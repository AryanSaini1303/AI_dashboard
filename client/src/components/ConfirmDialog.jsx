import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

// Focus-trapping modal for destructive / high-impact confirmations.
// Closes on Escape and backdrop click; returns focus discipline via portal.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  children
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => panelRef.current?.querySelector('[data-autofocus]')?.focus(), 30)
    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative glass facet border border-base-line w-full max-w-md p-6 shadow-elev-3"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-quartz/40 hover:text-quartz"
            >
              <X size={18} />
            </button>
            <div className="flex items-start gap-3">
              {danger && (
                <div className="facet-sm border border-garnet/40 bg-garnet/10 w-10 h-10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-garnet" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold text-quartz">{title}</h2>
                {message && <p className="text-sm text-quartz/60 mt-1.5">{message}</p>}
              </div>
            </div>

            {children && <div className="mt-4">{children}</div>}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="facet-sm border border-base-line px-4 py-2 text-sm hover:bg-base-raised transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                data-autofocus
                onClick={() => {
                  onConfirm?.()
                  onClose?.()
                }}
                className={`facet-sm px-4 py-2 text-sm font-semibold text-base transition-colors ${
                  danger ? 'bg-garnet hover:bg-garnet/90' : 'bg-amethyst hover:bg-amethyst/90'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// Visually isolates destructive actions per the danger-zone convention.
export function DangerZone({ title = 'Danger zone', description, children }) {
  return (
    <div className="facet border border-garnet/40 bg-garnet/5 p-5">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle size={15} className="text-garnet" />
        <h3 className="font-display text-sm font-semibold text-garnet uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {description && <p className="text-xs text-quartz/50 mb-4">{description}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  )
}
