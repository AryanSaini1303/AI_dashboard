import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const NotificationContext = createContext(null)
const STORAGE_KEY = 'mv_notifications'

// Persistent activity log (distinct from transient toasts). Surfaces system
// events — model swaps, low-confidence predictions, health changes — that a
// user can review later from the Topbar bell.
export function NotificationProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)))
    } catch {
      /* ignore quota */
    }
  }, [items])

  const notify = useCallback(({ title, message, variant = 'info' } = {}) => {
    setItems((prev) => [
      { id: Date.now() + Math.random(), title, message, variant, ts: Date.now(), read: false },
      ...prev
    ])
  }, [])

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const unread = items.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider value={{ items, notify, markAllRead, clear, unread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  return (
    ctx || { items: [], notify: () => {}, markAllRead: () => {}, clear: () => {}, unread: 0 }
  )
}
