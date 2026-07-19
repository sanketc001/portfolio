import { useState, useEffect } from 'react'

export type OperatingSystem = 'Windows' | 'macOS' | 'iOS' | 'Android' | 'Linux' | 'Unknown'

export function useDetectOS() {
  const [os, setOs] = useState<OperatingSystem>('Unknown')

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Try modern User-Agent Client Hints API first
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

    // 2. Fallback to standard User Agent parsing (Safari, Firefox, older browsers)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const platform = window.navigator.platform?.toLowerCase() || ''

    if (userAgent.includes('win') || platform.includes('win')) {
      setOs('Windows')
    } else if (userAgent.includes('mac') || platform.includes('mac')) {
      // Modern iPads (iPadOS 13+) identify as Macintosh. We check touch points to differentiate.
      const isIOS = userAgent.includes('iphone') || 
                    userAgent.includes('ipad') || 
                    (userAgent.includes('mac') && navigator.maxTouchPoints > 1)
      
      setOs(isIOS ? 'iOS' : 'macOS')
    } else if (userAgent.includes('android')) {
      setOs('Android')
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      setOs('iOS')
    } else if (userAgent.includes('linux') || platform.includes('linux')) {
      setOs('Linux')
    } else {
      setOs('Unknown')
    }
  }, [])

  return os
}
