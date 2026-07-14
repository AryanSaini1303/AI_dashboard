/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#161311',
          panel: '#1F1B18',
          raised: '#2A2420',
          line: '#3A322C'
        },
        quartz: '#F3EAE0',
        amethyst: {
          DEFAULT: '#C86B3C',
          dim: '#7A4126',
          bright: '#E88C55'
        },
        malachite: {
          DEFAULT: '#4A7856',
          dim: '#2E4B36',
          bright: '#6FA47D'
        },
        pyrite: {
          DEFAULT: '#E0A458',
          dim: '#8C6835',
          bright: '#F0C084'
        },
        garnet: {
          DEFAULT: '#A8433C',
          dim: '#6B2B26',
          bright: '#D46258'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      fontSize: {
        'fluid-title': ['clamp(1.15rem, 0.9rem + 1.1vw, 1.6rem)', { lineHeight: '1.15' }],
        'fluid-hero': ['clamp(2rem, 1.3rem + 3.2vw, 3.4rem)', { lineHeight: '1.05' }],
        'fluid-stat': ['clamp(1.6rem, 1.1rem + 2vw, 2.6rem)', { lineHeight: '1.1' }]
      },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(0,0,0,0.35)',
        'elev-2': '0 8px 22px -6px rgba(0,0,0,0.6)',
        'elev-3': '0 20px 54px -12px rgba(0,0,0,0.7)',
        'glow-amethyst': '0 0 0 1px rgba(200,107,60,0.4), 0 10px 34px -8px rgba(200,107,60,0.5)',
        'glow-malachite': '0 0 0 1px rgba(74,120,86,0.4), 0 10px 34px -8px rgba(74,120,86,0.5)',
        'glow-pyrite': '0 0 0 1px rgba(224,164,88,0.4), 0 10px 34px -8px rgba(224,164,88,0.5)',
        'glow-garnet': '0 0 0 1px rgba(168,67,60,0.4), 0 10px 34px -8px rgba(168,67,60,0.5)'
      },
      transitionTimingFunction: {
        'mv-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'mv-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      },
      clipPath: {
        facet: 'polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)'
      }
    }
  },
  plugins: []
}