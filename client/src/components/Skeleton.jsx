// Shimmer skeletons shaped like the real content they stand in for.
export function Skeleton({ className = '' }) {
  return <div className={`skeleton facet-sm ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`facet glass border border-base-line p-5 ${className}`}>
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function SkeletonChart({ height = 220 }) {
  return (
    <div className="facet glass border border-base-line p-5">
      <Skeleton className="h-3 w-40 mb-4" />
      <div className="skeleton facet-sm w-full" style={{ height }} />
    </div>
  )
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-base-line">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
  )
}
