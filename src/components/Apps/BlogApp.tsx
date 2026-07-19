import React, { useState } from 'react'
import { BookOpen, Calendar, Clock, ArrowLeft, ExternalLink } from 'lucide-react'
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

interface LinkedInPost {
  id: string
  date: string
  content: string
  likes: number
  comments: number
  shares: number
  image?: string
}

export const BlogApp: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [activeTab, setActiveTab] = useState<'blog' | 'linkedin'>('blog')
  
  const { profile } = portfolioData
  const posts = portfolioData.blog as BlogPost[]
  const linkedinPosts = (portfolioData as any).linkedinPosts as LinkedInPost[] || []

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
              
              {/* Header Profile Section with Tab Swapper */}
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  {activeTab === 'blog' ? (
                    <BookOpen className="w-6 h-6 text-violet-500" />
                  ) : (
                    <span className="text-xl">💬</span>
                  )}
                  <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">
                    {activeTab === 'blog' ? 'Engineering Blog' : 'LinkedIn Updates'}
                  </h2>
                </div>

                <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/50">
                  <button
                    onClick={() => setActiveTab('blog')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'blog'
                        ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-850 dark:hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Articles</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('linkedin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'linkedin'
                        ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-850 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>LinkedIn Activity</span>
                  </button>
                </div>
              </div>

              {activeTab === 'blog' ? (
                /* Blog Posts List */
                <div className="space-y-6">
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
              ) : (
                /* LinkedIn Updates Feed */
                <div className="space-y-6">
                  {linkedinPosts.map(post => (
                    <div
                      key={post.id}
                      className="p-5 md:p-6 rounded-2xl glass border border-white/10 dark:border-white/5 space-y-4 shadow-sm hover:shadow-md transition-shadow select-text"
                    >
                      {/* Author Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white/10">
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {profile.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {profile.title} • {post.date}
                          </p>
                        </div>
                        {/* Brand Link */}
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-500 hover:text-violet-600 transition-colors p-1.5 rounded-full hover:bg-violet-500/10 flex-shrink-0"
                          title="View on LinkedIn"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      {/* Content Text */}
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Optional Image */}
                      {post.image && (
                        <div className="rounded-xl overflow-hidden aspect-video border border-slate-200/50 dark:border-slate-800/50 bg-white/5">
                          <img
                            src={post.image}
                            alt="Post Media"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Social Counters */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-1 font-semibold">
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[8px] font-bold">👍</span>
                          <span>{post.likes} likes</span>
                        </div>
                        <div className="flex gap-2 font-medium">
                          <span>{post.comments} comments</span>
                          <span>•</span>
                          <span>{post.shares} shares</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
