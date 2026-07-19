import React, { useRef, useState, useEffect } from 'react'
import { motion, useDragControls, useMotionValue } from 'framer-motion'
import { useOS } from '../context/OSContext'
import type { WindowState } from '../context/OSContext'
import { X, Minus, Square, Minimize2, Move } from 'lucide-react'

interface WindowProps {
  windowState: WindowState
  children: React.ReactNode
  containerRef: React.RefObject<HTMLDivElement | null>
}

export const Window: React.FC<WindowProps> = ({ windowState, children, containerRef }) => {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow
  } = useOS()

  const { id, title, isOpen, isMinimized, isMaximized, zIndex, minW = 300, minH = 200 } = windowState

  const windowRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)

  // Window size and position state (for non-maximized states)
  const [size, setSize] = useState({ w: windowState.w, h: windowState.h })
  const [position, setPosition] = useState({ x: windowState.x, y: windowState.y })

  // Focus window on mount or when clicking inside
  const handleMouseDown = () => {
    if (activeWindowId !== id) {
      focusWindow(id)
    }
  }

  // Handle Resize Mouse Events
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    focusWindow(id)

    const startWidth = size.w
    const startHeight = size.h
    const startX = e.clientX
    const startY = e.clientY

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      setSize({
        w: Math.max(minW, startWidth + deltaX),
        h: Math.max(minH, startHeight + deltaY)
      })
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // Listen for keyboard shortcut: Escape to close start menu or Alt + W to close active window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeWindowId === id) {
        if (e.altKey && e.key.toLowerCase() === 'w') {
          e.preventDefault()
          closeWindow(id)
        }
        if (e.altKey && e.key.toLowerCase() === 'm') {
          e.preventDefault()
          minimizeWindow(id)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeWindowId, id, closeWindow, minimizeWindow])

  if (!isOpen) return null

  const isFocused = activeWindowId === id

  return (
    <motion.div
      ref={windowRef}
      onMouseDown={handleMouseDown}
      initial={false}
      animate={
        isMinimized
          ? { opacity: 0, scale: 0.8, y: 150, pointerEvents: 'none' }
          : isMaximized
          ? {
              opacity: 1,
              scale: 1,
              left: 0,
              top: 0,
              width: '100%',
              height: 'calc(100% - 48px)', // Subtract taskbar height
              pointerEvents: 'auto'
            }
          : {
              opacity: 1,
              scale: 1,
              left: position.x,
              top: position.y,
              width: size.w,
              height: size.h,
              pointerEvents: 'auto'
            }
      }
      style={{ x: dragX, y: dragY, zIndex }}
      transition={{
        default: { type: 'spring', stiffness: 220, damping: 25, mass: 0.8 }
      }}
      drag={!isMaximized}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={containerRef}
      dragElastic={0.02}
      dragMomentum={false}
      onDragEnd={() => {
        const dx = dragX.get()
        const dy = dragY.get()

        setPosition(prev => {
          let newX = prev.x + dx
          let newY = prev.y + dy

          // Prevent top title bar from being dragged off the screen
          if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth
            const containerHeight = containerRef.current.clientHeight

            // Keep at least 150px of the window width visible on screen
            newX = Math.max(150 - size.w, Math.min(containerWidth - 150, newX))
            // Keep title bar within the vertical workspace bounds
            newY = Math.max(0, Math.min(containerHeight - 100, newY))
          }

          return { x: newX, y: newY }
        })

        // Reset motion values so that the new left/top states hold positioning
        dragX.set(0)
        dragY.set(0)
      }}
      className={`absolute rounded-xl overflow-hidden shadow-2xl flex flex-col glass border transition-shadow duration-300 ${
        isFocused
          ? 'ring-1 ring-violet-500/20 shadow-violet-500/5 border-white/20 dark:border-white/10'
          : 'border-white/10 dark:border-white/5 opacity-90'
      }`}
    >
      {/* Title Bar */}
      <div
        onDoubleClick={() => toggleMaximizeWindow(id)}
        onPointerDown={(e) => {
          focusWindow(id)
          dragControls.start(e)
        }}
        className="h-10 px-4 flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/30 bg-slate-100/40 dark:bg-slate-900/40 cursor-default select-none flex-shrink-0"
      >
        {/* Windows-like OS Control Dots on Left */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => closeWindow(id)}
            className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center group cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button
            onClick={() => minimizeWindow(id)}
            className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center group cursor-pointer transition-colors"
            title="Minimize"
          >
            <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => toggleMaximizeWindow(id)}
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center group group-hover:scale-100 cursor-pointer transition-colors"
            title="Maximize"
          >
            {isMaximized ? (
              <Minimize2 className="w-2 h-2 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Square className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>

        {/* Window Title */}
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide font-sans">
          {title}
        </span>

        {/* Utility Icon */}
        <Move className="w-3.5 h-3.5 text-slate-400 opacity-30 pointer-events-none" />
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden bg-slate-50/90 dark:bg-[#131722]/95 relative">
        {children}
      </div>

      {/* Resize Handle (only show when not maximized) */}
      {!isMaximized && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize z-50 flex items-end justify-end p-0.5"
        >
          {/* Subtle resize grid marker */}
          <div className="w-1.5 h-1.5 border-r border-b border-slate-400 dark:border-slate-500 rounded-br-sm opacity-50" />
        </div>
      )}
    </motion.div>
  )
}
