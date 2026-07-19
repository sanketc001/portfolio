import React, { useState, useRef, useEffect } from 'react'
import { useOS } from '../context/OSContext'
import { Search, LogOut, Sun, Moon, Settings, User, FileText, FolderOpen, Image as ImageIcon, BookOpen, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import portfolioData from '../data/portfolioData.json'

interface StartMenuProps {
  isOpen: boolean
  onClose: () => void
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const {
    openWindow,
    theme,
    toggleTheme,
    windows,
    closeWindow
  } = useOS()

  const [search, setSearch] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const profile = portfolioData.profile

  const handleAppClick = (id: string) => {
    openWindow(id)
    onClose()
  }

  const handleShutdown = () => {
    // Close all open windows
    windows.forEach(win => {
      if (win.isOpen) closeWindow(win.id)
    })
    onClose()
  }

  // Close start menu when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Delay slightly to prevent immediate reopening if clicking the start button
        setTimeout(() => onClose(), 50)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const appItems = [
    { id: 'about', name: 'About Me', icon: User, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'projects', name: 'Projects Explorer', icon: FolderOpen, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'resume', name: 'Resume.pdf', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'gallery', name: 'Media Gallery', icon: ImageIcon, color: 'text-pink-500 bg-pink-500/10' },
    { id: 'blog', name: 'Developer Blog', icon: BookOpen, color: 'text-indigo-500 bg-indigo-500/10' },
    { id: 'contact', name: 'Contact / Mail', icon: Mail, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'text-teal-500 bg-teal-500/10' }
  ]

  const filteredApps = appItems.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="absolute bottom-14 left-4 w-96 h-[460px] rounded-2xl glass-panel shadow-2xl flex flex-col overflow-hidden z-[9999]"
        >
          {/* Header Profile Section */}
          <div className="p-5 border-b border-slate-200/40 dark:border-slate-800/40 bg-white/10 dark:bg-black/20 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-display">{profile.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{profile.title}</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search apps, utilities..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Apps Grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2 font-display">
              Pinned Apps
            </h4>

            {filteredApps.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No applications found.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {filteredApps.map(app => {
                  const Icon = app.icon
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleAppClick(app.id)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all text-center group cursor-pointer"
                    >
                      <div className={`p-2.5 rounded-lg mb-2 group-hover:scale-105 transition-transform ${app.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {app.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Bottom Tray */}
          <div className="p-3 border-t border-slate-200/40 dark:border-slate-800/40 bg-white/10 dark:bg-black/10 flex items-center justify-between">
            {/* Quick theme toggler */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-violet-500" />}
            </button>

            {/* Power off / Close all */}
            <button
              onClick={handleShutdown}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
              title="Close all open windows"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Close Workspace</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
