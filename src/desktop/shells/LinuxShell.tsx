import React from 'react'
import { motion } from 'framer-motion'
import { Grip, Sun, Moon } from 'lucide-react'
import { useOS } from '../../context/OSContext'
import { AppIcon } from '../../apps'
import { PINNED_APPS } from '../../appRegistry'
import { NetworkIcon, BatteryIcon } from '../../components/Common/StatusIcons'
import { useNow, formatTime } from '../../system/hooks'
import { useDockItem } from './useDockItem'

/** GNOME: black top bar with the clock in the middle, app dock down the left edge. */
export const LinuxShell: React.FC<{ shown: boolean }> = ({ shown }) => {
  const { startMenuOpen, setStartMenuOpen, theme, toggleTheme, insets } = useOS()
  const { stateOf, activate } = useDockItem()
  const now = useNow()

  const toggleOverview = (e: React.MouseEvent) => {
    e.stopPropagation()
    setStartMenuOpen(!startMenuOpen)
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: shown ? 0 : -34 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="absolute top-0 inset-x-0 px-2 flex items-center justify-between bg-[#131313] text-white text-[13px] font-medium z-[100001] select-none"
        style={{ height: insets.top }}
        onContextMenu={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={toggleOverview}
          aria-expanded={startMenuOpen}
          className={`h-6 px-3 rounded-full cursor-pointer transition-colors ${startMenuOpen ? 'bg-white/20' : 'hover:bg-white/12'}`}
        >
          Activities
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 tabular-nums">
          {now.toLocaleDateString([], { month: 'short', day: 'numeric' })}&ensp;{formatTime(now)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="h-6 w-7 rounded-full flex items-center justify-center hover:bg-white/12 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <div className="h-6 px-2.5 rounded-full flex items-center gap-2.5 hover:bg-white/12">
            <NetworkIcon className="w-3.5 h-3.5" />
            <BatteryIcon />
          </div>
        </div>
      </motion.header>

      <motion.nav
        aria-label="Dock"
        initial={false}
        animate={{ x: shown ? 0 : -72 }}
        transition={{ type: 'spring', stiffness: 240, damping: 28, delay: shown ? 0.08 : 0 }}
        className="absolute left-0 bottom-0 flex flex-col items-center gap-1.5 py-2 bg-black/55 backdrop-blur-xl border-r border-white/8 z-[99999] text-white"
        style={{ top: insets.top, width: insets.left }}
        onContextMenu={e => e.stopPropagation()}
      >
        {PINNED_APPS.map(app => {
          const { isOpen, isActive } = stateOf(app.id)
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => activate(app.id)}
              title={app.title}
              aria-label={app.title}
              className={`group relative w-[54px] h-[54px] rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                isActive ? 'bg-white/16' : 'hover:bg-white/10'
              }`}
            >
              <AppIcon app={app} size={40} className="transition-transform duration-150 group-active:scale-90" />
              <span
                className={`absolute left-0.5 w-1 rounded-full bg-accent-500 transition-all duration-200 ${
                  isActive ? 'h-3.5' : isOpen ? 'h-1' : 'h-0'
                }`}
              />
            </button>
          )
        })}

        <button
          type="button"
          onClick={toggleOverview}
          aria-label="Show apps"
          title="Show apps"
          className="mt-auto w-[54px] h-[54px] rounded-xl flex items-center justify-center hover:bg-white/10 cursor-pointer"
        >
          <Grip className="w-7 h-7" />
        </button>
      </motion.nav>
    </>
  )
}
