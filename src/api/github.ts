import portfolioData from '../data/portfolioData.json'

export interface GithubProject {
  id: string | number
  name: string
  description: string | null
  language: string | null
  stars: number
  homepage: string | null
  html_url: string
  topics: string[]
}

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes in ms

export async function fetchGithubProjects(username: string): Promise<GithubProject[]> {
  if (!username) {
    return portfolioData.fallbackProjects as GithubProject[]
  }

  const userCacheKey = `portfolio_github_repos_${username.toLowerCase()}`

  // Check LocalStorage cache first
  try {
    const cachedData = localStorage.getItem(userCacheKey)
    const cachedTime = localStorage.getItem(`${userCacheKey}_time`)

    if (cachedData && cachedTime) {
      const age = Date.now() - parseInt(cachedTime, 10)
      if (age < CACHE_TTL) {
        return JSON.parse(cachedData) as GithubProject[]
      }
    }
  } catch (e) {
    console.warn('LocalStorage error while reading cache:', e)
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
    
    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`)
    }

    const data = await response.json()
    
    if (!Array.isArray(data)) {
      throw new Error('GitHub API response is not an array')
    }

    const mappedProjects: GithubProject[] = data
      .filter((repo: any) => !repo.fork) // optional: filter out forks
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        homepage: repo.homepage,
        html_url: repo.html_url,
        topics: repo.topics || [],
      }))

    // Save to LocalStorage cache
    try {
      localStorage.setItem(userCacheKey, JSON.stringify(mappedProjects))
      localStorage.setItem(`${userCacheKey}_time`, Date.now().toString())
    } catch (e) {
      console.warn('Failed to save to LocalStorage cache:', e)
    }

    return mappedProjects
  } catch (error) {
    console.error('Failed to fetch from GitHub API. Falling back to static data.', error)
    return portfolioData.fallbackProjects as GithubProject[]
  }
}
