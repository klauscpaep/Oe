import React, { useState, useEffect } from "react";
import { User, Download } from "../types";
import { 
  User as UserIcon, 
  History, 
  Star, 
  Key, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Trash2, 
  QrCode,
  Globe,
  Settings,
  RefreshCw,
  Copy,
  ExternalLink
} from "lucide-react";
import { api } from "../api";

interface ProfileViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export default function ProfileView({ user, onUpdateUser, onLogout }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"details" | "history" | "api" | "security">("details");
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Details states
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 2FA Security states
  const [toggling2FA, setToggling2FA] = useState(false);
  const [qrInfo, setQrInfo] = useState<any | null>(null);

  // Load user downloads
  const loadDownloads = async () => {
    try {
      const res = await api.getDownloadHistory();
      if (res.success) {
        setDownloads(res.downloads);
      }
    } catch (err) {
      console.error("Failed to load downloads", err);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadDownloads();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.updateProfile({
        username,
        avatar,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      if (res.success) {
        setSuccess(res.message);
        onUpdateUser(res.user);
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Profil güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setToggling2FA(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.toggle2FA();
      if (res.success) {
        onUpdateUser({ ...user, twoFactorEnabled: res.twoFactorEnabled });
        if (res.twoFactorEnabled) {
          setQrInfo({ qrUrl: res.qrUrl, secret: res.secret });
          setSuccess("İki adımlı doğrulama anahtarı oluşturuldu.");
        } else {
          setQrInfo(null);
          setSuccess("İki adımlı doğrulama başarıyla devre dışı bırakıldı.");
        }
      }
    } catch (err: any) {
      setError(err.message || "2FA işlemi başarısız.");
    } finally {
      setToggling2FA(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    setLoading(true);
    try {
      const res = await api.regenerateApiKey();
      if (res.success) {
        onUpdateUser({ ...user, apiKey: res.apiKey });
        setSuccess("Yeni API anahtarı başarıyla üretildi.");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError("API anahtarı yenilenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Hesabınızı tamamen silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!")) return;
    try {
      const res = await api.deleteAccount();
      if (res.success) {
        alert(res.message);
        onLogout();
      }
    } catch (err: any) {
      setError("Hesap silme işlemi başarısız.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("API Anahtarı panoya kopyalandı.");
    setTimeout(() => setSuccess(""), 2000);
  };

  // Preset avatars for quick select
  const avatarPresets = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=hakan`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=ayse`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=mehmet`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=can`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=elif`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=vidi`
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Profile Header Info */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={avatar}
          alt={user.username}
          className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 object-cover p-1 ring-2 ring-rose-500/20"
        />
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 justify-center sm:justify-start">
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mx-auto sm:mx-0 ${
              user.premiumStatus === "vip" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
              user.premiumStatus === "premium" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
              "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              {user.premiumStatus === "free" ? "Ücretsiz Üyelik" : `${user.premiumStatus.toUpperCase()} PLAN`}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1.5">{user.email}</p>
          <p className="text-slate-500 text-[10px] font-mono mt-1">Kayıt Tarihi: {new Date(user.createdAt).toLocaleDateString("tr-TR")}</p>
        </div>
      </div>

      {/* Grid of Tab menu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar tabs */}
        <div className="lg:col-span-3 flex flex-col space-y-1 bg-slate-900/10 p-2 rounded-2xl border border-slate-900">
          <button
            onClick={() => setActiveTab("details")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "details" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>Kullanıcı Bilgileri</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "history" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="h-4 w-4" />
            <span>İndirme Geçmişim</span>
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "api" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <Key className="h-4 w-4" />
            <span>API Giriş Yetkisi</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "security" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Hesap Güvenliği</span>
          </button>
        </div>

        {/* Contents area */}
        <div className="lg:col-span-9 bg-slate-900/10 border border-slate-900 rounded-3xl p-6 sm:p-8 min-h-[400px]">
          
          {error && (
            <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs mb-6">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 p-4 rounded-xl text-xs mb-6">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Preset avatars picker */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Profil Avatarı Değiştir</label>
                <div className="grid grid-cols-6 gap-3 max-w-sm mb-4">
                  {avatarPresets.map((av, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`p-1 bg-slate-950 rounded-xl border transition-all ${
                        avatar === av ? "border-rose-500 ring-2 ring-rose-500/20" : "border-slate-850 hover:border-slate-700"
                      }`}
                    >
                      <img src={av} alt="preset" className="w-full h-auto rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Veya harici bir avatar görsel bağlantısı (URL) girin..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">E-posta Adresi (Değiştirilemez)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password change divider */}
              <div className="border-t border-slate-950/60 pt-6">
                <h4 className="text-xs font-semibold text-white mb-4 flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-rose-500" />
                  <span>Şifre Güncelleme (İsteğe bağlı)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Mevcut Şifre</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Yeni Şifre</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-rose-500/10 cursor-pointer"
              >
                {loading ? "Değişiklikler Kaydediliyor..." : "Profil Değişikliklerini Kaydet"}
              </button>
            </form>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-4 flex items-center space-x-2">
                <History className="h-4 w-4 text-rose-500" />
                <span>Geçmiş İndirme ve Dönüştürme Kayıtlarım</span>
              </h3>

              {downloads.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/10 border border-dashed border-slate-900 rounded-2xl">
                  <p className="text-slate-500 text-xs">Henüz indirilmiş bir dosyanız bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloads.map((dl) => (
                    <div
                      key={dl.id}
                      className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-slate-900 border border-slate-800 text-rose-400 font-bold px-2 py-0.5 rounded-md font-mono">
                            {dl.platform}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(dl.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 truncate mt-1.5">{dl.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Format: {dl.format} ({dl.quality}) | Dosya Boyutu: {dl.size}</p>
                      </div>

                      <a
                        href={dl.downloadUrl || "#"}
                        download
                        className="flex items-center space-x-1 bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition-all shadow-md shadow-rose-500/10"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Tekrar İndir</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* API ACCESS TAB */}
          {activeTab === "api" && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2 flex items-center space-x-2">
                  <Key className="h-4 w-4 text-rose-500" />
                  <span>Kullanıcı REST API Bağlantısı</span>
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  İndirme motorumuzu kendi yazılımlarınıza veya sunucunuza entegre etmek için aşağıdaki API anahtarını kullanabilirsiniz. 
                  Lütfen anahtarınızı kimseyle paylaşmayınız.
                </p>
              </div>

              {/* API KEY DISPLAY CARD */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">API KEY (X-API-KEY)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={user.apiKey}
                    className="flex-1 bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-rose-400 font-mono tracking-wide focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(user.apiKey)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="Kopyala"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRegenerateApiKey}
                    disabled={loading}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                    title="Anahtarı Yenile"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* API usage limits block */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-slate-300">Günlük İstek Sınırı</span>
                  <span className="font-mono text-[10px] bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-lg border border-rose-500/20 font-bold uppercase">
                    {user.premiumStatus === "free" ? "FREE" : user.premiumStatus === "premium" ? "PREMIUM" : "VIP"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full" 
                      style={{ width: user.premiumStatus === "free" ? "20%" : user.premiumStatus === "premium" ? "1%" : "0.1%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Mevcut Kullanım: {user.premiumStatus === "free" ? "2 / 10" : user.premiumStatus === "premium" ? "12 / 2000" : "45 / 10000"} istek</span>
                    <span>Kalan: {user.premiumStatus === "free" ? "8" : user.premiumStatus === "premium" ? "1988" : "9955"}</span>
                  </div>
                </div>

                <div className="mt-5 text-[10px] text-slate-500 leading-normal">
                  * API çağrılarınızda her başarılı sorgu 1 istek sayılır. Günlük limit her gece 00:00'da sıfırlanır. Limiti artırmak veya sınırsız VIP anahtarlara ulaşmak için <span className="text-rose-400 font-bold">Premium plana</span> geçiş yapın.
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2 flex items-center space-x-2">
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                  <span>Gelişmiş Hesap Güvenliği</span>
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Hesabınızı kötü niyetli girişimlerden korumak ve güvenle işlem yapmak için iki adımlı doğrulamayı aktif hale getirebilirsiniz.
                </p>
              </div>

              {/* 2FA activation */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">Google Authenticator (2FA)</h4>
                    <p className="text-slate-500 text-[11px] mt-1">Giriş yaparken şifrenize ek olarak tek kullanımlık 6 haneli kod girersiniz.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    disabled={toggling2FA}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                      user.twoFactorEnabled
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white"
                        : "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500 hover:text-white"
                    }`}
                  >
                    {user.twoFactorEnabled ? "Pasifleştir" : "Aktifleştir"}
                  </button>
                </div>

                {qrInfo && (
                  <div className="pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-xs">
                    <div className="bg-white p-2.5 rounded-2xl shrink-0">
                      <img src={qrInfo.qrUrl} alt="2FA QR Code" className="w-32 h-32" />
                    </div>
                    <div className="space-y-2 text-slate-400 leading-normal">
                      <p className="font-semibold text-slate-200">2FA Kurulum Adımları:</p>
                      <p>1. Telefonunuza Google Authenticator veya Authy uygulamasını indirin.</p>
                      <p>2. Uygulamadan QR kodunu taratın veya şu gizli anahtarı ekleyin:</p>
                      <p className="font-mono bg-slate-900 p-2 rounded-xl text-teal-400 border border-slate-800 tracking-wider text-center">{qrInfo.secret}</p>
                      <p className="text-rose-400 font-bold text-[10px]">* Lütfen kodun doğrulanıp doğrulanmadığını kontrol etmek için sonraki girişinizde bu kodu kullanın.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account deletion box */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-rose-950/20">
                <h4 className="font-bold text-rose-400 text-xs">Tehlikeli Bölge</h4>
                <p className="text-slate-500 text-[11px] mt-1 mb-4">Hesabınızı silerseniz indirme geçmişiniz, favorileriniz, biletleriniz ve API bağlantılarınız tamamen silinir. Bu işlem geri döndürülemez.</p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Hesabımı Tamamen Sil
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
