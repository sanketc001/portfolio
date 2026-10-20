// Guided tour: the order a visitor walks through the portfolio, by relevance.
// Window ids match the ids used by OSContext / HomeScreen.

export interface TourStep {
  id: string
  title: string
}

export const TOUR_STEPS: TourStep[] = [
  { id: 'about', title: 'About Me' },
  { id: 'projects', title: 'Featured Projects' },
  { id: 'experience', title: 'Experience' },
  { id: 'chat', title: 'Ask my portfolio' },
  { id: 'contact', title: 'Contact' }
]

export const TOUR_STORAGE_KEY = 'portfolio_tour_done'

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
