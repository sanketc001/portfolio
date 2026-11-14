import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOS } from '../../context/OSContext'
import { SKIN_NAMES } from '../../system/detect'
import { greetingFor } from '../../system/hooks'
import portfolioData from '../../data/portfolioData.json'

const BOOT_MS = 2400

/**
 * One greeting per browser session: says what was detected and why the desktop
 * looks the way it does, then dissolves into it. Any click or key skips it.
 */
export const BootScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { system, os, osOverride } = useOS()
  const profile = portfolioData.profile
  const firstName = profile.name.split(' ')[0]

  useEffect(() => {
    const timer = setTimeout(onDone, BOOT_MS)
    window.addEventListener('keydown', onDone)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onDone)
    }
  }, [onDone])

  const browser = `${system.browserName}${system.browserVersion ? ' ' + system.browserVersion : ''}`
  const reason = osOverride
    ? `Wearing the ${SKIN_NAMES[os]} look you picked.`
    : system.os
      ? `Dressed to match ${browser} on ${system.osLabel}.`
      : `Couldn't tell which system you're on, so this is the ${SKIN_NAMES[os]} look. Settings has the others.`

  return (
    <motion.div
      onClick={onDone}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 z-[200000] flex flex-col items-center justify-center text-center px-8 text-white bg-black/45 backdrop-blur-3xl cursor-pointer"
      role="status"
    >
      <img
        src={profile.avatar}
        alt=""
        className="boot-line w-20 h-20 rounded-full object-cover ring-1 ring-white/30 shadow-2xl"
        style={{ animationDelay: '0.05s' }}
      />
      <h1
        className="boot-line font-display text-4xl sm:text-5xl font-semibold tracking-tight mt-7"
        style={{ animationDelay: '0.2s' }}
      >
        {greetingFor(new Date())}.
      </h1>
      <p className="boot-line text-base sm:text-lg text-white/85 mt-3" style={{ animationDelay: '0.4s' }}>
        This is {firstName}'s desktop. Have a look around.
      </p>
      <p className="boot-line text-sm text-white/60 mt-2 max-w-md" style={{ animationDelay: '0.65s' }}>
        {reason}
      </p>
      <div className="boot-line mt-9 w-40 h-[3px] rounded-full bg-white/15 overflow-hidden" style={{ animationDelay: '0.8s' }}>
        <motion.div
          className="h-full rounded-full bg-white/85"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: (BOOT_MS - 500) / 1000, ease: 'easeInOut', delay: 0.3 }}
        />
      </div>
    </motion.div>
  )
}
