const BOOT_KEY = 'portfolio_booted'

export function shouldBoot(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return window.sessionStorage.getItem(BOOT_KEY) !== '1'
  } catch {
    return false
  }
}

export function markBooted(): void {
  try {
    window.sessionStorage.setItem(BOOT_KEY, '1')
  } catch {
    // session storage unavailable: the greeting simply shows again next load
  }
}
