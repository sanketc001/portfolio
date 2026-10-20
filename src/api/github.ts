import portfolioData from '../data/portfolioData.json'
import { storageGet, storageSet } from '../utils/storage'

export interface GithubProject {
  id: string | number
  name: string
  description: string | null
  language: string | null
  /** Only present when the repo list came live from the GitHub API. */
  stars?: number
  homepage: string | null
  html_url: string
  topics: string[]
}

export interface FeaturedProjectImage {
  file: string
  caption: string
}

export interface FeaturedProject {
  id: string
  name: string
  title: string
  description: string
  problem: string
  built: string
  stack: string[]
  language: string | null
  topics: string[]
  images: FeaturedProjectImage[]
  html_url: string
}

export interface GithubProjectsResult {
  projects: GithubProject[]
  source: 'live' | 'fallback'
}

export const featuredProjects = portfolioData.featuredProjects as FeaturedProject[]

/** Curated list used whenever the GitHub API is unavailable. No star counts. */
export const fallbackProjects: GithubProject[] = featuredProjects.map(p => ({
  id: p.id,
  name: p.name,
  description: p.description,
  language: p.language,
  homepage: null,
  html_url: p.html_url,
  topics: p.topics
}))

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const CACHE_VERSION = 'v2'

interface GithubRepoResponse {
  id: number
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  homepage: string | null
  html_url: string
  topics?: string[]
  fork: boolean
  archived: boolean
}

export function isListableRepo(repo: GithubRepoResponse, username: string): boolean {
  // Skip forks, archived repos and the profile README repo (named after the user).
  return !repo.fork && !repo.archived && repo.name.toLowerCase() !== username.toLowerCase()
}

export async function fetchGithubProjects(username: string): Promise<GithubProjectsResult> {
  if (!username) {
    return { projects: fallbackProjects, source: 'fallback' }
  }

  const cacheKey = `portfolio_github_repos_${CACHE_VERSION}_${username.toLowerCase()}`

  const cachedData = storageGet(cacheKey)
  const cachedTime = storageGet(`${cacheKey}_time`)
  if (cachedData && cachedTime && Date.now() - parseInt(cachedTime, 10) < CACHE_TTL) {
    try {
      const parsed = JSON.parse(cachedData)
      if (Array.isArray(parsed)) return { projects: parsed as GithubProject[], source: 'live' }
    } catch {
      // corrupted cache entry: refetch below
    }
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`
    )
    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`)
    }

    const data: unknown = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('GitHub API response is not an array')
    }

    const projects: GithubProject[] = (data as GithubRepoResponse[])
      .filter(repo => isListableRepo(repo, username))
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        homepage: repo.homepage,
        html_url: repo.html_url,
        topics: repo.topics || []
      }))

    storageSet(cacheKey, JSON.stringify(projects))
    storageSet(`${cacheKey}_time`, Date.now().toString())

    return { projects, source: 'live' }
  } catch (error) {
    console.warn('GitHub API unavailable, showing the curated project list instead.', error)
    return { projects: fallbackProjects, source: 'fallback' }
  }
}
