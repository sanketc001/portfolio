import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { fetchGithubProjects } from '../api/github'
import type { GithubProject } from '../api/github'
import portfolioData from '../data/portfolioData.json'
import { storageGet, storageSet } from '../utils/storage'
import { TOUR_STEPS, TOUR_STORAGE_KEY } from '../tour'

export interface WindowState {
  id: string
  title: string
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

interface OSContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  wallpaper: string
  setWallpaper: (url: string) => void
  wallpapers: typeof portfolioData.wallpapers
  windows: WindowState[]
  activeWindowId: string | null
  openWindow: (id: string) => void
  closeWindow: (id: string) => void
  closeAllWindows: () => void
  minimizeWindow: (id: string) => void
  toggleMaximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  githubUsername: string
  setGithubUsername: (username: string) => void
  projects: GithubProject[]
  projectsSource: 'live' | 'fallback'
  loadingProjects: boolean
  startMenuOpen: boolean
  setStartMenuOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  visitorCount: number | null
  // Guided tour
  tourStep: number | null
  startTour: () => void
  nextTourStep: () => void
  skipTour: () => void
  tourNotice: string | null
  setTourNotice: (notice: string | null) => void
}

const OSContext = createContext<OSContextType | undefined>(undefined)

const TASKBAR_HEIGHT = 48

// w/h are the preferred sizes; windows are centred and clamped to the viewport when opened.
const DEFAULT_WINDOWS: WindowState[] = [
  { id: 'about', title: 'About Me', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 60, w: 900, h: 620, minW: 400, minH: 300 },
  { id: 'projects', title: 'Featured Projects', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 120, y: 90, w: 1040, h: 700, minW: 500, minH: 350 },
  { id: 'experience', title: 'Experience', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 100, w: 860, h: 680, minW: 420, minH: 320 },
  { id: 'chat', title: 'Ask my portfolio', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 150, y: 110, w: 760, h: 680, minW: 380, minH: 400 },
  { id: 'contact', title: 'Contact / Mail', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 280, y: 210, w: 860, h: 600, minW: 350, minH: 300 },
  { id: 'resume', title: 'Resume.pdf', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 160, y: 120, w: 880, h: 700, minW: 450, minH: 400 },
  { id: 'certifications', title: 'Certifications', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 340, y: 260, w: 820, h: 600, minW: 400, minH: 300 },
  { id: 'gallery', title: 'Media Gallery', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 150, w: 940, h: 640, minW: 400, minH: 300 },
  { id: 'blog', title: 'Developer Blog', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 240, y: 180, w: 840, h: 620, minW: 400, minH: 300 },
  { id: 'settings', title: 'System Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 320, y: 240, w: 680, h: 560, minW: 350, minH: 300 }
]

const PREFERRED_SIZE = Object.fromEntries(DEFAULT_WINDOWS.map(w => [w.id, { w: w.w, h: w.h }]))

/** Centre a window in the visible workspace (above the taskbar), clamped so it fits. */
function centeredRect(id: string) {
  const pref = PREFERRED_SIZE[id] || { w: 800, h: 600 }
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const vh = typeof window !== 'undefined' ? window.innerHeight - TASKBAR_HEIGHT : 852
  const w = Math.max(320, Math.min(pref.w, vw - 48))
  const h = Math.max(280, Math.min(pref.h, vh - 32))
  return {
    w,
    h,
    x: Math.max(0, Math.round((vw - w) / 2)),
    y: Math.max(0, Math.round((vh - h) / 2))
  }
}

function isTourDone(): boolean {
  return storageGet(TOUR_STORAGE_KEY) === '1'
}

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = storageGet('portfolio_theme')
    if (saved === 'light' || saved === 'dark') return saved
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
      return 'dark'
    }
  })

  // Wallpaper state
  const [wallpaper, setWallpaper] = useState<string>(() => {
    return storageGet('portfolio_wallpaper') || portfolioData.wallpapers[0].url
  })

  // Guided tour: starts automatically on the first visit (About window open, centred).
  const [tourStep, setTourStep] = useState<number | null>(() => (isTourDone() ? null : 0))
  const [tourNotice, setTourNotice] = useState<string | null>(null)

  // Windows state
  const zCounter = useRef(20)
  const [windows, setWindows] = useState<WindowState[]>(() => {
    if (isTourDone()) return DEFAULT_WINDOWS
    const firstId = TOUR_STEPS[0].id
    return DEFAULT_WINDOWS.map(win =>
      win.id === firstId ? { ...win, ...centeredRect(firstId), isOpen: true, zIndex: 20 } : win
    )
  })
  const [activeWindowId, setActiveWindowId] = useState<string | null>(() =>
    isTourDone() ? null : TOUR_STEPS[0].id
  )

  // Start menu and Search states
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // GitHub user and projects
  const [githubUsername, setGithubUsernameState] = useState<string>(() => {
    return storageGet('portfolio_github_username') || 'sanketc001'
  })
  const [projects, setProjects] = useState<GithubProject[]>([])
  const [projectsSource, setProjectsSource] = useState<'live' | 'fallback'>('fallback')
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Real visitor count from CounterAPI. If the request fails (ad blockers, outage)
  // the count stays null and the badge is hidden; no made-up fallback number.
  const [visitorCount, setVisitorCount] = useState<number | null>(null)
  const counted = useRef(false)
  useEffect(() => {
    if (counted.current) return
    counted.current = true
    fetch('https://api.counterapi.dev/v1/sanketc001/portfolio/up')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && typeof data.count === 'number' && data.count > 0) {
          setVisitorCount(data.count)
        }
      })
      .catch(() => {
        // counter unavailable: keep the badge hidden
      })
  }, [])

  // Sync theme with document class list
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    storageSet('portfolio_theme', theme)
  }, [theme])

  const setWallpaperAndSave = (url: string) => {
    setWallpaper(url)
    storageSet('portfolio_wallpaper', url)
  }

  const setGithubUsername = (username: string) => {
    setGithubUsernameState(username)
    storageSet('portfolio_github_username', username)
  }

  // Fetch GitHub projects
  useEffect(() => {
    let active = true
    const loadProjects = async () => {
      setLoadingProjects(true)
      const result = await fetchGithubProjects(githubUsername)
      if (active) {
        setProjects(result.projects)
        setProjectsSource(result.source)
        setLoadingProjects(false)
      }
    }
    loadProjects()
    return () => {
      active = false
    }
  }, [githubUsername])

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light'
      const darkDefault = 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=1920&q=80'
      const lightDefault = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1920&q=80'
      const savedWallpaper = storageGet('portfolio_wallpaper')
      if (!savedWallpaper || savedWallpaper === darkDefault || savedWallpaper === lightDefault) {
        const nextWallpaper = nextTheme === 'dark' ? darkDefault : lightDefault
        setWallpaper(nextWallpaper)
        storageSet('portfolio_wallpaper', nextWallpaper)
      }
      return nextTheme
    })
  }

  const nextZ = () => {
    zCounter.current += 1
    return zCounter.current
  }

  const focusWindow = (id: string) => {
    const z = nextZ()
    setActiveWindowId(id)
    setWindows(prev =>
      prev.map(win => (win.id === id ? { ...win, zIndex: z, isMinimized: false } : win))
    )
  }

  /** Pure window-list transform: open (centred if it was closed) and bring to front. */
  const withOpened = (list: WindowState[], id: string, z: number) =>
    list.map(win => {
      if (win.id !== id) return win
      if (win.isOpen) return { ...win, isMinimized: false, zIndex: z }
      return { ...win, ...centeredRect(id), isOpen: true, isMinimized: false, isMaximized: false, zIndex: z }
    })

  const withClosed = (list: WindowState[], id: string) =>
    list.map(win => (win.id === id ? { ...win, isOpen: false } : win))

  const openWindow = (id: string) => {
    setStartMenuOpen(false)
    const z = nextZ()
    setWindows(prev => withOpened(prev, id, z))
    setActiveWindowId(id)
  }

  // --- Guided tour -------------------------------------------------------

  const markTourDone = () => storageSet(TOUR_STORAGE_KEY, '1')

  const finishTour = (currentId: string | null, skipped: boolean) => {
    setTourStep(null)
    markTourDone()
    if (currentId) {
      setWindows(prev => withClosed(prev, currentId))
      setActiveWindowId(prev => (prev === currentId ? null : prev))
    }
    setTourNotice(
      skipped
        ? 'Tour skipped. You can restart it any time.'
        : "That's the tour. Everything else is one click away; you can restart it any time."
    )
  }

  /** Move from the current tour window to step `index` (or finish past the end). */
  const goToTourStep = (index: number) => {
    const currentId = tourStep !== null ? TOUR_STEPS[tourStep].id : null
    if (index >= TOUR_STEPS.length) {
      finishTour(currentId, false)
      return
    }
    const nextId = TOUR_STEPS[index].id
    const z = nextZ()
    setWindows(prev => withOpened(currentId ? withClosed(prev, currentId) : prev, nextId, z))
    setActiveWindowId(nextId)
    setTourStep(index)
  }

  const startTour = () => {
    setStartMenuOpen(false)
    setTourNotice(null)
    const firstId = TOUR_STEPS[0].id
    const z = nextZ()
    // Start from a clean desktop so the visitor sees one window at a time.
    setWindows(prev => withOpened(prev.map(w => ({ ...w, isOpen: false })), firstId, z))
    setActiveWindowId(firstId)
    setTourStep(0)
  }

  const nextTourStep = () => {
    if (tourStep === null) return
    goToTourStep(tourStep + 1)
  }

  const skipTour = () => {
    if (tourStep === null) return
    finishTour(TOUR_STEPS[tourStep].id, true)
  }

  // ------------------------------------------------------------------------

  const closeWindow = (id: string) => {
    // Closing the current tour window advances the tour.
    if (tourStep !== null && TOUR_STEPS[tourStep].id === id) {
      goToTourStep(tourStep + 1)
      return
    }
    setWindows(prev => withClosed(prev, id))
    if (activeWindowId === id) {
      setActiveWindowId(null)
    }
  }

  const closeAllWindows = () => {
    if (tourStep !== null) {
      setTourStep(null)
      markTourDone()
    }
    setWindows(prev => prev.map(w => ({ ...w, isOpen: false })))
    setActiveWindowId(null)
  }

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(win => (win.id === id ? { ...win, isMinimized: true } : win)))
    if (activeWindowId === id) {
      // Focus the next highest z-index window that is open and not minimized
      const remaining = windows
        .filter(w => w.id !== id && w.isOpen && !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)
      setActiveWindowId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const toggleMaximizeWindow = (id: string) => {
    setWindows(prev => prev.map(win => (win.id === id ? { ...win, isMaximized: !win.isMaximized } : win)))
    focusWindow(id)
  }

  return (
    <OSContext.Provider
      value={{
        theme,
        toggleTheme,
        wallpaper,
        setWallpaper: setWallpaperAndSave,
        wallpapers: portfolioData.wallpapers,
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        closeAllWindows,
        minimizeWindow,
        toggleMaximizeWindow,
        focusWindow,
        githubUsername,
        setGithubUsername,
        projects,
        projectsSource,
        loadingProjects,
        startMenuOpen,
        setStartMenuOpen,
        searchQuery,
        setSearchQuery,
        visitorCount,
        tourStep,
        startTour,
        nextTourStep,
        skipTour,
        tourNotice,
        setTourNotice
      }}
    >
      {children}
    </OSContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export const useOS = () => {
  const context = useContext(OSContext)
  if (!context) {
    throw new Error('useOS must be used within an OSProvider')
  }
  return context
}
