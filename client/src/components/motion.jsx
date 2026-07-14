import { motion, useReducedMotion } from 'framer-motion'

// Shared motion tokens so every animated surface uses the same physics.
export const EASE_OUT = [0.22, 1, 0.36, 1]
export const EASE_SPRING = [0.34, 1.56, 0.64, 1]

// A container that staggers its children in on mount. Children should be
// <Rise> items. Respects prefers-reduced-motion (framer-motion collapses
// durations to ~0 automatically, but we also drop the y-offset).
export function Stagger({ children, className, gap = 0.04, ...rest }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap } }
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function Rise({ children, className, delay = 0, ...rest }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 10 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: EASE_OUT, delay }
        }
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

// Page-level wrapper: fades + rises content on route change.
export function PageTransition({ children, className }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

export { motion, useReducedMotion }
