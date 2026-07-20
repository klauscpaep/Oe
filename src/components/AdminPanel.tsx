import React, { useState, useEffect } from "react";
import { 
  Terminal, 
  Users, 
  Download, 
  HelpCircle, 
  AlertTriangle, 
  Cpu, 
  Database, 
  HardDrive, 
  Megaphone, 
  Settings, 
  Trash2, 
  ShieldAlert, 
  BookOpen, 
  Key, 
  Search, 
  CheckCircle, 
  RefreshCw,
  PlusCircle,
  FileCode,
  Sparkles,
  MessageSquare,
  LifeBuoy,
  Send,
  ArrowLeft,
  Check,
  Mail,
  Flame
} from "lucide-react";
import { User, Download as DownloadType, Announcement, Blog, Category, SystemStats } from "../types";
import { api } from "../api";

interface AdminPanelProps {
  currentUser: User;
  onRefreshData?: () => void;
}

export default function AdminPanel({ currentUser, onRefreshData }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "announcements" | "blog" | "settings" | "cache" | "tickets" | "appeals">("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Server-fetched data
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [browsers, setBrowsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<DownloadType[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [annList, setAnnList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [banAppeals, setBanAppeals] = useState<any[]>([]);

  // Deletion confirmation states
  const [deletingAnnId, setDeletingAnnId] = useState<string | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  // Ticket Management
  const [activeAdminTicket, setActiveAdminTicket] = useState<any | null>(null);
  const [adminReplyMessage, setAdminReplyMessage] = useState("");
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "answered" | "closed">("all");
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");

  // Forms / Management state
  const [searchQuery, setSearchQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "banned">("all");
  const [banReason, setBanReason] = useState("");
  const [banningUser, setBanningUser] = useState<User | null>(null);

  // New Blog Form
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogCategory, setBlogCategory] = useState("cat_1");

  // New Announcement Form
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState<"banner" | "popup" | "normal">("normal");
  const [annPinned, setAnnPinned] = useState(false);

  // Settings Forms
  const [siteName, setSiteName] = useState("VidiDown");
  const [siteTitle, setSiteTitle] = useState("VidiDown - Çoklu Platform Video & Ses Dönüştürücü");
  const [maintenanceMode, setMaintenanceMode] = useState("false");
  const [adsEnabled, setAdsEnabled] = useState("true");
  const [adsenseClient, setAdsenseClient] = useState("");
  const [adSlotHeader, setAdSlotHeader] = useState("");
  const [adSlotDownload, setAdSlotDownload] = useState("");
  const [adSlotSidebar, setAdSlotSidebar] = useState("");
  const [adSlotPopunder, setAdSlotPopunder] = useState("");
  const [freeSpeed, setFreeSpeed] = useState("5");
  const [premiumSpeed, setPremiumSpeed] = useState("100");
  const [premiumPrice, setPremiumPrice] = useState("149");
  const [vipPrice, setVipPrice] = useState("399");

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSecure, setSmtpSecure] = useState("false");

  // Firebase Settings
  const [firebaseApiKey, setFirebaseApiKey] = useState("");
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState("");
  const [firebaseProjectId, setFirebaseProjectId] = useState("");
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState("");
  const [firebaseMessagingSenderId, setFirebaseMessagingSenderId] = useState("");
  const [firebaseAppId, setFirebaseAppId] = useState("");
  const [firebaseMeasurementId, setFirebaseMeasurementId] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getDashboard();
      if (res.success) {
        setStats(res.stats);
        setCountries(res.countries);
        setDevices(res.devices);
        setBrowsers(res.browsers);
        setLogs(res.logs);
        setDownloads(res.downloads);
      }

      // Fetch users as well
      const uRes = await api.admin.getUsers();
      if (uRes.success) {
        setUserList(uRes.users);
      }

      // Fetch announcements as well
      const annRes = await api.admin.getAnnouncements();
      if (annRes.success) {
        setAnnList(annRes.announcements);
      }

      // Fetch tickets as well
      const ticketsRes = await api.admin.getTickets();
      if (ticketsRes.success) {
        setTicketsList(ticketsRes.tickets);
      }

      // Fetch ban appeals
      try {
        const appealsRes = await api.admin.getBanAppeals();
        if (appealsRes.success) {
          setBanAppeals(appealsRes.banAppeals);
        }
      } catch (e) {
        console.warn("Could not load ban appeals", e);
      }

      // Fetch settings to fill inputs
      const settingsRes = await api.getSettings();
      if (settingsRes.success) {
        const s = settingsRes.settings;
        if (s.site_name) setSiteName(s.site_name);
        if (s.site_title) setSiteTitle(s.site_title);
        if (s.maintenance_mode) setMaintenanceMode(s.maintenance_mode);
        if (s.ads_enabled) setAdsEnabled(s.ads_enabled);
        if (s.adsense_client_id) setAdsenseClient(s.adsense_client_id);
        if (s.ad_slot_header) setAdSlotHeader(s.ad_slot_header);
        if (s.ad_slot_download) setAdSlotDownload(s.ad_slot_download);
        if (s.ad_slot_sidebar) setAdSlotSidebar(s.ad_slot_sidebar);
        if (s.ad_slot_popunder) setAdSlotPopunder(s.ad_slot_popunder);
        if (s.free_download_speed) setFreeSpeed(s.free_download_speed);
        if (s.premium_download_speed) setPremiumSpeed(s.premium_download_speed);
        if (s.premium_price) setPremiumPrice(s.premium_price);
        if (s.vip_price) setVipPrice(s.vip_price);
        if (s.smtp_host) setSmtpHost(s.smtp_host);
        if (s.smtp_port) setSmtpPort(s.smtp_port);
        if (s.smtp_user) setSmtpUser(s.smtp_user);
        if (s.smtp_pass) setSmtpPass(s.smtp_pass);
        if (s.smtp_secure) setSmtpSecure(s.smtp_secure);
        if (s.firebase_api_key) setFirebaseApiKey(s.firebase_api_key);
        if (s.firebase_auth_domain) setFirebaseAuthDomain(s.firebase_auth_domain);
        if (s.firebase_project_id) setFirebaseProjectId(s.firebase_project_id);
        if (s.firebase_storage_bucket) setFirebaseStorageBucket(s.firebase_storage_bucket);
        if (s.firebase_messaging_sender_id) setFirebaseMessagingSenderId(s.firebase_messaging_sender_id);
        if (s.firebase_app_id) setFirebaseAppId(s.firebase_app_id);
        if (s.firebase_measurement_id) setFirebaseMeasurementId(s.firebase_measurement_id);
      }

    } catch (err: any) {
      setError(err.message || "Admin bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const handleUserAction = async (userId: string, action: string, extra: any = {}) => {
    try {
      const res = await api.admin.userAction(userId, { action, ...extra });
      if (res.success) {
        setSuccess(res.message);
        loadDashboardData();
        if (onRefreshData) onRefreshData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "İşlem gerçekleştirilemedi.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleBanAppealAction = async (appealId: string, action: "approve" | "reject") => {
    try {
      const res = await api.admin.actionBanAppeal(appealId, action);
      if (res.success) {
        setSuccess(res.message);
        loadDashboardData();
        if (onRefreshData) onRefreshData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "İşlem gerçekleştirilemedi.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogContent) {
      setError("Başlık ve İçerik gereklidir.");
      return;
    }
    try {
      const res = await api.admin.createBlog({
        title: blogTitle,
        content: blogContent,
        image: blogImage,
        categoryId: blogCategory,
        readTime: "3 dk"
      });
      if (res.success) {
        setSuccess("Yeni makale başarıyla yayınlandı!");
        setBlogTitle("");
        setBlogContent("");
        setBlogImage("");
        loadDashboardData();
        if (onRefreshData) onRefreshData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Makale oluşturulamadı.");
    }
  };

  const ANNOUNCEMENT_TEMPLATES = [
    {
      id: "system-update",
      name: "🚀 Sistem Güncellemesi",
      title: "Sistem Güncellemesi v2.4 Yayında!",
      content: `<h3>🎉 Yenilikler ve Geliştirmeler</h3>
<p>Sizlere daha iyi bir hizmet sunabilmek adına altyapımızı güncelledik:</p>
<ul>
  <li><strong>Yeni Platformlar:</strong> TikTok, Instagram Reels ve X (Twitter) video indirme motorları optimize edildi.</li>
  <li><strong>Dönüştürme Hızı:</strong> Video işleme sunucuları güçlendirilerek indirme hız limitleri %40 oranında artırıldı.</li>
  <li><strong>Hata Düzeltmeleri:</strong> Bazı YouTube oynatma listelerinin indirilmesi sırasında yaşanan bağlantı kopma sorunları giderildi.</li>
</ul>
<p>Herhangi bir sorun yaşarsanız destek talepleri üzerinden bizimle her zaman iletişime geçebilirsiniz.</p>`,
      type: "normal" as const,
      isPinned: true
    },
    {
      id: "maintenance",
      name: "🛠️ Planlı Bakım Çalışması",
      title: "Planlı Sunucu Bakım Çalışması Hakkında",
      content: `<div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.15); padding: 12px 16px; border-radius: 12px; color: #f43f5e; margin-bottom: 12px;">
  <strong>⚠️ ÖNEMLİ KESİNTİ BİLGİSİ</strong><br/>
  Daha kararlı ve daha hızlı bir indirme altyapısı sunabilmek adına sunucularımızda donanımsal yükseltme çalışmaları gerçekleştirilecektir.
</div>
<p><strong>Çalışma Zamanı:</strong> Bu gece 04:00 ile 05:00 saatleri arasında (Yaklaşık 1 saat).</p>
<p>Çalışma süresince video dönüştürme ve indirme işlemlerinde kısa süreli kesintiler veya gecikmeler yaşanabilecektir. Gösterdiğiniz anlayış için teşekkür ederiz.</p>`,
      type: "banner" as const,
      isPinned: false
    },
    {
      id: "discount",
      name: "🔥 Premium / VIP Kampanyası",
      title: "Sınırlı Süreli %50 Premium İndirimi Başladı!",
      content: `<p>VidiDown ayrıcalıklarını en uygun fiyatlarla deneyimlemenin tam zamanı! Bugüne özel tüm <strong>Premium Bireysel</strong> ve <strong>VIP Kurumsal</strong> üyelik paketlerimizde net <strong>%50 indirim</strong> fırsatı tanımlanmıştır.</p>
<ul>
  <li>Sınırsız ve 8K çözünürlüğe kadar yüksek kaliteli video indirme</li>
  <li>100 MB/s indirme hızı (Herhangi bir hız limiti olmadan)</li>
  <li>Tamamen reklamsız ve kesintisiz indirme deneyimi</li>
  <li>7/24 Öncelikli Canlı Destek hizmeti</li>
</ul>
<p>💡 <em>İndirim sepetinize otomatik olarak yansıtılmıştır. Profil sayfanızdan üyelik planınızı hemen yükselterek bu özel fırsatı kaçırmayın!</em></p>`,
      type: "popup" as const,
      isPinned: true
    },
    {
      id: "security-warning",
      name: "🔐 Güvenlik Uyarısı",
      title: "Önemli: Hesap Güvenliğiniz Hakkında Bilgilendirme",
      content: `<p>Değerli kullanıcılarımız,</p>
<p>Hesabınızın güvenliğini korumak amacıyla lütfen aşağıdaki güvenlik adımlarına hassasiyet gösteriniz:</p>
<ol>
  <li>VidiDown yetkilileri de dahil olmak üzere, şifrenizi hiçbir zaman üçüncü şahıslarla veya kendisini yetkili olarak tanıtan kişilerle paylaşmayın.</li>
  <li>Hesap güvenliğinizi artırmak için <strong>Profil > Hesap Güvenliği</strong> sekmesinden <strong>Google Authenticator (2FA)</strong> iki adımlı doğrulama sistemini etkinleştirin.</li>
  <li>Diğer platformlarda kullanmadığınız, güçlü ve özgün bir şifre belirleyin.</li>
</ol>
<p>Güvenli günler dileriz.</p>`,
      type: "normal" as const,
      isPinned: false
    },
    {
      id: "new-features",
      name: "🌟 Yeni Özellik: Filigransız TikTok & Reels",
      title: "TikTok ve Instagram Reels Videolarını Filigransız İndirin!",
      content: `<p>Beklenen özellik sonunda geldi! Artık TikTok ve Instagram Reels videolarını orijinal kalitesinde, <strong>filigransız (no-watermark)</strong> ve tamamen temiz bir şekilde tek tıkla indirebilirsiniz.</p>
<p>Yapmanız gereken tek şey video bağlantısını ana sayfadaki arama alanına yapıştırmak ve indirme seçeneklerinden "Filigransız MP4" formatını seçmek.</p>
<p>Keyifli indirmeler dileriz!</p>`,
      type: "normal" as const,
      isPinned: true
    }
  ];

  const handleApplyTemplate = (tpl: typeof ANNOUNCEMENT_TEMPLATES[0]) => {
    setAnnTitle(tpl.title);
    setAnnContent(tpl.content);
    setAnnType(tpl.type);
    setAnnPinned(tpl.isPinned);
    setSuccess(`"${tpl.name}" şablonu başarıyla dolduruldu!`);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await api.admin.deleteAnnouncement(id);
      if (res.success) {
        setSuccess("Duyuru başarıyla silindi.");
        loadDashboardData();
        if (onRefreshData) onRefreshData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Duyuru silinemedi.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) {
      setError("Başlık ve Duyuru içeriği zorunludur.");
      return;
    }
    try {
      const res = await api.admin.createAnnouncement({
        title: annTitle,
        content: annContent,
        type: annType,
        isPinned: annPinned,
        status: "active"
      });
      if (res.success) {
        setSuccess("Duyuru başarıyla oluşturuldu.");
        setAnnTitle("");
        setAnnContent("");
        setAnnType("normal");
        setAnnPinned(false);
        loadDashboardData();
        if (onRefreshData) onRefreshData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Duyuru oluşturulamadı.");
    }
  };

  const handleAdminReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyMessage || !activeAdminTicket) return;

    try {
      setLoading(true);
      const res = await api.replyTicket(activeAdminTicket.id, adminReplyMessage);
      if (res.success) {
        setSuccess("Cevabınız başarıyla gönderildi ve bilet 'Yanıtlandı' olarak işaretlendi.");
        setAdminReplyMessage("");
        setActiveAdminTicket(res.ticket);
        loadDashboardData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Cevap gönderilemedi.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: "open" | "answered" | "closed") => {
    try {
      const res = await api.admin.updateTicketStatus(id, status);
      if (res.success) {
        setSuccess(`Bilet durumu "${status === "closed" ? "Sonlandırıldı" : status === "answered" ? "Yanıtlandı" : "Açık"}" olarak güncellendi.`);
        
        // Update ticketsList immediately in state
        setTicketsList(prev => prev.map(t => t.id === id ? res.ticket : t));
        
        if (activeAdminTicket && activeAdminTicket.id === id) {
          setActiveAdminTicket(res.ticket);
        }
        loadDashboardData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Bilet durumu güncellenemedi.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      const res = await api.admin.deleteTicket(id);
      if (res.success) {
        setSuccess("Destek bileti kalıcı olarak silindi.");
        if (activeAdminTicket && activeAdminTicket.id === id) {
          setActiveAdminTicket(null);
        }
        setTicketsList(prev => prev.filter(t => t.id !== id));
        loadDashboardData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Bilet silinemedi.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.admin.saveSettings([
        { key: "site_name", value: siteName },
        { key: "site_title", value: siteTitle },
        { key: "maintenance_mode", value: maintenanceMode },
        { key: "ads_enabled", value: adsEnabled },
        { key: "adsense_client_id", value: adsenseClient },
        { key: "ad_slot_header", value: adSlotHeader },
        { key: "ad_slot_download", value: adSlotDownload },
        { key: "ad_slot_sidebar", value: adSlotSidebar },
        { key: "ad_slot_popunder", value: adSlotPopunder },
        { key: "free_download_speed", value: freeSpeed },
        { key: "premium_download_speed", value: premiumSpeed },
        { key: "premium_price", value: premiumPrice },
        { key: "vip_price", value: vipPrice },
        { key: "smtp_host", value: smtpHost },
        { key: "smtp_port", value: smtpPort },
        { key: "smtp_user", value: smtpUser },
        { key: "smtp_pass", value: smtpPass },
        { key: "smtp_secure", value: smtpSecure },
        { key: "firebase_api_key", value: firebaseApiKey },
        { key: "firebase_auth_domain", value: firebaseAuthDomain },
        { key: "firebase_project_id", value: firebaseProjectId },
        { key: "firebase_storage_bucket", value: firebaseStorageBucket },
        { key: "firebase_messaging_sender_id", value: firebaseMessagingSenderId },
        { key: "firebase_app_id", value: firebaseAppId },
        { key: "firebase_measurement_id", value: firebaseMeasurementId }
      ]);
      if (res.success) {
        setSuccess("Site, SMTP ve Firebase ayarları başarıyla kaydedildi.");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Ayarlar kaydedilemedi.");
    }
  };

  const handleToggleSetting = async (key: string, newValue: string) => {
    try {
      const res = await api.admin.saveSettings([
        { key: "site_name", value: siteName },
        { key: "site_title", value: siteTitle },
        { key: "maintenance_mode", value: key === "maintenance_mode" ? newValue : maintenanceMode },
        { key: "ads_enabled", value: key === "ads_enabled" ? newValue : adsEnabled },
        { key: "adsense_client_id", value: adsenseClient },
        { key: "ad_slot_header", value: adSlotHeader },
        { key: "ad_slot_download", value: adSlotDownload },
        { key: "ad_slot_sidebar", value: adSlotSidebar },
        { key: "ad_slot_popunder", value: adSlotPopunder },
        { key: "free_download_speed", value: freeSpeed },
        { key: "premium_download_speed", value: premiumSpeed },
        { key: "premium_price", value: premiumPrice },
        { key: "vip_price", value: vipPrice },
        { key: "smtp_host", value: smtpHost },
        { key: "smtp_port", value: smtpPort },
        { key: "smtp_user", value: smtpUser },
        { key: "smtp_pass", value: smtpPass },
        { key: "smtp_secure", value: smtpSecure },
        { key: "firebase_api_key", value: firebaseApiKey },
        { key: "firebase_auth_domain", value: firebaseAuthDomain },
        { key: "firebase_project_id", value: firebaseProjectId },
        { key: "firebase_storage_bucket", value: firebaseStorageBucket },
        { key: "firebase_messaging_sender_id", value: firebaseMessagingSenderId },
        { key: "firebase_app_id", value: firebaseAppId },
        { key: "firebase_measurement_id", value: firebaseMeasurementId }
      ]);
      if (res.success) {
        if (key === "maintenance_mode") setMaintenanceMode(newValue);
        if (key === "ads_enabled") setAdsEnabled(newValue);
        setSuccess(`${key === "maintenance_mode" ? "Bakım modu" : "Reklam dağıtımı"} başarıyla ${newValue === "true" ? "açıldı" : "kapatıldı"}.`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Ayar değiştirilemedi.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await api.admin.clearCache();
      setSuccess(res.message);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Önbellek temizlenemedi.");
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await api.admin.clearLogs();
      setSuccess(res.message);
      loadDashboardData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Loglar temizlenemedi.");
    }
  };

  const filteredUsers = userList.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (userStatusFilter === "active") return u.status === "active";
    if (userStatusFilter === "banned") return u.status === "banned";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-900 pb-6 mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Terminal className="h-6 w-6 text-teal-400" />
            <span>Yönetici Paneli (Dashboard)</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Yetkili kullanıcı: <span className="text-slate-200 font-semibold">{currentUser.username}</span> ({currentUser.email})
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs border border-slate-800 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
          <span>Verileri Yenile</span>
        </button>
      </div>

      {/* Admin Grid Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side menu */}
        <div className="lg:col-span-3 flex flex-col space-y-1 bg-slate-900/10 p-2 rounded-2xl border border-slate-900">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "dashboard" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Genel Durum</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "users" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Kullanıcı Yönetimi</span>
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "announcements" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Duyuru Sistemi</span>
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "blog" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Blog Yönetimi</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("tickets");
              setActiveAdminTicket(null);
            }}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "tickets" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <LifeBuoy className="h-4 w-4" />
            <span>Destek Talepleri</span>
          </button>
          <button
            onClick={() => setActiveTab("appeals")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "appeals" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>Ban İtirazları</span>
            {banAppeals.filter(a => a.status === "pending").length > 0 && (
              <span className="ml-auto bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {banAppeals.filter(a => a.status === "pending").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "settings" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Site & Reklam Ayarları</span>
          </button>
          <button
            onClick={() => setActiveTab("cache")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "cache" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Sunucu & Temizlik</span>
          </button>
        </div>

        {/* Right Side views */}
        <div className="lg:col-span-9 bg-slate-900/10 border border-slate-900 rounded-3xl p-6 sm:p-8 min-h-[500px]">
          
          {error && (
            <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs mb-6">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 p-4 rounded-xl text-xs mb-6">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && stats && (
            <div className="space-y-8">
              {/* Hızlı Sistem & Reklam Kontrolleri */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900/60 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                      <AlertTriangle className={`h-4 w-4 ${maintenanceMode === "true" ? "text-amber-500 animate-pulse" : "text-slate-500"}`} />
                      <span>Bakım Modu (Maintenance)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Açık olduğunda sadece yöneticiler siteye erişebilir.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      maintenanceMode === "true" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-slate-900 text-slate-500 border-slate-800"
                    }`}>
                      {maintenanceMode === "true" ? "AKTİF" : "KAPALI"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleSetting("maintenance_mode", maintenanceMode === "true" ? "false" : "true")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        maintenanceMode === "true" ? "bg-amber-500" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          maintenanceMode === "true" ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t md:border-t-0 md:border-l border-slate-900/60 pt-4 md:pt-0 md:pl-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                      <Megaphone className={`h-4 w-4 ${adsEnabled === "true" ? "text-teal-400" : "text-slate-500"}`} />
                      <span>Reklam Dağıtımı (Ads)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Sitedeki tüm Google AdSense ve özel reklam alanları.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      adsEnabled === "true" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-slate-900 text-slate-500 border-slate-800"
                    }`}>
                      {adsEnabled === "true" ? "AKTİF" : "KAPALI"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleSetting("ads_enabled", adsEnabled === "true" ? "false" : "true")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        adsEnabled === "true" ? "bg-teal-500" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          adsEnabled === "true" ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat Counters Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold tracking-wider uppercase">Toplam Üye</span>
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-3">{stats.totalUsers}</div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold tracking-wider uppercase">Toplam İndirme</span>
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-3">{stats.totalDownloads}</div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-teal-400">
                    <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Premium Üye</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-3">{stats.premiumUsers}</div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-rose-400">
                    <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Destek Talepleri</span>
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold text-white mt-3">{stats.openTickets}</div>
                </div>
              </div>

              {/* Hardware Monitoring Section */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900/60">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 mb-5 flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-teal-400" />
                  <span>Sunucu Donanım İzleme</span>
                </h3>

                <div className="space-y-4 text-xs font-mono">
                  {/* CPU usage */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1.5">
                      <span>CPU Kullanımı: {stats.hardware.cpuUsage}%</span>
                      <span>AMD EPYC™ 7003 Core (Cloud Run)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full transition-all duration-500" style={{ width: `${stats.hardware.cpuUsage}%` }}></div>
                    </div>
                  </div>

                  {/* RAM usage */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1.5">
                      <span>RAM Kullanımı: {stats.hardware.ramUsage}% (2.05 GB / 4.00 GB)</span>
                      <span>DDR4 High-Performance ECC</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full transition-all duration-500" style={{ width: `${stats.hardware.ramUsage}%` }}></div>
                    </div>
                  </div>

                  {/* Disk space */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1.5">
                      <span>Disk Alanı: {stats.hardware.diskUsage}% (14.2 GB / 50.0 GB)</span>
                      <span>NVMe SSD Cache Store</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full transition-all duration-500" style={{ width: `${stats.hardware.diskUsage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Browser / Device / Country bento grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Countries list */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                  <h4 className="font-bold text-slate-300 mb-4 tracking-wider uppercase">Ülke Dağılımı</h4>
                  <div className="space-y-3">
                    {countries.map((c, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>{c.name}</span>
                          <span>{c.count} ({c.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-slate-700 h-full" style={{ width: `${c.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Devices */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                  <h4 className="font-bold text-slate-300 mb-4 tracking-wider uppercase">Cihaz İstatistikleri</h4>
                  <div className="space-y-3">
                    {devices.map((d, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>{d.name}</span>
                          <span>{d.count} ({d.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-slate-700 h-full" style={{ width: `${d.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Browsers */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                  <h4 className="font-bold text-slate-300 mb-4 tracking-wider uppercase">Tarayıcı Dağılımı</h4>
                  <div className="space-y-3">
                    {browsers.map((b, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>{b.name}</span>
                          <span>{b.count} ({b.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-slate-700 h-full" style={{ width: `${b.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logs terminal output */}
              <div className="bg-slate-950 rounded-2xl border border-slate-900/60 overflow-hidden">
                <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-b border-slate-950">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center space-x-2">
                    <FileCode className="h-4 w-4 text-teal-400" />
                    <span>Son Sistem Günlük Kayıtları (Server Logs)</span>
                  </span>
                </div>
                <div className="p-4 bg-slate-950/80 font-mono text-[11px] text-slate-300 space-y-2 overflow-y-auto max-h-56">
                  {logs.map((log) => {
                    const color = log.type === "error" ? "text-rose-400" :
                                  log.type === "warning" ? "text-amber-400" :
                                  log.type === "auth" ? "text-purple-400" : "text-slate-400";
                    return (
                      <div key={log.id} className="leading-relaxed">
                        <span className="text-slate-500">[{new Date(log.createdAt).toLocaleTimeString("tr-TR")}]</span>{" "}
                        <span className={`${color} font-bold`}>[{log.type.toUpperCase()}]</span>{" "}
                        <span className="text-slate-400">IP: {log.ip} -</span>{" "}
                        <span>{log.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* USERS MANAGEMENT TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Kullanıcı adı veya e-posta ile ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-10 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900/60 space-x-1 self-start md:self-auto">
                  <button
                    onClick={() => setUserStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      userStatusFilter === "all"
                        ? "bg-slate-800 text-slate-100"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Tümü ({userList.length})
                  </button>
                  <button
                    onClick={() => setUserStatusFilter("active")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      userStatusFilter === "active"
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Aktifler ({userList.filter(u => u.status === "active").length})
                  </button>
                  <button
                    onClick={() => setUserStatusFilter("banned")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      userStatusFilter === "banned"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Yasaklılar ({userList.filter(u => u.status === "banned").length})
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-900/60 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-400">
                  <thead className="bg-slate-900/40 text-slate-200 border-b border-slate-900 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Kullanıcı</th>
                      <th className="px-5 py-3">E-posta</th>
                      <th className="px-5 py-3">Üyelik</th>
                      <th className="px-5 py-3">Durum</th>
                      <th className="px-5 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/10">
                        <td className="px-5 py-3.5 flex items-center space-x-2.5">
                          <img src={u.avatar} alt={u.username} className="w-7 h-7 rounded-full bg-slate-800" />
                          <div>
                            <div className="font-semibold text-slate-200">{u.username}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Rol: {u.role.toUpperCase()}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            u.premiumStatus === "vip" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            u.premiumStatus === "premium" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                            "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {u.premiumStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            u.status === "active" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                            "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            {u.status === "active" ? "AKTİF" : "YASAKLI"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          {/* Ban Action */}
                          {!(u.id === "usr_admin" || u.email.toLowerCase() === "winhtaner28@gmail.com") && (
                            u.status === "active" ? (
                              <button
                                onClick={() => {
                                  setBanningUser(u);
                                  setBanReason("");
                                }}
                                className="text-[10px] bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-2 py-1 rounded-lg border border-rose-500/20 transition-all font-semibold"
                              >
                                Engelle
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(u.id, "unban")}
                                className="text-[10px] bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-white px-2 py-1 rounded-lg border border-teal-500/20 transition-all font-semibold"
                              >
                                Engeli Kaldır
                              </button>
                            )
                          )}

                          {/* Toggle Admin */}
                          {u.role === "user" ? (
                            <button
                              onClick={() => handleUserAction(u.id, "set_admin")}
                              className="text-[10px] bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white px-2 py-1 rounded-lg border border-indigo-500/20 transition-all font-semibold"
                            >
                              Yetki Ver
                            </button>
                          ) : (
                            !(u.id === "usr_admin" || u.email.toLowerCase() === "winhtaner28@gmail.com") && (
                              <button
                                onClick={() => handleUserAction(u.id, "remove_admin")}
                                className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 px-2 py-1 rounded-lg border border-slate-700 transition-all font-semibold"
                              >
                                Yetki Al
                              </button>
                            )
                          )}

                          {/* Adjust premium level */}
                          <select
                            value={u.premiumStatus}
                            onChange={(e) => handleUserAction(u.id, "update_premium", { plan: e.target.value })}
                            className="text-[10px] bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-300"
                          >
                            <option value="free">FREE</option>
                            <option value="premium">PREM</option>
                            <option value="vip">VIP</option>
                          </select>

                          {!(u.id === "usr_admin" || u.email.toLowerCase() === "winhtaner28@gmail.com") && (
                            <button
                              onClick={() => {
                                if (confirm("Kullanıcıyı tamamen silmek istediğinizden emin misiniz?")) {
                                  handleUserAction(u.id, "delete");
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors inline-block align-middle"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === "announcements" && (
            <div className="space-y-8">
              {/* Ready Templates / Hazır Şablonlar */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  <span>Hazır Duyuru Şablonları (Tek Tıkla Doldur)</span>
                </h4>
                <p className="text-slate-400 text-xs mb-4">
                  Sitenizde sık sık paylaşacağınız genel durum bildirimlerini hazır şablonları kullanarak saniyeler içinde oluşturabilirsiniz.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ANNOUNCEMENT_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="text-left p-4 rounded-xl bg-slate-900 hover:bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors">
                          {tpl.name}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {tpl.title}
                        </p>
                      </div>
                      <span className="text-[9px] uppercase font-semibold text-slate-600 group-hover:text-teal-500/60 mt-3 transition-colors">
                        Şablonu Seç &raquo;
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Create announcement form & Active announcements list */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Create Form */}
                <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-900 space-y-4 h-fit">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2 border-b border-slate-900 pb-3">
                    <Megaphone className="h-4 w-4 text-teal-400" />
                    <span>Yeni Duyuru Oluştur</span>
                  </h3>

                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Başlık</label>
                      <input
                        type="text"
                        placeholder="Duyuru başlığı..."
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gösterim Biçimi</label>
                      <select
                        value={annType}
                        onChange={(e: any) => setAnnType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                      >
                        <option value="normal">Normal Akış (Sistem Duyuruları - Sağ Üstteki Zil Simgesi)</option>
                        <option value="banner">Banner (Ana sayfa tepesinde şerit)</option>
                        <option value="popup">Popup (Girişte ekranda beliren modal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Duyuru İçeriği (Saf Metin veya HTML)</label>
                      <textarea
                        rows={6}
                        placeholder="HTML veya düz metin formatında duyuru içeriğinizi girin..."
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none resize-none focus:border-teal-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="annPinned"
                        checked={annPinned}
                        onChange={(e) => setAnnPinned(e.target.checked)}
                        className="bg-slate-900 border border-slate-800 rounded focus:ring-0 text-teal-400 h-4 w-4"
                      />
                      <label htmlFor="annPinned" className="text-xs text-slate-400 select-none">Duyuruyu en üste sabitle (isPinned)</label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Duyuruyu Yayınla</span>
                    </button>
                  </form>
                </div>

                {/* Published List */}
                <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-900 flex flex-col h-full">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2 border-b border-slate-900 pb-3">
                    <Megaphone className="h-4 w-4 text-teal-400" />
                    <span>Yayınlanan Duyurular ({annList.length})</span>
                  </h3>

                  {annList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <Megaphone className="h-8 w-8 text-slate-700 mb-2 stroke-[1.5]" />
                      <p className="text-xs text-slate-500">Henüz yayınlanmış bir duyuru bulunmuyor.</p>
                      <p className="text-[10px] text-slate-600 mt-1">Soldaki şablonları kullanarak veya form ile hemen bir duyuru ekleyin.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {annList.map((ann: any) => (
                        <div
                          key={ann.id}
                          className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-200 text-xs">{ann.title}</span>
                              {ann.isPinned && (
                                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Sabit</span>
                              )}
                              <span className={`text-[9px] border px-1.5 py-0.5 rounded font-bold uppercase ${
                                ann.type === "popup"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : ann.type === "banner"
                                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                  : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                              }`}>
                                {ann.type === "popup" ? "Popup" : ann.type === "banner" ? "Banner" : "Duyuru"}
                              </span>
                            </div>
                            <div 
                              className="text-slate-400 text-[11px] leading-relaxed line-clamp-3 announcement-content"
                              dangerouslySetInnerHTML={{ __html: ann.content }}
                            />
                            <div className="text-[9px] text-slate-500 mt-2">
                              Oluşturulma: {new Date(ann.createdAt).toLocaleString("tr-TR")}
                            </div>
                          </div>

                          {deletingAnnId === ann.id ? (
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const res = await api.admin.deleteAnnouncement(ann.id);
                                    if (res.success) {
                                      setSuccess("Duyuru başarıyla silindi.");
                                      // Optimistic update
                                      setAnnList(prev => prev.filter(item => item.id !== ann.id));
                                      loadDashboardData();
                                      if (onRefreshData) onRefreshData();
                                      setTimeout(() => setSuccess(""), 3000);
                                    }
                                  } catch (err: any) {
                                    setError(err.message || "Duyuru silinemedi.");
                                    setTimeout(() => setError(""), 3000);
                                  } finally {
                                    setDeletingAnnId(null);
                                  }
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Evet, Sil
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingAnnId(null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                İptal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingAnnId(ann.id);
                                setTimeout(() => {
                                  setDeletingAnnId(prev => prev === ann.id ? null : prev);
                                }, 5000); // revert back after 5s
                              }}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 rounded-lg border border-rose-500/20 hover:border-transparent transition-all cursor-pointer flex-shrink-0"
                              title="Duyuruyu Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* BLOG MANAGEMENT TAB */}
          {activeTab === "blog" && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 mb-4 flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-teal-400" />
                <span>Blog / Kılavuz Makalesi Ekle</span>
              </h3>

              <form onSubmit={handleCreateBlog} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Makale Başlığı</label>
                    <input
                      type="text"
                      placeholder="TikTok filigransız indirme taktikleri..."
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="cat_1">Video İndirme Rehberleri</option>
                      <option value="cat_2">Gelişmeler & Güncellemeler</option>
                      <option value="cat_3">Sık Sorulan Sorular</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kapak Resmi Görsel URL (Unsplash)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={blogImage}
                    onChange={(e) => setBlogImage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Makale İçeriği (Markdown veya Düz yazı)</label>
                  <textarea
                    rows={6}
                    placeholder="Detaylı rehber içeriğinizi buraya giriniz..."
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Makaleyi Yayınla</span>
                </button>
              </form>
            </div>
          )}

          {/* SITE SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 mb-4 flex items-center space-x-2">
                <Settings className="h-4 w-4 text-teal-400" />
                <span>Site Genel & Reklam Yapılandırması</span>
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Site İsmi (Settings)</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Site Meta Başlığı (SEO)</label>
                    <input
                      type="text"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bakım Modu (Maintenance)</label>
                    <select
                      value={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="false">Kapalı (Aktif site)</option>
                      <option value="true">Açık (Sadece admin girebilir)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Reklam Dağıtımı (Google AdSense)</label>
                    <select
                      value={adsEnabled}
                      onChange={(e) => setAdsEnabled(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="true">Aktif (Reklam alanları görünür)</option>
                      <option value="false">Pasif (Reklam alanları gizlenir)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">AdSense Yayıncı Kodu</label>
                    <input
                      type="text"
                      placeholder="ca-pub-12345..."
                      value={adsenseClient}
                      onChange={(e) => setAdsenseClient(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ücretsiz Hız Limiti (MB/s)</label>
                    <input
                      type="number"
                      value={freeSpeed}
                      onChange={(e) => setFreeSpeed(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Premium Hız Limiti (MB/s)</label>
                    <input
                      type="number"
                      value={premiumSpeed}
                      onChange={(e) => setPremiumSpeed(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gelişmiş Reklam Yönetim Alanları */}
                <div className="border-t border-slate-900/60 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Megaphone className="h-3.5 w-3.5" />
                    <span>Gelişmiş Reklam Yerleşimi (HTML / JS / Iframe)</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] -mt-2">Google AdSense, Popunder veya diğer reklam ağlarından aldığınız reklam kodlarını aşağıdaki alanlara yapıştırarak sitenize entegre edebilirsiniz.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Üst Banner Reklam Kodu (Header Ad)</label>
                      <textarea
                        rows={3}
                        value={adSlotHeader}
                        onChange={(e) => setAdSlotHeader(e.target.value)}
                        placeholder="<a href='#'><img src='banner.png' /></a> veya AdSense kodu..."
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none font-mono resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">İndirme Sayfası Reklam Kodu (Download Page Ad)</label>
                      <textarea
                        rows={3}
                        value={adSlotDownload}
                        onChange={(e) => setAdSlotDownload(e.target.value)}
                        placeholder="İndirme butonu altındaki reklam kodu..."
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none font-mono resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Yan Menü / Sidebar Reklam Kodu (Sidebar Ad)</label>
                      <textarea
                        rows={3}
                        value={adSlotSidebar}
                        onChange={(e) => setAdSlotSidebar(e.target.value)}
                        placeholder="Sol/Sağ boşluklardaki dikey banner kodları..."
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none font-mono resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Popunder / Arka Plan Pop-up Reklam Kodu (Popunder Ad)</label>
                      <textarea
                        rows={3}
                        value={adSlotPopunder}
                        onChange={(e) => setAdSlotPopunder(e.target.value)}
                        placeholder="Ziyaretçi tıkladığında açılan reklam script kodları..."
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none font-mono resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Üyelik Paket Ücretleri */}
                <div className="border-t border-slate-900/60 pt-4 space-y-4">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Üyelik Paketi Fiyatlandırması (₺)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Premium Üyelik Ücreti (₺ / aylık)</label>
                      <input
                        type="number"
                        value={premiumPrice}
                        onChange={(e) => setPremiumPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">VIP Üyelik Ücreti (₺ / aylık)</label>
                      <input
                        type="number"
                        value={vipPrice}
                        onChange={(e) => setVipPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* E-posta Gönderim Ayarları (SMTP) */}
                <div className="border-t border-slate-900/60 pt-4 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span>E-posta Gönderim Ayarları (SMTP / Gmail)</span>
                    </h4>
                    <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded px-2 py-0.5">
                      Şifremi Unuttum Doğrulama Kodu İçin
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] -mt-2">
                    Sistemdeki kullanıcıların şifrelerini unuttuklarında doğrulama kodu alabilmeleri için Gmail veya özel bir SMTP sunucusu bilgilerinizi giriniz. 
                    <strong className="text-amber-400/90 ml-1">Önemli (Gmail):</strong> İki adımlı doğrulaması açık olan bir Gmail hesabından "Uygulama Şifreleri" kısmından 16 haneli bir şifre oluşturup "SMTP Şifresi" kısmına yapıştırmalısınız.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">SMTP Host / Sunucu</label>
                      <input
                        type="text"
                        placeholder="smtp.gmail.com"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">SMTP Port</label>
                      <input
                        type="text"
                        placeholder="587 veya 465"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Güvenli Bağlantı (SSL / TLS)</label>
                      <select
                        value={smtpSecure}
                        onChange={(e) => setSmtpSecure(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="false">STARTTLS / TLS (Port 587 için önerilir)</option>
                        <option value="true">SSL / TLS (Port 465 için önerilir)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">SMTP Kullanıcı Adı (E-posta)</label>
                      <input
                        type="email"
                        placeholder="ornek@gmail.com"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">SMTP Şifresi / Uygulama Şifresi</label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Firebase Ayarları */}
                <div className="border-t border-slate-900/60 pt-4 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      <span>Firebase Bağlantı Ayarları</span>
                    </h4>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-2 py-0.5">
                      İstemci & Veritabanı Yapılandırması
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] -mt-2">
                    Firebase entegrasyonu, kimlik doğrulama, kullanıcı yönetimi ve ek veritabanı özellikleri için gereklidir. Firebase Console üzerinden aldığınız web uygulaması yapılandırma parametrelerini buraya girebilirsiniz.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Firebase API Key</label>
                      <input
                        type="text"
                        placeholder="AIzaSy..."
                        value={firebaseApiKey}
                        onChange={(e) => setFirebaseApiKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Auth Domain</label>
                      <input
                        type="text"
                        placeholder="projeniz.firebaseapp.com"
                        value={firebaseAuthDomain}
                        onChange={(e) => setFirebaseAuthDomain(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Project ID</label>
                      <input
                        type="text"
                        placeholder="projeniz-id"
                        value={firebaseProjectId}
                        onChange={(e) => setFirebaseProjectId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Bucket</label>
                      <input
                        type="text"
                        placeholder="projeniz.appspot.com"
                        value={firebaseStorageBucket}
                        onChange={(e) => setFirebaseStorageBucket(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Messaging Sender ID</label>
                      <input
                        type="text"
                        placeholder="894723912401"
                        value={firebaseMessagingSenderId}
                        onChange={(e) => setFirebaseMessagingSenderId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">App ID</label>
                      <input
                        type="text"
                        placeholder="1:894723912401:web:abc123xyz"
                        value={firebaseAppId}
                        onChange={(e) => setFirebaseAppId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Measurement ID</label>
                      <input
                        type="text"
                        placeholder="G-ABC123XYZ"
                        value={firebaseMeasurementId}
                        onChange={(e) => setFirebaseMeasurementId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Ayarları Kaydet</span>
                </button>
              </form>
            </div>
          )}

          {/* TICKETS TAB */}
          {activeTab === "tickets" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 flex items-center space-x-2">
                    <LifeBuoy className="h-4 w-4 text-teal-400" />
                    <span>Kullanıcı Destek Talepleri</span>
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Kullanıcılar tarafından açılan teknik destek ve yardım taleplerini buradan inceleyip yanıtlayabilirsiniz.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(["all", "open", "answered", "closed"] as const).map((filter) => {
                    const count = ticketsList.filter(t => filter === "all" ? true : t.status === filter).length;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setTicketFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          ticketFilter === filter
                            ? "bg-teal-500/10 text-teal-400 border-teal-500/25"
                            : "bg-slate-950/40 text-slate-400 border-slate-900 hover:text-slate-200"
                        }`}
                      >
                        {filter === "all" ? "Tümü" : filter === "open" ? "Açık" : filter === "answered" ? "Yanıtlandı" : "Kapatıldı"}
                        <span className="ml-1.5 font-mono text-[9px] opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ticket Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Bilet başlığı, mesajı veya bilet ID ile arayın..."
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Grid: Tickets List & Active Chat */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Tickets List Column */}
                <div className={`lg:col-span-5 space-y-3 ${activeAdminTicket ? "hidden lg:block" : "block"}`}>
                  <div className="max-h-[550px] overflow-y-auto space-y-2 pr-2">
                    {(() => {
                      const filteredTickets = ticketsList.filter(t => {
                        const matchesFilter = ticketFilter === "all" || t.status === ticketFilter;
                        const lowerQuery = ticketSearchQuery.toLowerCase();
                        const matchesSearch = t.subject.toLowerCase().includes(lowerQuery) || 
                          t.message.toLowerCase().includes(lowerQuery) || 
                          (t.id && t.id.toLowerCase().includes(lowerQuery));
                        return matchesFilter && matchesSearch;
                      });

                      if (filteredTickets.length === 0) {
                        return (
                          <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-900">
                            <MessageSquare className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Kriterlere uygun destek talebi bulunamadı.</p>
                          </div>
                        );
                      }

                      return filteredTickets.map((ticket) => {
                        const lastReply = ticket.replies && ticket.replies[ticket.replies.length - 1];
                        const isSelected = activeAdminTicket && activeAdminTicket.id === ticket.id;

                        return (
                          <button
                            key={ticket.id}
                            type="button"
                            onClick={() => {
                              setActiveAdminTicket(ticket);
                              setAdminReplyMessage("");
                            }}
                            className={`w-full p-4 rounded-xl border transition-all duration-300 cursor-pointer group text-left block ${
                              isSelected
                                ? "bg-teal-500/10 border-teal-500/25 text-teal-400"
                                : "bg-slate-950 hover:bg-slate-900 border-slate-900 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <span className="font-bold text-slate-200 text-xs truncate group-hover:text-teal-400 transition-colors max-w-[150px]">
                                {ticket.subject}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${
                                ticket.status === "open"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : ticket.status === "answered"
                                    ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                    : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}>
                                {ticket.status === "open" ? "Açık" : ticket.status === "answered" ? "Cevaplandı" : "Kapalı"}
                              </span>
                            </div>

                            <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                              {lastReply ? `Son Yanıt: ${lastReply.message}` : ticket.message}
                            </p>

                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-3 pt-2 border-t border-slate-900">
                              <span>Bilet ID: {ticket.id}</span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString("tr-TR")}</span>
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Ticket Detail / Reply Column */}
                <div className={`lg:col-span-7 ${activeAdminTicket ? "block" : "hidden lg:block"}`}>
                  {activeAdminTicket ? (
                    <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col h-[550px]">
                      
                      {/* Detail Header */}
                      <div className="p-4 bg-slate-900/60 border-b border-slate-900 flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => setActiveAdminTicket(null)}
                            className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors lg:hidden"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{activeAdminTicket.subject}</h4>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Oluşturan: User #{activeAdminTicket.userId}
                            </div>
                          </div>
                        </div>

                        {/* Status Controls */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {activeAdminTicket.status !== "closed" ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateTicketStatus(activeAdminTicket.id, "closed")}
                              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-600 hover:text-slate-950 text-amber-400 border border-amber-500/20 hover:border-transparent rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1 animate-pulse hover:animate-none"
                              title="Sohbeti Sonlandır (Kullanıcıya bildirim gider)"
                            >
                              <span>Sohbeti Sonlandır</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[9px] font-bold rounded-lg border border-slate-750">
                                SOHBET SONLANDIRILDI
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateTicketStatus(activeAdminTicket.id, "open")}
                                className="px-2 py-1 bg-teal-500/10 hover:bg-teal-500 hover:text-slate-950 text-teal-400 border border-teal-500/20 hover:border-transparent rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                              >
                                Tekrar Aç
                              </button>
                            </div>
                          )}

                          {/* Quick dropdown for other statuses */}
                          <select
                            value={activeAdminTicket.status}
                            onChange={(e: any) => handleUpdateTicketStatus(activeAdminTicket.id, e.target.value)}
                            className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-400 focus:outline-none uppercase cursor-pointer hover:bg-slate-900 hover:text-slate-200 transition-colors"
                          >
                            <option value="open">Açık</option>
                            <option value="answered">Yanıtlandı</option>
                            <option value="closed">Kapalı</option>
                          </select>

                          {/* Delete Ticket Action */}
                          {deletingTicketId === activeAdminTicket.id ? (
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteTicket(activeAdminTicket.id);
                                  setDeletingTicketId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Evet, Sil
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingTicketId(null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                İptal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingTicketId(activeAdminTicket.id);
                                setTimeout(() => {
                                  setDeletingTicketId(prev => prev === activeAdminTicket.id ? null : prev);
                                }, 5000); // revert back after 5s
                              }}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent rounded-xl transition-all cursor-pointer"
                              title="Destek Talebini Tamamen Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
                        {/* User's Original Message */}
                        <div className="flex items-start space-x-2.5 max-w-[85%]">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-slate-300">
                            U
                          </div>
                          <div className="bg-slate-900 border border-slate-900/60 rounded-2xl p-3 text-slate-200">
                            <div className="text-[9px] font-mono text-slate-500 font-bold mb-1">
                              KULLANICI (BİLET SAHİBİ)
                            </div>
                            <p className="text-xs whitespace-pre-line leading-relaxed">{activeAdminTicket.message}</p>
                            <div className="text-[9px] font-mono text-slate-500 mt-2 text-right">
                              {new Date(activeAdminTicket.createdAt).toLocaleDateString("tr-TR")} {new Date(activeAdminTicket.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>

                        {/* Reply Thread */}
                        {activeAdminTicket.replies && activeAdminTicket.replies.map((rep: any) => {
                          const isAdminReply = rep.senderRole === "admin";
                          return (
                            <div
                              key={rep.id}
                              className={`flex items-start space-x-2.5 max-w-[85%] ${isAdminReply ? "ml-auto flex-row-reverse space-x-reverse" : ""}`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                isAdminReply ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-slate-300"
                              }`}>
                                {isAdminReply ? "Y" : "U"}
                              </div>
                              <div className={`rounded-2xl p-3 border ${
                                isAdminReply 
                                  ? "bg-teal-500/10 border-teal-500/20 text-teal-100" 
                                  : "bg-slate-900 border-slate-900/60 text-slate-200"
                              }`}>
                                <div className="text-[9px] font-mono text-slate-500 font-bold mb-1">
                                  {isAdminReply ? "YÖNETİCİ (DESTEK EKİBİ)" : "KULLANICI"}
                                </div>
                                <p className="text-xs whitespace-pre-line leading-relaxed">{rep.message}</p>
                                <div className="text-[9px] font-mono text-slate-500 mt-2 text-right">
                                  {new Date(rep.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reply Input Form */}
                      <form onSubmit={handleAdminReplyTicket} className="p-3 bg-slate-900 border-t border-slate-900 flex items-center space-x-2.5">
                        <input
                          type="text"
                          placeholder="Kullanıcıya yardımcı olmak için cevap yazın..."
                          value={adminReplyMessage}
                          onChange={(e) => setAdminReplyMessage(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={loading || !adminReplyMessage}
                          className="p-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-slate-950 rounded-xl transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>

                    </div>
                  ) : (
                    <div className="h-[550px] bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                      <MessageSquare className="h-10 w-10 text-slate-700 stroke-[1.5] mb-3" />
                      <h4 className="text-slate-300 font-bold text-xs">Herhangi bir destek talebi seçilmedi</h4>
                      <p className="text-slate-500 text-[11px] max-w-xs mt-1">
                        Sol taraftaki listeden bir destek biletine tıklayarak yazışma geçmişini görüntüleyebilir ve kullanıcıya cevap yazabilirsiniz.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* BAN APPEALS TAB */}
          {activeTab === "appeals" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 flex items-center space-x-2">
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
                    <span>Kullanıcı Ban İtiraz Başvuruları</span>
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-1">Yasaklanan kullanıcıların unban talepleri ve gerekçeleri burada listelenir.</p>
                </div>
              </div>

              {banAppeals.length === 0 ? (
                <div className="bg-slate-950 border border-slate-900 rounded-2xl p-8 text-center text-slate-500">
                  Şu ana kadar yapılmış herhangi bir ban itirazı bulunmuyor.
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-900">
                        <tr>
                          <th className="p-4">Kullanıcı</th>
                          <th className="p-4">E-posta</th>
                          <th className="p-4">Orijinal Ban Nedeni</th>
                          <th className="p-4 max-w-xs">Kullanıcı İtiraz Açıklaması</th>
                          <th className="p-4">Gönderim Tarihi</th>
                          <th className="p-4 text-center">Durum</th>
                          <th className="p-4 text-center">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {banAppeals.map((appeal: any) => (
                          <tr key={appeal.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-4 font-semibold text-slate-200">{appeal.username}</td>
                            <td className="p-4 text-slate-400">{appeal.email}</td>
                            <td className="p-4 text-rose-400 font-medium">{appeal.reason}</td>
                            <td className="p-4 max-w-xs text-slate-300 whitespace-pre-line leading-relaxed">{appeal.appealMessage}</td>
                            <td className="p-4 text-slate-500 font-mono text-[10px]">
                              {new Date(appeal.createdAt).toLocaleDateString("tr-TR")} {new Date(appeal.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                appeal.status === "pending"
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  : appeal.status === "approved"
                                  ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              }`}>
                                {appeal.status === "pending" && "Bekliyor"}
                                {appeal.status === "approved" && "Kabul Edildi"}
                                {appeal.status === "rejected" && "Reddedildi"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center items-center space-x-2">
                                {appeal.status === "pending" ? (
                                  <>
                                    <button
                                      onClick={() => handleBanAppealAction(appeal.id, "approve")}
                                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                                      title="Banı Kaldır (Kabul Et)"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Banı Kaldır</span>
                                    </button>
                                    <button
                                      onClick={() => handleBanAppealAction(appeal.id, "reject")}
                                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-bold rounded-lg text-[10px] border border-rose-500/20 transition-all cursor-pointer"
                                      title="Reddet"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Reddet</span>
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-slate-500 italic">İşlem Tamamlandı</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CACHE / LOGS CLEAN TAB */}
          {activeTab === "cache" && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 mb-4 flex items-center space-x-2">
                <Database className="h-4 w-4 text-teal-400" />
                <span>Sunucu Dosya Yönetimi & Önbellek Temizleme</span>
              </h3>

              <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Geçici Video Önbelleği (Temporal Transcoded Cache)</h4>
                  <p className="text-slate-500 text-[11px] mt-1">Dönüştürülen videolar sunucuda aşırı disk kaplamaması için her 24 saatte bir otomatik temizlenir. Manuel temizlemek için tıklayın.</p>
                </div>
                <button
                  onClick={handleClearCache}
                  className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2.5 rounded-xl border border-rose-500/20 text-xs font-semibold whitespace-nowrap tracking-wide transition-all cursor-pointer"
                >
                  Dosya Önbelleğini Temizle
                </button>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Sistem Günlük Kayıtları (System Logs)</h4>
                  <p className="text-slate-500 text-[11px] mt-1">Güvenlik ve indirme kayıtlarının tutulduğu veritabanı log tablosunu tamamen boşaltır.</p>
                </div>
                <button
                  onClick={handleClearLogs}
                  className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2.5 rounded-xl border border-rose-500/20 text-xs font-semibold whitespace-nowrap tracking-wide transition-all cursor-pointer"
                >
                  Sistem Loglarını Sıfırla
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {banningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setBanningUser(null)}></div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <span>Kullanıcıyı Engelle</span>
            </h3>
            <p className="text-slate-400 text-xs mb-4">
              <span className="font-semibold text-slate-300">{banningUser.username}</span> ({banningUser.email}) isimli kullanıcıyı engellemek üzeresiniz. Lütfen engelleme gerekçesini belirtin:
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Engelleme Nedeni</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Kural ihlali, spam vb. (Boş bırakılırsa 'Kural ihlali' yazılacaktır)"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-600"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBanningUser(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUserAction(banningUser.id, "ban", { reason: banReason || "Kural ihlali" });
                    setBanningUser(null);
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Engellemeyi Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
