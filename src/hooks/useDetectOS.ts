import { useState, useEffect } from 'react'

export type OperatingSystem = 'Windows' | 'macOS' | 'iOS' | 'Android' | 'Linux' | 'Unknown'

export function useDetectOS() {
  const [os, setOs] = useState<OperatingSystem>('Unknown')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Try modern User-Agent Client Hints API first (wrapped in try-catch to prevent SecurityErrors)
    try {
      if ('userAgentData' in navigator && (navigator as any).userAgentData?.platform) {
        const platform = (navigator as any).userAgentData.platform.toLowerCase()
        if (platform.includes('win')) {
          setOs('Windows')
          return
        }
        if (platform.includes('mac')) {
          setOs('macOS')
          return
        }
        if (platform.includes('linux')) {
          setOs('Linux')
          return
        }
        if (platform.includes('android')) {
          setOs('Android')
          return
        }
      }
    } catch (e) {
      console.warn("UserAgent Client Hints detection bypassed:", e)
    }

    // 2. Fallback to standard User Agent parsing (Safari, Firefox, older browsers)
    try {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const platform = window.navigator.platform?.toLowerCase() || ''
      const oscpu = ((window.navigator as any).oscpu || '').toLowerCase()

      if (
        userAgent.includes('win') || 
        platform.includes('win') || 
        oscpu.includes('win')
      ) {
        setOs('Windows')
      } else if (
        userAgent.includes('mac') || 
        platform.includes('mac') || 
        platform.includes('ipad') ||
        platform.includes('iphone') ||
        oscpu.includes('mac')
      ) {
        // Modern iPads (iPadOS 13+) identify as Macintosh. We check touch points to differentiate.
        const isIOS = userAgent.includes('iphone') || 
                      userAgent.includes('ipad') || 
                      userAgent.includes('ipod') ||
                      (userAgent.includes('mac') && navigator.maxTouchPoints > 1)
        
        setOs(isIOS ? 'iOS' : 'macOS')
      } else if (userAgent.includes('android')) {
        setOs('Android')
      } else if (userAgent.includes('linux') || platform.includes('linux') || oscpu.includes('linux')) {
        setOs('Linux')
      } else if (userAgent.includes('cros') || userAgent.includes('cros')) {
        setOs('Linux') // Map ChromeOS to Linux
      } else {
        setOs('Unknown')
      }
    } catch (e) {
      console.error("OS fallback parsing error:", e)
      setOs('Unknown')
    }
  }, [])

  return os
}
