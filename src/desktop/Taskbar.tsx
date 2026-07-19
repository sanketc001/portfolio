import React, { useState, useEffect } from 'react'
import { useOS } from '../context/OSContext'
import {
  User,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Mail,
  Settings,
  Wifi,
  Volume2,
  Battery,
  LayoutGrid
} from 'lucide-react'

interface TaskbarProps {
  onStartMenuToggle: () => void
  startMenuOpen: boolean
}

export const Taskbar: React.FC<TaskbarProps> = ({ onStartMenuToggle, startMenuOpen }) => {
  const { windows, activeWindowId, openWindow, minimizeWindow, focusWindow } = useOS()
  const [time, setTime] = useState<string>('')

  // System Tray clock update
  useEffect(() => {
    const updateTime = () => {
      const date = new Date()
      setTime(
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const appItems = [
    { id: 'about', name: 'About Me', icon: User, color: 'hover:text-blue-500' },
    { id: 'projects', name: 'Projects', icon: FolderOpen, color: 'hover:text-amber-500' },
    { id: 'resume', name: 'Resume', icon: FileText, color: 'hover:text-emerald-500' },
    { id: 'gallery', name: 'Gallery', icon: ImageIcon, color: 'hover:text-pink-500' },
    { id: 'blog', name: 'Blog', icon: BookOpen, color: 'hover:text-indigo-500' },
    { id: 'contact', name: 'Contact', icon: Mail, color: 'hover:text-purple-500' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'hover:text-teal-500' }
  ]

  const handleTaskbarIconClick = (id: string) => {
    const win = windows.find(w => w.id === id)
    if (!win) return

    if (!win.isOpen) {
      openWindow(id)
    } else if (win.isMinimized) {
      focusWindow(id)
    } else if (activeWindowId === id) {
      minimizeWindow(id)
    } else {
      focusWindow(id)
    }
  }

  return (
    <div className="h-12 w-full glass-panel border-t border-white/20 dark:border-white/5 absolute bottom-0 left-0 flex items-center justify-between px-4 z-[99999] select-none">
      {/* Start Button */}
      <button
        onClick={onStartMenuToggle}
        className={`h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
          startMenuOpen
            ? 'bg-violet-600 text-white shadow-inner scale-95'
            : 'bg-white/10 dark:bg-white/5 hover:bg-violet-600 hover:text-white text-slate-700 dark:text-slate-200'
        }`}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      {/* Center - Pinned & Open Windows list */}
      <div className="flex items-center gap-1">
        {appItems.map(app => {
          const win = windows.find(w => w.id === app.id)
          const isOpen = win?.isOpen
          const isActive = win?.isOpen && !win?.isMinimized && activeWindowId === app.id
          
          const Icon = app.icon

          return (
            <button
              key={app.id}
              onClick={() => handleTaskbarIconClick(app.id)}
              className={`relative h-9 px-3 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer group ${
                isActive
                  ? 'bg-white/15 dark:bg-white/5 text-violet-500'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5'
              } ${app.color}`}
              title={app.name}
            >
              <Icon className="w-4.5 h-4.5 group-hover:scale-105 transition-transform" />
              
              {/* Status Indicators */}
              {isOpen && (
                <div
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full transition-all ${
                    isActive ? 'bg-violet-500 w-3' : 'bg-slate-400 dark:bg-slate-650'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* System Tray (Clock & Status Icons) */}
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-xs font-semibold">
        <div className="flex items-center gap-1.5 opacity-80">
          <Wifi className="w-3.5 h-3.5" />
          <Volume2 className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 rotate-90" />
        </div>
        
        <div className="border-l border-slate-300 dark:border-slate-800 h-4 pl-3">
          <span>{time}</span>
        </div>
      </div>
    </div>
  )
}
