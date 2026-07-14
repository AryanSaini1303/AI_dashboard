import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'

// Reusable empty state: mesh-lit faceted icon + context copy + optional CTA.
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message,
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="relative facet-lg mesh-amethyst border border-base-line w-20 h-20 flex items-center justify-center mb-5">
        <div className="absolute inset-0 facet-lg bg-amethyst/10 animate-pulse" />
        <Icon size={30} className="relative text-amethyst" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-semibold text-quartz">{title}</h3>
      {message && <p className="text-sm text-quartz/50 mt-1.5 max-w-xs">{message}</p>}
      {action &&
        (action.to ? (
          <Link
            to={action.to}
            className="mt-5 facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold px-4 py-2 text-sm transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-5 facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold px-4 py-2 text-sm transition-colors"
          >
            {action.label}
          </button>
        ))}
    </div>
  )
}