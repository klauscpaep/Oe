import React, { useState } from "react";
import { Database, CheckCircle, RefreshCw, AlertCircle, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { api } from "../api";
import { motion } from "motion/react";

interface InstallWizardProps {
  onInstalled: () => void;
}

export default function InstallWizard({ onInstalled }: InstallWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInstall = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.install();
      if (res.success) {
        setSuccess(res.message);
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || "Kurulum başlatılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-slate-900 border border-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl z-10 text-xs"
      >
        {/* Brand visual header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 mb-3">
            <Database className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">VidiDown Kurulum Sihirbazı (install.php)</h2>
          <p className="text-slate-400 mt-1">Platform veritabanını, tabloları ve yönetici hesaplarını otomatik kurun.</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-3.5 text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-200">Sihirbaz Kurulum Adımları:</p>
              <ul className="space-y-2 list-disc pl-4 text-slate-400">
                <li><span className="text-slate-300 font-semibold">Gerekli Tablolar:</span> users, admins, downloads, announcements, settings, logs, premium, api_keys, tickets, notifications, blog, categories, reports, banned_users tablolarının tamamı JSON formatında otomatik kurulacaktır.</li>
                <li><span className="text-slate-300 font-semibold">Varsayılan Hesaplar:</span> Admin (Kullanıcı: admin, Şifre: admin123), Premium (Kullanıcı: premium_user, Şifre: premium123) ve Regular (Kullanıcı: hakan_yilmaz, Şifre: user123) hesapları otomatik kurulacaktır.</li>
                <li><span className="text-slate-300 font-semibold">Hazır İçerikler:</span> Kategori tanımları, eğitici blog makaleleri ve başlangıç sistem ayarları yüklenecektir.</li>
              </ul>
            </div>

            <button
              onClick={handleInstall}
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Kurulum Yapılıyor..." : "Otomatik Kurulumu Başlat"}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 p-6 rounded-2xl space-y-3">
              <CheckCircle className="h-10 w-10 mx-auto" />
              <h4 className="font-bold text-white text-sm">Kurulum Tamamlandı!</h4>
              <p className="text-slate-300 leading-normal">{success}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-left space-y-2">
              <p className="font-semibold text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>Hazır Giriş Bilgileri:</span>
              </p>
              <div className="space-y-1 text-[11px] font-mono text-slate-500">
                <p>Yönetici: <span className="text-slate-300 font-semibold">admin@vididown.com</span> / Şifre: <span className="text-slate-300">admin123</span></p>
                <p>Premium: <span className="text-slate-300 font-semibold">premium@vididown.com</span> / Şifre: <span className="text-slate-300">premium123</span></p>
                <p>Standart: <span className="text-slate-300 font-semibold">hakan@gmail.com</span> / Şifre: <span className="text-slate-300">user123</span></p>
              </div>
            </div>

            <button
              onClick={onInstalled}
              className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg shadow-teal-500/10 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Platforma Giriş Yap</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-[10px] text-slate-500 flex items-center justify-center space-x-1.5 border-t border-slate-850 pt-4">
          <span>VidiDown v2.4 Setup Wizard</span>
          <span>•</span>
          <Heart className="h-3 w-3 text-rose-500" />
        </div>
      </motion.div>
    </div>
  );
}
