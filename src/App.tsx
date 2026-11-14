import { useCallback, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { OSProvider, useOS } from './context/OSContext'
import { Desktop } from './desktop/Desktop'
import { HomeScreen } from './mobile/HomeScreen'
import { BootScreen } from './components/Common/BootScreen'
import { shouldBoot, markBooted } from './system/boot'

function Shell() {
  const { isMobile } = useOS()
  const [booting, setBooting] = useState(shouldBoot)
  const finishBoot = useCallback(() => {
    markBooted()
    setBooting(false)
  }, [])

  return (
    <div className="w-screen h-dvh overflow-hidden relative font-sans text-slate-800 dark:text-slate-200">
      {isMobile ? <HomeScreen booted={!booting} /> : <Desktop booted={!booting} />}
      <AnimatePresence>{booting && <BootScreen key="boot" onDone={finishBoot} />}</AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <OSProvider>
      {/* Honour prefers-reduced-motion for all framer-motion animations */}
      <MotionConfig reducedMotion="user">
        <Shell />
      </MotionConfig>
    </OSProvider>
  )
}

export default App
