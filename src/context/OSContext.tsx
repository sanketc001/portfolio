import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchGithubProjects } from '../api/github'
import type { GithubProject } from '../api/github'
import portfolioData from '../data/portfolioData.json'

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
  minimizeWindow: (id: string) => void
  toggleMaximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  githubUsername: string
  setGithubUsername: (username: string) => void
  projects: GithubProject[]
  loadingProjects: boolean
  startMenuOpen: boolean
  setStartMenuOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  visitorCount: number | null
}

const OSContext = createContext<OSContextType | undefined>(undefined)

const DEFAULT_WINDOWS: WindowState[] = [
  { id: 'about', title: 'About Me', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 60, w: 750, h: 500, minW: 400, minH: 300 },
  { id: 'projects', title: 'Projects Explorer', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 120, y: 90, w: 850, h: 550, minW: 500, minH: 350 },
  { id: 'resume', title: 'Resume.pdf', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 160, y: 120, w: 800, h: 600, minW: 450, minH: 400 },
  { id: 'gallery', title: 'Media Gallery', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 200, y: 150, w: 700, h: 480, minW: 400, minH: 300 },
  { id: 'blog', title: 'Developer Blog', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 240, y: 180, w: 780, h: 520, minW: 400, minH: 300 },
  { id: 'contact', title: 'Contact / Mail', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 280, y: 210, w: 600, h: 450, minW: 350, minH: 300 },
  { id: 'settings', title: 'System Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 320, y: 240, w: 600, h: 460, minW: 350, minH: 300 },
  { id: 'certifications', title: 'Certifications', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 340, y: 260, w: 750, h: 500, minW: 400, minH: 300 }
]

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('portfolio_theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Wallpaper state
  const [wallpaper, setWallpaper] = useState<string>(() => {
    const saved = localStorage.getItem('portfolio_wallpaper')
    return saved || portfolioData.wallpapers[0].url
  })

  // Windows state
  const [windows, setWindows] = useState<WindowState[]>(DEFAULT_WINDOWS)
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [maxZIndex, setMaxZIndex] = useState(10)

  // Start menu and Search states
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // GitHub user and projects
  const [githubUsername, setGithubUsernameState] = useState<string>(() => {
    return localStorage.getItem('portfolio_github_username') || 'sanketc001' // default to portfolio owner or fallbacks
  })
  const [projects, setProjects] = useState<GithubProject[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [visitorCount, setVisitorCount] = useState<number | null>(null)

  // Fetch / Increment visitor count with ad-blocker fallback
  useEffect(() => {
    const cachedCount = localStorage.getItem('portfolio_visitor_count')
    const fallbackSeed = cachedCount ? parseInt(cachedCount, 10) : 1482

    fetch('https://api.counterapi.dev/v1/sanketc001/portfolio/up')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.value === 'number') {
          setVisitorCount(data.value)
          localStorage.setItem('portfolio_visitor_count', data.value.toString())
        } else {
          const newVal = fallbackSeed + 1
          setVisitorCount(newVal)
          localStorage.setItem('portfolio_visitor_count', newVal.toString())
        }
      })
      .catch(err => {
        console.warn("Counter API blocked or failed, using local caching rules:", err)
        const newVal = fallbackSeed + 1
        setVisitorCount(newVal)
        localStorage.setItem('portfolio_visitor_count', newVal.toString())
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
    localStorage.setItem('portfolio_theme', theme)
  }, [theme])

  // Save wallpaper selection
  const setWallpaperAndSave = (url: string) => {
    setWallpaper(url)
    localStorage.setItem('portfolio_wallpaper', url)
  }

  // Set GitHub username and save
  const setGithubUsername = (username: string) => {
    setGithubUsernameState(username)
    localStorage.setItem('portfolio_github_username', username)
  }

  // Fetch GitHub projects
  useEffect(() => {
    let active = true
    const loadProjects = async () => {
      setLoadingProjects(true)
      const data = await fetchGithubProjects(githubUsername)
      if (active) {
        setProjects(data)
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
      const savedWallpaper = localStorage.getItem('portfolio_wallpaper')
      if (!savedWallpaper || savedWallpaper === darkDefault || savedWallpaper === lightDefault) {
        const nextWallpaper = nextTheme === 'dark' ? darkDefault : lightDefault
        setWallpaper(nextWallpaper)
        localStorage.setItem('portfolio_wallpaper', nextWallpaper)
      }
      return nextTheme
    })
  }

  const focusWindow = (id: string) => {
    setActiveWindowId(id)
    setWindows(prev =>
      prev.map(win => {
        if (win.id === id) {
          const nextZ = maxZIndex + 1
          setMaxZIndex(nextZ)
          return { ...win, zIndex: nextZ, isMinimized: false }
        }
        return win
      })
    )
  }

  const openWindow = (id: string) => {
    setStartMenuOpen(false)
    setWindows(prev =>
      prev.map(win => {
        if (win.id === id) {
          return { ...win, isOpen: true, isMinimized: false }
        }
        return win
      })
    )
    focusWindow(id)
  }

  const closeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(win => {
        if (win.id === id) {
          return { ...win, isOpen: false }
        }
        return win
      })
    )
    if (activeWindowId === id) {
      setActiveWindowId(null)
    }
  }

  const minimizeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(win => {
        if (win.id === id) {
          return { ...win, isMinimized: true }
        }
        return win
      })
    )
    if (activeWindowId === id) {
      // Focus the next highest z-index window that is open and not minimized
      const remaining = windows
        .filter(w => w.id !== id && w.isOpen && !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)
      
      if (remaining.length > 0) {
        setActiveWindowId(remaining[0].id)
      } else {
        setActiveWindowId(null)
      }
    }
  }

  const toggleMaximizeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(win => {
        if (win.id === id) {
          return { ...win, isMaximized: !win.isMaximized }
        }
        return win
      })
    )
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
        minimizeWindow,
        toggleMaximizeWindow,
        focusWindow,
        githubUsername,
        setGithubUsername,
        projects,
        loadingProjects,
        startMenuOpen,
        setStartMenuOpen,
        searchQuery,
        setSearchQuery,
        visitorCount
      }}
    >
      {children}
    </OSContext.Provider>
  )
}

export const useOS = () => {
  const context = useContext(OSContext)
  if (!context) {
    throw new Error('useOS must be used within an OSProvider')
  }
  return context
}
