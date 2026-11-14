import React from 'react'
import { Globe, Monitor, MapPin, BatteryMedium, Wifi, WifiOff, Users } from 'lucide-react'
import { useOS } from '../context/OSContext'
import { useNow, formatTime, formatDate, greetingFor } from '../system/hooks'

/** Desktop widget built from what the visitor's own browser reports: their clock, system, battery, network. */
export const DeviceWidget: React.FC = () => {
  const { system, battery, online, visitorCount, insets } = useOS()
  const now = useNow()

  const rows: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[] = [
    {
      icon: Globe,
      label: 'Browser',
      value: `${system.browserName}${system.browserVersion ? ' ' + system.browserVersion : ''}`
    },
    { icon: Monitor, label: 'System', value: system.model ? `${system.osLabel}, ${system.model}` : system.osLabel },
    { icon: MapPin, label: 'Time zone', value: system.timeZone.replace(/_/g, ' ') }
  ]
  if (battery) {
    rows.push({
      icon: BatteryMedium,
      label: 'Battery',
      value: `${Math.round(battery.level * 100)}%${battery.charging ? ', charging' : ''}`
    })
  }
  rows.push({ icon: online ? Wifi : WifiOff, label: 'Network', value: online ? 'Online' : 'Offline' })

  return (
    <aside
      aria-label="Your device"
      className="absolute right-5 z-10 w-64 glass-panel rounded-[calc(var(--win-radius)+8px)] p-4 text-[var(--bar-ink)] select-none"
      style={{ top: insets.top + 20 }}
      onDoubleClick={e => e.stopPropagation()}
    >
      <p className="text-xs opacity-60">{greetingFor(now)}</p>
      <p className="font-display text-[40px] leading-none font-semibold tracking-tight tabular-nums mt-1">
        {formatTime(now)}
      </p>
      <p className="text-xs opacity-70 mt-1.5">{formatDate(now, 'long')}</p>

      <dl className="mt-4 pt-3 border-t border-current/10 space-y-2">
        {rows.map(row => {
          const Icon = row.icon
          return (
            <div key={row.label} className="flex items-center gap-2.5 text-xs">
              <Icon className="w-3.5 h-3.5 opacity-55 flex-shrink-0" />
              <dt className="opacity-60 flex-shrink-0">{row.label}</dt>
              <dd className="ml-auto font-medium truncate text-right" title={row.value}>
                {row.value}
              </dd>
            </div>
          )
        })}
      </dl>

      <p className="mt-3 pt-3 border-t border-current/10 text-[11px] leading-snug opacity-55">
        Read from your browser to style this desktop. None of it leaves the page.
      </p>

      {visitorCount !== null && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] opacity-70">
          <Users className="w-3.5 h-3.5" />
          Visit number {visitorCount.toLocaleString()}
        </p>
      )}
    </aside>
  )
}
