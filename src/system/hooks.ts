import { useEffect, useState } from 'react'

export interface BatteryState {
  /** 0 to 1 */
  level: number
  charging: boolean
}

interface BatteryManagerLike extends EventTarget {
  level: number
  charging: boolean
}

/** Real battery level where the browser exposes it; null otherwise (never a made-up value). */
export function useBattery(): BatteryState | null {
  const [battery, setBattery] = useState<BatteryState | null>(null)

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManagerLike> }
    if (!nav.getBattery) return
    let manager: BatteryManagerLike | null = null
    let cancelled = false
    const update = () => {
      if (manager && !cancelled) setBattery({ level: manager.level, charging: manager.charging })
    }
    nav
      .getBattery()
      .then(m => {
        if (cancelled) return
        manager = m
        update()
        m.addEventListener('levelchange', update)
        m.addEventListener('chargingchange', update)
      })
      .catch(() => {
        // battery status unavailable
      })
    return () => {
      cancelled = true
      manager?.removeEventListener('levelchange', update)
      manager?.removeEventListener('chargingchange', update)
    }
  }, [])

  return battery
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine !== false)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

/** Current time, re-rendering once per minute (on the minute). */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        setNow(new Date())
        schedule()
      }, 60000 - (Date.now() % 60000) + 20)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])
  return now
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

// Formatting follows the visitor's own locale (12/24-hour clock, date order).

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDate(date: Date, style: 'short' | 'long' = 'short'): string {
  return style === 'long'
    ? date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function greetingFor(date: Date): string {
  const h = date.getHours()
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 22) return 'Good evening'
  return 'Good night'
}

export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night'

export function dayPhase(date: Date): DayPhase {
  const h = date.getHours()
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 17) return 'day'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}
