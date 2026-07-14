import { motion, useReducedMotion } from 'framer-motion'

// A low-poly faceted crystal rendered in SVG. It slowly rotates (freezes
// under prefers-reduced-motion) and doubles as its own static fallback —
// no WebGL, so it can never blank the page. A true react-three-fiber gem
// can be swapped in behind a lazy boundary later without changing callers.
export default function CrystalHero({ size = 220, system = 'Trigonal' }) {
  const reduce = useReducedMotion()

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* glow */}
      <div className="absolute inset-0 mesh-amethyst blur-2xl opacity-60" />
      <motion.div
        className="relative"
        style={{ transformStyle: 'preserve-3d', perspective: 600 }}
        animate={reduce ? {} : { rotateY: 360 }}
        transition={reduce ? {} : { duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          animate={reduce ? {} : { y: [0, -8, 0] }}
          transition={reduce ? {} : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <defs>
            <linearGradient id="cf1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B9A6EC" />
              <stop offset="100%" stopColor="#5B4A8A" />
            </linearGradient>
            <linearGradient id="cf2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B6FD1" />
              <stop offset="100%" stopColor="#3A2F5C" />
            </linearGradient>
            <linearGradient id="cf3" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#6E58AE" />
              <stop offset="100%" stopColor="#2A2340" />
            </linearGradient>
          </defs>
          {/* crown */}
          <polygon points="100,18 62,70 100,64" fill="url(#cf1)" />
          <polygon points="100,18 138,70 100,64" fill="url(#cf2)" />
          <polygon points="62,70 100,64 100,88 68,88" fill="url(#cf2)" />
          <polygon points="138,70 100,64 100,88 132,88" fill="url(#cf1)" />
          {/* girdle line */}
          <polygon points="62,70 68,88 132,88 138,70 100,88" fill="url(#cf3)" opacity="0.9" />
          {/* pavilion */}
          <polygon points="68,88 100,88 100,182" fill="url(#cf2)" />
          <polygon points="132,88 100,88 100,182" fill="url(#cf1)" />
          <polygon points="62,70 68,88 100,182" fill="url(#cf3)" opacity="0.85" />
          <polygon points="138,70 132,88 100,182" fill="url(#cf3)" opacity="0.7" />
          {/* highlight */}
          <polygon points="100,18 62,70 100,64" fill="#ECE7DD" opacity="0.18" />
        </motion.svg>
      </motion.div>
      <span className="absolute bottom-1 text-[10px] font-mono text-quartz/40 tracking-wide">
        {system.toUpperCase()} SYSTEM
      </span>
    </div>
  )
}
