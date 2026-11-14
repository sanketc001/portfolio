import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ArrowLeft, Search, Compass, X } from 'lucide-react'
import { useOS } from '../context/OSContext'
import { AppIcon, AppContent } from '../apps'
import { APPS, LINKS, appById } from '../appRegistry'
import type { AppDef } from '../appRegistry'
import { Wallpaper } from '../components/Common/Wallpaper'
import { NetworkIcon, BatteryIcon } from '../components/Common/StatusIcons'
import { TourBar } from '../components/Common/TourBar'
import { useNow, formatTime, formatDate, greetingFor } from '../system/hooks'
import { TOUR_STEPS } from '../tour'

const TOUR_APP: AppDef = { id: 'tour', name: 'Tour', title: 'Take the tour', icon: Compass, tile: ['#f59e0b', '#ea580c'] }
const DOCK_IDS = ['about', 'projects', 'chat', 'contact']

export const HomeScreen: React.FC<{ booted: boolean }> = ({ booted }) => {
  const { os, system, battery, visitorCount, tourStep, nextTourStep, skipTour, startTour, tourNotice, setTourNotice } = useOS()
  const isIOS = os === 'ios'
  const now = useNow()

  const [activeApp, setActiveApp] = useState<string | null>(() => (tourStep !== null ? TOUR_STEPS[tourStep].id : null))
  const [search, setSearch] = useState('')

  // Follow the guided tour: each step opens its app; ending the tour returns home.
  const [followedTourStep, setFollowedTourStep] = useState(tourStep)
  if (tourStep !== followedTourStep) {
    setFollowedTourStep(tourStep)
    setActiveApp(tourStep !== null ? TOUR_STEPS[tourStep].id : null)
  }
  const tourAppId = tourStep !== null ? TOUR_STEPS[tourStep].id : null

  const closeApp = () => {
    // Leaving the current tour app ends the tour (it can be restarted from the Tour icon).
    if (tourAppId && activeApp === tourAppId) skipTour()
    else setActiveApp(null)
  }

  const openContact = () => {
    if (tourAppId === 'chat') nextTourStep()
    else setActiveApp('contact')
  }

  useEffect(() => {
    if (!tourNotice) return
    const timer = setTimeout(() => setTourNotice(null), 6000)
    return () => clearTimeout(timer)
  }, [tourNotice, setTourNotice])

  const launch = (app: AppDef) => {
    if (app.id === 'tour') startTour()
    else if (app.url) window.open(app.url, '_blank', 'noopener')
    else setActiveApp(app.id)
  }

  const q = search.trim().toLowerCase()
  const dockApps = DOCK_IDS.map(id => appById(id)!)
  const gridApps = [...APPS.filter(a => q || !DOCK_IDS.includes(a.id)), TOUR_APP, ...LINKS].filter(
    a => !q || a.name.toLowerCase().includes(q) || a.title.toLowerCase().includes(q)
  )

  const browser = `${system.browserName}${system.browserVersion ? ' ' + system.browserVersion : ''}`
  const deviceLine = system.model ? `${system.model}, ${system.osLabel}` : system.osLabel
  const iconSize = isIOS ? 60 : 56

  const searchField = (
    <div className="relative">
      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search apps"
        aria-label="Search apps"
        className={`w-full h-11 pl-11 pr-4 text-sm text-white placeholder-white/70 bg-white/18 backdrop-blur-xl border border-white/15 focus:outline-none focus:border-white/60 ${
          isIOS ? 'rounded-2xl' : 'rounded-full'
        }`}
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" />
    </div>
  )

  return (
    <div className="h-full w-full relative isolate flex flex-col overflow-hidden select-none">
      <Wallpaper />

      {/* Status bar: the visitor's real clock, connection and battery */}
      <div
        className={`flex items-center justify-between flex-shrink-0 z-[200] transition-colors duration-300 ${
          isIOS ? 'h-11 px-7 text-[15px] font-semibold' : 'h-9 px-5 text-[13px] font-medium'
        } ${activeApp ? 'surface text-[var(--bar-ink)]' : 'text-white'}`}
      >
        <span className="tabular-nums">{formatTime(now)}</span>
        <span className="flex items-center gap-2">
          <NetworkIcon className="w-4 h-4" />
          <BatteryIcon showPercent={!isIOS} />
        </span>
      </div>

      <div className="flex-1 relative flex flex-col overflow-hidden">
        {!activeApp && (
          <motion.div
            initial={false}
            animate={{ opacity: booted ? 1 : 0, scale: booted ? 1 : 1.06 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4">
              <div className="max-w-sm mx-auto w-full">
                {isIOS ? (
                  /* iOS: a widget card */
                  <section aria-label="Your device" className="glass-panel rounded-[26px] p-4 mb-7 text-[var(--bar-ink)]">
                    <p className="text-xs opacity-60">{greetingFor(now)}</p>
                    <p className="font-display text-[22px] font-semibold tracking-tight leading-tight mt-0.5">{formatDate(now, 'long')}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {browser} on {deviceLine}
                      {battery ? `, battery at ${Math.round(battery.level * 100)}%` : ''}
                    </p>
                    {visitorCount !== null && <p className="text-xs opacity-55 mt-0.5">Visit number {visitorCount.toLocaleString()}</p>}
                  </section>
                ) : (
                  /* Android: "At a glance" sitting straight on the wallpaper */
                  <section aria-label="Your device" className="on-wallpaper mb-9 mt-3">
                    <p className="font-display text-[30px] leading-tight">{formatDate(now)}</p>
                    <p className="text-sm opacity-90 mt-1">
                      {greetingFor(now)}. {browser} on {deviceLine}
                      {battery ? `, ${Math.round(battery.level * 100)}%` : ''}
                    </p>
                    {visitorCount !== null && <p className="text-xs opacity-75 mt-0.5">Visit number {visitorCount.toLocaleString()}</p>}
                  </section>
                )}

                {gridApps.length === 0 ? (
                  <p className="on-wallpaper text-sm text-center py-10">Nothing here is called “{search}”.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-y-6 gap-x-3">
                    {gridApps.map(app => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => launch(app)}
                        aria-label={app.id === 'tour' ? 'Take the tour' : `Open ${app.title}`}
                        className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-90 transition-transform duration-150"
                      >
                        <AppIcon app={app} size={iconSize} />
                        <span className="on-wallpaper text-[11.5px] leading-tight line-clamp-1">{app.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {tourNotice && (
              <div role="status" className="mx-6 mb-3 max-w-sm self-center w-[calc(100%-3rem)] glass-panel rounded-2xl px-4 py-3 flex items-start gap-3 text-xs text-[var(--bar-ink)]">
                <Compass className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                <p className="flex-1 leading-relaxed">{tourNotice}</p>
                <button type="button" onClick={() => startTour()} className="font-semibold text-accent-600 dark:text-accent-400 cursor-pointer whitespace-nowrap">
                  Restart tour
                </button>
                <button type="button" onClick={() => setTourNotice(null)} aria-label="Dismiss" className="opacity-50 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dock and search: iOS puts search above a glass dock, Android below a bare one */}
            <div className="px-5 pb-3 w-full flex-shrink-0">
              <div className="max-w-sm mx-auto flex flex-col gap-3">
                {isIOS && searchField}
                <div className={`flex justify-around ${isIOS ? 'p-3.5 rounded-[34px] glass-panel' : 'px-1 py-1'}`}>
                  {dockApps.map(app => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => launch(app)}
                      aria-label={`Open ${app.title}`}
                      className="cursor-pointer active:scale-90 transition-transform duration-150"
                    >
                      <AppIcon app={app} size={iconSize} />
                    </button>
                  ))}
                </div>
                {!isIOS && searchField}
              </div>
            </div>
          </motion.div>
        )}

        {/* Open app */}
        <AnimatePresence>
          {activeApp && (
            <motion.div
              key="app"
              initial={isIOS ? { opacity: 0, scale: 0.82, borderRadius: 44 } : { opacity: 0, y: 70 }}
              animate={isIOS ? { opacity: 1, scale: 1, borderRadius: 0 } : { opacity: 1, y: 0 }}
              exit={isIOS ? { opacity: 0, scale: 0.82, borderRadius: 44 } : { opacity: 0, y: 70 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 surface glass !border-0 !shadow-none flex flex-col z-[100] overflow-hidden"
            >
              {isIOS ? (
                <div className="relative h-11 px-2 flex items-center flex-shrink-0 border-b border-[var(--glass-border)] text-[var(--bar-ink)]">
                  <button type="button" onClick={closeApp} className="flex items-center text-accent-500 text-[17px] py-2 pr-3 cursor-pointer">
                    <ChevronLeft className="w-6 h-6 -mr-0.5" />
                    Home
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold pointer-events-none">
                    {appById(activeApp)?.title}
                  </span>
                </div>
              ) : (
                <div className="h-14 px-2 flex items-center gap-2 flex-shrink-0 text-[var(--bar-ink)]">
                  <button type="button" onClick={closeApp} aria-label="Back to home" className="w-11 h-11 rounded-full flex items-center justify-center active:bg-current/10 cursor-pointer">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <span className="font-display text-[20px]">{appById(activeApp)?.title}</span>
                </div>
              )}

              <div className="flex-1 overflow-hidden relative">
                <AppContent id={activeApp} onOpenContact={openContact} />
              </div>

              {tourStep !== null && activeApp === tourAppId && (
                <TourBar step={tourStep} onNext={nextTourStep} onSkip={skipTour} compact />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Home indicator / gesture pill */}
      <div className={`h-6 flex items-center justify-center flex-shrink-0 z-[200] ${activeApp ? 'surface' : ''}`}>
        <button
          type="button"
          onClick={() => activeApp && closeApp()}
          aria-label="Home"
          tabIndex={activeApp ? 0 : -1}
          className={`h-[5px] rounded-full cursor-pointer ${isIOS ? 'w-36' : 'w-24'} ${activeApp ? 'bg-[var(--bar-ink)] opacity-70' : 'bg-white/80'}`}
        />
      </div>
    </div>
  )
}
