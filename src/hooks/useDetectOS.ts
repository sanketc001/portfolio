import { useState, useEffect } from 'react'

export type OperatingSystem = 'Windows' | 'macOS' | 'iOS' | 'Android' | 'Linux' | 'Unknown'

export function useDetectOS() {
  const [os, setOs] = useState<OperatingSystem>('Unknown')

  useEffect(() => {
    if (typeof navigator === 'undefined') return

    try {
      const ua = navigator.userAgent.toLowerCase()
      const plat = (navigator.platform || '').toLowerCase()
      
      let detected: OperatingSystem = 'Unknown'
      
      // Standard string matches
      if (ua.includes('win') || plat.includes('win')) {
        detected = 'Windows'
      } else if (
        ua.includes('mac') || 
        plat.includes('mac') || 
        plat.includes('ipad') || 
        plat.includes('iphone') || 
        ua.includes('macintosh')
      ) {
        // Modern iPads spoof as Macintosh. Differentiate using touch points.
        const isIOS = ua.includes('iphone') || 
                      ua.includes('ipad') || 
                      ua.includes('ipod') || 
                      (ua.includes('mac') && navigator.maxTouchPoints > 1)
        
        detected = isIOS ? 'iOS' : 'macOS'
      } else if (ua.includes('android') || ua.includes('adr')) {
        detected = 'Android'
      } else if (ua.includes('linux') || plat.includes('linux') || ua.includes('cros')) {
        detected = 'Linux'
      }
      
      setOs(detected)
    } catch (e) {
      console.error("Simplified OS detection failed:", e)
      setOs('Unknown')
    }
  }, [])

  return os
}
