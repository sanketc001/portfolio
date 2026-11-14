import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Sun, Moon, Trash2, Image as ImageIcon, Compass, X } from 'lucide-react'
import { useOS, DYNAMIC_WALLPAPER } from '../context/OSContext'
import { Window } from './Window'
import { Launcher } from './Launcher'
import { DeviceWidget } from './DeviceWidget'
import { WindowsShell } from './shells/WindowsShell'
import { MacShell } from './shells/MacShell'
import { LinuxShell } from './shells/LinuxShell'
import { Wallpaper } from '../components/Common/Wallpaper'
import { AppIcon, AppContent } from '../apps'
import { APPS, LINKS } from '../appRegistry'
import type { AppDef } from '../appRegistry'
import { storageClear } from '../utils/storage'
import { TOUR_STEPS } from '../tour'

export const Desktop: React.FC<{ booted: boolean }> = ({ booted }) => {
  const {
    os,
    insets,
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
    tourStep,
    nextTourStep,
    startTour,
    tourNotice,
    setTourNotice
  } = useOS()

  // From the chat fallback: continue the tour if Contact is next, otherwise just open it.
  const openContact = () => {
    if (tourStep !== null && TOUR_STEPS[tourStep]?.id === 'chat') nextTourStep()
    else openWindow('contact')
  }

  // Auto-dismiss the "tour finished / skipped" notice.
  useEffect(() => {
    if (!tourNotice) return
    const timer = setTimeout(() => setTourNotice(null), 7000)
    return () => clearTimeout(timer)
  }, [tourNotice, setTourNotice])

  const desktopRef = useRef<HTMLDivElement>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const launch = (app: AppDef) => {
    if (app.url) window.open(app.url, '_blank', 'noopener')
    else openWindow(app.id)
  }

  const handleRefresh = () => {
    // Re-trigger the GitHub sync by bouncing the username
    const username = githubUsername
    setGithubUsername('')
    setTimeout(() => setGithubUsername(username), 50)
    setContextMenu(null)
  }

  const handleNextWallpaper = () => {
    const all = [DYNAMIC_WALLPAPER, ...wallpapers.map(w => w.url)]
    setWallpaper(all[(all.indexOf(wallpaper) + 1) % all.length])
    setContextMenu(null)
  }

  const handleReset = () => {
    storageClear()
    window.location.reload()
  }

  // Ctrl + Space (or the OS key) toggles the launcher; Escape dismisses menus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault()
        setStartMenuOpen(!startMenuOpen)
      }
      if (e.key === 'Escape') {
        setContextMenu(null)
        setStartMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [startMenuOpen, setStartMenuOpen])

  const menuItem =
    'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-left cursor-default hover:bg-accent-500 hover:text-white'

  return (
    <div
      ref={desktopRef}
      onContextMenu={e => {
        e.preventDefault()
        setContextMenu({
          x: Math.min(e.clientX, window.innerWidth - 200),
          y: Math.min(e.clientY, window.innerHeight - 190)
        })
      }}
      onClick={() => {
        setContextMenu(null)
        setStartMenuOpen(false)
      }}
      className="h-full w-full overflow-hidden relative isolate select-none"
    >
      <Wallpaper />

      {/* Desktop icons */}
      <motion.div
        initial={false}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ duration: 0.5, delay: booted ? 0.15 : 0 }}
        className="absolute flex flex-col flex-wrap content-start gap-x-2 gap-y-1 z-10"
        style={{ top: insets.top + 16, left: insets.left + 16, bottom: insets.bottom + 16 }}
      >
        {[...APPS, ...LINKS].map(app => (
          <button
            key={app.id}
            type="button"
            aria-label={`Open ${app.title}`}
            onKeyDown={e => {
              if (e.key === 'Enter') launch(app)
            }}
            onDoubleClick={() => launch(app)}
            onClick={() => {
              // Touch screens have no double click
              if (window.matchMedia('(pointer: coarse)').matches) launch(app)
            }}
            className="group w-[84px] py-2 rounded-md flex flex-col items-center gap-1.5 cursor-default transition-colors hover:bg-white/12 focus-visible:bg-white/15"
          >
            <AppIcon app={app} size={46} className="transition-transform duration-200 group-hover:scale-105 group-active:scale-95" />
            <span className="on-wallpaper text-[11.5px] leading-tight text-center line-clamp-2 px-1">{app.name}</span>
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={false}
        animate={{ opacity: booted ? 1 : 0, y: booted ? 0 : -12 }}
        transition={{ duration: 0.5, delay: booted ? 0.25 : 0 }}
      >
        <DeviceWidget />
      </motion.div>

      {/* Tour finished / skipped notice */}
      {tourNotice && (
        <div
          role="status"
          className="absolute left-1/2 -translate-x-1/2 z-[99998] max-w-md w-[calc(100%-2rem)] glass-panel rounded-xl px-4 py-3 flex items-start gap-3 text-xs text-[var(--bar-ink)] animate-fade-in"
          style={{ top: insets.top + 20 }}
          onClick={e => e.stopPropagation()}
        >
          <Compass className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
          <p className="flex-1 leading-relaxed">{tourNotice}</p>
          <button type="button" onClick={() => startTour()} className="font-semibold text-accent-600 dark:text-accent-400 hover:underline cursor-pointer whitespace-nowrap">
            Restart tour
          </button>
          <button type="button" onClick={() => setTourNotice(null)} aria-label="Dismiss" className="opacity-50 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {windows.map(win => (
        <Window key={win.id} windowState={win} containerRef={desktopRef}>
          <AppContent id={win.id} onOpenContact={openContact} />
        </Window>
      ))}

      {contextMenu && (
        <div
          role="menu"
          onClick={e => e.stopPropagation()}
          className="absolute w-48 rounded-lg glass-panel p-1 z-[100002] text-[13px] text-[var(--bar-ink)] animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button type="button" role="menuitem" onClick={handleRefresh} className={menuItem}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh projects
          </button>
          <button type="button" role="menuitem" onClick={handleNextWallpaper} className={menuItem}>
            <ImageIcon className="w-3.5 h-3.5" />
            Next wallpaper
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              toggleTheme()
              setContextMenu(null)
            }}
            className={menuItem}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="border-t border-current/15 my-1 mx-2" />
          <button type="button" role="menuitem" onClick={handleReset} className={`${menuItem} hover:!bg-red-600`}>
            <Trash2 className="w-3.5 h-3.5" />
            Reset saved settings
          </button>
        </div>
      )}

      <Launcher />

      {os === 'windows' && <WindowsShell shown={booted} />}
      {os === 'macos' && <MacShell shown={booted} />}
      {os === 'linux' && <LinuxShell shown={booted} />}
    </div>
  )
}
