import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

// A "mineral growth" confidence readout: confidence fills a faceted crystal
// outline bottom-up. On mount it animates 0 → value with a count-up label,
// and high-confidence results finish with a light-sweep across the facet.
export default function ConfidenceFacet({ value = 0, size = 96, highThreshold = 0.85 }) {
  const target = Math.round(value * 100)
  const [display, setDisplay] = useState(0)
  const [filled, setFilled] = useState(false)
  const reduce = useReducedMotion()
  const rafRef = useRef()

  const isHigh = value >= highThreshold

  useEffect(() => {
    if (reduce) {
      setDisplay(target)
      setFilled(true)
      return
    }
    setDisplay(0)
    setFilled(false)
    const start = performance.now()
    const dur = 900
    const raise = requestAnimationFrame(() => setFilled(true))
    function tick(now) {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * target))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      cancelAnimationFrame(raise)
    }
  }, [target, reduce])

  const color = isHigh ? 'from-malachite to-malachite/40' : target >= 60 ? 'from-amethyst to-amethyst/40' : 'from-pyrite to-pyrite/40'

  return (
    <div
      className={`relative facet border border-base-line bg-base-raised overflow-hidden ${
        isHigh && filled ? 'specular' : ''
      }`}
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={target}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Confidence ${target} percent`}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${color}`}
        style={{
          height: filled ? `${target}%` : '0%',
          transition: reduce ? 'none' : 'height 900ms cubic-bezier(0.22,1,0.36,1)'
        }}
      />
      {isHigh && filled && (
        <span className="absolute inset-0 pointer-events-none animate-fade bg-[linear-gradient(120deg,transparent,rgba(236,231,221,0.18),transparent)]" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono font-semibold text-lg drop-shadow">{display}%</span>
      </div>
    </div>
  )
}
