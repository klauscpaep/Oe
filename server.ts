import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { dbInstance, User, Download, Announcement, Setting, Log, Ticket, Blog, Category, Report, BannedUser } from "./server/db";

const PORT = 3000;
const JWT_SECRET = "vididown_super_jwt_secret_998811";

// Lazy initialize Gemini API to handle missing keys gracefully
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI", e);
      }
    }
  }
  return aiClient;
}

const app = express();
app.use(express.json());

// Helper for logger
function addLog(type: "info" | "warning" | "error" | "auth" | "download", message: string, req: express.Request) {
  const db = dbInstance.getData();
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const newLog = {
    id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    type,
    message,
    ip,
    createdAt: new Date().toISOString()
  };
  dbInstance.save({ logs: [newLog, ...db.logs].slice(0, 500) });
}

// Middleware: Authenticate JWT
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Giriş yapmanız gerekiyor." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Geçersiz veya süresi dolmuş oturum." });
    }
    const db = dbInstance.getData();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    if (dbUser.status === "banned") {
      const banInfo = db.banned_users.find(b => b.userId === dbUser.id);
      return res.status(403).json({ 
        error: `Hesabınız engellenmiştir. Gerekçe: ${banInfo?.reason || "Kural ihlali"}`,
        banned: true,
        userId: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        reason: banInfo?.reason || "Kural ihlali"
      });
    }
    req.user = dbUser;
    next();
  });
}

// Middleware: Admin Only
function requireAdmin(req: any, res: any, next: any) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Bu işlem için yönetici yetkisi gereklidir." });
  }
}

// --- API ROUTES ---

// 1. Kurulum / Sihirbaz API
app.post("/api/install", (req, res) => {
  try {
    dbInstance.reset();
    addLog("info", "Sistem sıfırlandı ve yeniden kuruldu.", req);
    res.json({ success: true, message: "Veritabanı başarıyla kuruldu ve varsayılan veriler yüklendi!" });
  } catch (e: any) {
    res.status(500).json({ error: "Kurulum hatası: " + e.message });
  }
});

// Sistem Durumu
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Auth APIs
app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tüm alanları doldurmanız gerekmektedir." });
  }

  const db = dbInstance.getData();
  const emailExists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  const usernameExists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase());

  if (emailExists) {
    return res.status(400).json({ error: "Bu e-posta adresi zaten kullanımda." });
  }
  if (usernameExists) {
    return res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış." });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = "usr_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const apiKey = "vidi_api_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const isMasterAdmin = email.toLowerCase() === "winhtaner28@gmail.com";
  const newUser: User = {
    id: userId,
    username,
    email,
    passwordHash,
    role: isMasterAdmin ? "admin" : "user",
    status: "active",
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    apiKey,
    premiumStatus: isMasterAdmin ? "vip" : "free",
    twoFactorEnabled: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  dbInstance.save({ users: db.users });

  addLog("auth", `Yeni kullanıcı kaydoldu: ${username} (${email})`, req);

  // Generate Token
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      premiumStatus: newUser.premiumStatus,
      apiKey: newUser.apiKey,
      twoFactorEnabled: newUser.twoFactorEnabled
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-posta ve şifre gereklidir." });
  }

  const db = dbInstance.getData();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(400).json({ error: "Geçersiz e-posta veya şifre." });
  }

  if (user.status === "banned") {
    const banInfo = db.banned_users.find(b => b.userId === user.id);
    return res.status(403).json({ 
      error: `Hesabınız engellenmiştir. Gerekçe: ${banInfo?.reason || "Kural ihlali"}`,
      banned: true,
      userId: user.id,
      username: user.username,
      email: user.email,
      reason: banInfo?.reason || "Kural ihlali"
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Geçersiz e-posta veya şifre." });
  }

  addLog("auth", `Kullanıcı giriş yaptı: ${user.username}`, req);

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      premiumStatus: user.premiumStatus,
      apiKey: user.apiKey,
      twoFactorEnabled: user.twoFactorEnabled
    }
  });
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      premiumStatus: req.user.premiumStatus,
      apiKey: req.user.apiKey,
      twoFactorEnabled: req.user.twoFactorEnabled
    }
  });
});

// Profil güncelleme
app.post("/api/profile/update", authenticateToken, (req: any, res) => {
  const { username, avatar, currentPassword, newPassword } = req.body;
  const db = dbInstance.getData();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  }

  const user = db.users[userIndex];

  if (username && username !== user.username) {
    const usernameExists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== user.id);
    if (usernameExists) {
      return res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış." });
    }
    user.username = username;
  }

  if (avatar) {
    user.avatar = avatar;
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: "Şifrenizi değiştirmek için mevcut şifrenizi girmelisiniz." });
    }
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Mevcut şifreniz hatalı." });
    }
    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
  }

  db.users[userIndex] = user;
  dbInstance.save({ users: db.users });

  addLog("auth", `Profil güncellendi: ${user.username}`, req);

  res.json({
    success: true,
    message: "Profil bilgileriniz başarıyla güncellendi.",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      premiumStatus: user.premiumStatus,
      apiKey: user.apiKey,
      twoFactorEnabled: user.twoFactorEnabled
    }
  });
});

// Hesabı silme
app.post("/api/profile/delete", authenticateToken, (req: any, res) => {
  const db = dbInstance.getData();
  const filteredUsers = db.users.filter(u => u.id !== req.user.id);
  dbInstance.save({ users: filteredUsers });
  addLog("auth", `Kullanıcı hesabını sildi: ${req.user.username}`, req);
  res.json({ success: true, message: "Hesabınız başarıyla silindi." });
});

// API Anahtarı Sistemi Kaldırıldı
app.post("/api/api-key/regenerate", authenticateToken, (req: any, res) => {
  res.status(403).json({ error: "API Giriş Yetkisi sistemi tamamen kaldırılmıştır." });
});

// 2FA Simülasyonu
app.post("/api/auth/2fa/toggle", authenticateToken, (req: any, res) => {
  const db = dbInstance.getData();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

  const currentStatus = db.users[userIndex].twoFactorEnabled;
  db.users[userIndex].twoFactorEnabled = !currentStatus;
  db.users[userIndex].twoFactorSecret = !currentStatus ? "JBSWY3DPEHPK3PXP" : undefined;

  dbInstance.save({ users: db.users });
  addLog("auth", `2FA durumu değiştirildi (${!currentStatus}): ${req.user.username}`, req);

  res.json({
    success: true,
    twoFactorEnabled: !currentStatus,
    secret: !currentStatus ? "JBSWY3DPEHPK3PXP" : null,
    qrUrl: !currentStatus ? "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/VidiDown:" + req.user.email + "?secret=JBSWY3DPEHPK3PXP&issuer=VidiDown" : null
  });
});

// 3. Platform Video / Ses Bilgisi Getirme (AI or Fallback)
app.post("/api/video/info", async (req, res) => {
  const { url, platform } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Lütfen geçerli bir URL giriniz." });
  }

  const detectedPlatform = platform || (url.includes("youtube.com") || url.includes("youtu.be") ? "YouTube" :
                          url.includes("instagram.com") ? "Instagram" :
                          url.includes("tiktok.com") ? "TikTok" :
                          url.includes("facebook.com") ? "Facebook" :
                          url.includes("twitter.com") || url.includes("x.com") ? "X" : "YouTube");

  // Fallback metadata generator
  const fallbackTitles = [
    "Komik Hayvan Videoları Derlemesi 2026",
    "Lo-Fi Beats to Study/Relax to 🎧",
    "Uzayda Yaşam Belgeseli - Mars Görevi",
    "React Native ile 10 Saatte Mobil Uygulama Geliştirme",
    "İstanbul Sokak Lezzetleri Gurme Turu",
    "Teknolojik Gelişmeler ve Yapay Zeka Devrimi",
    "Motivasyon ve Başarı Hikayeleri"
  ];
  const randomTitle = fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)];
  const fallbackMetadata = {
    title: randomTitle,
    channelName: "VidiDown Creator",
    durationString: "04:12",
    durationSeconds: 252,
    views: "432K",
    thumbnail: `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60`,
    platform: detectedPlatform,
    qualities: ["144P", "360P", "480P", "720P", "1080P", "1440P (2K)", "2160P (4K)", "4320P (8K)"],
    audioQualities: ["128kbps", "192kbps", "320kbps"]
  };

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Lütfen aşağıdaki sosyal medya video bağlantısı veya anahtar kelime için yüksek kaliteli, gerçekçi Türkçe video meta verileri (başlık, kanal, süre, gerçekçi Unsplash görsel adresi, izlenme, platform vb.) üret.
Bağlantı: "${url}"
Algılanan Platform: "${detectedPlatform}"

Yanıtını SADECE aşağıdaki JSON şemasına uygun olacak şekilde ver. Kesinlikle markdown (\`\`\`json vb.) sarmalı veya açıklama metni ekleme. Sadece saf JSON string döndür:
{
  "title": "Sosyal medya videosunun başlığı",
  "channelName": "Yayıncı/Kanal adı",
  "durationString": "Süre (Örn: 05:24)",
  "durationSeconds": 324,
  "views": "İzlenme sayısı (Örn: 2.4M)",
  "thumbnail": "Unsplash üzerinden video içeriğiyle son derece uyumlu, kaliteli ve yüksek çözünürlüklü bir manzara/teknoloji/sanat/insan fotoğrafı bağlantısı",
  "platform": "${detectedPlatform}",
  "qualities": ["144P", "360P", "480P", "720P", "1080P", "1440P (2K)", "2160P (4K)"],
  "audioQualities": ["128kbps", "192kbps", "320kbps"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const text = response.text || "";
      const cleanedJson = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanedJson);
      return res.json(parsed);
    } catch (e) {
      console.error("Gemini metadata generation failed, using fallback", e);
      return res.json(fallbackMetadata);
    }
  } else {
    // Return fallback directly
    return res.json(fallbackMetadata);
  }
});

// 4. Video / Ses İndirme ve Dönüştürme Simülasyonu
app.post("/api/video/download", (req, res) => {
  const { title, url, format, quality, userId, platform } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: "Lütfen indirmek için bir video bilgisi gönderin." });
  }

  const db = dbInstance.getData();
  const dlId = "dl_" + Date.now() + "_" + Math.floor(Math.random() * 100);

  // Calculate simulated size
  const sizes: Record<string, string> = {
    "144P": "3.5 MB",
    "360P": "12.4 MB",
    "480P": "24.1 MB",
    "720P": "48.9 MB",
    "1080P": "92.5 MB",
    "1440P (2K)": "220.4 MB",
    "2160P (4K)": "680.1 MB",
    "4320P (8K)": "1.8 GB",
    "128kbps": "3.8 MB",
    "192kbps": "5.6 MB",
    "320kbps": "9.4 MB"
  };
  const size = sizes[quality] || "28.5 MB";

  const newDownload: Download = {
    id: dlId,
    userId: userId || null,
    title,
    url,
    format,
    quality,
    size,
    status: "converting",
    platform: platform || "YouTube",
    downloadUrl: `https://vidi-files.s3.amazonaws.com/downloads/${dlId}.${format.toLowerCase()}`,
    createdAt: new Date().toISOString()
  };

  db.downloads.unshift(newDownload);
  dbInstance.save({ downloads: db.downloads });

  addLog("download", `Dönüştürme başlatıldı: ${title} (${quality} - ${format})`, req);

  res.json({
    success: true,
    download: newDownload
  });
});

// Download favorilere ekleme/listeleme (UI logic handles state or profile can fetch)
app.get("/api/profile/downloads", authenticateToken, (req: any, res) => {
  const db = dbInstance.getData();
  const userDownloads = db.downloads.filter(d => d.userId === req.user.id);
  res.json({ success: true, downloads: userDownloads });
});

// 5. Blog Makaleleri ve Kategorileri
app.get("/api/blog", (req, res) => {
  const db = dbInstance.getData();
  res.json({ success: true, blog: db.blog, categories: db.categories });
});

// 6. Duyurular (Banner ve Popuplar)
app.get("/api/announcements", (req, res) => {
  const db = dbInstance.getData();
  const active = db.announcements.filter(a => a.status === "active");
  res.json({ success: true, announcements: active });
});

// 7. Destek Talepleri (Tickets)
app.get("/api/tickets", authenticateToken, (req: any, res) => {
  const db = dbInstance.getData();
  const userTickets = db.tickets.filter(t => t.userId === req.user.id);
  res.json({ success: true, tickets: userTickets });
});

app.post("/api/tickets", authenticateToken, (req: any, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: "Konu ve mesaj alanları zorunludur." });
  }

  const db = dbInstance.getData();
  const newTicket: Ticket = {
    id: "tck_" + Date.now(),
    userId: req.user.id,
    subject,
    message,
    status: "open",
    replies: [],
    createdAt: new Date().toISOString()
  };

  db.tickets.unshift(newTicket);
  dbInstance.save({ tickets: db.tickets });

  addLog("info", `Yeni destek talebi açıldı: ${subject} (${req.user.username})`, req);
  res.status(201).json({ success: true, ticket: newTicket });
});

app.post("/api/tickets/:id/reply", authenticateToken, (req: any, res) => {
  const { message } = req.body;
  const ticketId = req.params.id;

  if (!message) {
    return res.status(400).json({ error: "Mesaj boş olamaz." });
  }

  const db = dbInstance.getData();
  const ticketIndex = db.tickets.findIndex(t => t.id === ticketId);

  if (ticketIndex === -1) {
    return res.status(404).json({ error: "Destek talebi bulunamadı." });
  }

  const ticket = db.tickets[ticketIndex];
  
  // check ownership
  if (ticket.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Bu destek talebine erişim yetkiniz yok." });
  }

  const reply = {
    id: "rep_" + Date.now(),
    senderRole: req.user.role,
    senderName: req.user.username,
    message,
    createdAt: new Date().toISOString()
  };

  ticket.replies.push(reply);
  ticket.status = req.user.role === "admin" ? "answered" : "open";
  
  db.tickets[ticketIndex] = ticket;
  dbInstance.save({ tickets: db.tickets });

  addLog("info", `Destek talebine yanıt yazıldı. Bilet ID: ${ticketId}`, req);
  res.json({ success: true, ticket });
});

// 8. Site Ayarları
app.get("/api/settings", (req, res) => {
  const db = dbInstance.getData();
  const settingsObj: Record<string, string> = {};
  db.settings.forEach(s => {
    settingsObj[s.key] = s.value;
  });
  res.json({ success: true, settings: settingsObj });
});

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (!digits || digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function expiryCheck(cardExpiry: string): boolean {
  const match = cardExpiry.trim().match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt("20" + match[2], 10);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

function cvvCheck(cvv: string): boolean {
  const cleaned = cvv.trim().replace(/\D/g, "");
  return cleaned.length === 3 || cleaned.length === 4;
}

// 9. Premium Üyelik Satın Alma / Aktifleştirme (Simülasyon)
app.post("/api/premium/activate", authenticateToken, (req: any, res) => {
  const { plan, cardName, cardNumber, cardExpiry, cvv } = req.body; // premium or vip + card details
  if (!plan || (plan !== "premium" && plan !== "vip")) {
    return res.status(400).json({ error: "Geçersiz üyelik planı." });
  }

  // Real Bank & Credit Card Validation
  if (!cardName || cardName.trim().length < 3) {
    return res.status(400).json({ error: "Lütfen geçerli bir kart sahibi adı giriniz (en az 3 karakter)." });
  }
  if (!cardNumber) {
    return res.status(400).json({ error: "Lütfen kart numarasını giriniz." });
  }
  const cleanCardNumber = cardNumber.replace(/\D/g, "");
  if (!luhnCheck(cleanCardNumber)) {
    return res.status(400).json({ error: "Geçersiz kredi/banka kartı numarası! Lütfen geçerli bir kart numarası girdiğinizden emin olun (Luhn algoritması doğrulaması başarısız)." });
  }
  if (!cardExpiry || !expiryCheck(cardExpiry)) {
    return res.status(400).json({ error: "Geçersiz son kullanma tarihi! Lütfen AA/YY formatında ve gelecekte olan bir tarih giriniz." });
  }
  if (!cvv || !cvvCheck(cvv)) {
    return res.status(400).json({ error: "Geçersiz güvenlik kodu (CVV)! Lütfen 3 veya 4 haneli güvenlik kodunu giriniz." });
  }

  const db = dbInstance.getData();
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

  db.users[userIndex].premiumStatus = plan;

  // Add key and subscription details
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + 30); // 30 days subscription

  const maskedCard = "**** **** **** " + cleanCardNumber.slice(-4);

  const newPremium = {
    id: "prm_" + Date.now(),
    userId: req.user.id,
    plan: plan as "premium" | "vip",
    expiresAt: expDate.toISOString(),
    status: "active" as const,
    createdAt: new Date().toISOString(),
    cardName: cardName.trim(),
    cardNumberMasked: maskedCard
  };

  db.premium.unshift(newPremium);
  dbInstance.save({ users: db.users, premium: db.premium });

  addLog("info", `Başarılı Ödeme: ${req.user.username} adlı kullanıcı ${plan.toUpperCase()} plana yükseldi. Kart Sahibi: ${cardName.trim()}, Kart No: ${maskedCard}`, req);

  res.json({
    success: true,
    message: `Tebrikler! Ödemeniz başarıyla alındı ve hesabınız ${plan.toUpperCase()} plana yükseltildi. Tüm sınırsız özelliklerin tadını çıkarın.`,
    premiumStatus: plan
  });
});

// --- ADMIN API ENDPOINTS (Yönetici Paneli) ---
app.get("/api/admin/dashboard", authenticateToken, requireAdmin, (req, res) => {
  const db = dbInstance.getData();
  
  // Total stats
  const totalDownloads = db.downloads.length;
  const totalUsers = db.users.length;
  const premiumUsers = db.users.filter(u => u.premiumStatus !== "free").length;
  const openTickets = db.tickets.filter(t => t.status === "open").length;

  // Simulate hardware usages
  const cpuUsage = Math.floor(Math.random() * 15) + 5; // 5-20%
  const ramUsage = Math.floor(Math.random() * 10) + 40; // 40-50%
  const diskUsage = 28; // 28% fixed for demo

  // Countries
  const countries = [
    { name: "Türkiye", count: 840, percentage: 65 },
    { name: "Almanya", count: 180, percentage: 14 },
    { name: "Azerbaycan", count: 120, percentage: 9 },
    { name: "ABD", count: 80, percentage: 6 },
    { name: "Diğer", count: 78, percentage: 6 }
  ];

  // Devices & Browsers
  const devices = [
    { name: "Mobil", count: 720, percentage: 56 },
    { name: "Masaüstü", count: 480, percentage: 37 },
    { name: "Tablet", count: 90, percentage: 7 }
  ];

  const browsers = [
    { name: "Chrome", count: 650, percentage: 50 },
    { name: "Safari", count: 320, percentage: 25 },
    { name: "Firefox", count: 150, percentage: 12 },
    { name: "Edge", count: 110, percentage: 8 },
    { name: "Diğer", count: 60, percentage: 5 }
  ];

  res.json({
    success: true,
    stats: {
      totalDownloads,
      totalUsers,
      premiumUsers,
      openTickets,
      hardware: { cpuUsage, ramUsage, diskUsage }
    },
    countries,
    devices,
    browsers,
    logs: db.logs.slice(0, 10),
    downloads: db.downloads.slice(0, 5)
  });
});

// Admin Kullanıcı Yönetimi
app.get("/api/admin/users", authenticateToken, requireAdmin, (req, res) => {
  const db = dbInstance.getData();
  res.json({ success: true, users: db.users });
});

app.post("/api/admin/users/:id/action", authenticateToken, requireAdmin, (req: any, res) => {
  const { action, reason, plan } = req.body;
  const userId = req.params.id;

  const db = dbInstance.getData();
  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  }

  const user = db.users[userIndex];

  // Prevent modifying the main admin or your personal protected account (winhtaner28@gmail.com)
  const isProtectedUser = user.id === "usr_admin" || user.email.toLowerCase() === "winhtaner28@gmail.com";
  if (isProtectedUser && action !== "update_premium") {
    return res.status(400).json({ error: "Bu yönetici hesabı üzerinde yetki değişikliği veya engelleme yapılamaz." });
  }

  if (action === "ban") {
    user.status = "banned";
    db.banned_users.push({
      id: "ban_" + Date.now(),
      userId: user.id,
      reason: reason || "Kural ihlali",
      createdAt: new Date().toISOString()
    });
    addLog("warning", `Kullanıcı engellendi: ${user.username}. Gerekçe: ${reason}`, req);
  } else if (action === "unban") {
    user.status = "active";
    db.banned_users = db.banned_users.filter(b => b.userId !== user.id);
    addLog("info", `Kullanıcı engeli kaldırıldı: ${user.username}`, req);
  } else if (action === "delete") {
    db.users = db.users.filter(u => u.id !== userId);
    db.banned_users = db.banned_users.filter(b => b.userId !== userId);
    addLog("warning", `Kullanıcı silindi: ${user.username}`, req);
    dbInstance.save({ users: db.users, banned_users: db.banned_users });
    return res.json({ success: true, message: "Kullanıcı tamamen silindi." });
  } else if (action === "set_admin") {
    user.role = "admin";
    addLog("info", `Kullanıcıya yönetici yetkisi verildi: ${user.username}`, req);
  } else if (action === "remove_admin") {
    user.role = "user";
    addLog("info", `Yönetici yetkisi geri alındı: ${user.username}`, req);
  } else if (action === "update_premium") {
    user.premiumStatus = plan || "free";
    addLog("info", `Kullanıcı üyelik planı güncellendi (${plan}): ${user.username}`, req);
  }

  db.users[userIndex] = user;
  dbInstance.save({ users: db.users, banned_users: db.banned_users });

  res.json({ success: true, user, message: "İşlem başarıyla uygulandı." });
});

// Submit Ban Appeal (Public Endpoint)
app.post("/api/auth/ban-appeal", (req: any, res) => {
  const { userId, username, email, reason, appealMessage } = req.body;
  if (!userId || !appealMessage) {
    return res.status(400).json({ error: "Eksik parametreler. Kullanıcı ID'si ve itiraz mesajı zorunludur." });
  }

  const db = dbInstance.getData();
  
  // Check if there's already a pending appeal for this user to avoid spam
  const existing = db.ban_appeals.find(a => a.userId === userId && a.status === "pending");
  if (existing) {
    return res.status(400).json({ error: "Zaten açıkta bekleyen bir itirazınız bulunmaktadır. Lütfen yöneticilerin incelemesini bekleyin." });
  }

  const newAppeal = {
    id: "appeal_" + Date.now(),
    userId,
    username: username || "Bilinmeyen Kullanıcı",
    email: email || "Bilinmeyen E-posta",
    reason: reason || "Belirtilmemiş",
    appealMessage,
    status: "pending" as const,
    createdAt: new Date().toISOString()
  };

  db.ban_appeals.push(newAppeal);
  dbInstance.save({ ban_appeals: db.ban_appeals });

  res.json({ success: true, message: "İtirazınız başarıyla yöneticilere iletildi. İncelenip en kısa sürede karar verilecektir." });
});

// List Ban Appeals (Admin Only)
app.get("/api/admin/ban-appeals", authenticateToken, requireAdmin, (req: any, res) => {
  const db = dbInstance.getData();
  res.json({ success: true, banAppeals: db.ban_appeals });
});

// Take Action on Ban Appeal (Admin Only)
app.post("/api/admin/ban-appeals/:id/action", authenticateToken, requireAdmin, (req: any, res) => {
  const { action } = req.body; // "approve" (unban) or "reject"
  const appealId = req.params.id;

  const db = dbInstance.getData();
  const appealIndex = db.ban_appeals.findIndex(a => a.id === appealId);
  if (appealIndex === -1) {
    return res.status(404).json({ error: "İtiraz kaydı bulunamadı." });
  }

  const appeal = db.ban_appeals[appealIndex];
  
  if (action === "approve") {
    appeal.status = "approved";
    
    // Unban the user
    const userIndex = db.users.findIndex(u => u.id === appeal.userId);
    if (userIndex !== -1) {
      db.users[userIndex].status = "active";
      db.banned_users = db.banned_users.filter(b => b.userId !== appeal.userId);
      addLog("info", `Yasaklı kullanıcı itirazı onaylandı ve engel kaldırıldı: ${db.users[userIndex].username}`, req);
    }
  } else if (action === "reject") {
    appeal.status = "rejected";
    addLog("warning", `Yasaklı kullanıcı itirazı reddedildi: ${appeal.username}`, req);
  }

  db.ban_appeals[appealIndex] = appeal;
  dbInstance.save({ ban_appeals: db.ban_appeals, users: db.users, banned_users: db.banned_users });

  res.json({ success: true, message: `İtiraz başarıyla ${action === "approve" ? "onaylandı ve engel kaldırıldı" : "reddedildi"}.` });
});

// Admin Blog Yönetimi
app.post("/api/admin/blog", authenticateToken, requireAdmin, (req: any, res) => {
  const { title, content, image, categoryId, readTime } = req.body;
  if (!title || !content || !categoryId) {
    return res.status(400).json({ error: "Lütfen başlık, içerik ve kategori alanlarını doldurun." });
  }

  const db = dbInstance.getData();
  const newBlog: Blog = {
    id: "blog_" + Date.now(),
    title,
    content,
    image: image || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60",
    categoryId,
    views: 0,
    readTime: readTime || "3 dk",
    createdAt: new Date().toISOString()
  };

  db.blog.unshift(newBlog);
  dbInstance.save({ blog: db.blog });
  addLog("info", `Yeni makale yayınlandı: ${title}`, req);

  res.status(201).json({ success: true, blog: newBlog });
});

app.delete("/api/admin/blog/:id", authenticateToken, requireAdmin, (req, res) => {
  const db = dbInstance.getData();
  const deletedBlog = db.blog.find(b => b.id === req.params.id);
  db.blog = db.blog.filter(b => b.id !== req.params.id);
  dbInstance.save({ blog: db.blog });
  addLog("info", `Makale silindi: ${deletedBlog?.title || req.params.id}`, req);
  res.json({ success: true, message: "Makale silindi." });
});

// Admin Duyuru Yönetimi
app.get("/api/admin/announcements", authenticateToken, requireAdmin, (req, res) => {
  const db = dbInstance.getData();
  res.json({ success: true, announcements: db.announcements });
});

app.post("/api/admin/announcements", authenticateToken, requireAdmin, (req: any, res) => {
  const { title, content, type, isPinned, status } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Lütfen başlık ve duyuru içeriğini doldurun." });
  }

  const db = dbInstance.getData();
  const newAnn: Announcement = {
    id: "ann_" + Date.now(),
    title,
    content,
    type: type || "normal",
    status: status || "active",
    isPinned: !!isPinned,
    createdAt: new Date().toISOString()
  };

  db.announcements.unshift(newAnn);
  dbInstance.save({ announcements: db.announcements });
  addLog("info", `Yeni duyuru oluşturuldu: ${title}`, req);

  res.status(201).json({ success: true, announcement: newAnn });
});

app.delete("/api/admin/announcements/:id", authenticateToken, requireAdmin, (req, res) => {
  const db = dbInstance.getData();
  db.announcements = db.announcements.filter(a => a.id !== req.params.id);
  dbInstance.save({ announcements: db.announcements });
  addLog("info", `Duyuru silindi. ID: ${req.params.id}`, req);
  res.json({ success: true, message: "Duyuru silindi." });
});

// Admin Destek Talepleri Yönetimi
app.get("/api/admin/tickets", authenticateToken, requireAdmin, (req, res) => {
  const db = dbInstance.getData();
  res.json({ success: true, tickets: db.tickets });
});

app.post("/api/admin/tickets/:id/status", authenticateToken, requireAdmin, (req: any, res) => {
  const { status } = req.body;
  if (!status || !["open", "answered", "closed"].includes(status)) {
    return res.status(400).json({ error: "Geçersiz destek talebi durumu." });
  }

  const db = dbInstance.getData();
  const index = db.tickets.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Destek talebi bulunamadı." });
  }

  const ticket = db.tickets[index];
  ticket.status = status;

  if (status === "closed") {
    // Check if the last reply is already the system closed reply to avoid duplicates
    const systemClosedMsg = "Sohbet sonlandırıldı. Yardımcı olabileceğimiz başka bir konu varsa yeni bir destek talebi oluşturabilirsiniz.";
    const alreadyClosed = ticket.replies.some(r => r.message === systemClosedMsg);
    if (!alreadyClosed) {
      ticket.replies.push({
        id: "rep_sys_" + Date.now(),
        senderRole: "admin",
        senderName: "Sistem",
        message: systemClosedMsg,
        createdAt: new Date().toISOString()
      });
    }
  }

  db.tickets[index] = ticket;
  dbInstance.save({ tickets: db.tickets });
  addLog("info", `Destek talebi durumu güncellendi: ${req.params.id} -> ${status}`, req);
  res.json({ success: true, ticket });
});

app.delete("/api/admin/tickets/:id", authenticateToken, requireAdmin, (req, res) => {
  const db = dbInstance.getData();
  db.tickets = db.tickets.filter(t => t.id !== req.params.id);
  dbInstance.save({ tickets: db.tickets });
  addLog("info", `Destek talebi silindi. ID: ${req.params.id}`, req);
  res.json({ success: true, message: "Destek talebi silindi." });
});

// Admin Reklam Yönetimi / Site Ayarları Güncelleme
app.post("/api/admin/settings", authenticateToken, requireAdmin, (req: any, res) => {
  const { settings } = req.body; // array of {key, value}
  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ error: "Geçersiz ayarlar formatı." });
  }

  const db = dbInstance.getData();
  settings.forEach((newS: { key: string; value: string }) => {
    const idx = db.settings.findIndex(s => s.key === newS.key);
    if (idx !== -1) {
      db.settings[idx].value = String(newS.value);
    } else {
      db.settings.push({ key: newS.key, value: String(newS.value) });
    }
  });

  dbInstance.save({ settings: db.settings });
  addLog("info", "Site genel ayarları güncellendi.", req);
  res.json({ success: true, message: "Ayarlar başarıyla kaydedildi." });
});

// Admin Dosya Yönetimi / Önbellek & Log Temizleme
app.post("/api/admin/clear-cache", authenticateToken, requireAdmin, (req, res) => {
  // Simulated Cache cleaning
  addLog("info", "Dosya önbelleği ve geçici indirme klasörleri temizlendi.", req);
  res.json({ success: true, message: "Sunucu önbelleği (temp cache) başarıyla temizlendi." });
});

app.post("/api/admin/clear-logs", authenticateToken, requireAdmin, (req, res) => {
  dbInstance.save({ logs: [] });
  addLog("info", "Tüm sistem kayıt günlükleri temizlendi.", req);
  res.json({ success: true, message: "Sistem logları başarıyla temizlendi." });
});

// --- VITE AND STATIC SERVING CONFIGURATION ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VidiDown server running on http://localhost:${PORT}`);
  });
}

startServer();
