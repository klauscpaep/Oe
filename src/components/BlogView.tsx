import React, { useState } from "react";
import { Blog, Category } from "../types";
import { BookOpen, Calendar, Eye, Clock, ArrowRight, X, Search, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BlogViewProps {
  blogs: Blog[];
  categories: Category[];
  isAdmin: boolean;
  onDeleteBlog?: (id: string) => void;
}

export default function BlogView({ blogs, categories, isAdmin, onDeleteBlog }: BlogViewProps) {
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = activeCategory === "all" || blog.categoryId === activeCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Blog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent flex items-center space-x-2">
            <BookOpen className="h-7 w-7 text-rose-500" />
            <span>Rehberler & Blog</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-lg">
            Sosyal medyadaki en popüler videoları en yüksek kalitede, reklamsız ve filigransız indirme tekniklerini keşfedin.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Blog yazısı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
            activeCategory === "all"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          Hepsi
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
              activeCategory === cat.id
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Aradığınız kriterlere uygun makale bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => {
            const cat = categories.find((c) => c.id === blog.categoryId);
            return (
              <motion.article
                key={blog.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col bg-slate-900/20 border border-slate-900 hover:border-slate-800/80 rounded-3xl overflow-hidden transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {cat && (
                    <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-rose-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-rose-500/20">
                      {cat.name}
                    </span>
                  )}
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(blog.createdAt).toLocaleDateString("tr-TR")}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{blog.readTime} okuma</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{blog.views}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-snug mb-2">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {blog.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-950/40">
                    <button
                      onClick={() => setSelectedBlog(blog)}
                      className="text-xs font-semibold text-rose-400 group-hover:text-rose-300 flex items-center space-x-1"
                    >
                      <span>Yazıyı Oku</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>

                    {isAdmin && onDeleteBlog && (
                      <button
                        onClick={() => onDeleteBlog(blog.id)}
                        className="text-[10px] bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-semibold px-2 py-1 rounded-lg border border-rose-500/20 transition-all"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Read Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <>
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50" onClick={() => setSelectedBlog(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-10 bottom-10 max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-y-auto"
            >
              <div className="relative h-64 sm:h-80 w-full bg-slate-950">
                <img
                  src={selectedBlog.image}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-center space-x-4 text-xs font-mono text-slate-500 mb-4">
                  <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-lg border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">
                    Rehber
                  </span>
                  <span>{new Date(selectedBlog.createdAt).toLocaleDateString("tr-TR")}</span>
                  <span>•</span>
                  <span>{selectedBlog.readTime} Okuma</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-tight">
                  {selectedBlog.title}
                </h1>

                <div className="text-sm text-slate-300 leading-relaxed space-y-4 font-normal whitespace-pre-line">
                  {selectedBlog.content}
                </div>

                {/* Additional simulated paragraph for depth */}
                <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-500">
                  <p className="font-semibold text-slate-400 mb-1">VidiDown İndirme İpuçları:</p>
                  <span>En yüksek hızda indirme ve toplu işlemleri aktifleştirmek için sağ üstteki Premium sekmesinden hesabınızı yükseltebilirsiniz. Paylaştığımız yöntemlerin tamamı kişisel kullanım amaçlıdır.</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
