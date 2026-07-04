import React, { useState } from "react";
import { User } from "../types";
import { 
  Download, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Menu, 
  X, 
  LifeBuoy, 
  BookOpen, 
  HelpCircle, 
  Settings, 
  Terminal,
  Database,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  user: User | null;
  currentView: string;
  setView: (view: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  announcements?: any[];
}

export default function Header({ user, currentView, setView, onOpenAuth, onLogout, announcements = [] }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);

  const navItems = [
    { label: "Ana Sayfa", view: "home", icon: Download },
    { label: "Premium", view: "premium", icon: Sparkles, highlight: true },
    { label: "Blog", view: "blog", icon: BookOpen },
    { label: "SSS", view: "faq", icon: HelpCircle },
    { label: "Destek", view: "support", icon: LifeBuoy, authRequired: true }
  ];

  const handleNavClick = (view: string) => {
    setView(view);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView("home")}>
            <div className="bg-rose-500 text-white p-2 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center">
              <Download className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-rose-400 bg-clip-text text-transparent">
              Vidi<span className="text-rose-500">Down</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded-full border border-rose-500/20 font-mono">
              v2.4
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              if (item.authRequired && !user) return null;

              const Icon = item.icon;
              const isActive = currentView === item.view;

              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    item.highlight 
                      ? isActive
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                        : "bg-gradient-to-r from-rose-500/10 to-pink-500/10 hover:from-rose-500 hover:to-pink-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent"
                      : isActive
                        ? "bg-slate-900 text-white border border-slate-800"
                        : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Account Controls */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Announcements Bell Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAnnouncementsOpen(!announcementsOpen)}
                className="relative p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center justify-center"
                title="Sistem Duyuruları"
              >
                <Bell className="h-4.5 w-4.5" />
                {announcements.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {announcementsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAnnouncementsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800/95 p-3 shadow-2xl z-50 max-h-96 overflow-y-auto"
                    >
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1 border-b border-slate-800/80 pb-2 flex items-center justify-between">
                        <span>Sistem Duyuruları</span>
                        <span className="font-mono text-[10px] lowercase text-slate-500 font-normal">{announcements.length} adet</span>
                      </h4>

                      <div className="space-y-2">
                        {announcements.length === 0 ? (
                          <p className="text-[11px] text-slate-500 text-center py-4">Henüz duyuru bulunmuyor.</p>
                        ) : (
                          announcements.map((ann) => (
                            <div key={ann.id} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-900 hover:border-slate-800 transition-all text-left">
                              <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-1">
                                <span className="text-xs font-bold text-slate-200">{ann.title}</span>
                                {ann.isPinned && (
                                  <span className="text-[8px] bg-amber-500/15 text-amber-400 border border-amber-500/10 px-1 rounded font-bold uppercase shrink-0">Sabit</span>
                                )}
                                <span className={`text-[8px] border px-1 rounded font-bold uppercase shrink-0 ${
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
                                className="text-[11px] text-slate-400 leading-relaxed break-words announcement-content"
                                dangerouslySetInnerHTML={{ __html: ann.content }}
                              />
                              <span className="block text-[8px] text-slate-600 font-mono mt-2 text-right">
                                {new Date(ann.createdAt).toLocaleDateString("tr-TR")}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pr-3 bg-slate-900 hover:bg-slate-800/80 rounded-full border border-slate-800 transition-all cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-7 h-7 rounded-full bg-slate-800 object-cover ring-2 ring-rose-500/30"
                  />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1">
                      <span>{user.username}</span>
                      {user.role === "admin" && (
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-400 fill-teal-400/10" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {user.premiumStatus === "free" ? "Ücretsiz" : user.premiumStatus}
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800/95 p-2 shadow-2xl z-20"
                      >
                        <div className="px-3 py-2 border-b border-slate-800/80 mb-1.5">
                          <p className="text-xs text-slate-400">Giriş yapıldı:</p>
                          <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                        </div>

                        {user.role === "admin" && (
                          <button
                            onClick={() => {
                              setView("admin");
                              setProfileOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-xl text-teal-400 hover:bg-teal-500/10 transition-colors"
                          >
                            <Terminal className="h-4 w-4" />
                            <span>Yönetici Paneli</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setView("profile");
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>Profilim</span>
                        </button>

                        <button
                          onClick={() => {
                            setView("support");
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <LifeBuoy className="h-4 w-4" />
                          <span>Destek Talepleri</span>
                        </button>

                        <hr className="border-slate-800/80 my-1.5" />

                        <button
                          onClick={() => {
                            onLogout();
                            setProfileOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Çıkış Yap</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all cursor-pointer"
              >
                <UserIcon className="h-4 w-4" />
                <span>Giriş Yap / Üye Ol</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Announcements Bell Icon (Mobile) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAnnouncementsOpen(!announcementsOpen)}
                className="relative p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center justify-center"
                title="Sistem Duyuruları"
              >
                <Bell className="h-4 w-4" />
                {announcements.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {announcementsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAnnouncementsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800/95 p-3 shadow-2xl z-50 max-h-80 overflow-y-auto"
                    >
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1 border-b border-slate-800/80 pb-2 flex items-center justify-between">
                        <span>Sistem Duyuruları</span>
                        <span className="font-mono text-[10px] lowercase text-slate-500 font-normal">{announcements.length} adet</span>
                      </h4>

                      <div className="space-y-2">
                        {announcements.length === 0 ? (
                          <p className="text-[11px] text-slate-500 text-center py-4">Henüz duyuru bulunmuyor.</p>
                        ) : (
                          announcements.map((ann) => (
                            <div key={ann.id} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-900 hover:border-slate-800 transition-all text-left">
                              <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-1">
                                <span className="text-xs font-bold text-slate-200">{ann.title}</span>
                                {ann.isPinned && (
                                  <span className="text-[8px] bg-amber-500/15 text-amber-400 border border-amber-500/10 px-1 rounded font-bold uppercase shrink-0">Sabit</span>
                                )}
                                <span className={`text-[8px] border px-1 rounded font-bold uppercase shrink-0 ${
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
                                className="text-[11px] text-slate-400 leading-relaxed break-words announcement-content"
                                dangerouslySetInnerHTML={{ __html: ann.content }}
                              />
                              <span className="block text-[8px] text-slate-600 font-mono mt-2 text-right">
                                {new Date(ann.createdAt).toLocaleDateString("tr-TR")}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {user && (
              <img
                src={user.avatar}
                alt={user.username}
                onClick={() => setView("profile")}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 cursor-pointer object-cover"
              />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition-all cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950 border-b border-slate-900 px-4 pt-2 pb-4 space-y-1.5 overflow-hidden"
          >
            {navItems.map((item) => {
              if (item.authRequired && !user) return null;
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentView === item.view
                      ? "bg-slate-900 text-white border border-slate-800"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  <Icon className="h-4 w-4 text-rose-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {user ? (
              <div className="pt-4 border-t border-slate-900 mt-2 space-y-1">
                {user.role === "admin" && (
                  <button
                    onClick={() => handleNavClick("admin")}
                    className="w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm text-teal-400 font-medium hover:bg-teal-500/10"
                  >
                    <Terminal className="h-4 w-4" />
                    <span>Yönetici Paneli</span>
                  </button>
                )}
                <button
                  onClick={() => handleNavClick("profile")}
                  className="w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-900/50"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Profilim</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm text-rose-400 font-medium hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-900 mt-2">
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium px-4 py-3 rounded-xl text-sm shadow-lg shadow-rose-500/10"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Giriş Yap / Üye Ol</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
