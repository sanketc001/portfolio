// Safe wrappers around localStorage. Storage can be unavailable (private
// windows, blocked site data, sandboxed previews) and every access may throw,
// so the app must keep working when these return null / no-op.

export function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function storageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore: storage unavailable or full
  }
}

export function storageRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function storageClear(): void {
  try {
    window.localStorage.clear()
  } catch {
    // ignore
  }
}
