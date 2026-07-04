import React, { useState } from "react";
import { Sparkles, Check, Flame, Shield, HelpCircle, Trophy, Zap, AlertCircle } from "lucide-react";
import { User } from "../types";
import { api } from "../api";
import { motion, AnimatePresence } from "motion/react";

interface PremiumViewProps {
  user: User | null;
  onUpgradeSuccess: (newStatus: "free" | "premium" | "vip") => void;
  onOpenAuth: () => void;
}

export default function PremiumView({ user, onUpgradeSuccess, onOpenAuth }: PremiumViewProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);

  const plans = [
    {
      id: "free",
      name: "Ücretsiz (Free)",
      tag: "Temel İndirme",
      price: "0",
      description: "Sosyal medyadan ara sıra video indiren kullanıcılar için ideal paket.",
      features: [
        "Maksimum 1080p Full HD video indirme",
        "5 MB/s indirme hız sınırı",
        "Günlük 10 video indirme limiti",
        "Sitedeki reklamları görüntüler",
        "Standart dönüştürme kuyruğu",
        "Genel topluluk desteği"
      ],
      icon: Flame,
      color: "border-slate-800 bg-slate-900/10",
      btnText: "Mevcut Planınız"
    },
    {
      id: "premium",
      name: "Premium Üye",
      tag: "En Popüler Paket",
      price: "149",
      description: "Hızlı, sınırsız ve yüksek çözünürlüklü indirme deneyimi arayanlar için.",
      features: [
        "4K (2160p) Ultra HD indirme kalitesi",
        "Sınırsız indirme hızı (100+ MB/s)",
        "Sınırsız günlük indirme hakkı",
        "%100 Reklamsız kullanım deneyimi",
        "Öncelikli dönüştürme sunucuları",
        "24/7 Bilet destek sistemi önceliği",
        "Günlük 2.000 REST API sorgusu"
      ],
      icon: Sparkles,
      color: "border-rose-500/50 bg-gradient-to-b from-rose-500/5 to-transparent shadow-lg shadow-rose-500/5",
      btnText: "Premium'a Yüksel",
      highlight: true
    },
    {
      id: "vip",
      name: "VIP Kurumsal",
      tag: "Sınırsız Güç & API",
      price: "399",
      description: "Geliştiriciler, içerik üreticileri ve arşivciler için tasarlanmış en üstün paket.",
      features: [
        "8K (4320p) Ultra HD indirme desteği",
        "Kapasite sınırı olmayan maksimum sunucu hızı",
        "Toplu (birlikte) video indirme desteği",
        "%100 Reklamsız ve filigransız kullanım",
        "En yüksek VIP dönüştürme önceliği",
        "Telefon & Canlı destek ayrıcalığı",
        "Günlük 10.000 REST API sorgu limiti"
      ],
      icon: Trophy,
      color: "border-purple-500/50 bg-gradient-to-b from-purple-500/5 to-transparent shadow-lg shadow-purple-500/5",
      btnText: "VIP'ye Yüksel"
    }
  ];

  const handleCheckoutInitiate = (plan: any) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.premiumStatus === plan.id) {
      alert("Bu plana zaten sahipsiniz.");
      return;
    }
    setCheckoutPlan(plan);
  };

  const handlePaymentConfirm = async () => {
    if (!checkoutPlan) return;
    setLoading(checkoutPlan.id);
    try {
      const res = await api.activatePremium(checkoutPlan.id);
      if (res.success) {
        setSuccess(res.message);
        onUpgradeSuccess(res.premiumStatus);
        setTimeout(() => {
          setSuccess("");
          setCheckoutPlan(null);
        }, 3000);
      }
    } catch (err: any) {
      alert(err.message || "Ödeme işlemi sırasında bir sorun oluştu.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-[10px] bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 font-bold uppercase tracking-widest">
          Üyelik Planları
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent mt-3">
          Limitleri Kaldırın, Premium'a Geçin
        </h2>
        <p className="text-slate-400 mt-3 text-sm max-w-lg mx-auto leading-relaxed">
          Sınırsız indirme hızı, reklamsız deneyim ve 4K/8K video çözünürlükleri ile VidiDown deneyiminizi en üst seviyeye taşıyın.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrentPlan = user ? user.premiumStatus === plan.id : plan.id === "free";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between border rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 ${plan.color} ${
                plan.highlight ? "ring-2 ring-rose-500/20" : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-rose-500/20">
                  EN POPÜLER PAKET
                </span>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-xl border ${
                    plan.id === "free" ? "bg-slate-950 border-slate-800 text-slate-400" :
                    plan.id === "premium" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                    "bg-purple-500/10 border-purple-500/20 text-purple-400"
                  }`}>
                    <PlanIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-100">{plan.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide">{plan.tag}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline space-x-1.5 mb-5">
                  <span className="text-3xl font-extrabold text-white">₺{plan.price}</span>
                  <span className="text-xs text-slate-500 font-medium">/ aylık</span>
                </div>

                <p className="text-xs text-slate-400 leading-normal mb-6">
                  {plan.description}
                </p>

                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                      <Check className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${
                        plan.id === "free" ? "text-slate-500" :
                        plan.id === "premium" ? "text-rose-500" :
                        "text-purple-400"
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe button */}
              <button
                type="button"
                onClick={() => handleCheckoutInitiate(plan)}
                disabled={isCurrentPlan}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
                  isCurrentPlan
                    ? "bg-slate-950 border border-slate-900 text-slate-500 cursor-not-allowed"
                    : plan.id === "free"
                      ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800"
                      : plan.id === "premium"
                        ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/15"
                        : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/15"
                }`}
              >
                {isCurrentPlan ? plan.btnText : plan.btnText}
              </button>
            </div>
          );
        })}
      </div>

      {/* CHECKOUT POPUP / MODAL */}
      <AnimatePresence>
        {checkoutPlan && (
          <>
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50" onClick={() => setCheckoutPlan(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-50 text-xs"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 mb-3">
                  <Shield className="h-5 w-5 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white">Güvenli Ödeme Ekranı (Secure Checkout)</h3>
                <p className="text-slate-400 mt-1">Seçtiğiniz plan: <span className="text-rose-400 font-bold">{checkoutPlan.name}</span></p>
              </div>

              {success ? (
                <div className="text-center py-6 space-y-3">
                  <Check className="h-12 w-12 text-teal-400 mx-auto bg-teal-500/10 p-2.5 rounded-full border border-teal-500/20" />
                  <p className="text-sm font-bold text-white">Ödeme Başarılı!</p>
                  <p className="text-slate-400 leading-normal">{success}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mock card info */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>Ödenecek Tutar</span>
                      <span>₺{checkoutPlan.price} / Ay</span>
                    </div>
                    <hr className="border-slate-900" />
                    <p className="text-[10px] text-slate-500 leading-normal">
                      * Bu bir demo ödeme arayüzüdür. "Ödemeyi Onayla" butonuna bastığınızda hesabınız sistem tarafından anında yükseltilecek ve kartınızdan herhangi bir çekim yapılmayacaktır.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutPlan(null)}
                      className="w-full bg-slate-950 border border-slate-800 hover:text-white text-slate-400 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={handlePaymentConfirm}
                      disabled={loading !== null}
                      className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-rose-500/15"
                    >
                      {loading ? "Onaylanıyor..." : "Ödemeyi Onayla"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
