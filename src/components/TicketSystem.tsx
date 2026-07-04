import React, { useState } from "react";
import { Ticket, User } from "../types";
import { LifeBuoy, Send, PlusCircle, CheckCircle2, AlertCircle, Clock, ChevronRight, MessageSquare, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TicketSystemProps {
  tickets: Ticket[];
  user: User;
  onCreateTicket: (subject: string, message: string) => Promise<any>;
  onReplyTicket: (id: string, message: string) => Promise<any>;
}

export default function TicketSystem({ tickets, user, onCreateTicket, onReplyTicket }: TicketSystemProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form states
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await onCreateTicket(subject, message);
      setSuccess("Destek talebiniz başarıyla oluşturuldu.");
      setSubject("");
      setMessage("");
      setTimeout(() => {
        setIsCreating(false);
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Destek talebi oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage || !activeTicket) return;

    setLoading(true);
    try {
      const updatedTicket = await onReplyTicket(activeTicket.id, replyMessage);
      setActiveTicket(updatedTicket.ticket || updatedTicket); // update local ticket view
      setReplyMessage("");
    } catch (err: any) {
      setError(err.message || "Yanıt gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // Keep active ticket in sync with updated ticket from prop
  React.useEffect(() => {
    if (activeTicket) {
      const current = tickets.find((t) => t.id === activeTicket.id);
      if (current) {
        setActiveTicket(current);
      }
    }
  }, [tickets, activeTicket?.id]);

  return (
    <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent flex items-center space-x-2">
            <LifeBuoy className="h-7 w-7 text-rose-500" />
            <span>Destek & Ticket Sistemi</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-md">
            Ödeme, indirme hataları veya API kullanım detayları ile ilgili teknik ekibimizle doğrudan iletişime geçin.
          </p>
        </div>

        {!isCreating && !activeTicket && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-1.5 bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-rose-500/10"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Yeni Talep Oluştur</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* CREATE TICKET SCREEN */}
        {isCreating && (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-950/40">
              <h3 className="text-lg font-bold text-white">Yeni Destek Talebi</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-xs text-slate-400 hover:text-white bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800"
              >
                Geri Dön
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 p-4 rounded-xl text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Destek Konusu</label>
                <input
                  type="text"
                  placeholder="Örn: Premium aboneliğim aktif olmadı / API hata kodu"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sorununuz veya Talebiniz</label>
                <textarea
                  rows={5}
                  placeholder="Yaşadığınız sorunu detaylıca açıklayınız. Ödeme yaptıysanız işlem referans numarasını eklemeyi unutmayın."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-slate-950 text-slate-400 hover:text-white font-semibold px-5 py-2.5 rounded-xl text-xs border border-slate-800"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-rose-500/10"
                >
                  {loading ? "Oluşturuluyor..." : "Talebi Gönder"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* TICKET DETAIL CHAT SCREEN */}
        {activeTicket && (
          <motion.div
            key="ticket-chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden flex flex-col h-[550px]"
          >
            {/* Header */}
            <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTicket(null)}
                  className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">{activeTicket.subject}</h3>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                    <span>Talep ID: {activeTicket.id}</span>
                    <span>•</span>
                    <span>Açılış: {new Date(activeTicket.createdAt).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                activeTicket.status === "open"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : activeTicket.status === "answered"
                    ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    : "bg-slate-800 text-slate-400 border-slate-700"
              }`}>
                {activeTicket.status === "open" ? "Açık" : activeTicket.status === "answered" ? "Yanıtlandı" : "Kapatıldı"}
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/20">
              {/* Main Ticket Description */}
              <div className="flex items-start space-x-3 max-w-[85%]">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full bg-slate-800 object-cover"
                />
                <div className="bg-slate-900 border border-slate-900/50 rounded-2xl p-4 text-slate-200">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold mb-1">{user.username} (Talep Sahibi)</div>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{activeTicket.message}</p>
                  <div className="text-[9px] font-mono text-slate-500 mt-2 text-right">
                    {new Date(activeTicket.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {activeTicket.replies.map((rep) => {
                const isAdmin = rep.senderRole === "admin";
                return (
                  <div
                    key={rep.id}
                    className={`flex items-start space-x-3 max-w-[85%] ${isAdmin ? "ml-auto flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isAdmin ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-300"
                    }`}>
                      {isAdmin ? "A" : rep.senderName.substring(0, 1).toUpperCase()}
                    </div>
                    <div className={`rounded-2xl p-4 border ${
                      isAdmin 
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-100" 
                        : "bg-slate-900 border-slate-900/50 text-slate-200"
                    }`}>
                      <div className="text-[10px] font-mono text-slate-400 font-semibold mb-1">
                        {rep.senderName} {isAdmin && " (Teknik Destek)"}
                      </div>
                      <p className="text-sm whitespace-pre-line leading-relaxed">{rep.message}</p>
                      <div className="text-[9px] font-mono text-slate-500 mt-2 text-right">
                        {new Date(rep.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input bar */}
            {activeTicket.status !== "closed" ? (
              <form onSubmit={handleReply} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-900 flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Mesajınızı yazın..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !replyMessage}
                  className="p-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
                Bu destek talebi arşive alınmıştır. Yeni soru sormak için lütfen yeni destek talebi oluşturun.
              </div>
            )}
          </motion.div>
        )}

        {/* LIST TICKETS SCREEN */}
        {!isCreating && !activeTicket && (
          <motion.div
            key="ticket-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {tickets.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl">
                <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-slate-300 font-semibold text-sm">Aktif Destek Talebiniz Bulunmuyor</h4>
                <p className="text-slate-500 text-xs mt-1">Herhangi bir sorun yaşarsanız yeni bir talep açarak bize ulaşabilirsiniz.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {tickets.map((ticket) => {
                  const lastReply = ticket.replies[ticket.replies.length - 1];
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setActiveTicket(ticket)}
                      className="bg-slate-900/20 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all duration-300 group"
                    >
                      <div className="flex items-start space-x-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${
                          ticket.status === "answered"
                            ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          <MessageSquare className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-200 group-hover:text-rose-400 transition-colors truncate pr-4">{ticket.subject}</h4>
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {lastReply ? `Son Yanıt: ${lastReply.message}` : ticket.message}
                          </p>
                          <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 mt-2">
                            <span>Talep ID: {ticket.id}</span>
                            <span>•</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString("tr-TR")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          ticket.status === "open"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : ticket.status === "answered"
                              ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {ticket.status === "open" ? "Açık" : ticket.status === "answered" ? "Yanıtlandı" : "Kapandı"}
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
