import React, { useState } from 'react'
import { Plus, X, Image as ImageIcon, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import portfolioData from '../../data/portfolioData.json'

interface GalleryItem {
  id: string
  title: string
  url: string
  description: string
}

export const GalleryApp: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>(portfolioData.gallery)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  
  // States for simulated upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newUrl.trim()) {
      setErrorMessage('Title and Image URL are required.')
      return
    }

    // Basic URL validation
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS URL.')
      return
    }

    const newItem: GalleryItem = {
      id: `img-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
      description: newDesc.trim() || 'Custom user upload'
    }

    setItems(prev => [newItem, ...prev])
    setNewTitle('')
    setNewUrl('')
    setNewDesc('')
    setErrorMessage('')
    setIsUploadOpen(false)
  }

  return (
    <div className="h-full flex flex-col select-text relative">
      {/* Top action bar */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Interactive Gallery
          </span>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Image</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map(item => (
            <motion.div
              layoutId={`gallery-card-${item.id}`}
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group cursor-pointer rounded-xl overflow-hidden glass border border-white/10 dark:border-white/5 hover:border-violet-500/35 hover:shadow-lg transition-all duration-300 relative aspect-video"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <h4 className="text-white font-bold text-sm tracking-tight">{item.title}</h4>
                <p className="text-white/70 text-xs mt-1 line-clamp-1">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Simulated Upload Dialog */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            >
              <button
                onClick={() => setIsUploadOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5 font-display">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <span>Simulate Design Upload</span>
              </h3>

              <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Image Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="E.g., Futuristic UI Mockup"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Image URL *</label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Brief details about the project/design..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-500 font-medium text-xs">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-violet-605 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Publish to Gallery
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox / Fullscreen Viewer */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4">
            <motion.div
              layoutId={`gallery-card-${selectedItem.id}`}
              className="max-w-4xl w-full flex flex-col bg-slate-950/80 rounded-2xl overflow-hidden border border-white/10 relative"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute right-4 top-4 p-2 rounded-full bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-6 bg-slate-900 text-white">
                <h3 className="text-lg font-bold font-display">{selectedItem.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedItem.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
