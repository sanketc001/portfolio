import React, { useState, useRef, useEffect } from 'react'
import { Plus, X, FileText, Image as ImageIcon, Music, Video, Sparkles, Download, Play, Pause, Folder } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import portfolioData from '../../data/portfolioData.json'

interface MediaFile {
  id: string
  name: string
  url: string
  size: string
  description?: string
}

type MediaFolder = 'documents' | 'pictures' | 'music' | 'videos'

export const GalleryApp: React.FC = () => {
  // Load initial gallery folders from portfolioData or state fallback
  const [galleryData, setGalleryData] = useState<{
    documents: MediaFile[]
    pictures: MediaFile[]
    music: MediaFile[]
    videos: MediaFile[]
  }>(() => {
    const data = (portfolioData as any).mediaGallery
    return data || { documents: [], pictures: [], music: [], videos: [] }
  })

  const [activeFolder, setActiveFolder] = useState<MediaFolder>('pictures')
  const [selectedPicture, setSelectedPicture] = useState<MediaFile | null>(null)

  // Music Player State
  const [currentPlayingMusic, setCurrentPlayingMusic] = useState<MediaFile | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Video Player State
  const [activeVideo, setActiveVideo] = useState<MediaFile | null>(null)

  // Upload/Add URL Modal State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addFolder, setAddFolder] = useState<MediaFolder>('pictures')
  const [newFileName, setNewFileName] = useState('')
  const [newFileUrl, setNewFileUrl] = useState('')
  const [newFileSize, setNewFileSize] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Handle music play/pause
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentPlayingMusic])

  // Track music progress
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const selectMusic = (track: MediaFile) => {
    if (currentPlayingMusic?.id === track.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentPlayingMusic(track)
      setIsPlaying(true)
      setCurrentTime(0)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Handle Add File Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFileName.trim() || !newFileUrl.trim()) {
      setErrorMessage('Name and URL are required.')
      return
    }

    if (!newFileUrl.startsWith('http://') && !newFileUrl.startsWith('https://') && !newFileUrl.startsWith('Resume.pdf')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS URL.')
      return
    }

    const newFile: MediaFile = {
      id: `media-${Date.now()}`,
      name: newFileName.trim(),
      url: newFileUrl.trim(),
      size: newFileSize.trim() || 'Custom URL'
    }

    setGalleryData(prev => ({
      ...prev,
      [addFolder]: [newFile, ...prev[addFolder]]
    }))

    // Reset inputs
    setNewFileName('')
    setNewFileUrl('')
    setNewFileSize('')
    setErrorMessage('')
    setIsAddOpen(false)
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`
      }
    }
    return null
  }

  return (
    <div className="h-full flex flex-col md:flex-row select-text bg-slate-50/20 dark:bg-slate-950/10">
      {/* Hidden audio element for music player */}
      {currentPlayingMusic && (
        <audio
          ref={audioRef}
          src={currentPlayingMusic.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Sidebar - Directory Tree */}
      <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50 bg-white/10 dark:bg-slate-900/10 p-4 flex flex-col gap-2 flex-shrink-0">
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Folder className="w-4 h-4 text-violet-500" />
          <span>Root Library</span>
        </div>

        {/* Directory Buttons */}
        <button
          onClick={() => setActiveFolder('documents')}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeFolder === 'documents'
              ? 'bg-violet-500/15 text-violet-650 dark:text-violet-400 border border-violet-500/20'
              : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4.5 h-4.5" />
            <span>Documents</span>
          </div>
          <span className="text-[10px] opacity-60">({galleryData.documents.length})</span>
        </button>

        <button
          onClick={() => setActiveFolder('pictures')}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeFolder === 'pictures'
              ? 'bg-violet-500/15 text-violet-650 dark:text-violet-400 border border-violet-500/20'
              : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-4.5 h-4.5" />
            <span>Pictures</span>
          </div>
          <span className="text-[10px] opacity-60">({galleryData.pictures.length})</span>
        </button>

        <button
          onClick={() => setActiveFolder('music')}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeFolder === 'music'
              ? 'bg-violet-500/15 text-violet-650 dark:text-violet-400 border border-violet-500/20'
              : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Music className="w-4.5 h-4.5" />
            <span>Music</span>
          </div>
          <span className="text-[10px] opacity-60">({galleryData.music.length})</span>
        </button>

        <button
          onClick={() => setActiveFolder('videos')}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeFolder === 'videos'
              ? 'bg-violet-500/15 text-violet-650 dark:text-violet-400 border border-violet-500/20'
              : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Video className="w-4.5 h-4.5" />
            <span>Videos</span>
          </div>
          <span className="text-[10px] opacity-60">({galleryData.videos.length})</span>
        </button>

        {/* Dynamic add button at bottom of sidebar */}
        <div className="mt-auto pt-4 border-t border-slate-200/40 dark:border-slate-800/40 hidden md:block">
          <button
            onClick={() => {
              setAddFolder(activeFolder)
              setIsAddOpen(true)
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-605 hover:bg-violet-750 text-white text-xs font-bold transition-all shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add File URL</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top action bar */}
        <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-white/5 md:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase">
            Library / {activeFolder}
          </span>
          <button
            onClick={() => {
              setAddFolder(activeFolder)
              setIsAddOpen(true)
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-650 hover:bg-violet-700 text-white text-[10px] font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add File</span>
          </button>
        </div>

        {/* Content Viewer based on selected directory */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* DOCUMENTS FOLDER */}
          {activeFolder === 'documents' && (
            <div className="space-y-3">
              {galleryData.documents.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl glass border border-white/10 dark:border-white/5 hover:border-violet-500/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-850 dark:text-slate-250">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400">{doc.size} • PDF Document</p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200/50 dark:border-slate-800/50 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* PICTURES FOLDER */}
          {activeFolder === 'pictures' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {galleryData.pictures.map(pic => (
                <motion.div
                  layoutId={`gallery-pic-${pic.id}`}
                  key={pic.id}
                  onClick={() => setSelectedPicture(pic)}
                  className="group cursor-pointer rounded-xl overflow-hidden glass border border-white/10 dark:border-white/5 hover:border-violet-500/35 hover:shadow-lg transition-all duration-300 relative aspect-video"
                >
                  <img
                    src={pic.url}
                    alt={pic.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h4 className="text-white font-bold text-sm tracking-tight">{pic.name}</h4>
                    <p className="text-white/70 text-[10px] mt-0.5">{pic.size}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* MUSIC FOLDER */}
          {activeFolder === 'music' && (
            <div className="space-y-4">
              {/* Custom Integrated Audio Player Header */}
              {currentPlayingMusic && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-transparent border border-violet-500/25 flex flex-col gap-3 shadow-sm mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-500 flex items-center justify-center animate-spin [animation-duration:10s]">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] text-violet-500 font-bold uppercase tracking-wider">Now Playing</span>
                        <h4 className="text-sm font-bold text-slate-805 dark:text-white mt-0.5">{currentPlayingMusic.name}</h4>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={e => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = parseFloat(e.target.value)
                        }
                      }}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-450">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracks List */}
              <div className="space-y-2">
                {galleryData.music.map(track => (
                  <div
                    key={track.id}
                    onClick={() => selectMusic(track)}
                    className={`p-4 rounded-xl glass border transition-all flex items-center justify-between cursor-pointer group ${
                      currentPlayingMusic?.id === track.id
                        ? 'border-violet-500/40 bg-violet-500/5'
                        : 'border-white/10 dark:border-white/5 hover:border-violet-500/25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center flex-shrink-0">
                        {currentPlayingMusic?.id === track.id && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-0.75 bg-violet-500 animate-[bounce_0.8s_infinite_100ms] h-full" />
                            <span className="w-0.75 bg-violet-500 animate-[bounce_0.8s_infinite_300ms] h-2/3" />
                            <span className="w-0.75 bg-violet-500 animate-[bounce_0.8s_infinite_500ms] h-4/5" />
                          </div>
                        ) : (
                          <Music className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{track.name}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5">{track.size}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-805 text-slate-450 group-hover:text-slate-800 dark:group-hover:text-white transition-all cursor-pointer">
                      {currentPlayingMusic?.id === track.id && isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIDEOS FOLDER */}
          {activeFolder === 'videos' && (
            <div className="space-y-6">
              {/* Active Video Player Widget */}
              {activeVideo && (
                <div className="rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-black shadow-lg">
                  <div className="aspect-video relative w-full bg-slate-950 flex items-center justify-center">
                    {getEmbedUrl(activeVideo.url) ? (
                      <iframe
                        src={getEmbedUrl(activeVideo.url)!}
                        title={activeVideo.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <video
                        key={activeVideo.id}
                        src={activeVideo.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="p-4 bg-slate-900/90 text-white flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-violet-450 font-bold uppercase tracking-wider">Active Video Screen</span>
                      <h4 className="text-sm font-bold mt-0.5">{activeVideo.name}</h4>
                    </div>
                    <button
                      onClick={() => setActiveVideo(null)}
                      className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
              )}

              {/* Videos Grid list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {galleryData.videos.map(vid => (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideo(vid)}
                    className="group cursor-pointer rounded-xl overflow-hidden glass border border-white/10 dark:border-white/5 hover:border-violet-500/35 hover:shadow-lg transition-all duration-300 relative aspect-video bg-black/40 flex items-center justify-center"
                  >
                    {/* Centered play button overlay */}
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10 shadow">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold text-xs tracking-tight">{vid.name}</h4>
                      <p className="text-white/60 text-[9px] mt-0.5">{vid.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* URL / Add File Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5 font-display">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <span>Add External File URL</span>
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Target Directory</label>
                  <select
                    value={addFolder}
                    onChange={e => setAddFolder(e.target.value as MediaFolder)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="documents">Documents</option>
                    <option value="pictures">Pictures</option>
                    <option value="music">Music</option>
                    <option value="videos">Videos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">File Name *</label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    placeholder="E.g., Ambient Coding Beats.mp3"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">File URL *</label>
                  <input
                    type="text"
                    value={newFileUrl}
                    onChange={e => setNewFileUrl(e.target.value)}
                    placeholder="https://example.com/media/file.mp3"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Estimated Size</label>
                  <input
                    type="text"
                    value={newFileSize}
                    onChange={e => setNewFileSize(e.target.value)}
                    placeholder="E.g., 5.4 MB"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-500 font-medium text-xs">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Import File Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Picture Lightbox / Fullscreen Viewer */}
      <AnimatePresence>
        {selectedPicture && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4">
            <motion.div
              layoutId={`gallery-pic-${selectedPicture.id}`}
              className="max-w-4xl w-full flex flex-col bg-slate-950/80 rounded-2xl overflow-hidden border border-white/10 relative"
            >
              <button
                onClick={() => setSelectedPicture(null)}
                className="absolute right-4 top-4 p-2 rounded-full bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedPicture.url}
                  alt={selectedPicture.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold font-display">{selectedPicture.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">{selectedPicture.size}</p>
                </div>
                <a
                  href={selectedPicture.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Original</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
