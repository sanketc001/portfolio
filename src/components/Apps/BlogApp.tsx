import React, { useState } from 'react'
import { BookOpen, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import portfolioData from '../../data/portfolioData.json'

interface BlogPost {
  id: string
  title: string
  date: string
  readTime: string
  excerpt: string
  content: string
}

export const BlogApp: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const posts = portfolioData.blog as BlogPost[]

  return (
    <div className="h-full flex flex-col select-text bg-slate-50/50 dark:bg-slate-950/20">
      <AnimatePresence mode="wait">
        {!selectedPost ? (
          /* List View */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto p-6 md:p-8"
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center gap-2 mb-8">
                <BookOpen className="w-6 h-6 text-violet-500" />
                <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Engineering Blog</h2>
              </div>

              {posts.map(post => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5 hover:border-violet-500/30 hover:shadow-md cursor-pointer transition-all duration-300 group"
                >
                  <div className="flex gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors font-display">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="text-xs font-bold text-violet-500 dark:text-violet-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Article</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Reader View */
          <motion.div
            key="reader"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-y-auto p-6 md:p-10 bg-white dark:bg-slate-950"
          >
            <div className="max-w-2xl mx-auto">
              {/* Back Button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-8 group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to articles</span>
              </button>

              {/* Meta tags */}
              <div className="flex gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedPost.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight font-display border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                {selectedPost.title}
              </h1>

              {/* Article Content */}
              <div className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-wrap">
                {selectedPost.content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
