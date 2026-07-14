import { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  ScanSearch,
  GitCompareArrows,
  BarChart3,
  History as HistoryIcon,
  Box,
  Activity,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Moon,
  Keyboard
} from 'lucide-react'
import { getHistory } from '../services/mineralService'
import { applyTheme } from '../services/theme'

const PaletteContext = createContext(null)
export function useCommandPalette() {
  return useContext(PaletteContext) || { open: false, setOpen: () => {} }
}

const ROUTES = [
  { label: 'Overview', to: '/', icon: LayoutDashboard, kw: 'home dashboard' },
  { label: 'Identify Mineral', to: '/detect', icon: ScanSearch, kw: 'detect predict upload' },
  { label: 'Compare Samples', to: '/compare', icon: GitCompareArrows, kw: 'compare two' },
  { label: 'Analytics', to: '/analytics', icon: BarChart3, kw: 'charts trends' },
  { label: 'Prediction History', to: '/history', icon: HistoryIcon, kw: 'log records' },
  { label: 'Model Management', to: '/model', icon: Box, kw: 'swap upload model' },
  { label: 'API Health', to: '/health', icon: Activity, kw: 'status uptime' },
  { label: 'Settings', to: '/settings', icon: SettingsIcon, kw: 'preferences config' }
]

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open && history.length === 0) {
      getHistory().then((h) => setHistory(Array.isArray(h) ? h.slice(0, 8) : []))
    }
  }, [open, history.length])

  function run(fn) {
    setOpen(false)
    setTimeout(fn, 60)
  }

  function setTheme(theme) {
    localStorage.setItem('mv_theme', theme)
    applyTheme(theme)
  }

  return (
    <PaletteContext.Provider value={{ open, setOpen }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[95] flex items-start justify-center pt-[12vh] px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -6 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative w-full max-w-xl"
              >
                <Command
                  label="Command palette"
                  className="glass facet border border-base-line shadow-elev-3 overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-4 border-b border-base-line">
                    <Sparkles size={16} className="text-amethyst" />
                    <Command.Input
                      autoFocus
                      placeholder="Search actions, pages, history…"
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-quartz/40"
                    />
                    <kbd className="text-[10px] font-mono text-quartz/40 border border-base-line rounded px-1.5 py-0.5">
                      ESC
                    </kbd>
                  </div>
                  <Command.List className="max-h-[52vh] overflow-y-auto p-2">
                    <Command.Empty className="py-8 text-center text-sm text-quartz/40">
                      No results found.
                    </Command.Empty>

                    <Command.Group heading="Actions" className="text-[10px] uppercase tracking-wide text-quartz/40 px-2 py-1">
                      <Item icon={ScanSearch} onSelect={() => run(() => navigate('/detect'))}>
                        Identify a sample
                      </Item>
                      <Item icon={GitCompareArrows} onSelect={() => run(() => navigate('/compare'))}>
                        Compare samples
                      </Item>
                      <Item icon={Sun} onSelect={() => run(() => setTheme('light'))}>
                        Switch to light theme
                      </Item>
                      <Item icon={Moon} onSelect={() => run(() => setTheme('dark'))}>
                        Switch to dark theme
                      </Item>
                      <Item
                        icon={Keyboard}
                        onSelect={() => run(() => window.dispatchEvent(new CustomEvent('mv:shortcuts')))}
                      >
                        Show keyboard shortcuts
                      </Item>
                    </Command.Group>

                    <Command.Group heading="Go to" className="text-[10px] uppercase tracking-wide text-quartz/40 px-2 py-1">
                      {ROUTES.map((r) => (
                        <Item
                          key={r.to}
                          icon={r.icon}
                          keywords={[r.kw]}
                          onSelect={() => run(() => navigate(r.to))}
                        >
                          {r.label}
                        </Item>
                      ))}
                    </Command.Group>

                    {history.length > 0 && (
                      <Command.Group heading="Recent predictions" className="text-[10px] uppercase tracking-wide text-quartz/40 px-2 py-1">
                        {history.map((h) => (
                          <Item
                            key={h.id}
                            icon={HistoryIcon}
                            keywords={[h.prediction || '']}
                            onSelect={() => run(() => navigate('/history'))}
                          >
                            <span className="flex-1">{h.prediction || 'Unknown'}</span>
                            <span className="font-mono text-xs text-quartz/40">
                              {h.confidence != null ? `${Math.round(h.confidence * 100)}%` : ''}
                            </span>
                          </Item>
                        ))}
                      </Command.Group>
                    )}
                  </Command.List>
                </Command>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </PaletteContext.Provider>
  )
}

function Item({ icon: Icon, children, onSelect, keywords }) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-quartz/80 cursor-pointer data-[selected=true]:bg-amethyst/15 data-[selected=true]:text-quartz aria-selected:bg-amethyst/15"
    >
      {Icon && <Icon size={16} className="text-quartz/50" />}
      {children}
    </Command.Item>
  )
}
