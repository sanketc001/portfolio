import React, { useState } from 'react'
import { useOS } from '../../context/OSContext'
import { Settings, Moon, Sun, Check, RefreshCw } from 'lucide-react'
import { Github } from '../Common/BrandIcons'
import { useDetectOS } from '../../hooks/useDetectOS'

export const SettingsApp: React.FC = () => {
  const detectedOS = useDetectOS()
  const {
    theme,
    toggleTheme,
    wallpaper,
    setWallpaper,
    wallpapers,
    githubUsername,
    setGithubUsername,
    loadingProjects
  } = useOS()

  const [usernameInput, setUsernameInput] = useState(githubUsername)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameInput.trim()) {
      setGithubUsername(usernameInput.trim())
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 select-text">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-violet-500" />
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">System Settings</h2>
        </div>

        {/* Section 1: Themes */}
        <div className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-display">Personalization</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Color Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Toggle between dark and light aesthetics</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 font-bold text-xs transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-violet-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Wallpaper Selector */}
        <div className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-display">Desktop Wallpaper</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {wallpapers.map(wp => (
              <div
                key={wp.id}
                onClick={() => setWallpaper(wp.url)}
                className="group cursor-pointer flex flex-col gap-1.5"
              >
                <div className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  wallpaper === wp.url ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-transparent hover:border-slate-350 dark:hover:border-slate-700'
                }`}>
                  <img
                    src={wp.url}
                    alt={wp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {wallpaper === wp.url && (
                    <div className="absolute inset-0 bg-violet-600/30 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="p-1 rounded-full bg-violet-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-center font-bold text-slate-500 dark:text-slate-400 truncate">{wp.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: GitHub Username Sync */}
        <div className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-display">GitHub Sync</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter your GitHub username to dynamically populate the file explorer (Projects folder) and mobile Launcher (Projects app) with your actual public repositories.
          </p>

          <form onSubmit={handleSyncSubmit} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              placeholder="E.g., octocat"
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            
            <button
              type="submit"
              disabled={loadingProjects}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              {loadingProjects ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Sync</span>
              )}
            </button>
          </form>

          {saveSuccess && (
            <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 animate-fade-in">
              Successfully synced! Repositories are reloading...
            </p>
          )}
        </div>

        {/* Section 4: System Information */}
        <div className="p-6 rounded-2xl glass border border-white/10 dark:border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-display">System Information</h3>
          
          <div className="space-y-3 text-xs md:text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
              <span className="font-semibold text-slate-500">Visitor OS</span>
              <span className="font-bold text-slate-800 dark:text-white px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">{detectedOS}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
              <span className="font-semibold text-slate-500">Host Environment</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {import.meta.env.DEV ? 'Local Development' : 'GitHub Pages (Production)'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-semibold text-slate-500">Vite Base Path</span>
              <span className="font-mono text-slate-400">{import.meta.env.BASE_URL}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
