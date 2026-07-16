import { OSProvider } from './context/OSContext'
import { useDevice } from './hooks/useDevice'
import { Desktop } from './desktop/Desktop'
import { HomeScreen } from './mobile/HomeScreen'

function App() {
  const { isMobile } = useDevice()

  return (
    <OSProvider>
      <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200">
        {isMobile ? <HomeScreen /> : <Desktop />}
      </div>
    </OSProvider>
  )
}

export default App
