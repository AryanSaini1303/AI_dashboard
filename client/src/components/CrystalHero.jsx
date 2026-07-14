import { useEffect, useRef } from 'react'

export default function CrystalHero({ size = 220, system = 'Trigonal' }) {
  const prefersReduced = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size + 40 }}>
      <style>{`
        @keyframes crystalFloat {
          0%   { transform: translateY(0px)   scaleX(1);    }
          25%  { transform: translateY(-8px)  scaleX(0.82); }
          50%  { transform: translateY(-12px) scaleX(1);    }
          75%  { transform: translateY(-8px)  scaleX(1.18); }
          100% { transform: translateY(0px)   scaleX(1);    }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes glowPulseOuter {
          0%, 100% { opacity: 0.4; transform: scale(0.97); }
          50%       { opacity: 0.9; transform: scale(1.03); }
        }
        .crystal-svg-anim {
          animation: ${prefersReduced.current ? 'none' : 'crystalFloat 6s ease-in-out infinite'};
          filter: drop-shadow(0 0 18px #7c5cbf88) drop-shadow(0 0 6px #b9a6ec66);
        }
        .crystal-glow-inner {
          animation: ${prefersReduced.current ? 'none' : 'glowPulse 3s ease-in-out infinite'};
        }
        .crystal-glow-outer {
          animation: ${prefersReduced.current ? 'none' : 'glowPulseOuter 3s ease-in-out infinite 0.5s'};
        }
      `}</style>

      {/* outer glow */}
      <div
        className="crystal-glow-outer"
        style={{
          position: 'absolute',
          width: size * 1.3,
          height: size * 1.3,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #b9a6ec22 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* inner glow */}
      <div
        className="crystal-glow-inner"
        style={{
          position: 'absolute',
          width: size * 0.85,
          height: size * 0.85,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #7c5cbf55 0%, #5b4a8a33 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* crystal */}
      <svg
        className="crystal-svg-anim"
        width={size}
        height={size}
        viewBox="0 0 200 210"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 2 }}
      >
        <defs>
          <linearGradient id="cg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4C8F5" />
            <stop offset="100%" stopColor="#6B52B0" />
          </linearGradient>
          <linearGradient id="cg2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B84DC" />
            <stop offset="100%" stopColor="#3A2F6A" />
          </linearGradient>
          <linearGradient id="cg3" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#7A62C2" />
            <stop offset="100%" stopColor="#241D45" />
          </linearGradient>
          <linearGradient id="cg4" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#C4B5EE" />
            <stop offset="100%" stopColor="#8B73D4" />
          </linearGradient>
          <linearGradient id="cg5" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4B3A8A" />
            <stop offset="100%" stopColor="#1E1838" />
          </linearGradient>
        </defs>

        {/* crown facets */}
        <polygon points="100,16 56,72 100,62" fill="url(#cg1)" opacity="0.95" />
        <polygon points="100,16 144,72 100,62" fill="url(#cg2)" opacity="0.95" />

        {/* upper girdle */}
        <polygon points="56,72 100,62 100,90 64,90" fill="url(#cg2)" opacity="0.88" />
        <polygon points="144,72 100,62 100,90 136,90" fill="url(#cg1)" opacity="0.88" />

        {/* girdle band */}
        <polygon points="56,72 64,90 136,90 144,72" fill="url(#cg4)" opacity="0.7" />

        {/* pavilion */}
        <polygon points="64,90 100,90 100,194" fill="url(#cg2)" opacity="0.92" />
        <polygon points="136,90 100,90 100,194" fill="url(#cg1)" opacity="0.92" />
        <polygon points="56,72 64,90 100,194" fill="url(#cg5)" opacity="0.82" />
        <polygon points="144,72 136,90 100,194" fill="url(#cg3)" opacity="0.75" />

        {/* culet tip glow */}
        <ellipse cx="100" cy="194" rx="5" ry="3" fill="#C4B5EE" opacity="0.5" />

        {/* highlights */}
        <polygon points="100,16 56,72 100,62" fill="#F0ECF8" opacity="0.22" />
        <polygon points="80,58 100,16 120,58 100,62" fill="#ffffff" opacity="0.12" />

        {/* girdle sheen lines */}
        <line x1="56" y1="72" x2="144" y2="72" stroke="#D4C8F5" strokeWidth="0.8" opacity="0.5" />
        <line x1="64" y1="90" x2="136" y2="90" stroke="#9B84DC" strokeWidth="0.5" opacity="0.4" />
      </svg>

      {/* system label */}
      <span style={{
        position: 'absolute',
        bottom: 0,
        fontSize: 10,
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        color: 'var(--text-muted, #888)',
        textTransform: 'uppercase',
        zIndex: 3,
        userSelect: 'none',
      }}>
        {system.toUpperCase()} SYSTEM
      </span>
    </div>
  )
}