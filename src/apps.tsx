import React from 'react'
import type { AppDef } from './appRegistry'
import { AboutApp } from './components/Apps/AboutApp'
import { ProjectsApp } from './components/Apps/ProjectsApp'
import { ResumeApp } from './components/Apps/ResumeApp'
import { GalleryApp } from './components/Apps/GalleryApp'
import { BlogApp } from './components/Apps/BlogApp'
import { SettingsApp } from './components/Apps/SettingsApp'
import { ContactApp } from './components/Apps/ContactApp'
import { CertificationsApp } from './components/Apps/CertificationsApp'
import { ExperienceApp } from './components/Apps/ExperienceApp'
import { ChatApp } from './components/Apps/ChatApp'


/** The gradient tile every shell uses for an app; its corner shape comes from the active skin. */
export const AppIcon: React.FC<{ app: AppDef; size?: number; className?: string }> = ({ app, size = 48, className = '' }) => {
  const Icon = app.icon
  return (
    <span
      className={`app-tile ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(160deg, ${app.tile[0]}, ${app.tile[1]})`
      }}
      aria-hidden="true"
    >
      <span className="flex w-1/2 h-1/2">
        <Icon className="w-full h-full" />
      </span>
    </span>
  )
}

export const AppContent: React.FC<{ id: string; onOpenContact: () => void }> = ({ id, onOpenContact }) => {
  switch (id) {
    case 'about':
      return <AboutApp />
    case 'projects':
      return <ProjectsApp />
    case 'resume':
      return <ResumeApp />
    case 'gallery':
      return <GalleryApp />
    case 'blog':
      return <BlogApp />
    case 'contact':
      return <ContactApp />
    case 'settings':
      return <SettingsApp />
    case 'certifications':
      return <CertificationsApp />
    case 'experience':
      return <ExperienceApp />
    case 'chat':
      return <ChatApp onOpenContact={onOpenContact} />
    default:
      return null
  }
}
