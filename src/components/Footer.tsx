import React from "react";
import { Download, Heart, Shield, FileText, Map, HelpCircle, Mail, AlertTriangle } from "lucide-react";

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2" onClick={() => setView("home")}>
              <div className="bg-rose-500 text-white p-2 rounded-xl flex items-center justify-center">
                <Download className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Vidi<span className="text-rose-500">Down</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              YouTube, Shorts, TikTok, Instagram Reels, Facebook ve X platformlarından yüksek kaliteli video ve ses indirme, dönüştürme ve arşivleme aracıdır.
            </p>
            <div className="text-xs text-slate-500">
              Uluslararası standartlarda %100 güvenli, hızlı ve filigransız indirme deneyimi.
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Desteklenen Platformlar</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView("home")} className="hover:text-rose-500 transition-colors text-left">YouTube & Shorts</button></li>
              <li><button onClick={() => setView("home")} className="hover:text-rose-500 transition-colors text-left">TikTok & Douyin</button></li>
              <li><button onClick={() => setView("home")} className="hover:text-rose-500 transition-colors text-left">Instagram Reels & Post</button></li>
              <li><button onClick={() => setView("home")} className="hover:text-rose-500 transition-colors text-left">Facebook & Twitter (X)</button></li>
              <li><button onClick={() => setView("home")} className="hover:text-rose-500 transition-colors text-left">Vimeo & Dailymotion</button></li>
            </ul>
          </div>

          {/* Resources & SSS */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Sayfalar & Yardım</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView("blog")} className="hover:text-rose-500 transition-colors text-left">Rehberler & Blog</button></li>
              <li><button onClick={() => setView("faq")} className="hover:text-rose-500 transition-colors text-left">Sıkça Sorulan Sorular</button></li>
              <li><button onClick={() => setView("about")} className="hover:text-rose-500 transition-colors text-left">Hakkımızda</button></li>
              <li><button onClick={() => setView("contact")} className="hover:text-rose-500 transition-colors text-left">İletişim & Destek</button></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-rose-500 transition-colors text-left flex items-center space-x-1">
                <Map className="h-3.5 w-3.5" />
                <span>Sitemap (SEO)</span>
              </a></li>
            </ul>
          </div>

          {/* Legal / GDPR / DMCA */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Yasal & Güvenlik</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView("privacy")} className="hover:text-rose-500 transition-colors text-left flex items-center space-x-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span>Gizlilik Politikası</span>
              </button></li>
              <li><button onClick={() => setView("terms")} className="hover:text-rose-500 transition-colors text-left flex items-center space-x-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Kullanım Şartları</span>
              </button></li>
              <li><button onClick={() => setView("dmca")} className="hover:text-rose-500 transition-colors text-left flex items-center space-x-1.5 text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>DMCA Telif Hakkı</span>
              </button></li>
              <li className="text-[11px] text-slate-500 leading-snug mt-2">
                GDPR & Cookie Politikalarına tam uyumluyuz. Sitede sunulan servislerin kullanımı, telif hakkı kurallarına tabidir.
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 mb-4 sm:mb-0">
            <span>© {currentYear} VidiDown. Tüm hakları saklıdır.</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Türkiye'de sevgiyle geliştirildi</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
