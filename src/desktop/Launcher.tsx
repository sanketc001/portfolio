import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Sun, Moon, Compass, PanelsTopLeft } from 'lucide-react'
import { useOS } from '../context/OSContext'
import { AppIcon } from '../apps'
import { APPS, LINKS } from '../appRegistry'
import type { AppDef } from '../appRegistry'
import portfolioData from '../data/portfolioData.json'

/**
 * App launcher, drawn the way the active skin does it: a Start menu above the
 * taskbar (Windows), a Spotlight-style panel (macOS) or a full-screen overview (GNOME).
 */
export const Launcher: React.FC = () => {
  const { os, insets, startMenuOpen, setStartMenuOpen, openWindow, theme, toggleTheme, closeAllWindows, startTour } = useOS()
  const [search, setSearch] = useState('')
  const profile = portfolioData.profile

  const close = () => {
    setStartMenuOpen(false)
    setSearch('')
  }

  const launch = (app: AppDef) => {
    if (app.url) window.open(app.url, '_blank', 'noopener')
    else openWindow(app.id)
    close()
  }

  const q = search.trim().toLowerCase()
  const results = [...APPS, ...LINKS].filter(
    a => !q || a.name.toLowerCase().includes(q) || a.title.toLowerCase().includes(q)
  )

  const isOverview = os === 'linux'
  const isSpotlight = os === 'macos'

  const panelClass = isOverview
    ? 'inset-0 flex flex-col items-center bg-black/70 backdrop-blur-2xl text-white'
    : isSpotlight
      ? 'left-1/2 top-[16%] w-[640px] max-w-[calc(100vw-2rem)] max-h-[70vh] -translate-x-1/2 rounded-2xl glass-panel flex flex-col overflow-hidden text-[var(--bar-ink)]'
      : 'left-1/2 bottom-[60px] w-[600px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-84px)] -translate-x-1/2 rounded-lg glass-panel flex flex-col overflow-hidden text-[var(--bar-ink)]'

  const motionProps = isOverview
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : isSpotlight
      ? {
          initial: { opacity: 0, scale: 0.97, y: -8 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.98 },
          transition: { duration: 0.16, ease: 'easeOut' as const }
        }
      : {
          initial: { opacity: 0, y: 48 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 48 },
          transition: { type: 'spring' as const, stiffness: 420, damping: 36 }
        }

  return (
    <AnimatePresence>
      {startMenuOpen && (
        <motion.div
          key="launcher"
          role="dialog"
          aria-label="Apps"
          {...motionProps}
          onClick={e => {
            e.stopPropagation()
            if (isOverview && e.target === e.currentTarget) close()
          }}
          onContextMenu={e => e.stopPropagation()}
          className={`absolute z-[100000] ${panelClass}`}
          style={isOverview ? { paddingTop: insets.top + 36 } : undefined}
        >
          {/* Search */}
          <div className={isOverview ? 'w-[420px] max-w-[calc(100vw-3rem)]' : isSpotlight ? 'p-3' : 'px-8 pt-7 pb-2'}>
            <div className="relative">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 opacity-50 ${isSpotlight ? 'left-3 w-5 h-5' : 'left-3.5 w-4 h-4'}`}
              />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && results[0]) launch(results[0])
                }}
                placeholder="Search apps"
                aria-label="Search apps"
                className={
                  isOverview
                    ? 'w-full h-10 pl-10 pr-4 rounded-full bg-white/12 border border-white/15 text-sm text-white placeholder-white/55 focus:outline-none focus:border-white/50'
                    : isSpotlight
                      ? 'w-full h-11 pl-11 pr-4 bg-transparent text-xl font-light placeholder-current/40 focus:outline-none'
                      : 'w-full h-9 pl-10 pr-4 rounded-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[13px] placeholder-current/50 focus:outline-none focus:border-accent-500'
                }
              />
            </div>
          </div>

          {/* Apps */}
          <div
            className={
              isOverview
                ? 'flex-1 w-full max-w-4xl overflow-y-auto px-8 pt-12 pb-8'
                : isSpotlight
                  ? 'flex-1 overflow-y-auto px-3 pb-3 border-t border-current/10 pt-3'
                  : 'flex-1 overflow-y-auto px-8 pt-4 pb-4'
            }
          >
            {!isOverview && !isSpotlight && <h2 className="text-sm font-semibold px-2 mb-3">Pinned</h2>}

            {results.length === 0 ? (
              <p className="text-sm text-center py-10 opacity-60">Nothing here is called “{search}”.</p>
            ) : (
              <div
                className={`grid ${
                  isOverview ? 'grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-4' : isSpotlight ? 'grid-cols-6 gap-1' : 'grid-cols-6 gap-1'
                }`}
              >
                {results.map(app => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => launch(app)}
                    className={`flex flex-col items-center gap-2 rounded-lg cursor-pointer transition-colors ${
                      isOverview ? 'p-3 hover:bg-white/10' : 'px-1 py-3 hover:bg-current/[0.07]'
                    }`}
                  >
                    <AppIcon app={app} size={isOverview ? 72 : 40} />
                    <span className={`${isOverview ? 'text-[13px]' : 'text-[11px]'} leading-tight text-center line-clamp-1`}>
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!q && (
              <button
                type="button"
                onClick={() => {
                  startTour()
                  close()
                }}
                className={`mt-5 w-full flex items-center gap-3 p-3 rounded-lg text-left cursor-pointer transition-colors ${
                  isOverview
                    ? 'max-w-md mx-auto bg-white/10 hover:bg-white/15'
                    : 'bg-accent-500/10 hover:bg-accent-500/[0.16]'
                }`}
              >
                <span className="p-2 rounded-md bg-accent-600 text-white">
                  <Compass className="w-4 h-4" />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold">Take the tour</span>
                  <span className="block text-[11px] opacity-65">About, projects, experience, chat and contact, one window at a time</span>
                </span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div
            className={
              isOverview
                ? 'w-full max-w-4xl px-8 pb-6 flex items-center justify-between'
                : `flex items-center justify-between border-t border-current/10 ${isSpotlight ? 'px-4 py-2.5' : 'px-10 py-3.5 bg-black/[0.03] dark:bg-black/20'}`
            }
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={profile.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-xs font-medium truncate">{profile.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs hover:bg-current/10 cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  closeAllWindows()
                  close()
                }}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs hover:bg-current/10 cursor-pointer"
              >
                <PanelsTopLeft className="w-4 h-4" />
                <span>Close all windows</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
