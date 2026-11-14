import React, { useRef, useState, useEffect } from 'react'
import { motion, useDragControls, useMotionValue } from 'framer-motion'
import { useOS } from '../context/OSContext'
import type { WindowState } from '../context/OSContext'
import { X, Minus, Square, Copy, Maximize2, Minimize2 } from 'lucide-react'
import { AppIcon } from '../apps'
import { appById } from '../appRegistry'
import { TourBar } from '../components/Common/TourBar'
import { TOUR_STEPS } from '../tour'

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
    toggleMaximizeWindow,
    os,
    insets,
    tourStep,
    nextTourStep,
    skipTour
  } = useOS()

  const { id, title, isOpen, isMinimized, isMaximized, zIndex, minW = 300, minH = 200 } = windowState

  const windowRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)

  // Window size and position state (for non-maximized states)
  const [size, setSize] = useState({ w: windowState.w, h: windowState.h })
  const [position, setPosition] = useState({ x: windowState.x, y: windowState.y })

  // When the window manager re-centres this window (e.g. on re-open), adopt the new rect.
  const rectKey = `${windowState.x},${windowState.y},${windowState.w},${windowState.h}`
  const [appliedRectKey, setAppliedRectKey] = useState(rectKey)
  if (rectKey !== appliedRectKey) {
    setAppliedRectKey(rectKey)
    setSize({ w: windowState.w, h: windowState.h })
    setPosition({ x: windowState.x, y: windowState.y })
  }

  // Keep the window inside the workspace when the browser is resized. Runs a frame
  // late so it also settles the drag offsets after the drag layer has re-measured.
  useEffect(() => {
    const onResize = () => {
      requestAnimationFrame(() => {
        dragX.set(0)
        dragY.set(0)
        setPosition(prev => ({
          x: Math.max(insets.left, Math.min(prev.x, window.innerWidth - 160)),
          y: Math.max(insets.top, Math.min(prev.y, window.innerHeight - insets.bottom - 60))
        }))
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [dragX, dragY, insets])

  // Track mode transition (maximize/minimize) to disable spring animations during manual drags
  const prevMaximized = useRef(isMaximized)
  const prevMinimized = useRef(isMinimized)
  const [isTransitioningMode, setIsTransitioningMode] = useState(false)

  useEffect(() => {
    if (prevMaximized.current !== isMaximized || prevMinimized.current !== isMinimized) {
      setIsTransitioningMode(true)
      const timer = setTimeout(() => setIsTransitioningMode(false), 450)
      prevMaximized.current = isMaximized
      prevMinimized.current = isMinimized
      return () => clearTimeout(timer)
    }
  }, [isMaximized, isMinimized])

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

  const app = appById(id)
  const closeTitle = tourStep !== null && TOUR_STEPS[tourStep]?.id === id ? 'Close (continues the tour)' : 'Close'
  // Title-bar buttons must not start a window drag.
  const noDrag = (e: React.PointerEvent) => e.stopPropagation()

  const isFocused = activeWindowId === id
  const isTourWindow = tourStep !== null && TOUR_STEPS[tourStep]?.id === id

  return (
    <motion.div
      ref={windowRef}
      onMouseDown={handleMouseDown}
      role="dialog"
      aria-label={title}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={
        isMinimized
          ? os === 'linux'
            ? { opacity: 0, scale: 0.6, x: -220, pointerEvents: 'none' }
            : { opacity: 0, scale: 0.5, y: 320, pointerEvents: 'none' }
          : isMaximized
          ? {
              opacity: 1,
              scale: 1,
              // Explicit so the minimise offset is animated back out on restore
              x: 0,
              y: 0,
              left: insets.left,
              top: insets.top,
              width: `calc(100% - ${insets.left}px)`,
              height: `calc(100% - ${insets.top + insets.bottom}px)`,
              pointerEvents: 'auto'
            }
          : {
              opacity: 1,
              scale: 1,
              // Explicit so the minimise offset is animated back out on restore
              x: 0,
              y: 0,
              left: position.x,
              top: position.y,
              width: size.w,
              height: size.h,
              pointerEvents: 'auto'
            }
      }
      style={{ x: dragX, y: dragY, zIndex }}
      transition={
        isTransitioningMode
          ? { default: { type: 'spring', stiffness: 220, damping: 25, mass: 0.8 } }
          : {
              opacity: { type: 'spring', stiffness: 220, damping: 25 },
              scale: { type: 'spring', stiffness: 220, damping: 25 },
              left: { duration: 0 },
              top: { duration: 0 },
              width: { duration: 0 },
              height: { duration: 0 }
            }
      }
      drag={!isMaximized}
      dragListener={false}
      dragControls={dragControls}
      // No ref constraints: the drag layer re-measures them mid open-animation and
      // shoves the window into a corner. Bounds are enforced in onDragEnd instead.
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
            newY = Math.max(insets.top, Math.min(containerHeight - insets.bottom - 60, newY))
          }

          return { x: newX, y: newY }
        })

        // Reset motion values so that the new left/top states hold positioning
        dragX.set(0)
        dragY.set(0)
      }}
      className={`absolute overflow-hidden flex flex-col glass transition-shadow duration-300 ${
        isMaximized ? 'rounded-none' : 'rounded-[var(--win-radius)]'
      } ${isFocused ? '' : '!shadow-lg'}`}
    >
      {/* Title bar, laid out the way the active skin does it */}
      <div
        onDoubleClick={() => toggleMaximizeWindow(id)}
        onPointerDown={e => {
          focusWindow(id)
          dragControls.start(e)
        }}
        className={`relative flex items-center flex-shrink-0 cursor-default select-none text-[var(--bar-ink)] ${
          os === 'windows' ? 'h-9 pl-3' : os === 'macos' ? 'h-9 px-3.5' : 'h-10 px-2.5'
        }`}
      >
        {os === 'macos' && (
          <div className="group flex gap-2 items-center" onPointerDown={noDrag}>
            {[
              { label: 'Close window', title: closeTitle, on: () => closeWindow(id), color: 'bg-[#ff5f57]', Glyph: X },
              { label: 'Minimize window', title: 'Minimize', on: () => minimizeWindow(id), color: 'bg-[#febc2e]', Glyph: Minus },
              {
                label: isMaximized ? 'Restore window' : 'Maximize window',
                title: isMaximized ? 'Restore' : 'Maximize',
                on: () => toggleMaximizeWindow(id),
                color: 'bg-[#28c840]',
                Glyph: isMaximized ? Minimize2 : Maximize2
              }
            ].map(b => (
              <button
                key={b.label}
                type="button"
                onClick={b.on}
                title={b.title}
                aria-label={b.label}
                className={`w-3 h-3 rounded-full flex items-center justify-center cursor-default border border-black/10 ${
                  isFocused ? b.color : 'bg-current/20'
                }`}
              >
                <b.Glyph className="w-2 h-2 text-black/60 stroke-[3] opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}

        {os === 'windows' ? (
          <span className={`flex items-center gap-2 text-xs ${isFocused ? '' : 'opacity-55'}`}>
            {app && <AppIcon app={app} size={16} className="!shadow-none" />}
            {title}
          </span>
        ) : (
          <span
            className={`absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold pointer-events-none whitespace-nowrap ${
              isFocused ? 'opacity-85' : 'opacity-45'
            }`}
          >
            {title}
          </span>
        )}

        {os === 'windows' && (
          <div className="ml-auto flex self-stretch" onPointerDown={noDrag}>
            <button type="button" onClick={() => minimizeWindow(id)} title="Minimize" aria-label="Minimize window" className="w-[46px] flex items-center justify-center hover:bg-current/10 cursor-default transition-colors">
              <Minus className="w-4 h-4 stroke-[1.25]" />
            </button>
            <button type="button" onClick={() => toggleMaximizeWindow(id)} title={isMaximized ? 'Restore' : 'Maximize'} aria-label={isMaximized ? 'Restore window' : 'Maximize window'} className="w-[46px] flex items-center justify-center hover:bg-current/10 cursor-default transition-colors">
              {isMaximized ? <Copy className="w-3 h-3 stroke-[1.5] -scale-x-100" /> : <Square className="w-3 h-3 stroke-[1.5]" />}
            </button>
            <button type="button" onClick={() => closeWindow(id)} title={closeTitle} aria-label="Close window" className="w-[46px] flex items-center justify-center hover:bg-[#c42b1c] hover:text-white cursor-default transition-colors">
              <X className="w-4 h-4 stroke-[1.25]" />
            </button>
          </div>
        )}

        {os === 'linux' && (
          <div className="ml-auto flex items-center gap-2" onPointerDown={noDrag}>
            <button type="button" onClick={() => minimizeWindow(id)} title="Minimize" aria-label="Minimize window" className="w-6 h-6 rounded-full flex items-center justify-center bg-current/10 hover:bg-current/20 cursor-pointer transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => toggleMaximizeWindow(id)} title={isMaximized ? 'Restore' : 'Maximize'} aria-label={isMaximized ? 'Restore window' : 'Maximize window'} className="w-6 h-6 rounded-full flex items-center justify-center bg-current/10 hover:bg-current/20 cursor-pointer transition-colors">
              {isMaximized ? <Copy className="w-3 h-3 -scale-x-100" /> : <Square className="w-3 h-3" />}
            </button>
            <button type="button" onClick={() => closeWindow(id)} title={closeTitle} aria-label="Close window" className="w-6 h-6 rounded-full flex items-center justify-center bg-current/10 hover:bg-current/20 cursor-pointer transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden surface border-t border-[var(--glass-border)] relative">
        {children}
      </div>

      {/* Guided tour footer (only on the current tour window) */}
      {isTourWindow && tourStep !== null && (
        <TourBar step={tourStep} onNext={nextTourStep} onSkip={skipTour} />
      )}

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
