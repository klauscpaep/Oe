import React, { useState } from "react";
import { ChevronDown, HelpCircle, CheckCircle, Smartphone, Flame, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "VidiDown ile video indirmek ücretsiz midir?",
      answer: "Evet, VidiDown'un temel indirme ve dönüştürme özellikleri tamamen ücretsizdir. Günlük ücretsiz kullanım sınırı dahilinde dilediğiniz videoları 1080p kalitesine kadar kolaylıkla indirebilirsiniz. Sınırsız indirme hızı, reklamsız deneyim ve 4K/8K çözünürlükler için Premium üyeliğe göz atabilirsiniz.",
      icon: CheckCircle
    },
    {
      question: "Hangi platformları ve video formatlarını destekliyorsunuz?",
      answer: "Platformumuz başta YouTube (Shorts dahil olmak üzere), TikTok, Instagram (Reels), Facebook ve X (Twitter) gibi popüler ağları tam destekler. Videoları MP4, WEBM, AVI, MKV formatlarında; sesleri ise MP3, WAV, AAC, FLAC ve M4A formatlarında indirebilirsiniz.",
      icon: Flame
    },
    {
      question: "TikTok videolarını filigransız (Watermark olmadan) nasıl indirebilirim?",
      answer: "TikTok video bağlantısını arama kutusuna yapıştırıp 'Dönüştür' butonuna bastığınızda, sistemimiz TikTok sunucularındaki ham video adresini otomatik olarak çözer. Gelen seçeneklerden filigransız MP4 butonuna tıklayarak logolar olmadan videoyu cihazınıza kaydedebilirsiniz.",
      icon: Star
    },
    {
      question: "Mobil cihazlar ve iPhone (iOS) telefonlar ile uyumlu mudur?",
      answer: "Evet, web sitemiz tamamen mobil uyumludur. Android cihazlarda herhangi bir sınırlama olmadan doğrudan tarayıcıdan indirebilirsiniz. iOS (iPhone) cihazlarda, Apple güvenlik politikaları gereği indirilen dosyayı 'Dosyalar' klasörünüze kaydetmek için Safari tarayıcısını kullanmanız önerilir.",
      icon: Smartphone
    },
    {
      question: "İndirilen videoların kalitesi nedir? 4K ve 8K seçenekleri var mı?",
      answer: "VidiDown, videonun sunulduğu kaynak kalitede indirmeyi destekler. Videonun orijinalinde mevcutsa 144p'den başlayarak 1080p (Full HD), 1440p (2K), 2160p (4K) ve hatta 4320p (8K) kalitesine kadar indirme seçeneği sunulur. Sesler ise stüdyo kalitesinde (320kbps'e kadar) MP3 olarak dönüştürülür.",
      icon: HelpCircle
    }
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-slate-400 mt-2 text-sm max-w-lg mx-auto">
          VidiDown indirme, dönüştürme ve üyelik işlemleriyle ilgili merak ettiğiniz soruların yanıtları.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const Icon = faq.icon;

          return (
            <div
              key={index}
              className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-5 text-left font-medium text-slate-200 hover:text-white transition-colors focus:outline-none"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-1.5 bg-slate-950 rounded-lg text-rose-500">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-base font-semibold">{faq.question}</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-rose-500" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-950/40">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
