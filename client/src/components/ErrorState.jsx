import { CloudOff, RotateCw } from 'lucide-react'

// Standardized error pattern for failed API calls / unreachable services.
// Distinct from the total-outage demo-mode fallback.
export default function ErrorState({
  icon: Icon = CloudOff,
  title = "Couldn't load this",
  message = 'Something went wrong reaching the service. Check your connection and try again.',
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      <div className="facet-lg border border-garnet/40 bg-garnet/5 w-16 h-16 flex items-center justify-center mb-4">
        <Icon size={26} className="text-garnet" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-base font-semibold text-quartz">{title}</h3>
      <p className="text-sm text-quartz/50 mt-1.5 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 facet-sm border border-base-line hover:border-amethyst/60 px-4 py-2 text-sm inline-flex items-center gap-2 transition-colors"
        >
          <RotateCw size={14} /> Try again
        </button>
      )}
    </div>
  )
}
