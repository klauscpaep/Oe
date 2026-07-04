import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DB_FILE = path.join(process.cwd(), "vidi_db.json");

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  status: "active" | "banned";
  avatar: string;
  apiKey: string;
  premiumStatus: "free" | "premium" | "vip";
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  lastIp?: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
}

export interface Download {
  id: string;
  userId: string | null;
  title: string;
  url: string;
  format: string;
  quality: string;
  size: string;
  status: "pending" | "converting" | "ready" | "failed";
  platform: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "banner" | "popup" | "normal";
  status: "active" | "draft";
  isPinned: boolean;
  publishAt?: string;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Log {
  id: string;
  type: "info" | "warning" | "error" | "auth" | "download";
  message: string;
  ip: string;
  createdAt: string;
}

export interface Premium {
  id: string;
  userId: string;
  plan: "premium" | "vip";
  expiresAt: string;
  status: "active" | "expired";
  createdAt: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  apiKey: string;
  dailyLimit: number;
  currentUsage: number;
  createdAt: string;
}

export interface TicketReply {
  id: string;
  senderRole: "user" | "admin";
  senderName: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "answered" | "closed";
  replies: TicketReply[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  image: string;
  categoryId: string;
  views: number;
  readTime: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  status: "pending" | "resolved";
  createdAt: string;
}

export interface BannedUser {
  id: string;
  userId: string;
  email?: string;
  username?: string;
  ipAddress?: string;
  reason: string;
  liftDate?: string;
  createdAt: string;
}

export interface BanAppeal {
  id: string;
  userId: string;
  username: string;
  email: string;
  reason: string;
  appealMessage: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  admins: Admin[];
  downloads: Download[];
  announcements: Announcement[];
  settings: Setting[];
  logs: Log[];
  premium: Premium[];
  api_keys: ApiKey[];
  tickets: Ticket[];
  notifications: Notification[];
  blog: Blog[];
  categories: Category[];
  reports: Report[];
  banned_users: BannedUser[];
  ban_appeals: BanAppeal[];
}

export function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  
  const users: User[] = [
    {
      id: "usr_admin",
      username: "admin",
      email: "admin@vididown.com",
      passwordHash: bcrypt.hashSync("admin123", salt),
      role: "admin",
      status: "active",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
      apiKey: "vidi_api_adm_7182938129",
      premiumStatus: "vip",
      twoFactorEnabled: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_premium",
      username: "premium_user",
      email: "premium@vididown.com",
      passwordHash: bcrypt.hashSync("premium123", salt),
      role: "user",
      status: "active",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=premium",
      apiKey: "vidi_api_prem_5521948381",
      premiumStatus: "premium",
      twoFactorEnabled: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "usr_regular",
      username: "hakan_yilmaz",
      email: "hakan@gmail.com",
      passwordHash: bcrypt.hashSync("user123", salt),
      role: "user",
      status: "active",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hakan",
      apiKey: "vidi_api_user_1029384756",
      premiumStatus: "free",
      twoFactorEnabled: false,
      createdAt: new Date().toISOString()
    }
  ];

  const admins: Admin[] = [
    {
      id: "adm_1",
      userId: "usr_admin",
      role: "Super Admin",
      createdAt: new Date().toISOString()
    }
  ];

  const categories: Category[] = [
    { id: "cat_1", name: "Video İndirme Rehberleri", slug: "video-indirme-rehberleri" },
    { id: "cat_2", name: "Gelişmeler & Güncellemeler", slug: "gelismeler-guncellemeler" },
    { id: "cat_3", name: "Sık Sorulan Sorular", slug: "sik-sorulan-sorular" }
  ];

  const blog: Blog[] = [
    {
      id: "blog_1",
      title: "YouTube Shorts Videoları Yüksek Kalitede Nasıl İndirilir?",
      content: "YouTube Shorts videolarını MP4 formatında ve 1080p Full HD kalitede indirmek artık çok kolay. VidiDown kullanarak tek tıkla Shorts videolarını cihazınıza kaydedebilirsiniz. Tek yapmanız gereken Shorts bağlantısını kopyalayıp arama kutusuna yapıştırmaktır.",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60",
      categoryId: "cat_1",
      views: 1240,
      readTime: "3 dk",
      createdAt: new Date().toISOString()
    },
    {
      id: "blog_2",
      title: "TikTok Filigransız (Watermark olmadan) Video Kaydetme",
      content: "TikTok videolarını üzerindeki logo ve filigran olmadan indirmek isteyen kullanıcılar için VidiDown en pratik çözümü sunuyor. Platformumuz videonun ham halini tespit ederek filigransız MP4 formatında yüksek hızlı indirme sağlar.",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=60",
      categoryId: "cat_1",
      views: 948,
      readTime: "4 dk",
      createdAt: new Date().toISOString()
    },
    {
      id: "blog_3",
      title: "VidiDown v2.4.0 Güncelleme Notları",
      content: "Platformumuza yeni platformlar eklendi! Artık Instagram Reels, TikTok, Facebook ve X (Twitter) videolarını da en yüksek kalitede indirebilirsiniz. API hızı optimize edildi ve sunucu kapasiteleri %200 artırıldı.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
      categoryId: "cat_2",
      views: 520,
      readTime: "2 dk",
      createdAt: new Date().toISOString()
    }
  ];

  const settings: Setting[] = [
    { key: "site_name", value: "VidiDown" },
    { key: "site_title", value: "VidiDown - Çoklu Platform Video & Ses Dönüştürücü" },
    { key: "maintenance_mode", value: "false" },
    { key: "ads_enabled", value: "true" },
    { key: "adsense_client_id", value: "ca-pub-1234567890123456" },
    { key: "daily_free_limit", value: "10" },
    { key: "premium_download_speed", value: "100" }, // MB/s
    { key: "free_download_speed", value: "5" }, // MB/s
    { key: "recaptcha_enabled", value: "false" },
    { key: "premium_price", value: "149" },
    { key: "vip_price", value: "399" }
  ];

  const announcements: Announcement[] = [
    {
      id: "ann_1",
      title: "Hoş Geldiniz! VidiDown Yayında",
      content: "Süper hızlı video ve ses indirme platformumuz artık tamamen aktif. Ücretsiz üye olarak indirme geçmişinizi görebilir ve favorilere ekleyebilirsiniz.",
      type: "normal",
      status: "active",
      isPinned: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "ann_2",
      title: "%50 Premium Kampanyası!",
      content: "Kısa süreliğine tüm Premium ve VIP üyeliklerde %50 indirim başladı. Sınırsız, reklamsız ve 8K indirme kalitesi için Premium'a geçin!",
      type: "popup",
      status: "active",
      isPinned: false,
      createdAt: new Date().toISOString()
    }
  ];

  const downloads: Download[] = [
    {
      id: "dl_1",
      userId: "usr_regular",
      title: "Tarkan - Geççek (Official Video)",
      url: "https://www.youtube.com/watch?v=12345678",
      format: "MP4",
      quality: "1080P",
      size: "45.2 MB",
      status: "ready",
      platform: "YouTube",
      downloadUrl: "#",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "dl_2",
      userId: "usr_premium",
      title: "SpaceX Starship Orbital Launch Test",
      url: "https://www.youtube.com/watch?v=87654321",
      format: "MP4",
      quality: "2160P (4K)",
      size: "348.5 MB",
      status: "ready",
      platform: "YouTube",
      downloadUrl: "#",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: "dl_3",
      userId: null,
      title: "Funny TikTok Dance Compilation 2026",
      url: "https://www.tiktok.com/@test/video/1293819283",
      format: "MP4",
      quality: "720P",
      size: "12.8 MB",
      status: "ready",
      platform: "TikTok",
      downloadUrl: "#",
      createdAt: new Date(Date.now() - 600000).toISOString()
    }
  ];

  const premium: Premium[] = [
    {
      id: "prm_1",
      userId: "usr_premium",
      plan: "premium",
      expiresAt: new Date(Date.now() + 30 * 24 * 3600000).toISOString(), // 30 days
      status: "active",
      createdAt: new Date().toISOString()
    }
  ];

  const api_keys: ApiKey[] = [
    {
      id: "apk_1",
      userId: "usr_admin",
      apiKey: "vidi_api_adm_7182938129",
      dailyLimit: 10000,
      currentUsage: 45,
      createdAt: new Date().toISOString()
    },
    {
      id: "apk_2",
      userId: "usr_premium",
      apiKey: "vidi_api_prem_5521948381",
      dailyLimit: 2000,
      currentUsage: 12,
      createdAt: new Date().toISOString()
    }
  ];

  const tickets: Ticket[] = [
    {
      id: "tck_1",
      userId: "usr_regular",
      subject: "İndirme Hızı Hakkında",
      message: "Merhabalar, ücretsiz üyelikte indirme hızı sınırı nedir? Premium üyelik alınca hız ne kadar artıyor acaba?",
      status: "answered",
      replies: [
        {
          id: "r_1",
          senderRole: "admin",
          senderName: "Destek Ekibi",
          message: "Merhaba Hakan Bey, ücretsiz üyelerimiz için hız limitimiz 5 MB/s'dir. Premium veya VIP üyeliğe geçiş yaparsanız limit kalkar ve internet servis sağlayıcınızın desteklediği maksimum hızda (100+ MB/s) indirme yapabilirsiniz.",
          createdAt: new Date(Date.now() - 1200000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const logs: Log[] = [
    {
      id: "log_1",
      type: "info",
      message: "Sistem başarıyla başlatıldı ve veritabanı kuruldu.",
      ip: "127.0.0.1",
      createdAt: new Date().toISOString()
    },
    {
      id: "log_2",
      type: "auth",
      message: "Admin kullanıcısı sisteme giriş yaptı.",
      ip: "192.168.1.1",
      createdAt: new Date().toISOString()
    }
  ];

  const reports: Report[] = [
    {
      id: "rep_1",
      title: "Instagram indirme hatası",
      content: "Instagram reels indirirken link hatası veriyor bazen.",
      status: "pending",
      createdAt: new Date().toISOString()
    }
  ];

  const banned_users: BannedUser[] = [];

  return {
    users,
    admins,
    downloads,
    announcements,
    settings,
    logs,
    premium,
    api_keys,
    tickets,
    notifications: [],
    blog,
    categories,
    reports,
    banned_users,
    ban_appeals: []
  };
}

export class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    let dbData: DatabaseSchema;
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        dbData = JSON.parse(fileContent);
      } else {
        dbData = getInitialDatabase();
        this.saveData(dbData);
      }
    } catch (e) {
      console.error("Database loading failed, re-initializing", e);
      dbData = getInitialDatabase();
      this.saveData(dbData);
    }

    let modified = false;

    // Ensure all required collections are initialized
    dbData.banned_users = [];
    modified = true;
    if (!dbData.tickets) { dbData.tickets = []; modified = true; }
    if (!dbData.reports) { dbData.reports = []; modified = true; }
    if (!dbData.blog) { dbData.blog = []; modified = true; }
    if (!dbData.categories) { dbData.categories = []; modified = true; }
    if (!dbData.notifications) { dbData.notifications = []; modified = true; }
    if (!dbData.logs) { dbData.logs = []; modified = true; }
    if (!dbData.downloads) { dbData.downloads = []; modified = true; }
    if (!dbData.ban_appeals) { dbData.ban_appeals = []; modified = true; }

    // Ensure all users are active (unbanned)
    dbData.users = dbData.users.map(u => {
      if (u.status !== "active") {
        u.status = "active";
        modified = true;
      }
      if (u.email.toLowerCase() === "winhtaner28@gmail.com") {
        if (u.role !== "admin" || u.status !== "active" || u.premiumStatus !== "vip") {
          u.role = "admin";
          u.status = "active";
          u.premiumStatus = "vip";
          modified = true;
        }
      }
      return u;
    });

    // Ensure pricing settings exist
    if (!dbData.settings) {
      dbData.settings = [];
    }
    const defaultSettings = [
      { key: "premium_price", value: "149" },
      { key: "vip_price", value: "399" }
    ];
    defaultSettings.forEach(ds => {
      const exists = dbData.settings.some(s => s.key === ds.key);
      if (!exists) {
        dbData.settings.push(ds);
        modified = true;
      }
    });

    if (modified) {
      this.saveData(dbData);
    }

    return dbData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Database saving failed", e);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public save(data: Partial<DatabaseSchema>) {
    this.data = { ...this.data, ...data };
    this.saveData(this.data);
  }

  public reset() {
    const initialData = getInitialDatabase();
    this.data = initialData;
    this.saveData(initialData);
  }
}

export const dbInstance = new LocalDatabase();
