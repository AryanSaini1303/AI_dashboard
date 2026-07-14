import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ScanSearch,
  GitCompareArrows,
  BarChart3,
  History as HistoryIcon,
  Box,
  Activity,
  Settings as SettingsIcon,
  Truck
} from 'lucide-react'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/detect', label: 'Mineral Identification', icon: ScanSearch },
  { to: '/weighbridge', label: 'Weighbridge AI', icon: Truck },
  { to: '/compare', label: 'Compare Samples', icon: GitCompareArrows },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  // { to: '/history', label: 'Prediction History', icon: HistoryIcon },
  // { to: '/model', label: 'Model Management', icon: Box, admin: true },
  // { to: '/health', label: 'API Health', icon: Activity },
  // { to: '/settings', label: 'Settings', icon: SettingsIcon }
]

function NavItem({ link, onNavigate }) {
  const Icon = link.icon
  return (
    <NavLink
      to={link.to}
      end={link.end}
      onClick={onNavigate}
      data-tour={link.to === '/detect' ? 'detect' : link.to === '/settings' ? 'settings' : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
          isActive
            ? 'text-quartz bg-amethyst/10'
            : 'text-quartz/55 hover:text-quartz hover:bg-base-raised/60'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute left-0 top-1 bottom-1 w-[3px] bg-amethyst rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            />
          )}
          <Icon
            size={17}
            strokeWidth={1.9}
            className={isActive ? 'text-amethyst' : 'text-quartz/45 group-hover:text-quartz/80'}
          />
          <span className="flex-1">{link.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  const content = (
    <>
      <div className="h-16 flex items-center gap-2 px-5 border-b border-base-line shrink-0">
        <span className="w-2.5 h-2.5 bg-amethyst facet-sm" />
        <span className="font-display font-semibold tracking-tight text-lg">
          Mineral<span className="text-amethyst">Vision</span>
        </span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map((l) => (
          <NavItem key={l.to} link={l} onNavigate={onClose} />
        ))}
      </nav>
      <div className="p-4 border-t border-base-line text-xs text-quartz/40 font-mono shrink-0">
        v2.0 · SqueezeNet1.1
      </div>
    </>
  )

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-base-panel border-r border-base-line flex-col">
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-64 bg-base-panel border-r border-base-line flex flex-col transition-transform duration-300 ease-mv-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  )
}