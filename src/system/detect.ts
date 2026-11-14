// Reads what the visitor's browser reports about their device. Everything here
// stays in the page: it is only used to style the shell and is never sent anywhere.

export type OSId = 'windows' | 'macos' | 'linux' | 'ios' | 'android'

export interface SystemInfo {
  /** Detected operating system family; null when the user agent gives no usable hint. */
  os: OSId | null
  /** Human label, as specific as the browser allows: "Windows 11", "macOS 14.5", "Android 14". */
  osLabel: string
  browserName: string
  browserVersion: string
  /** Device model, when the browser shares one (mostly Android). */
  model: string | null
  language: string
  timeZone: string
  cores: number | null
  memoryGb: number | null
  screen: string
  pixelRatio: number
  touch: boolean
}

interface UADataLike {
  platform?: string
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>
}

const OS_NAMES: Record<OSId, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  ios: 'iOS',
  android: 'Android'
}

export const SKIN_NAMES: Record<OSId, string> = {
  windows: 'Windows 11',
  macos: 'macOS',
  linux: 'GNOME',
  ios: 'iOS',
  android: 'Android'
}

function uaData(): UADataLike | undefined {
  return (navigator as Navigator & { userAgentData?: UADataLike }).userAgentData
}

function detectOS(ua: string): { os: OSId | null; label: string } {
  const hint = (uaData()?.platform || '').toLowerCase()
  const s = ua.toLowerCase()

  if (/iphone|ipod/.test(s)) return { os: 'ios', label: withVersion('iOS', /os (\d+)[_.](\d+)/.exec(s)) }
  // iPadOS reports itself as a Mac; a Mac with a multi-touch screen is an iPad.
  if (/ipad/.test(s) || (/macintosh/.test(s) && navigator.maxTouchPoints > 1)) {
    return { os: 'ios', label: withVersion('iPadOS', /os (\d+)[_.](\d+)/.exec(s)) }
  }
  if (hint === 'android' || /android/.test(s)) return { os: 'android', label: 'Android' }
  if (hint === 'windows' || /windows nt|win64|win32/.test(s)) return { os: 'windows', label: 'Windows' }
  if (hint === 'macos' || /macintosh|mac os x/.test(s)) return { os: 'macos', label: 'macOS' }
  if (/cros/.test(s) || hint.includes('chrome os') || hint.includes('chromeos')) return { os: 'linux', label: 'ChromeOS' }
  if (hint === 'linux' || /linux|x11/.test(s)) {
    const distro = /(ubuntu|fedora|debian|arch|mint|suse)/.exec(s)?.[1]
    return { os: 'linux', label: distro ? distro[0].toUpperCase() + distro.slice(1) + ' Linux' : 'Linux' }
  }
  return { os: null, label: 'Unrecognised system' }
}

function withVersion(name: string, m: RegExpExecArray | null): string {
  return m ? `${name} ${m[1]}.${m[2]}` : name
}

function detectBrowser(ua: string): { name: string; version: string } {
  const tests: [string, RegExp][] = [
    ['Edge', /Edg(?:e|A|iOS)?\/(\d+)/],
    ['Opera', /(?:OPR|Opera)\/(\d+)/],
    ['Samsung Internet', /SamsungBrowser\/(\d+)/],
    ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/],
    ['Chrome', /(?:Chrome|CriOS)\/(\d+)/],
    ['Safari', /Version\/(\d+)(?:\.\d+)* .*Safari/]
  ]
  for (const [name, re] of tests) {
    const m = re.exec(ua)
    if (m) return { name, version: m[1] }
  }
  return { name: 'your browser', version: '' }
}

/** Everything that can be read synchronously. */
export function readSystemInfo(): SystemInfo {
  const ua = navigator.userAgent || ''
  const { os, label } = detectOS(ua)
  const browser = detectBrowser(ua)
  const nav = navigator as Navigator & { deviceMemory?: number }
  let timeZone = 'UTC'
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    // keep UTC
  }
  return {
    os,
    osLabel: label,
    browserName: browser.name,
    browserVersion: browser.version,
    model: null,
    language: navigator.language || 'en',
    timeZone,
    cores: navigator.hardwareConcurrency || null,
    memoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    screen: `${window.screen.width} × ${window.screen.height}`,
    pixelRatio: window.devicePixelRatio || 1,
    touch: navigator.maxTouchPoints > 0
  }
}

/**
 * Chromium browsers freeze the OS version in the user agent string and expose the
 * real one through client hints. Returns the fields that could be made more specific.
 */
export async function refineSystemInfo(info: SystemInfo): Promise<Partial<SystemInfo>> {
  const data = uaData()
  if (!data?.getHighEntropyValues || !info.os) return {}
  try {
    const hints = await data.getHighEntropyValues(['platformVersion', 'model'])
    const version = typeof hints.platformVersion === 'string' ? hints.platformVersion : ''
    const major = parseInt(version.split('.')[0] || '', 10)
    const out: Partial<SystemInfo> = {}
    if (typeof hints.model === 'string' && hints.model) out.model = hints.model
    if (!Number.isNaN(major) && info.osLabel === OS_NAMES[info.os]) {
      if (info.os === 'windows') {
        // Windows 11 reports platform version 13 and up; 1 to 10 are Windows 10 releases.
        if (major >= 13) out.osLabel = 'Windows 11'
        else if (major > 0) out.osLabel = 'Windows 10'
      } else if (info.os === 'macos' && major > 0) {
        const minor = version.split('.')[1]
        out.osLabel = `macOS ${major}${minor && minor !== '0' ? '.' + minor : ''}`
      } else if (info.os === 'android' && major > 0) {
        out.osLabel = `Android ${major}`
      }
    }
    return out
  } catch {
    return {}
  }
}

/**
 * The accent colour the visitor picked in their OS settings, where the browser
 * exposes it (the CSS `AccentColor` system colour). Returns null when it is not
 * available or would be unreadable behind white button text.
 */
export function readSystemAccent(): string | null {
  try {
    if (!CSS.supports('color', 'AccentColor')) return null
    const probe = document.createElement('span')
    probe.style.color = 'AccentColor'
    probe.style.display = 'none'
    document.body.appendChild(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value)
    if (!m) return null
    const [r, g, b] = [m[1], m[2], m[3]].map(Number)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    const saturation = Math.max(r, g, b) - Math.min(r, g, b)
    if (luminance < 0.12 || luminance > 0.62 || saturation < 40) return null
    return `rgb(${r} ${g} ${b})`
  } catch {
    return null
  }
}

/** Which shell to draw for an OS, given the layout the viewport calls for. */
export function skinFor(os: OSId | null, isMobile: boolean): OSId {
  if (isMobile) {
    if (os === 'ios' || os === 'macos') return 'ios'
    return 'android'
  }
  if (os === 'ios' || os === 'macos') return 'macos'
  if (os === 'windows') return 'windows'
  return 'linux'
}
