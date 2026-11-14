import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { Search, Command } from 'lucide-react'
import { useOS } from '../../context/OSContext'
import { AppIcon } from '../../apps'
import { PINNED_APPS, LINKS, appById } from '../../appRegistry'
import type { AppDef } from '../../appRegistry'
import { NetworkIcon, BatteryIcon } from '../../components/Common/StatusIcons'
import { useNow, formatTime, formatDate } from '../../system/hooks'
import { useDockItem } from './useDockItem'

const BASE = 50
const PEAK = 74
const REACH = 140

/** One dock icon that swells as the pointer nears it. */
const DockIcon: React.FC<{
  app: AppDef
  mouseX: MotionValue<number>
  isOpen: boolean
  onClick: () => void
}> = ({ app, mouseX, isOpen, onClick }) => {
  const ref = useRef<HTMLButtonElement>(null)
  const distance = useTransform(mouseX, x => {
    const rect = ref.current?.getBoundingClientRect()
    return rect ? x - (rect.left + rect.width / 2) : Infinity
  })
  const target = useTransform(distance, [-REACH, 0, REACH], [BASE, PEAK, BASE])
  const size = useSpring(target, { stiffness: 320, damping: 26, mass: 0.4 })

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={app.title}
      style={{ width: size, height: size }}
      whileTap={{ y: -10 }}
      className="group relative flex items-end justify-center cursor-pointer"
    >
      <span className="pointer-events-none absolute -top-9 px-2.5 py-1 rounded-md glass-panel text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {app.title}
      </span>
      <AppIcon app={app} size={BASE} className="!w-full !h-full" />
      <span
        className={`absolute -bottom-[7px] w-1 h-1 rounded-full bg-current transition-opacity ${isOpen ? 'opacity-70' : 'opacity-0'}`}
      />
    </motion.button>
  )
}

/** macOS: translucent menu bar on top, magnifying dock below. */
export const MacShell: React.FC<{ shown: boolean }> = ({ shown }) => {
  const { activeWindowId, openWindow, startTour, toggleTheme, theme, closeAllWindows, startMenuOpen, setStartMenuOpen } = useOS()
  const { stateOf, activate } = useDockItem()
  const now = useNow()
  const mouseX = useMotionValue(Infinity)
  const [menuOpen, setMenuOpen] = useState(false)

  const activeTitle = (activeWindowId && appById(activeWindowId)?.title) || 'Desktop'

  const menu: { label: string; run: () => void; divider?: boolean }[] = [
    { label: 'About this portfolio', run: () => openWindow('about') },
    { label: 'Settings…', run: () => openWindow('settings'), divider: true },
    { label: 'Take the tour', run: startTour },
    { label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', run: toggleTheme, divider: true },
    { label: 'Close all windows', run: closeAllWindows }
  ]

  return (
    <>
      {/* Menu bar */}
      <motion.header
        initial={false}
        animate={{ y: shown ? 0 : -32 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="absolute top-0 inset-x-0 h-7 px-3 flex items-center justify-between text-[13px] z-[99999] select-none text-[var(--bar-ink)] bg-[var(--panel-bg)] backdrop-blur-2xl backdrop-saturate-200"
        onContextMenu={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 relative">
          <button
            type="button"
            aria-label="Main menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            onBlur={() => setMenuOpen(false)}
            className={`h-[22px] px-2 rounded flex items-center cursor-default ${menuOpen ? 'bg-current/15' : 'hover:bg-current/10'}`}
          >
            <Command className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-bold">{activeTitle}</span>

          {menuOpen && (
            <div
              role="menu"
              className="absolute top-[26px] left-0 w-56 p-1 rounded-lg glass-panel animate-fade-in"
              onMouseDown={e => e.preventDefault()}
            >
              {menu.map(item => (
                <React.Fragment key={item.label}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      item.run()
                      setMenuOpen(false)
                    }}
                    className="w-full text-left px-2.5 py-1 rounded-[5px] hover:bg-accent-500 hover:text-white cursor-default"
                  >
                    {item.label}
                  </button>
                  {item.divider && <div className="my-1 mx-2 border-t border-current/15" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3.5">
          <BatteryIcon showPercent />
          <NetworkIcon />
          <button
            type="button"
            aria-label="Search apps"
            title="Search apps (Ctrl + Space)"
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className="h-[22px] px-1.5 rounded hover:bg-current/10 cursor-default"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <span className="tabular-nums">
            {formatDate(now)}&ensp;{formatTime(now)}
          </span>
        </div>
      </motion.header>

      {/* Dock */}
      <motion.nav
        aria-label="Dock"
        initial={false}
        animate={{ y: shown ? 0 : 110 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24, delay: shown ? 0.1 : 0 }}
        onMouseMove={e => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        onContextMenu={e => e.stopPropagation()}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 h-[66px] px-2 pb-2 flex items-end gap-1.5 rounded-[22px] glass-panel z-[99999] text-[var(--bar-ink)]"
      >
        {PINNED_APPS.map(app => (
          <DockIcon key={app.id} app={app} mouseX={mouseX} isOpen={stateOf(app.id).isOpen} onClick={() => activate(app.id)} />
        ))}
        <span className="self-center w-px h-11 mx-1 bg-current/20" />
        {LINKS.map(app => (
          <DockIcon
            key={app.id}
            app={app}
            mouseX={mouseX}
            isOpen={false}
            onClick={() => window.open(app.url, '_blank', 'noopener')}
          />
        ))}
      </motion.nav>
    </>
  )
}
