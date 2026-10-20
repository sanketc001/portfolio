import { MotionConfig } from 'framer-motion'
import { OSProvider } from './context/OSContext'
import { useDevice } from './hooks/useDevice'
import { Desktop } from './desktop/Desktop'
import { HomeScreen } from './mobile/HomeScreen'

function App() {
  const { isMobile } = useDevice()

  return (
    <OSProvider>
      {/* Honour prefers-reduced-motion for all framer-motion animations */}
      <MotionConfig reducedMotion="user">
        <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200">
          {isMobile ? <HomeScreen /> : <Desktop />}
        </div>
      </MotionConfig>
    </OSProvider>
  )
}

export default App
