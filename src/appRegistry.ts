import type React from 'react'
import {
  User,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Mail,
  Settings,
  Award,
  Briefcase,
  MessageCircle
} from 'lucide-react'
import { Github, Linkedin } from './components/Common/BrandIcons'
import portfolioData from './data/portfolioData.json'
export interface AppDef {
  id: string
  /** Short label under icons */
  name: string
  /** Window / screen title */
  title: string
  icon: React.ComponentType<{ className?: string }>
  /** Two-stop gradient for the icon tile */
  tile: [string, string]
  /** Shown in the dock / taskbar */
  pinned?: boolean
  url?: string
}

// Ordered by relevance (the guided tour follows the first five).
export const APPS: AppDef[] = [
  { id: 'about', name: 'About', title: 'About Me', icon: User, tile: ['#4f8dfd', '#3b5bdb'], pinned: true },
  { id: 'projects', name: 'Projects', title: 'Featured Projects', icon: FolderOpen, tile: ['#fbbf24', '#f97316'], pinned: true },
  { id: 'experience', name: 'Experience', title: 'Experience', icon: Briefcase, tile: ['#38bdf8', '#2563eb'], pinned: true },
  { id: 'chat', name: 'Ask', title: 'Ask my portfolio', icon: MessageCircle, tile: ['#34d399', '#059669'], pinned: true },
  { id: 'contact', name: 'Contact', title: 'Contact', icon: Mail, tile: ['#f472b6', '#db2777'], pinned: true },
  { id: 'resume', name: 'Resume', title: 'Resume.pdf', icon: FileText, tile: ['#f87171', '#dc2626'], pinned: true },
  { id: 'certifications', name: 'Credentials', title: 'Certifications', icon: Award, tile: ['#a78bfa', '#7c3aed'] },
  { id: 'gallery', name: 'Gallery', title: 'Media Gallery', icon: ImageIcon, tile: ['#fb7185', '#c026d3'], pinned: true },
  { id: 'blog', name: 'Blog', title: 'Developer Blog', icon: BookOpen, tile: ['#2dd4bf', '#0d9488'] },
  { id: 'settings', name: 'Settings', title: 'Settings', icon: Settings, tile: ['#94a3b8', '#475569'], pinned: true }
]

export const LINKS: AppDef[] = [
  { id: 'github', name: 'GitHub', title: 'GitHub profile', icon: Github, tile: ['#3f3f46', '#18181b'], url: portfolioData.profile.github },
  { id: 'linkedin', name: 'LinkedIn', title: 'LinkedIn profile', icon: Linkedin, tile: ['#2f80ed', '#0a55b5'], url: portfolioData.profile.linkedin }
]

export const PINNED_APPS = APPS.filter(a => a.pinned)

export function appById(id: string): AppDef | undefined {
  return APPS.find(a => a.id === id) || LINKS.find(a => a.id === id)
}
