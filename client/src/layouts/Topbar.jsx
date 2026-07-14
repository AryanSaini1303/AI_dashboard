import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, Bell, LogOut, CheckCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useCommandPalette } from '../components/CommandPalette'

const dotColor = {
  success: 'bg-malachite',
  warning: 'bg-pyrite',
  error: 'bg-garnet',
  info: 'bg-amethyst'
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function roleBadge(role) {
  if (role === 'admin') return { label: 'Admin', cls: 'text-amethyst border-amethyst/40 bg-amethyst/10' }
  if (role === 'researcher') return { label: 'Researcher', cls: 'text-pyrite border-pyrite/40 bg-pyrite/10' }
  return null
}

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user, logout } = useAuth()
  const { items, unread, markAllRead, clear } = useNotifications()
  const { setOpen } = useCommandPalette()
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)

  const email = user?.email || 'demo@mineralvision.ai'
  const initials = email.slice(0, 2).toUpperCase()
  const badge = roleBadge(user?.role)

  useEffect(() => {
    function onClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  return (
    <header className="h-16 shrink-0 border-b border-base-line flex items-center justify-between px-4 sm:px-6 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-quartz/70 hover:text-quartz"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-fluid-title font-semibold truncate">{title}</h1>
          {subtitle && <p className="text-xs text-quartz/50 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command palette trigger */}
        <button
          onClick={() => setOpen(true)}
          data-tour="search"
          className="hidden sm:flex items-center gap-2 facet-sm border border-base-line px-3 py-1.5 text-xs text-quartz/50 hover:border-amethyst/50 hover:text-quartz/80 transition-colors"
        >
          <Search size={14} />
          <span>Search…</span>
          <kbd className="font-mono text-[10px] border border-base-line rounded px-1">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </button>
        <button
          onClick={() => setOpen(true)}
          className="sm:hidden p-2 text-quartz/70 hover:text-quartz"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => {
              setBellOpen((o) => !o)
              if (!bellOpen) markAllRead()
            }}
            className="relative p-2 text-quartz/70 hover:text-quartz"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-amethyst text-[10px] font-mono text-base flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 mt-2 w-80 glass facet border border-base-line shadow-elev-3 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-base-line">
                  <span className="text-sm font-medium">Activity</span>
                  {items.length > 0 && (
                    <button onClick={clear} className="text-xs text-quartz/50 hover:text-quartz">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <CheckCheck size={22} className="text-quartz/30 mx-auto mb-2" />
                      <p className="text-sm text-quartz/40">You're all caught up.</p>
                    </div>
                  ) : (
                    items.map((n) => (
                      <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-base-line/60 last:border-0">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotColor[n.variant] || dotColor.info}`} />
                        <div className="min-w-0">
                          <p className="text-sm text-quartz/85">{n.title}</p>
                          {n.message && <p className="text-xs text-quartz/50 mt-0.5">{n.message}</p>}
                          <p className="text-[10px] font-mono text-quartz/35 mt-1">{timeAgo(n.ts)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="hidden md:flex items-center gap-2">
          {badge && (
            <span className={`text-[10px] font-medium uppercase tracking-wide border rounded px-1.5 py-0.5 ${badge.cls}`}>
              {badge.label}
            </span>
          )}
          <div className="w-8 h-8 facet-sm bg-amethyst/15 border border-amethyst/30 flex items-center justify-center">
            <span className="font-mono text-xs text-amethyst">{initials}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 text-quartz/60 hover:text-garnet transition-colors"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
