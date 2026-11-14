import React from 'react'
import { Wifi, WifiOff, Zap } from 'lucide-react'
import { useOS } from '../../context/OSContext'

/** Network glyph that follows the visitor's real connection state. */
export const NetworkIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  const { online } = useOS()
  return (
    <span title={online ? 'Online' : 'Offline'} className="inline-flex">
      {online ? <Wifi className={className} /> : <WifiOff className={`${className} opacity-60`} />}
    </span>
  )
}

/** Battery glyph filled to the visitor's real charge. Renders nothing when the browser doesn't share it. */
export const BatteryIcon: React.FC<{ showPercent?: boolean }> = ({ showPercent = false }) => {
  const { battery } = useOS()
  if (!battery) return null
  const pct = Math.round(battery.level * 100)
  const low = pct <= 20 && !battery.charging
  return (
    <span
      className="inline-flex items-center gap-1"
      title={`Battery ${pct}%${battery.charging ? ', charging' : ''}`}
      role="img"
      aria-label={`Battery ${pct}%${battery.charging ? ', charging' : ''}`}
    >
      {showPercent && <span className="tabular-nums">{pct}%</span>}
      {battery.charging && <Zap className="w-3 h-3 fill-current -mr-0.5" />}
      <span className="relative inline-flex items-center">
        <span className="relative w-[22px] h-[11px] rounded-[3.5px] border border-current/60 p-[1.5px]">
          <span
            className={`block h-full rounded-[1.5px] transition-[width] duration-500 ${
              low ? 'bg-red-500' : battery.charging ? 'bg-emerald-500' : 'bg-current'
            }`}
            style={{ width: `${Math.max(8, pct)}%` }}
          />
        </span>
        <span className="w-[1.5px] h-[4px] rounded-r-sm bg-current opacity-60 ml-[1px]" />
      </span>
    </span>
  )
}
