import React, { useRef, useState, useEffect } from 'react'
import { useOS } from '../context/OSContext'
import { Window } from './Window'
import { Taskbar } from './Taskbar'
import { StartMenu } from './StartMenu'
import {
  User,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Mail,
  Settings,
  RefreshCw,
  Sun,
  Moon,
  Trash2,
  Award
} from 'lucide-react'
import { Github, Linkedin } from '../components/Common/BrandIcons'
import portfolioData from '../data/portfolioData.json'

// App components
import { AboutApp } from '../components/Apps/AboutApp'
import { ProjectsApp } from '../components/Apps/ProjectsApp'
import { ResumeApp } from '../components/Apps/ResumeApp'
import { GalleryApp } from '../components/Apps/GalleryApp'
import { BlogApp } from '../components/Apps/BlogApp'
import { SettingsApp } from '../components/Apps/SettingsApp'
import { ContactApp } from '../components/Apps/ContactApp'
import { CertificationsApp } from '../components/Apps/CertificationsApp'

export const Desktop: React.FC = () => {
  const {
    wallpaper,
    setWallpaper,
    wallpapers,
    windows,
    openWindow,
    theme,
    toggleTheme,
    githubUsername,
    setGithubUsername,
    startMenuOpen,
    setStartMenuOpen,
    visitorCount
  } = useOS()

  const desktopRef = useRef<HTMLDivElement>(null)
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0
  })

  // Desktop Icons Configuration
  const desktopIcons = [
    { id: 'about', name: 'About Me', icon: User, color: 'from-blue-400 to-indigo-500' },
    { id: 'projects', name: 'Projects', icon: FolderOpen, color: 'from-amber-400 to-orange-500' },
    { id: 'resume', name: 'Resume.pdf', icon: FileText, color: 'from-emerald-400 to-teal-500' },
    { id: 'gallery', name: 'Media Gallery', icon: ImageIcon, color: 'from-pink-400 to-rose-500' },
    { id: 'blog', name: 'Developer Blog', icon: BookOpen, color: 'from-violet-400 to-purple-500' },
    { id: 'contact', name: 'Contact Me', icon: Mail, color: 'from-fuchsia-400 to-pink-500' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'from-slate-400 to-slate-600' },
    { id: 'certifications', name: 'Certifications', icon: Award, color: 'from-violet-500 to-fuchsia-600' },
    { id: 'github', name: 'GitHub Profile', icon: Github, color: 'from-slate-800 to-black', isExternal: true, url: portfolioData.profile.github },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-800', isExternal: true, url: portfolioData.profile.linkedin }
  ]

  // Handle right-click Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Position menu near mouse coordinates
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    })
  }

  // Close context menu when clicking elsewhere
  const closeContextMenu = () => {
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0 })
    }
  }

  // Action for context menu: Refresh
  const handleRefresh = () => {
    // re-trigger github sync by toggling username state triggers
    const username = githubUsername
    setGithubUsername('')
    setTimeout(() => setGithubUsername(username), 50)
    closeContextMenu()
  }

  // Action for context menu: Random wallpaper
  const handleRandomWallpaper = () => {
    const currentIdx = wallpapers.findIndex(w => w.url === wallpaper)
    let nextIdx = Math.floor(Math.random() * wallpapers.length)
    if (nextIdx === currentIdx) {
      nextIdx = (nextIdx + 1) % wallpapers.length
    }
    setWallpaper(wallpapers[nextIdx].url)
    closeContextMenu()
  }

  // Action for context menu: Clear local cache
  const handleClearCache = () => {
    localStorage.clear()
    window.location.reload()
  }

  // Global keyboard listener: Win key or Ctrl + Space opens start menu/search
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Toggle Start Menu
      if (e.key === 'Meta' || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault()
        setStartMenuOpen(!startMenuOpen)
      }
      
      // Escape closes Context Menu & Start Menu
      if (e.key === 'Escape') {
        closeContextMenu()
        setStartMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleGlobalShortcuts)
    return () => window.removeEventListener('keydown', handleGlobalShortcuts)
  }, [startMenuOpen, setStartMenuOpen, contextMenu])

  return (
    <div
      ref={desktopRef}
      onContextMenu={handleContextMenu}
      onClick={() => {
        closeContextMenu()
        setStartMenuOpen(false)
      }}
      className="h-screen w-screen overflow-hidden relative select-none"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Visitor Counter (Top Right) */}
      <div className="absolute top-6 right-6 z-10 select-none">
        <div className="glass px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-white shadow-lg backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-85">Visitors:</span>
          <span className="text-xs font-black font-display text-emerald-450">
            {visitorCount !== null ? visitorCount.toLocaleString() : '...'}
          </span>
        </div>
      </div>
      {/* Desktop Icons Grid (Left column layout) */}
      <div className="absolute top-6 left-6 bottom-18 w-32 flex flex-col flex-wrap gap-4 content-start z-10">
        {desktopIcons.map(icon => {
          const Icon = icon.icon
          return (
            <div
              key={icon.id}
              onDoubleClick={() => {
                if (icon.isExternal) {
                  window.open(icon.url, '_blank')
                } else {
                  openWindow(icon.id)
                }
              }}
              className="w-24 p-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/10 dark:hover:bg-white/5 active:scale-95 group text-center"
            >
              {/* Double click helper on mobile/tablet screens */}
              <div 
                onClick={() => {
                  // If on a tap device, allow click
                  if (window.matchMedia('(pointer: coarse)').matches) {
                    if (icon.isExternal) {
                      window.open(icon.url, '_blank')
                    } else {
                      openWindow(icon.id)
                    }
                  }
                }}
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${icon.color} shadow-lg shadow-black/10 flex items-center justify-center text-white mb-2 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-[10px] font-bold text-white tracking-wide drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]">
                {icon.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Windows Manager Render */}
      {windows.map(win => (
        <Window key={win.id} windowState={win} containerRef={desktopRef}>
          {win.id === 'about' && <AboutApp />}
          {win.id === 'projects' && <ProjectsApp />}
          {win.id === 'resume' && <ResumeApp />}
          {win.id === 'gallery' && <GalleryApp />}
          {win.id === 'blog' && <BlogApp />}
          {win.id === 'contact' && <ContactApp />}
          {win.id === 'settings' && <SettingsApp />}
          {win.id === 'certifications' && <CertificationsApp />}
        </Window>
      ))}

      {/* Context Menu Popup */}
      {contextMenu.visible && (
        <div
          onClick={e => e.stopPropagation()}
          className="absolute w-44 rounded-xl glass-panel shadow-2xl p-1 z-[99999] border border-white/20 text-xs text-slate-800 dark:text-slate-200 animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleRefresh}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-600 hover:text-white text-left font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Projects</span>
          </button>
          
          <button
            onClick={handleRandomWallpaper}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-600 hover:text-white text-left font-semibold cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Next Wallpaper</span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-600 hover:text-white text-left font-semibold cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
          
          <div className="border-t border-slate-200/30 dark:border-slate-800/30 my-1" />

          <button
            onClick={handleClearCache}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white text-left font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset System</span>
          </button>
        </div>
      )}

      {/* Start Menu Popup */}
      <StartMenu isOpen={startMenuOpen} onClose={() => setStartMenuOpen(false)} />

      {/* Taskbar Bar */}
      <Taskbar
        onStartMenuToggle={() => setStartMenuOpen(!startMenuOpen)}
        startMenuOpen={startMenuOpen}
      />
    </div>
  )
}
