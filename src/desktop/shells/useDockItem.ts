import { useOS } from '../../context/OSContext'

/** Shared taskbar / dock behaviour: open, focus, or minimise depending on the window's state. */
export function useDockItem() {
  const { windows, activeWindowId, openWindow, minimizeWindow, focusWindow } = useOS()

  const stateOf = (id: string) => {
    const win = windows.find(w => w.id === id)
    const isOpen = !!win?.isOpen
    return { isOpen, isActive: isOpen && !win?.isMinimized && activeWindowId === id }
  }

  const activate = (id: string) => {
    const win = windows.find(w => w.id === id)
    if (!win) return
    if (!win.isOpen) openWindow(id)
    else if (win.isMinimized) focusWindow(id)
    else if (activeWindowId === id) minimizeWindow(id)
    else focusWindow(id)
  }

  return { stateOf, activate }
}
