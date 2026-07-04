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
  Sparkles
} from "lucide-react";
import { User, Download as DownloadType, Announcement, Blog, Category, SystemStats } from "../types";
import { api } from "../api";

interface AdminPanelProps {
  currentUser: User;
  onRefreshData?: () => void;
}

export default function AdminPanel({ currentUser, onRefreshData }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "announcements" | "blog" | "settings" | "cache">("dashboard");
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

  // Forms / Management state
  const [searchQuery, setSearchQuery] = useState("");
  const [banReason, setBanReason] = useState("");

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
  const [freeSpeed, setFreeSpeed] = useState("5");
  const [premiumSpeed, setPremiumSpeed] = useState("100");
  const [premiumPrice, setPremiumPrice] = useState("149");
  const [vipPrice, setVipPrice] = useState("399");

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

      // Fetch settings to fill inputs
      const settingsRes = await api.getSettings();
      if (settingsRes.success) {
        const s = settingsRes.settings;
        if (s.site_name) setSiteName(s.site_name);
        if (s.site_title) setSiteTitle(s.site_title);
        if (s.maintenance_mode) setMaintenanceMode(s.maintenance_mode);
        if (s.ads_enabled) setAdsEnabled(s.ads_enabled);
        if (s.adsense_client_id) setAdsenseClient(s.adsense_client_id);
        if (s.free_download_speed) setFreeSpeed(s.free_download_speed);
        if (s.premium_download_speed) setPremiumSpeed(s.premium_download_speed);
        if (s.premium_price) setPremiumPrice(s.premium_price);
        if (s.vip_price) setVipPrice(s.vip_price);
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.admin.saveSettings([
        { key: "site_name", value: siteName },
        { key: "site_title", value: siteTitle },
        { key: "maintenance_mode", value: maintenanceMode },
        { key: "ads_enabled", value: adsEnabled },
        { key: "adsense_client_id", value: adsenseClient },
        { key: "free_download_speed", value: freeSpeed },
        { key: "premium_download_speed", value: premiumSpeed },
        { key: "premium_price", value: premiumPrice },
        { key: "vip_price", value: vipPrice }
      ]);
      if (res.success) {
        setSuccess("Site ayarları başarıyla kaydedildi.");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Ayarlar kaydedilemedi.");
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

  const filteredUsers = userList.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <div className="flex items-center justify-between gap-4">
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
                            {u.status === "active" ? "AKTİF" : "ENGELLE"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          {/* Ban Action */}
                          {!(u.id === "usr_admin" || u.email.toLowerCase() === "winhtaner28@gmail.com") && (
                            u.status === "active" ? (
                              <button
                                onClick={() => {
                                  const r = prompt("Engelleme gerekçesini giriniz:");
                                  if (r !== null) handleUserAction(u.id, "ban", { reason: r });
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
                                Kaldır
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
            <div className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 mb-4 flex items-center space-x-2">
                <Megaphone className="h-4 w-4 text-teal-400" />
                <span>Yeni Duyuru Yayınla</span>
              </h3>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Başlık</label>
                    <input
                      type="text"
                      placeholder="Duyuru başlığı..."
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gösterim Biçimi</label>
                    <select
                      value={annType}
                      onChange={(e: any) => setAnnType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="normal">Normal Akış (Duyurular listesi)</option>
                      <option value="banner">Banner (Ana sayfa tepesinde)</option>
                      <option value="popup">Popup (Girişte ekranda beliren)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Duyuru İçeriği</label>
                  <textarea
                    rows={4}
                    placeholder="HTML veya saf metin formatında duyuru içeriğinizi girin..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="annPinned"
                    checked={annPinned}
                    onChange={(e) => setAnnPinned(e.target.checked)}
                    className="bg-slate-950 border border-slate-900 rounded focus:ring-0 text-teal-400 h-4 w-4"
                  />
                  <label htmlFor="annPinned" className="text-xs text-slate-400">Duyuruyu en üste sabitle (isPinned)</label>
                </div>

                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Duyuruyu Yayınla</span>
                </button>
              </form>
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
    </div>
  );
}
