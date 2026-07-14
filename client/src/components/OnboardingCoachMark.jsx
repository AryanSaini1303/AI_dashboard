import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ScanSearch, Command, Settings as SettingsIcon, Sparkles, X } from 'lucide-react'

const KEY = 'mv_onboarded'

const STEPS = [
  {
    selector: '[data-tour="detect"]',
    icon: ScanSearch,
    title: 'Identify a sample',
    body: 'Start here. Upload a mineral photo and the model returns a classification with confidence and reasoning.'
  },
  {
    selector: '[data-tour="search"]',
    icon: Command,
    title: 'Command palette',
    body: 'Press ⌘K (or Ctrl+K) anywhere to jump between pages, run actions, and search your prediction history.'
  },
  {
    selector: '[data-tour="settings"]',
    icon: SettingsIcon,
    title: 'Make it yours',
    body: 'Set your confidence threshold, point the app at your backend, and switch themes in Settings.'
  }
]

function useTargetRect(selector, step) {
  const [rect, setRect] = useState(null)
  useLayoutEffect(() => {
    function measure() {
      const el = document.querySelector(selector)
      setRect(el ? el.getBoundingClientRect() : null)
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [selector, step])
  return rect
}

export default function OnboardingCoachMark() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(KEY)) setActive(true)
    }, 700)
    return () => clearTimeout(t)
  }, [])

  const current = STEPS[step]
  const rect = useTargetRect(current?.selector, step)

  function finish() {
    localStorage.setItem(KEY, '1')
    setActive(false)
  }

  if (!active || !current) return null

  // Fall back to a centered card if the target isn't on screen (e.g. mobile
  // drawer collapsed) so the tour never points at nothing.
  const pad = 8
  const hasRect = rect && rect.width > 0
  const spotlight = hasRect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null

  const tipTop = hasRect ? Math.min(rect.bottom + 14, window.innerHeight - 200) : window.innerHeight / 2 - 90
  const tipLeft = hasRect ? Math.min(Math.max(rect.left, 16), window.innerWidth - 336) : window.innerWidth / 2 - 160

  const Icon = current.icon

  return createPortal(
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[97]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {/* Spotlight: transparent hole via giant box-shadow */}
        {spotlight ? (
          <motion.div
            layout
            className="absolute facet-sm pointer-events-none"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
              outline: '2px solid rgba(139,111,209,0.8)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/70" />
        )}

        {/* Tooltip card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute glass facet border border-base-line w-80 p-4 shadow-elev-3"
          style={{ top: tipTop, left: tipLeft }}
        >
          <button onClick={finish} className="absolute top-3 right-3 text-quartz/40 hover:text-quartz" aria-label="Skip tour">
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="facet-sm bg-amethyst/15 border border-amethyst/30 w-8 h-8 flex items-center justify-center">
              <Icon size={16} className="text-amethyst" />
            </div>
            <span className="text-[10px] font-mono text-quartz/40">STEP {step + 1} / {STEPS.length}</span>
          </div>
          <h3 className="font-display font-semibold text-quartz flex items-center gap-1.5">
            {current.title} {step === 0 && <Sparkles size={14} className="text-amethyst" />}
          </h3>
          <p className="text-sm text-quartz/60 mt-1">{current.body}</p>

          <div className="flex items-center justify-between mt-4">
            <button onClick={finish} className="text-xs text-quartz/50 hover:text-quartz">Skip tour</button>
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="facet-sm border border-base-line px-3 py-1.5 text-xs hover:bg-base-raised">
                  Back
                </button>
              )}
              <button
                onClick={() => (step === STEPS.length - 1 ? finish() : setStep((s) => s + 1))}
                className="facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold px-3 py-1.5 text-xs"
              >
                {step === STEPS.length - 1 ? 'Got it' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
