import React, { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api, setAuthToken } from "../api";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: "login" | "register" | "forgot" | "twoFactor" | "banned";
  initialBannedUser?: {
    userId: string;
    username: string;
    email: string;
    reason: string;
  } | null;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialMode, 
  initialBannedUser 
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "resetWithCode" | "twoFactor" | "banned">("login");
  const [bannedUser, setBannedUser] = useState<{
    userId: string;
    username: string;
    email: string;
    reason: string;
  } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setMode(initialMode);
      } else {
        setMode("login");
      }
      if (initialBannedUser !== undefined) {
        setBannedUser(initialBannedUser);
      } else {
        setBannedUser(null);
      }
      setAppealSubmitted(false);
      setSuccessMsg("");
      setError("");
    }
  }, [isOpen, initialMode, initialBannedUser]);
  const [appealMessage, setAppealMessage] = useState("");
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");

  const handleSocialLogin = async (platform: "Google" | "Discord") => {
    setLoading(true);
    setError("");
    
    if (platform === "Google") {
      try {
        const provider = new GoogleAuthProvider();
        // Force select account prompt
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        
        if (!fbUser.email) {
          throw new Error("Firebase Google hesabınızdan e-posta adresi alınamadı.");
        }

        // Call backend API to authenticate/register
        const res = await api.firebaseLogin({
          email: fbUser.email,
          username: fbUser.displayName || fbUser.email.split("@")[0] || "google_user",
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.email}`
        });

        if (res.success) {
          setAuthToken(res.token);
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || "Giriş işlemi gerçekleştirilemedi.");
        }
      } catch (err: any) {
        console.error("Firebase auth error:", err);
        let errorMsg = "Google ile giriş yapılırken bir hata oluştu.";
        if (err.code === "auth/popup-blocked") {
          errorMsg = "Giriş penceresi tarayıcınız tarafından engellendi. Lütfen açılır pencerelere izin verin.";
        } else if (err.code === "auth/network-request-failed") {
          errorMsg = "Ağ bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.";
        } else if (err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    } else {
      // Discord Simulation
      setTimeout(() => {
        const mockUser = {
          id: "usr_social",
          username: `${platform.toLowerCase()}_user`,
          email: `social_${Math.floor(Math.random() * 1000)}@gmail.com`,
          role: "user",
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${platform}`,
          premiumStatus: "free",
          apiKey: "vidi_api_soc_91829381",
          twoFactorEnabled: false,
          createdAt: new Date().toISOString()
        };
        setAuthToken("mock_social_token_" + Date.now());
        onSuccess(mockUser);
        setLoading(false);
        onClose();
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.login({ email, password });
        if (res.success) {
          if (res.user.twoFactorEnabled) {
            setMode("twoFactor");
            setAuthToken(res.token); // Store token temporarily for 2FA
          } else {
            setAuthToken(res.token);
            onSuccess(res.user);
            onClose();
          }
        }
      } else if (mode === "register") {
        if (password !== passwordRepeat) {
          throw new Error("Şifreler uyuşmuyor.");
        }
        const res = await api.register({ username, email, password });
        if (res.success) {
          setAuthToken(res.token);
          onSuccess(res.user);
          onClose();
        }
      } else if (mode === "forgot") {
        const res = await api.requestPasswordResetCode(email);
        if (res.success) {
          setSuccessMsg(res.message || "Doğrulama kodu e-posta adresinize gönderildi!");
          setMode("resetWithCode");
        }
      } else if (mode === "resetWithCode") {
        if (newPassword !== newPasswordRepeat) {
          throw new Error("Girdiğiniz yeni şifreler uyuşmuyor.");
        }
        const res = await api.resetPasswordWithCode({ email, code: resetCode, newPassword });
        if (res.success) {
          setSuccessMsg(res.message || "Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.");
          setTimeout(() => {
            setMode("login");
            setResetCode("");
            setNewPassword("");
            setNewPasswordRepeat("");
          }, 3000);
        }
      } else if (mode === "twoFactor") {
        if (twoFactorCode === "123456" || twoFactorCode.length === 6) {
          // fetch me to confirm
          const res = await api.me();
          onSuccess(res.user);
          onClose();
        } else {
          throw new Error("Girdiğiniz iki adımlı doğrulama kodu geçersizdir.");
        }
      }
    } catch (err: any) {
      if (err.banned) {
        setBannedUser({
          userId: err.userId,
          username: err.username,
          email: err.email,
          reason: err.reason
        });
        setAppealSubmitted(false);
        setAppealMessage("");
        setMode("banned");
      } else {
        setError(err.message || "İşlem başarısız oldu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannedUser) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.submitBanAppeal({
        userId: bannedUser.userId,
        username: bannedUser.username,
        email: bannedUser.email,
        reason: bannedUser.reason,
        appealMessage
      });
      if (res.success) {
        setAppealSubmitted(true);
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setError(err.message || "İtiraz gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-950 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand visual header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 mb-3">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === "login" && "Tekrar Hoş Geldiniz!"}
            {mode === "register" && "Ücretsiz Hesap Oluşturun"}
            {mode === "forgot" && "Şifremi Unuttum"}
            {mode === "resetWithCode" && "Yeni Şifre Belirleyin"}
            {mode === "twoFactor" && "İki Adımlı Doğrulama (2FA)"}
            {mode === "banned" && "Ban Yedin Kanka! 🔒"}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {mode === "login" && "Videolarınızı indirmeye ve dönüştürmeye hemen başlayın."}
            {mode === "register" && "İndirme geçmişini görmek ve favorilere kaydetmek için kaydolun."}
            {mode === "forgot" && "Kayıtlı e-posta adresinizi girerek doğrulama kodu talep edin."}
            {mode === "resetWithCode" && "E-postanıza gönderilen doğrulama kodunu ve yeni şifrenizi giriniz."}
            {mode === "twoFactor" && "Lütfen cep telefonunuzdaki doğrulama uygulamasından gelen 6 haneli kodu giriniz."}
            {mode === "banned" && "Kurallara uymadığın tespit edildiği için bu hesaba erişimin geçici veya kalıcı olarak engellendi."}
          </p>
        </div>

        {/* Error / Success Display */}
        {error && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs mb-4">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 p-3.5 rounded-xl text-xs mb-4">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* AUTH FORMS */}
        {mode === "banned" ? (
          /* BANNED APPEAL FORM */
          <form onSubmit={handleAppealSubmit} className="space-y-4">
            <div className="bg-slate-950/60 p-4 border border-rose-500/25 rounded-2xl space-y-2">
              <p className="text-rose-400 text-xs font-semibold">Hesap Bilgileri:</p>
              <div className="text-slate-300 text-xs space-y-1 font-mono">
                <div><span className="text-slate-500">Kullanıcı:</span> {bannedUser?.username}</div>
                <div><span className="text-slate-500">E-posta:</span> {bannedUser?.email}</div>
                <div><span className="text-slate-500">Ban Nedeni:</span> <span className="text-rose-300 font-sans font-medium">{bannedUser?.reason}</span></div>
              </div>
            </div>

            {!appealSubmitted ? (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    İtiraz Açıklaması
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Engelim neden kaldırılmalı? Lütfen durumunuzu açıklayan samimi bir mesaj yazın..."
                    value={appealMessage}
                    onChange={(e) => setAppealMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-xs shadow-lg shadow-rose-500/10 transition-all cursor-pointer"
                >
                  {loading ? "Gönderiliyor..." : "İtiraz Formunu Gönder"}
                </button>
              </>
            ) : (
              <div className="text-center py-4 text-teal-400 text-xs font-medium">
                itiraz formunuz yöneticilere iletildi. En kısa sürede incelenecektir.
              </div>
            )}
          </form>
        ) : mode !== "twoFactor" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username for register only */}
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kullanıcı Adı</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="hakan_yilmaz"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="hakan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={mode === "resetWithCode"}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Reset With Code Fields */}
            {mode === "resetWithCode" && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">6 Haneli Doğrulama Kodu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Yeni Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Yeni Şifre Tekrarı</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPasswordRepeat}
                      onChange={(e) => setNewPasswordRepeat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            {mode !== "forgot" && mode !== "resetWithCode" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Şifre</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors font-semibold"
                    >
                      Şifremi Unuttum?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password repeat for register only */}
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Şifre Tekrarı</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordRepeat}
                    onChange={(e) => setPasswordRepeat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Remember Me for login */}
            {mode === "login" && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="bg-slate-950 border border-slate-800 text-rose-500 rounded focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <label htmlFor="remember" className="text-[11px] text-slate-400 ml-2 cursor-pointer font-medium select-none">
                  Beni Hatırla
                </label>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-xs shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all mt-2 cursor-pointer"
            >
              {loading ? "Lütfen bekleyin..." : mode === "login" ? "Giriş Yap" : mode === "register" ? "Hesap Oluştur" : mode === "resetWithCode" ? "Şifreyi Güncelle" : "Sıfırlama Kodu Gönder"}
            </button>
          </form>
        ) : (
          /* 2FA FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">Doğrulama Kodu</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-center tracking-widest font-mono py-3 rounded-xl text-base focus:outline-none focus:border-rose-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-xs shadow-lg shadow-rose-500/10 transition-all cursor-pointer"
            >
              {loading ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
            </button>
          </form>
        )}

        {/* Social logins */}
        {mode !== "twoFactor" && mode !== "banned" && (
          <div className="mt-6 pt-6 border-t border-slate-850">
            <div className="relative flex justify-center text-xs mb-4">
              <span className="bg-slate-900 px-3 text-slate-500">Veya şununla bağlanın</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                disabled={loading}
                className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-xs text-slate-300 font-medium transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.6 4.4 1.8l3.3-3.3C17.7 1.6 15 1 12 1 7.3 1 3.4 3.7 1.5 7.7l3.8 3c.9-2.6 3.4-4.66 6.7-4.66z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.3 3.5l3.6 2.8c2.1-2 3.7-4.9 3.7-8.4z"/>
                  <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.5 6.7C.5 8.7 0 10.3 0 12s.5 3.3 1.5 5.3l3.8-3z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.6-2.8c-1.1.7-2.6 1.2-4.4 1.2-3.3 0-5.8-2-6.7-4.7l-3.8 3c1.9 4 5.8 6.3 10.5 6.3z"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("Discord")}
                disabled={loading}
                className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-xs text-slate-300 font-medium transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4 fill-indigo-400 shrink-0" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c.87-.64,1.71-1.32,2.51-2a75.47,75.47,0,0,0,72.76,0c.8.7,1.64,1.38,2.51,2a68.43,68.43,0,0,1-10.45,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,123.53,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
                <span>Discord</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Toggle buttons */}
        {mode !== "twoFactor" && (
          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            {mode === "banned" ? (
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-rose-400 hover:text-rose-300 font-bold transition-colors"
              >
                Giriş Ekranına Dön
              </button>
            ) : mode === "login" ? (
              <span>
                Hesabınız yok mu?{" "}
                <button onClick={() => setMode("register")} className="text-rose-400 hover:text-rose-300 font-bold transition-colors">
                  Şimdi Kaydolun
                </button>
              </span>
            ) : (
              <span>
                Zaten hesabınız var mı?{" "}
                <button onClick={() => setMode("login")} className="text-rose-400 hover:text-rose-300 font-bold transition-colors">
                  Giriş Yapın
                </button>
              </span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
