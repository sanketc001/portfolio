import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOS, DYNAMIC_WALLPAPER } from '../../context/OSContext'
import { useNow, dayPhase } from '../../system/hooks'

/**
 * Backdrop for both shells. The animated layer takes its colours from the active
 * skin and a tint from the visitor's local time of day; a chosen photo fades in over it.
 */
export const Wallpaper: React.FC = () => {
  const { wallpaper } = useOS()
  const now = useNow()
  const isPhoto = wallpaper !== DYNAMIC_WALLPAPER

  return (
    <div className="absolute inset-0 -z-20 pointer-events-none" aria-hidden="true">
      <div className="wp" data-phase={dayPhase(now)}>
        {!isPhoto && (
          <>
            <div className="wp-blob wp-blob-a" />
            <div className="wp-blob wp-blob-b" />
            <div className="wp-blob wp-blob-c" />
            <div className="wp-tint" />
          </>
        )}
      </div>
      <AnimatePresence>
        {isPhoto && (
          <motion.div
            key={wallpaper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
