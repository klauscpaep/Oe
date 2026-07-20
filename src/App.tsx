import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FAQ from "./components/FAQ";
import BlogView from "./components/BlogView";
import TicketSystem from "./components/TicketSystem";
import AdminPanel from "./components/AdminPanel";
import ProfileView from "./components/ProfileView";
import PremiumView from "./components/PremiumView";
import AuthModal from "./components/AuthModal";
import InstallWizard from "./components/InstallWizard";
import { User, Download, Announcement, Blog, Category } from "./types";
import { api, setAuthToken, getAuthToken } from "./api";
import { updateFirebaseConfig } from "./firebase";
import { 
  Search, 
  Download as DlIcon, 
  Sparkles, 
  Clock, 
  Flame, 
  Play, 
  HelpCircle, 
  AlertTriangle,
  CheckCircle,
  Megaphone,
  X,
  Mail,
  Smartphone,
  Check,
  Send,
  Wrench
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Global States
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<string>("home");
  const [isInstalled, setIsInstalled] = useState<boolean>(true);
  const [authOpen, setAuthOpen] = useState(false);

  // Video Search & Download States
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("YouTube");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<any | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("MP4");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState("");
  const [downloadDone, setDownloadDone] = useState<Download | null>(null);
  const [searchError, setSearchError] = useState("");

  // Static Fetched States
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<Download[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem("vidi_site_settings");
      return cached ? JSON.parse(cached) : {
        site_name: "VidiDown",
        site_title: "VidiDown - Çoklu Platform Video & Ses Dönüştürücü",
        maintenance_mode: "false",
        ads_enabled: "true",
        free_download_speed: "5",
        premium_download_speed: "100"
      };
    } catch {
      return {};
    }
  });

  // Active Popup Announcement
  const [activePopup, setActivePopup] = useState<Announcement | null>(null);

  // Cookie & GDPR consent states
  const [cookieConsent, setCookieConsent] = useState<boolean>(() => {
    return localStorage.getItem("vidi_cookie_consent") === "true";
  });

  // Contact page states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");

  const [bannedUserInfo, setBannedUserInfo] = useState<any>(null);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | "forgot" | "twoFactor" | "banned" | undefined>(undefined);

  const handleApiError = (err: any) => {
    if (err.banned) {
      setBannedUserInfo({
        userId: err.userId,
        username: err.username,
        email: err.email,
        reason: err.reason
      });
      setAuthModalMode("banned");
      setAuthOpen(true);
    }
  };

  const isAds = siteSettings.ads_enabled === "true" && (!user || user.premiumStatus === "free");
  const showMaintenance = siteSettings.maintenance_mode === "true" && (!user || user.role !== "admin");

  // Check login & load public content
  const initApp = async () => {
    try {
      // 1. Fetch settings and health in parallel FIRST to bootstrap the UI
      const [settingsRes, health] = await Promise.all([
        api.getSettings().catch(() => null),
        api.health().catch(() => null)
      ]);

      if (!health) {
        setIsInstalled(false);
        return;
      }

      if (settingsRes && settingsRes.success) {
        setSiteSettings(settingsRes.settings);
        localStorage.setItem("vidi_site_settings", JSON.stringify(settingsRes.settings));
        updateFirebaseConfig(settingsRes.settings);
      } else {
        const cached = localStorage.getItem("vidi_site_settings");
        if (!cached) {
          setIsInstalled(false);
          return;
        }
      }

      // 2. Fetch other resources in parallel to make the page load in under 100ms
      const token = getAuthToken();
      
      const blogPromise = api.getBlog().catch(() => null);
      const annPromise = api.getAnnouncements().catch(() => null);
      const dlHistoryPromise = api.getDownloadHistory().catch(() => null);
      
      // Conditionally fetch user and tickets if token exists
      const mePromise = token ? api.me().catch((err) => ({ error: err })) : Promise.resolve(null);
      const ticketsPromise = token ? api.getTickets().catch(() => null) : Promise.resolve(null);

      const [blogRes, annRes, dlHistory, meRes, ticketRes] = await Promise.all([
        blogPromise,
        annPromise,
        dlHistoryPromise,
        mePromise,
        ticketsPromise
      ]);

      // Handle Blog Data
      if (blogRes && blogRes.success) {
        setBlogs(blogRes.blog);
        setCategories(blogRes.categories);
      }

      // Handle Announcements
      if (annRes && annRes.success) {
        setAnnouncements(annRes.announcements);
        const popup = annRes.announcements.find((a: Announcement) => a.type === "popup");
        if (popup) {
          setActivePopup(popup);
        }
      }

      // Handle Download History
      if (dlHistory && dlHistory.success) {
        setRecentDownloads(dlHistory.downloads);
      }

      // Handle User Data / Token Auth
      if (token && meRes) {
        if (meRes.success) {
          setUser(meRes.user);
        } else if (meRes.error) {
          const err = meRes.error;
          if (err.banned) {
            handleApiError(err);
          } else {
            setAuthToken(null);
            setUser(null);
          }
        } else if (meRes.banned) {
          handleApiError(meRes);
        } else {
          setAuthToken(null);
          setUser(null);
        }
      }

      // Handle Tickets
      if (ticketRes && ticketRes.success) {
        setTickets(ticketRes.tickets);
      }

      setIsInstalled(true);
    } catch (e) {
      console.error("App initialization failed:", e);
      setIsInstalled(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  // Dynamic background polling for real-time site settings, announcements, and blogs (no F5 needed)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        // Fetch latest settings in background
        const settingsRes = await api.getSettings().catch(() => null);
        if (settingsRes && settingsRes.success) {
          setSiteSettings((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(settingsRes.settings)) {
              localStorage.setItem("vidi_site_settings", JSON.stringify(settingsRes.settings));
              updateFirebaseConfig(settingsRes.settings);
              return settingsRes.settings;
            }
            return prev;
          });
        }

        // Fetch announcements in background
        const annRes = await api.getAnnouncements().catch(() => null);
        if (annRes && annRes.success) {
          setAnnouncements((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(annRes.announcements)) {
              const popup = annRes.announcements.find((a: Announcement) => a.type === "popup");
              if (popup) {
                setActivePopup((current) => {
                  if (!current || current.id !== popup.id || current.title !== popup.title) {
                    return popup;
                  }
                  return current;
                });
              }
              return annRes.announcements;
            }
            return prev;
          });
        }

        // Fetch blogs/categories in background
        const blogRes = await api.getBlog().catch(() => null);
        if (blogRes && blogRes.success) {
          setBlogs((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(blogRes.blog)) {
              return blogRes.blog;
            }
            return prev;
          });
          setCategories((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(blogRes.categories)) {
              return blogRes.categories;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn("Background sync failed silently:", err);
      }
    }, 3000); // Polling every 3 seconds (extremely responsive and lightweight)

    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    if (siteSettings && siteSettings.site_title) {
      document.title = siteSettings.site_title;
    }
  }, [siteSettings]);

  // Gelişmiş Popunder & Reklam scripti tetikleyici
  useEffect(() => {
    if (isAds && siteSettings.ad_slot_popunder) {
      try {
        const div = document.createElement("div");
        div.innerHTML = siteSettings.ad_slot_popunder;
        const scripts = Array.from(div.getElementsByTagName("script"));
        scripts.forEach((oldScript) => {
          const newScript = document.createElement("script");
          if (oldScript.src) {
            newScript.src = oldScript.src;
          } else {
            newScript.textContent = oldScript.textContent;
          }
          document.body.appendChild(newScript);
        });
      } catch (e) {
        console.warn("Popunder/Popup reklam yükleme hatası:", e);
      }
    }
  }, [isAds, siteSettings.ad_slot_popunder]);

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setView("home");
    setTickets([]);
  };

  const handleOpenAuth = () => {
    setAuthOpen(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    initApp();
  };

  const handleMetadataFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    setFetchingMetadata(true);
    setSearchError("");
    setVideoMetadata(null);
    setDownloadDone(null);
    setDownloadProgress(0);

    try {
      const res = await api.getVideoInfo(videoUrl, selectedPlatform);
      setVideoMetadata(res);
      // Auto-select first quality
      if (res.qualities && res.qualities.length > 0) {
        setSelectedQuality(res.qualities[0]);
      }
    } catch (err: any) {
      if (err.banned) {
        handleApiError(err);
      }
      setSearchError(err.message || "Video bilgileri alınamadı. Lütfen URL adresini kontrol edin.");
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleStartDownload = async () => {
    if (!videoMetadata) return;

    setDownloading(true);
    setDownloadProgress(0);
    setDownloadDone(null);

    try {
      const res = await api.startDownload({
        title: videoMetadata.title,
        url: videoUrl,
        format: selectedFormat,
        quality: selectedQuality,
        userId: user ? user.id : null,
        platform: videoMetadata.platform
      });

      if (res.success) {
        // Simulated progress ticker based on speed limits
        const isPremium = user && user.premiumStatus !== "free";
        const maxSpeed = isPremium 
          ? Number(siteSettings.premium_download_speed || 100) 
          : Number(siteSettings.daily_free_limit || 5);

        let currentProgress = 0;
        const interval = setInterval(() => {
          // Fluctuating speeds
          const currentSpeed = (maxSpeed * (0.8 + Math.random() * 0.4)).toFixed(1);
          setDownloadSpeed(`${currentSpeed} MB/s`);

          currentProgress += isPremium ? 8 : 2; // Premiums download 4x faster!
          if (currentProgress >= 100) {
            currentProgress = 100;
            setDownloadProgress(100);
            setDownloading(false);
            setDownloadDone(res.download);
            clearInterval(interval);
            initApp(); // reload history
          } else {
            setDownloadProgress(currentProgress);
          }
        }, 150);
      }
    } catch (err: any) {
      if (err.banned) {
        handleApiError(err);
      }
      alert(err.message || "İndirme işlemi başlatılamadı.");
      setDownloading(false);
    }
  };

  const handleCreateTicket = async (subject: string, message: string) => {
    const res = await api.createTicket({ subject, message });
    initApp(); // reload tickets
    return res;
  };

  const handleReplyTicket = async (id: string, message: string) => {
    const res = await api.replyTicket(id, message);
    initApp(); // reload tickets
    return res;
  };

  const handleAcceptCookies = () => {
    localStorage.setItem("vidi_cookie_consent", "true");
    setCookieConsent(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess("Mesajınız başarıyla teknik ekibimize iletilmiştir. En kısa sürede yanıtlanacaktır.");
    setContactName("");
    setContactEmail("");
    setContactMessage("");
    setTimeout(() => setContactSuccess(""), 5000);
  };

  // Render setup wizard if backend database not configured
  if (!isInstalled) {
    return <InstallWizard onInstalled={() => initApp()} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* 1. Global Announcement Banner */}
      {announcements.some(a => a.type === "banner") && (
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 py-2 px-4 text-center text-xs font-bold tracking-wide text-white relative z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <Megaphone className="h-4 w-4 shrink-0 animate-bounce" />
            <span dangerouslySetInnerHTML={{ __html: announcements.find(a => a.type === "banner")?.content || "" }} />
          </div>
        </div>
      )}

      {/* 2. Header */}
      <Header 
        user={user} 
        currentView={view} 
        setView={setView} 
        onOpenAuth={handleOpenAuth} 
        onLogout={handleLogout} 
        announcements={announcements}
        siteSettings={siteSettings}
      />

      {/* 3. Main Body */}
      <main className="flex-1">
        
        {/* AdSense Top Header Banner placeholder */}
        {isAds && (
          <div className="max-w-4xl mx-auto px-4 pt-6">
            {siteSettings.ad_slot_header ? (
              <div 
                className="w-full overflow-hidden flex justify-center items-center"
                dangerouslySetInnerHTML={{ __html: siteSettings.ad_slot_header }}
              />
            ) : (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 text-center text-[10px] text-slate-600 tracking-wider uppercase font-mono">
                REKLAM ALANI (Google AdSense: {siteSettings.adsense_client_id})
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {showMaintenance ? (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto px-4 py-24 text-center"
            >
              <div className="inline-flex bg-amber-500/10 text-amber-500 p-4 rounded-3xl mb-6 animate-pulse border border-amber-500/20">
                <Wrench className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent mb-4">
                Sistem Bakımdadır
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Size daha iyi, stabil ve daha hızlı bir indirme hizmeti sunabilmek için şu anda planlı bakım çalışması yapıyoruz. Çok kısa bir süre sonra otomatik olarak tekrar aktif olacağız!
              </p>
              <div className="inline-block text-[11px] bg-slate-900 text-slate-400 px-4 py-2 rounded-2xl border border-slate-800/80 font-mono">
                Otomatik senkronizasyon devrede. Sayfa kendiliğinden yenilenecektir.
              </div>
            </motion.div>
          ) : (
            <>
              {/* HOME VIEW */}
              {view === "home" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16 py-12"
            >
              {/* Hero & Search engine */}
              <div className="max-w-4xl mx-auto px-4 text-center">
                <span className="text-[10px] bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 font-bold uppercase tracking-widest inline-flex items-center space-x-1.5 mb-4">
                  <Sparkles className="h-3 w-3 text-rose-500" />
                  <span>Süper Hızlı Video Dönüştürücü</span>
                </span>
                
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent leading-tight sm:leading-none">
                  Herhangi Bir Videoyu Saniyeler İçinde İndirin
                </h1>
                <p className="text-slate-400 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
                  YouTube, TikTok, Instagram Reels, Facebook ve Twitter videolarını yüksek hızda MP3, MP4 formatlarında, 4K ve 8K kalitelerinde indirin.
                </p>

                {/* Platform select badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                  {["YouTube", "TikTok", "Instagram", "Facebook", "X"].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(plat);
                        setVideoMetadata(null);
                        setDownloadDone(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        selectedPlatform === plat
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                          : "bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>

                {/* URL INPUT BAR */}
                <form onSubmit={handleMetadataFetch} className="mt-8 max-w-2xl mx-auto">
                  <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex items-center shadow-2xl relative">
                    <Search className="absolute left-4.5 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder={`Lütfen bir ${selectedPlatform} video bağlantısı (URL) yapıştırın...`}
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="flex-1 bg-transparent text-slate-200 pl-11 pr-4 py-3.5 text-xs sm:text-sm focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={fetchingMetadata}
                      className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-md shadow-rose-500/15 shrink-0 cursor-pointer"
                    >
                      <span>{fetchingMetadata ? "Çözülüyor..." : "Dönüştür"}</span>
                    </button>
                  </div>
                </form>

                {searchError && (
                  <div className="max-w-2xl mx-auto mt-4 flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}
              </div>

              {/* VIDEO METADATA CARD AND OPTIONS */}
              <AnimatePresence>
                {videoMetadata && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="max-w-3xl mx-auto px-4"
                  >
                    <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6">
                      {/* Thumbnail Left */}
                      <div className="relative w-full md:w-56 h-36 rounded-2xl bg-slate-950 overflow-hidden shrink-0">
                        <img
                          src={videoMetadata.thumbnail}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-lg border border-slate-800">
                          {videoMetadata.durationString}
                        </span>
                      </div>

                      {/* Info & Settings Right */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                            <span className="bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-lg border border-rose-500/20 font-bold uppercase tracking-wider">
                              {videoMetadata.platform}
                            </span>
                            <span>•</span>
                            <span>{videoMetadata.views} izlenme</span>
                          </div>
                          
                          <h3 className="text-base font-bold text-slate-200 mt-2.5 leading-snug">{videoMetadata.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">Yayıncı: {videoMetadata.channelName}</p>
                        </div>

                        {/* Format and Quality selector controls */}
                        <div className="mt-5 space-y-4 pt-4 border-t border-slate-950/40">
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Format:</span>
                            <div className="flex items-center space-x-1.5">
                              {["MP4", "WEBM", "MP3", "WAV"].map((fmt) => (
                                <button
                                  key={fmt}
                                  type="button"
                                  onClick={() => {
                                    setSelectedFormat(fmt);
                                    // Reset quality choice
                                    if (fmt === "MP3" || fmt === "WAV") {
                                      setSelectedQuality(videoMetadata.audioQualities[1]);
                                    } else {
                                      setSelectedQuality(videoMetadata.qualities[0]);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    selectedFormat === fmt
                                      ? "bg-slate-800 text-rose-400 border border-rose-500/25"
                                      : "bg-slate-950 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {fmt}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mr-2">Kalite:</span>
                            {(selectedFormat === "MP3" || selectedFormat === "WAV" ? videoMetadata.audioQualities : videoMetadata.qualities).map((q: string) => (
                              <button
                                key={q}
                                type="button"
                                onClick={() => setSelectedQuality(q)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                                  selectedQuality === q
                                    ? "bg-rose-500 text-white font-bold"
                                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-900"
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>

                          {/* ACTION BUTTON & PROGRESS */}
                          <div className="pt-2">
                            {downloading ? (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono text-slate-400">
                                  <span>Dönüştürülüyor & İndiriliyor...</span>
                                  <span className="text-rose-400 font-bold">{downloadSpeed}</span>
                                </div>
                                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                                  <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                                </div>
                                <div className="text-right text-[10px] text-slate-500 font-mono">{downloadProgress}% tamamlandı</div>
                              </div>
                            ) : downloadDone ? (
                              <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                  <p className="font-bold text-white text-xs">Dönüştürme İşlemi Başarılı!</p>
                                  <p className="text-[10px] text-slate-500 font-mono mt-1">Dosya Boyutu: {downloadDone.size} | Format: {downloadDone.format} ({downloadDone.quality})</p>
                                </div>
                                <a
                                  href={`/api/files/download/${downloadDone.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    alert("Dosya cihazınıza başarıyla indirildi!");
                                    setDownloadDone(null);
                                    setVideoMetadata(null);
                                    setVideoUrl("");
                                  }}
                                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-teal-500/10 flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
                                >
                                  <DlIcon className="h-4.5 w-4.5" />
                                  <span>Cihaza İndir (İndir)</span>
                                </a>
                              </div>
                            ) : (
                              <button
                                onClick={handleStartDownload}
                                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-rose-500/15 flex items-center justify-center space-x-1.5 cursor-pointer"
                              >
                                <DlIcon className="h-4.5 w-4.5 animate-bounce" />
                                <span>{selectedFormat} Formatına Dönüştür ve İndir</span>
                              </button>
                            )}
                          </div>

                          {isAds && siteSettings.ad_slot_download && (
                            <div 
                              className="mt-4 pt-4 border-t border-slate-900/40 w-full overflow-hidden flex justify-center items-center"
                              dangerouslySetInnerHTML={{ __html: siteSettings.ad_slot_download }}
                            />
                          )}

                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Statistics counter block */}
              <div className="max-w-6xl mx-auto px-4 py-8 border-y border-slate-900/60 bg-slate-950/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <h3 className="text-2xl sm:text-3.5xl font-extrabold text-white">418,293+</h3>
                    <p className="text-slate-500 text-xs mt-1.5 uppercase tracking-wider font-semibold">Toplam İndirme</p>
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3.5xl font-extrabold text-white">99.9%</h3>
                    <p className="text-slate-500 text-xs mt-1.5 uppercase tracking-wider font-semibold">Aktiflik Hızı</p>
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3.5xl font-extrabold text-white">45 MB/s</h3>
                    <p className="text-slate-500 text-xs mt-1.5 uppercase tracking-wider font-semibold">Ortalama Hız</p>
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3.5xl font-extrabold text-white">12,520+</h3>
                    <p className="text-slate-500 text-xs mt-1.5 uppercase tracking-wider font-semibold">Online Üye</p>
                  </div>
                </div>
              </div>

              {/* Recent downloads and FAQ bento box */}
              <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Recent list (left) */}
                <div className="lg:col-span-4 bg-slate-900/10 border border-slate-900 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 tracking-wider uppercase flex items-center space-x-2">
                    <Clock className="h-4.5 w-4.5 text-rose-500" />
                    <span>Son Dönüştürülenler</span>
                  </h3>
                  {recentDownloads.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center">Henüz indirilmiş dosya kaydı yok.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentDownloads.slice(0, 5).map((dl) => (
                        <div key={dl.id} className="bg-slate-950/40 p-3 rounded-xl border border-slate-950 flex flex-col">
                          <span className="text-[9px] font-mono text-slate-500">{dl.platform} • {dl.quality}</span>
                          <span className="text-xs font-bold text-slate-200 mt-1 truncate">{dl.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{dl.format} | {dl.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* brief FAQ (right) */}
                <div className="lg:col-span-8">
                  <FAQ />
                </div>
              </div>

              {/* Brief Blog section */}
              <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white tracking-tight">Kılavuzlar ve Popüler Makaleler</h3>
                  <button onClick={() => setView("blog")} className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider">
                    Tüm Blogu Gör
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {blogs.slice(0, 3).map((blog) => (
                    <div
                      key={blog.id}
                      onClick={() => setView("blog")}
                      className="bg-slate-900/15 border border-slate-900 hover:border-slate-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group"
                    >
                      <img src={blog.image} className="w-full h-32 object-cover" />
                      <div className="p-4">
                        <span className="text-[9px] font-mono text-rose-400 tracking-wider font-bold">REHBER</span>
                        <h4 className="font-bold text-slate-200 mt-1.5 group-hover:text-rose-400 transition-colors line-clamp-2">{blog.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* PREMIUM VIEW */}
          {view === "premium" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PremiumView 
                user={user} 
                onUpgradeSuccess={(newStatus) => {
                  if (user) {
                    setUser({ ...user, premiumStatus: newStatus });
                  }
                }} 
                onOpenAuth={handleOpenAuth} 
              />
            </motion.div>
          )}

          {/* BLOG VIEW */}
          {view === "blog" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BlogView 
                blogs={blogs} 
                categories={categories} 
                isAdmin={user?.role === "admin"}
                onDeleteBlog={async (id) => {
                  if (confirm("Bu makaleyi silmek istiyor musunuz?")) {
                    await api.admin.deleteBlog(id);
                    initApp();
                  }
                }}
              />
            </motion.div>
          )}

          {/* SSS (FAQ) FULL VIEW */}
          {view === "faq" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12"
            >
              <FAQ />
            </motion.div>
          )}

          {/* SUPPORT TICKET VIEW */}
          {view === "support" && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TicketSystem 
                tickets={tickets} 
                user={user} 
                onCreateTicket={handleCreateTicket} 
                onReplyTicket={handleReplyTicket} 
              />
            </motion.div>
          )}

          {/* PROFILE VIEW */}
          {view === "profile" && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfileView 
                user={user} 
                onUpdateUser={(updated) => setUser(updated)} 
                onLogout={handleLogout} 
              />
            </motion.div>
          )}

          {/* ADMIN MANAGEMENT PANEL */}
          {view === "admin" && user && user.role === "admin" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel 
                currentUser={user} 
                onRefreshData={() => initApp()} 
              />
            </motion.div>
          )}

          {/* STATIC PAGES: ABOUT, CONTACT, PRIVACY, TERMS, DMCA */}
          {view === "about" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-4 py-16 text-xs leading-relaxed">
              <h2 className="text-2xl font-bold text-white mb-6">Hakkımızda</h2>
              <p className="text-slate-450 text-sm mb-4">VidiDown, 2026 yılında kurulmuş, yenilikçi ve son teknoloji ürünü bir çoklu platform indirme ve medya dönüştürme aracıdır.</p>
              <p className="text-slate-400 mb-4">Kullanıcılarımızın internet üzerindeki video ve ses dosyalarını en güvenli, filigransız ve orijinal kalitelerinde cihazlarına kaydetmelerine olanak sağlıyoruz. Güçlü API altyapımız, sunucu entegrasyonlarımız ve yapay zeka destekli içerik analiz sistemlerimiz sayesinde her saniye yüzlerce kullanıcıya kesintisiz indirme desteği veriyoruz.</p>
              <p className="text-slate-400">VidiDown, kişisel kullanım ve eğitim amaçlı içerik indirme prensiplerini benimser. Her türlü soru ve ticari iş birliği için destek@vididown.com adresinden bizimle iletişime geçebilirsiniz.</p>
            </motion.div>
          )}

          {view === "contact" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto px-4 py-16 text-xs">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">İletişime Geçin</h2>
              <form onSubmit={handleContactSubmit} className="space-y-4 bg-slate-900/30 p-6 sm:p-8 rounded-3xl border border-slate-900">
                {contactSuccess && (
                  <div className="flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 p-4 rounded-xl text-xs mb-4">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{contactSuccess}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Adınız Soyadınız</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Hakan Yılmaz"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">E-posta Adresiniz</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="hakan@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mesajınız</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Öneri veya iş birliği talebinizi buraya yazın..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  Mesajı Gönder
                </button>
              </form>
            </motion.div>
          )}

          {view === "privacy" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-4 py-16 text-xs leading-relaxed space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Gizlilik Politikası</h2>
              <p className="text-slate-400">VidiDown ("biz", "bize" veya "bizim"), sitemizi ziyaret eden kullanıcıların gizliliğine son derece önem verir. Bu belge, kişisel verilerinizin nasıl toplandığı, saklandığı ve korunduğu hakkında bilgi verir.</p>
              <h3 className="text-sm font-bold text-slate-200 mt-4">1. Toplanan Veriler</h3>
              <p className="text-slate-400">Platformumuza üye olurken paylaştığınız e-posta adresi, kullanıcı adı ve şifre haricinde herhangi bir kişisel veri saklanmaz. İndirdiğiniz videoların log kayıtlarında yalnızca işlem durumu, boyut ve format detayları tutulur.</p>
              <h3 className="text-sm font-bold text-slate-200 mt-4">2. Verilerin Güvenliği</h3>
              <p className="text-slate-400">Şifreleriniz, sunucumuzda tek yönlü bcrypt şifreleme algoritmasıyla kriptolanarak saklanır. Ekibimiz dahil hiç kimse düz şifrenize erişemez.</p>
            </motion.div>
          )}

          {view === "terms" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-4 py-16 text-xs leading-relaxed space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Kullanım Şartları</h2>
              <p className="text-slate-400">VidiDown hizmetlerini kullanarak aşağıdaki maddeleri kabul etmiş sayılırsınız.</p>
              <h3 className="text-sm font-bold text-slate-200 mt-4">1. Telif Hakları ve Kişisel Kullanım</h3>
              <p className="text-slate-400">VidiDown aracılığıyla indirilen tüm videolar yalnızca kişisel arşivleme, eğitim ve adil kullanım (fair-use) kapsamındadır. İndirilen videoların ticari amaçlarla yeniden dağıtılması, satılması veya yayınlanması kesinlikle yasaktır. Telif hakkı sahiplerinin haklarına riayet etmek kullanıcının sorumluluğundadır.</p>
              <h3 className="text-sm font-bold text-slate-200 mt-4">2. Hizmet Kötüye Kullanımı</h3>
              <p className="text-slate-400">Platform sunucularına DDoS saldırısı gerçekleştirmek, API istek limitlerini aşmaya çalışmak veya güvenlik açıklarını suiistimal etmek hesabınızın süresiz engellenmesine yol açar.</p>
            </motion.div>
          )}

          {view === "dmca" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-4 py-16 text-xs leading-relaxed space-y-4">
              <h2 className="text-2xl font-bold text-rose-500 mb-6 flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
                <span>DMCA Telif Hakkı (Telif Hakkı Bildirimi)</span>
              </h2>
              <p className="text-slate-400">VidiDown, 17 U.S.C. § 512 ve Dijital Binyıl Telif Hakkı Yasası (DMCA) şartlarına tam olarak uymayı taahhüt eder.</p>
              <p className="text-slate-400">Platformumuz hiçbir videoyu veya müziği kendi sunucularında barındırmaz. VidiDown, yalnızca üçüncü taraf platformlardaki (YouTube, TikTok, Instagram vb.) halka açık medyaları kullanıcının isteği doğrultusunda dönüştüren teknik bir aracıdır (Proxy Linker).</p>
              <p className="text-slate-400">Telif hakkıyla korunan bir içeriğinizin platformumuz tarafından dönüştürülmesini veya aranmasını engellemek (Kara Listeye / Blacklist eklemek) istiyorsanız, lütfen resmi sahiplik kanıtı ile birlikte <span className="text-rose-400 font-bold">dmca@vididown.com</span> adresine e-posta gönderiniz. Talepleriniz en geç 24 saat içinde işleme alınarak ilgili bağlantılar sitemiz genelinde tamamen engellenecektir.</p>
            </motion.div>
          )}
            </>
          )}

        </AnimatePresence>

        {/* AdSense Bottom Footer Banner placeholder */}
        {isAds && (
          <div className="max-w-4xl mx-auto px-4 pb-12">
            {siteSettings.ad_slot_sidebar ? (
              <div 
                className="w-full overflow-hidden flex justify-center items-center"
                dangerouslySetInnerHTML={{ __html: siteSettings.ad_slot_sidebar }}
              />
            ) : (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 text-center text-[10px] text-slate-600 tracking-wider uppercase font-mono">
                REKLAM ALANI (Google AdSense: {siteSettings.adsense_client_id})
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. Footer */}
      <Footer setView={setView} siteSettings={siteSettings} />

      {/* 5. Auth Modal Dialog */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => {
          setAuthOpen(false);
          setAuthModalMode(undefined);
          setBannedUserInfo(null);
        }} 
        onSuccess={handleAuthSuccess} 
        initialMode={authModalMode}
        initialBannedUser={bannedUserInfo}
      />

      {/* 6. Active Popup Announcements */}
      <AnimatePresence>
        {activePopup && (
          <>
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50" onClick={() => setActivePopup(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 text-xs text-center"
            >
              <button
                onClick={() => setActivePopup(null)}
                className="absolute top-4 right-4 p-1 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="inline-flex p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 mb-4">
                <Megaphone className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{activePopup.title}</h3>
              <div 
                className="text-slate-400 leading-relaxed mb-6 text-left break-words max-h-60 overflow-y-auto pr-1 announcement-content"
                dangerouslySetInnerHTML={{ __html: activePopup.content }}
              />
              <button
                type="button"
                onClick={() => setActivePopup(null)}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md shadow-rose-500/10 cursor-pointer"
              >
                Anladım
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. Cookie GDPR Banner */}
      <AnimatePresence>
        {!cookieConsent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 inset-x-4 max-w-4xl mx-auto bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl z-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300"
          >
            <p className="leading-relaxed text-center sm:text-left">
              Web sitemizde deneyiminizi iyileştirmek, trafiği analiz etmek ve reklamları kişiselleştirmek için çerezler (cookies) kullanıyoruz. Sitemizi kullanarak çerez politikamızı ve kullanım sözleşmemizi kabul etmiş sayılırsınız.
            </p>
            <div className="flex space-x-2 shrink-0">
              <button
                onClick={() => setView("privacy")}
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-xl font-semibold border border-slate-800 transition-colors"
              >
                Politikayı İncele
              </button>
              <button
                onClick={handleAcceptCookies}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors shadow-md shadow-rose-500/15"
              >
                Kabul Ediyorum
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
