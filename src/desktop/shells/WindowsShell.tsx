import React from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Search } from 'lucide-react'
import { useOS } from '../../context/OSContext'
import { AppIcon } from '../../apps'
import { PINNED_APPS } from '../../appRegistry'
import { NetworkIcon, BatteryIcon } from '../../components/Common/StatusIcons'
import { useNow, formatTime } from '../../system/hooks'
import { useDockItem } from './useDockItem'

/** Windows 11: one mica taskbar with centred apps and the tray on the right. */
export const WindowsShell: React.FC<{ shown: boolean }> = ({ shown }) => {
  const { startMenuOpen, setStartMenuOpen } = useOS()
  const { stateOf, activate } = useDockItem()
  const now = useNow()

  const toggleStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setStartMenuOpen(!startMenuOpen)
  }

  return (
    <motion.div
      initial={false}
      animate={{ y: shown ? 0 : 56 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="absolute bottom-0 inset-x-0 h-12 glass-panel !border-x-0 !border-b-0 !shadow-none z-[99999] text-[var(--bar-ink)] select-none"
      onContextMenu={e => e.stopPropagation()}
    >
      <nav aria-label="Taskbar" className="absolute inset-0 flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={toggleStart}
          aria-label="Start"
          aria-expanded={startMenuOpen}
          title="Start"
          className={`w-10 h-10 rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-current/10 ${
            startMenuOpen ? 'bg-current/10' : ''
          }`}
        >
          <LayoutGrid className="w-6 h-6 text-accent-500 fill-accent-500/25 transition-transform active:scale-90" />
        </button>

        <button
          type="button"
          onClick={toggleStart}
          className="h-8 w-44 mx-1 px-3 rounded-full flex items-center gap-2 text-xs bg-current/[0.07] hover:bg-current/[0.12] cursor-text transition-colors"
        >
          <Search className="w-3.5 h-3.5 opacity-70" />
          <span className="opacity-60">Search</span>
        </button>

        {PINNED_APPS.map(app => {
          const { isOpen, isActive } = stateOf(app.id)
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => activate(app.id)}
              title={app.title}
              aria-label={app.title}
              className={`group relative w-10 h-10 rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-current/10 ${
                isActive ? 'bg-current/[0.09]' : ''
              }`}
            >
              <AppIcon app={app} size={26} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-90" />
              <span
                className={`absolute bottom-0.5 h-[3px] rounded-full transition-all duration-200 ${
                  isActive ? 'w-4 bg-accent-500' : isOpen ? 'w-1.5 bg-current/45' : 'w-0'
                }`}
              />
            </button>
          )
        })}
      </nav>

      <div className="absolute right-0 inset-y-0 flex items-center gap-1 pr-3 text-xs">
        <div className="h-8 px-2 rounded-md flex items-center gap-2.5 hover:bg-current/10">
          <NetworkIcon />
          <BatteryIcon />
        </div>
        <div className="h-10 px-2 rounded-md flex flex-col items-end justify-center leading-tight hover:bg-current/10 tabular-nums">
          <span>{formatTime(now)}</span>
          <span>{now.toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  )
}
