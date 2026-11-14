import React, { useState } from 'react'
import { useOS, DYNAMIC_WALLPAPER } from '../../context/OSContext'
import { Moon, Sun, Check, RefreshCw } from 'lucide-react'
import { Github } from '../Common/BrandIcons'
import { SKIN_NAMES, skinFor } from '../../system/detect'
import type { OSId } from '../../system/detect'

const DESKTOP_SKINS: OSId[] = ['windows', 'macos', 'linux']
const MOBILE_SKINS: OSId[] = ['ios', 'android']

export const SettingsApp: React.FC = () => {
  const {
    os,
    system,
    osOverride,
    setOsOverride,
    isMobile,
    battery,
    online,
    systemAccent,
    useSystemAccent,
    setUseSystemAccent,
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

  const skins = isMobile ? MOBILE_SKINS : DESKTOP_SKINS
  const detectedSkin = skinFor(system.os, isMobile)

  // Only what the browser actually reports; rows it withholds are left out.
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection
  const device: [string, string][] = [
    ['System', system.osLabel],
    ['Browser', `${system.browserName}${system.browserVersion ? ' ' + system.browserVersion : ''}`]
  ]
  if (system.model) device.push(['Device', system.model])
  device.push(['Screen', `${system.screen} at ${system.pixelRatio.toFixed(system.pixelRatio % 1 ? 2 : 0)}x`])
  if (system.cores) device.push(['Processor threads', String(system.cores)])
  if (system.memoryGb) device.push(['Memory', `${system.memoryGb >= 8 ? 'at least 8' : system.memoryGb} GB`])
  if (battery) device.push(['Battery', `${Math.round(battery.level * 100)}%${battery.charging ? ', charging' : ''}`])
  device.push([
    'Network',
    !online ? 'Offline' : conn?.effectiveType ? `Online, ${conn.effectiveType.toUpperCase()}-class${conn.downlink ? `, about ${conn.downlink} Mbps` : ''}` : 'Online'
  ])
  device.push(['Language', system.language])
  device.push(['Time zone', system.timeZone.replace(/_/g, ' ')])
  device.push(['Touch screen', system.touch ? 'Yes' : 'No'])

  const section = 'p-5 rounded-2xl glass space-y-4'
  const heading = 'text-sm font-semibold text-slate-800 dark:text-white font-display'
  const hint = 'text-xs text-slate-500 dark:text-slate-400 leading-relaxed'
  const choice = (selected: boolean) =>
    `px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
      selected
        ? 'bg-accent-600 border-accent-600 text-white'
        : 'border-slate-300/70 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-500/10'
    }`

  return (
    <div className="h-full overflow-y-auto p-5 md:p-8 select-text">
      <div className="max-w-2xl mx-auto space-y-5">
        <h2 className="text-2xl font-semibold font-display text-slate-800 dark:text-white">Settings</h2>

        {/* Look */}
        <div className={section}>
          <h3 className={heading}>Look</h3>
          <p className={hint}>
            {system.os
              ? `Your browser says you're on ${system.osLabel}, so this portfolio drew itself as ${SKIN_NAMES[detectedSkin]}.`
              : `Your browser didn't say which system you're on, so this portfolio fell back to ${SKIN_NAMES[detectedSkin]}.`}{' '}
            Try another if you're curious.
          </p>

          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Desktop style">
            <button type="button" role="radio" aria-checked={!osOverride} onClick={() => setOsOverride(null)} className={choice(!osOverride)}>
              Match my system
            </button>
            {skins.map(id => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={!!osOverride && os === id}
                onClick={() => setOsOverride(id)}
                className={choice(!!osOverride && os === id)}
              >
                {SKIN_NAMES[id]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">Colour mode</p>
              <p className={hint}>Starts on whichever your system uses.</p>
            </div>
            <button type="button" onClick={toggleTheme} className={`${choice(false)} flex items-center gap-2`}>
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>

          {systemAccent && (
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span>
                <span className="block text-sm font-medium text-slate-800 dark:text-white">Use my system accent colour</span>
                <span className={hint}>
                  Your system's accent is{' '}
                  <span className="inline-block w-2.5 h-2.5 rounded-full align-middle" style={{ background: systemAccent }} />. Turn this off for
                  the {SKIN_NAMES[os]} default.
                </span>
              </span>
              <input
                type="checkbox"
                checked={useSystemAccent}
                onChange={e => setUseSystemAccent(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
            </label>
          )}
        </div>

        {/* Wallpaper */}
        <div className={section}>
          <h3 className={heading}>Wallpaper</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[{ id: 'dynamic', name: 'Live, follows your time of day', url: DYNAMIC_WALLPAPER }, ...wallpapers].map(wp => {
              const selected = wallpaper === wp.url
              return (
                <button key={wp.id} type="button" onClick={() => setWallpaper(wp.url)} aria-pressed={selected} className="group cursor-pointer flex flex-col gap-1.5 text-left">
                  <span
                    className={`relative block aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      selected ? 'border-accent-500' : 'border-transparent group-hover:border-slate-400/50'
                    }`}
                  >
                    {wp.url === DYNAMIC_WALLPAPER ? (
                      <span
                        className="absolute inset-0"
                        style={{
                          background:
                            'radial-gradient(circle at 20% 10%, var(--wp-a), transparent 60%), radial-gradient(circle at 85% 90%, var(--wp-b), transparent 60%), var(--wp-base)'
                        }}
                      />
                    ) : (
                      <img src={wp.url.replace('w=1920', 'w=400')} alt="" loading="lazy" className="w-full h-full object-cover" />
                    )}
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-accent-600 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{wp.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* GitHub sync */}
        <div className={section}>
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            <h3 className={heading}>GitHub projects</h3>
          </div>
          <p className={hint}>Enter a GitHub username to fill the Projects app with that account's public repositories.</p>

          <form onSubmit={handleSyncSubmit} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              placeholder="octocat"
              aria-label="GitHub username"
              className="flex-1 text-xs px-3.5 py-2.5 rounded-lg"
            />
            <button
              type="submit"
              disabled={loadingProjects}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {loadingProjects ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Load projects'}
            </button>
          </form>

          {saveSuccess && (
            <p role="status" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
              Loading projects from {githubUsername}.
            </p>
          )}
        </div>

        {/* Device */}
        <div className={section}>
          <h3 className={heading}>Your device</h3>
          <p className={hint}>
            What your browser told this page. It is used to style the desktop and stays here: none of it is stored or sent anywhere.
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-xs">
            {device.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2 border-b border-slate-500/15">
                <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="font-medium text-slate-800 dark:text-white text-right truncate" title={value}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
