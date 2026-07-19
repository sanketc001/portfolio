import React, { useState, useEffect } from 'react'
import { useOS } from '../context/OSContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Mail,
  Settings,
  Wifi,
  Signal,
  Battery,
  ChevronLeft,
  Search,
  Award
} from 'lucide-react'
import { Github, Linkedin } from '../components/Common/BrandIcons'

// App components
import { AboutApp } from '../components/Apps/AboutApp'
import { ProjectsApp } from '../components/Apps/ProjectsApp'
import { ResumeApp } from '../components/Apps/ResumeApp'
import { GalleryApp } from '../components/Apps/GalleryApp'
import { BlogApp } from '../components/Apps/BlogApp'
import { SettingsApp } from '../components/Apps/SettingsApp'
import { ContactApp } from '../components/Apps/ContactApp'
import { CertificationsApp } from '../components/Apps/CertificationsApp'
import portfolioData from '../data/portfolioData.json'

export const HomeScreen: React.FC = () => {
  const { wallpaper, theme, visitorCount } = useOS()
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [time, setTime] = useState('')
  const [dateStr, setDateStr] = useState('')

  // Track wallpaper fade state on mobile
  const [prevWallpaper, setPrevWallpaper] = useState(wallpaper)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    if (wallpaper !== prevWallpaper) {
      setFade(true)
      const timer = setTimeout(() => {
        setPrevWallpaper(wallpaper)
        setFade(false)
      }, 550)
      return () => clearTimeout(timer)
    }
  }, [wallpaper, prevWallpaper])

  // Update clock & date
  useEffect(() => {
    const updateTime = () => {
      const date = new Date()
      setTime(
        date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })
      )
      setDateStr(
        date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // App catalog
  const apps = [
    { id: 'about', name: 'About Me', icon: User, color: 'from-blue-400 to-indigo-500' },
    { id: 'projects', name: 'Projects', icon: FolderOpen, color: 'from-amber-400 to-orange-500' },
    { id: 'resume', name: 'Resume', icon: FileText, color: 'from-emerald-400 to-teal-500' },
    { id: 'gallery', name: 'Gallery', icon: ImageIcon, color: 'from-pink-400 to-rose-500' },
    { id: 'certifications', name: 'Credentials', icon: Award, color: 'from-violet-400 to-fuchsia-500' },
    { id: 'blog', name: 'Blog', icon: BookOpen, color: 'from-indigo-400 to-purple-500' },
    { id: 'contact', name: 'Contact', icon: Mail, color: 'from-purple-400 to-pink-500' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'from-teal-400 to-emerald-500' },
    { id: 'github', name: 'GitHub', icon: Github, color: 'bg-slate-900 text-white', isExternal: true, url: portfolioData.profile.github },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600 text-white', isExternal: true, url: portfolioData.profile.linkedin }
  ]

  // Dock apps (pinned bottom apps)
  const dockApps = [
    { id: 'about', name: 'About', icon: User, color: 'bg-blue-500 text-white' },
    { id: 'projects', name: 'Projects', icon: FolderOpen, color: 'bg-amber-500 text-white' },
    { id: 'resume', name: 'Resume', icon: FileText, color: 'bg-emerald-500 text-white' },
    { id: 'contact', name: 'Contact', icon: Mail, color: 'bg-purple-500 text-white' }
  ]

  const handleAppLaunch = (id: string, isExternal?: boolean, url?: string) => {
    if (isExternal && url) {
      window.open(url, '_blank')
    } else {
      setActiveApp(id)
    }
  }

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full w-full relative flex flex-col justify-between overflow-hidden select-none bg-slate-950 font-sans">
      {/* Mobile background wallpaper layers with cross-fade transition */}
      <div className="absolute inset-0 -z-20 overflow-hidden bg-slate-900 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${prevWallpaper})` }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out"
          style={{ 
            backgroundImage: `url(${wallpaper})`,
            opacity: fade ? 1 : 0
          }}
        />
      </div>

      {/* Dynamic Theme backdrop overlay to soften background contrast */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/15 -z-19 pointer-events-none transition-colors duration-500" />
      {/* 1. Android/iOS Status Bar (Sticky at top, adapts theme) */}
      <div className={`h-8 px-4 flex items-center justify-between text-[11px] font-semibold z-[200] transition-all duration-300 ${
        activeApp 
          ? theme === 'light'
            ? 'text-slate-700 bg-[#f9f6f0] border-b border-[#e4ded0]'
            : 'text-slate-200 bg-slate-900 border-b border-slate-800'
          : 'text-white bg-black/10 backdrop-blur-[1px]'
      }`}>
        <div className="flex items-center gap-2">
          <span>{time}</span>
          <span className="opacity-45">•</span>
          <span className="text-[10px] tracking-wide font-medium flex items-center gap-0.5">
            👥 {visitorCount !== null ? visitorCount.toLocaleString() : '...'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 rotate-90" />
        </div>
      </div>

      {/* Main Screenspace Container */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Clock, Widgets, Apps & Dock (only when no app is open) */}
        {!activeApp && (
          <>
            <div className="flex-1 flex flex-col px-6 pt-4 relative overflow-y-auto pb-20">
              {/* 2. Clock & Date Widget (Pixel style) */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white mt-4 mb-6 flex flex-col items-center text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-display"
              >
                <h1 className="text-5xl font-bold tracking-tight">{time}</h1>
                <p className="text-sm font-medium mt-1 opacity-90">{dateStr}</p>
              </motion.div>

              {/* 3. Aesthetic Google Search Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-sm mx-auto mb-8"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search apps..."
                    className="w-full text-xs pl-9 pr-4 py-2.5 rounded-full border border-white/15 bg-white/20 dark:bg-black/20 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-white/70" />
                </div>
              </motion.div>

              {/* 4. Applications Grid */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-4 gap-y-6 gap-x-4 max-w-sm mx-auto w-full"
              >
                {filteredApps.map(app => {
                  const Icon = app.icon
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleAppLaunch(app.id, app.isExternal, app.url)}
                      className="flex flex-col items-center cursor-pointer group active:scale-90 transition-transform"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${app.color} shadow-lg shadow-black/10 flex items-center justify-center mb-1.5`}>
                        <Icon className="w-5.5 h-5.5 stroke-[1.8]" />
                      </div>
                      <span className="text-[10px] font-bold text-white text-center tracking-wide leading-tight line-clamp-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {app.name}
                      </span>
                    </button>
                  )
                })}
              </motion.div>
            </div>

            {/* 5. Mobile Dock (Bottom pinned launcher apps) */}
            <div className="px-6 pb-6 w-full z-10">
              <div className="max-w-sm mx-auto p-3.5 rounded-3xl glass backdrop-blur-2xl flex justify-around shadow-2xl border border-white/15 dark:border-white/5">
                {dockApps.map(app => {
                  const Icon = app.icon
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleAppLaunch(app.id)}
                      className="flex flex-col items-center cursor-pointer active:scale-90 transition-transform"
                    >
                      <div className={`w-11 h-11 rounded-2xl ${app.color} shadow flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* 6. Active App Fullscreen Panel Overlay */}
        <AnimatePresence>
          {activeApp && (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="absolute inset-0 bg-slate-50 dark:bg-[#0f121d] flex flex-col z-[100]"
            >
              {/* Native App Top Navigation Bar */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex-shrink-0 select-none">
                <button
                  onClick={() => setActiveApp(null)}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-xs font-bold py-2 pr-3 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-violet-500" />
                  <span>Launcher</span>
                </button>

                <span className="text-sm font-bold text-slate-800 dark:text-white capitalize font-display">
                  {apps.find(a => a.id === activeApp)?.name}
                </span>
                
                {/* placeholder for symmetrical design */}
                <div className="w-12 h-6" />
              </div>

              {/* App Viewport Container */}
              <div className="flex-1 overflow-hidden relative">
                {activeApp === 'about' && <AboutApp />}
                {activeApp === 'projects' && <ProjectsApp />}
                {activeApp === 'resume' && <ResumeApp />}
                {activeApp === 'gallery' && <GalleryApp />}
                {activeApp === 'blog' && <BlogApp />}
                {activeApp === 'settings' && <SettingsApp />}
                {activeApp === 'contact' && <ContactApp />}
                {activeApp === 'certifications' && <CertificationsApp />}
              </div>

              {/* Android Navigation Bar Pill at Bottom */}
              <div className="h-6 w-full flex items-center justify-center bg-transparent select-none flex-shrink-0">
                <div 
                  onClick={() => setActiveApp(null)}
                  className="w-28 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 opacity-60 active:scale-95 cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
