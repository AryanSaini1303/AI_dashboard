import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X, Undo2 } from 'lucide-react'

const ToastContext = createContext(null)

const VARIANTS = {
  success: { icon: CheckCircle2, color: 'text-malachite', ring: 'border-malachite/40' },
  warning: { icon: AlertTriangle, color: 'text-pyrite', ring: 'border-pyrite/40' },
  error: { icon: XCircle, color: 'text-garnet', ring: 'border-garnet/40' },
  info: { icon: Info, color: 'text-amethyst', ring: 'border-amethyst/40' }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, message, variant = 'info', duration = 4000, action } = {}) => {
      const id = ++idRef.current
      setToasts((t) => [...t, { id, title, message, variant, action }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]">
        <AnimatePresence>
          {toasts.map((t) => {
            const v = VARIANTS[t.variant] || VARIANTS.info
            const Icon = v.icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`glass facet-sm border ${v.ring} p-3 pr-2 flex items-start gap-3`}
                role="status"
              >
                <Icon size={18} className={`${v.color} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  {t.title && <p className="text-sm font-medium text-quartz">{t.title}</p>}
                  {t.message && <p className="text-xs text-quartz/60 mt-0.5">{t.message}</p>}
                  {t.action && (
                    <button
                      onClick={() => {
                        t.action.onClick?.()
                        dismiss(t.id)
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amethyst hover:underline"
                    >
                      <Undo2 size={13} /> {t.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="text-quartz/40 hover:text-quartz p-0.5"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  return ctx || { toast: () => {}, dismiss: () => {} }
}
