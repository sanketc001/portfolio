import React, { useState, useMemo } from 'react'
import { useOS } from '../../context/OSContext'
import { Search, Star, ExternalLink, GitBranch, RefreshCw, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export const ProjectsApp: React.FC = () => {
  const { projects, loadingProjects, githubUsername, setGithubUsername } = useOS()
  const [filterLang, setFilterLang] = useState<string>('All')
  const [searchWord, setSearchWord] = useState<string>('')
  const [usernameInput, setUsernameInput] = useState<string>(githubUsername)
  const [editingUsername, setEditingUsername] = useState<boolean>(false)

  // Get unique languages for filter buttons
  const languages = useMemo(() => {
    const langs = new Set<string>()
    projects.forEach(p => {
      if (p.language) langs.add(p.language)
    })
    return ['All', ...Array.from(langs)]
  }, [projects])

  // Filter projects by language & search word
  const filteredProjects = useMemo(() => {
    return projects.filter(proj => {
      const matchLang = filterLang === 'All' || proj.language === filterLang
      const matchSearch =
        proj.name.toLowerCase().includes(searchWord.toLowerCase()) ||
        (proj.description || '').toLowerCase().includes(searchWord.toLowerCase()) ||
        proj.topics.some(t => t.toLowerCase().includes(searchWord.toLowerCase()))
      return matchLang && matchSearch
    })
  }, [projects, filterLang, searchWord])

  const getLanguageStyles = (lang: string | null) => {
    if (!lang) return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    switch (lang.toLowerCase()) {
      case 'typescript':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'javascript':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'rust':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'python':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'css':
      case 'html':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
      default:
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    }
  }

  const handleSyncUsername = (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameInput.trim()) {
      setGithubUsername(usernameInput.trim())
      setEditingUsername(false)
    }
  }

  return (
    <div className="h-full flex flex-col select-text">
      {/* GitHub account sync header */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-wrap gap-4 items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Source: GitHub API (@{githubUsername})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {editingUsername ? (
            <form onSubmit={handleSyncUsername} className="flex gap-2">
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="GitHub Username"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded font-medium cursor-pointer"
              >
                Sync
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsernameInput(githubUsername)
                  setEditingUsername(false)
                }}
                className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <button
                onClick={() => setEditingUsername(true)}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 transition-colors font-medium cursor-pointer"
              >
                Change Account
              </button>
              {loadingProjects && <RefreshCw className="w-4 h-4 text-violet-500 animate-spin" />}
            </>
          )}
        </div>
      </div>

      {/* Filters & Search controls */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 justify-between bg-white/2">
        {/* Languages tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setFilterLang(lang)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterLang === lang
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchWord}
            onChange={e => setSearchWord(e.target.value)}
            placeholder="Search projects..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loadingProjects && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-100/50 dark:bg-slate-900/40 animate-pulse h-40" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
            <GitBranch className="w-12 h-12 text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm">No repositories found matching your query.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map(repo => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={repo.id}
                  className="group relative flex flex-col p-5 rounded-2xl glass border border-white/10 dark:border-white/5 hover:border-violet-500/40 dark:hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-semibold bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <span>{repo.stars}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed mb-4 flex-1 line-clamp-3">
                    {repo.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {repo.language && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getLanguageStyles(repo.language)}`}>
                        {repo.language}
                      </span>
                    )}
                    {repo.topics.slice(0, 3).map(topic => (
                      <span key={topic} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3 text-xs font-bold pt-3 border-t border-slate-200/40 dark:border-slate-800/30">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
                    >
                      <span>Repository</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-violet-500 dark:hover:text-violet-400 transition-colors ml-auto"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
