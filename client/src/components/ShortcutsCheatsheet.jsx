import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Open command palette' },
  { keys: ['Ctrl', 'K'], label: 'Open command palette (Windows)' },
  { keys: ['?'], label: 'Show this shortcuts sheet' },
  { keys: ['G', 'then', 'D'], label: 'Go to Identify' },
  { keys: ['Esc'], label: 'Close any overlay' },
  { keys: ['Tab'], label: 'Move focus forward' }
]

export default function ShortcutsCheatsheet() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable
      if (e.key === '?' && !typing) {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    function onEvt() {
      setOpen(true)
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('mv:shortcuts', onEvt)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('mv:shortcuts', onEvt)
    }
  }, [])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[92] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative glass facet border border-base-line w-full max-w-md p-6 shadow-elev-3"
            role="dialog"
            aria-label="Keyboard shortcuts"
          >
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-quartz/40 hover:text-quartz" aria-label="Close">
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-5">
              <Keyboard size={18} className="text-amethyst" />
              <h2 className="font-display text-lg font-semibold">Keyboard shortcuts</h2>
            </div>
            <ul className="space-y-3">
              {SHORTCUTS.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-quartz/70">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, i) =>
                      k === 'then' ? (
                        <span key={i} className="text-xs text-quartz/40">then</span>
                      ) : (
                        <kbd
                          key={i}
                          className="font-mono text-xs bg-base-raised border border-base-line rounded px-2 py-1 min-w-[26px] text-center"
                        >
                          {k}
                        </kbd>
                      )
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
