import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Skeleton } from './Skeleton'

const accentMap = {
  amethyst: 'text-amethyst',
  malachite: 'text-malachite',
  pyrite: 'text-pyrite',
  garnet: 'text-garnet'
}

export default function StatCard({
  label,
  value,
  accent = 'amethyst',
  sub,
  icon: Icon,
  trend,
  variant = 'default',
  loading = false,
  children,
  className = ''
}) {
  const valueSize =
    variant === 'hero'
      ? 'text-fluid-hero'
      : variant === 'mini'
      ? 'text-lg'
      : 'text-fluid-stat'

  const pad = variant === 'mini' ? 'p-3' : variant === 'hero' ? 'p-5' : 'p-4'

  if (loading) {
    return (
      <div className={`facet glass border border-base-line ${pad} ${className}`}>
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-7 w-28 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    )
  }

  const isEmpty = value === 0 || value === '0' || value == null || value === '—'

  const trendUp = trend && trend.direction === 'up'
  const trendColor = trend
    ? trend.good === false
      ? trendUp
        ? 'text-garnet'
        : 'text-malachite'
      : trendUp
      ? 'text-malachite'
      : 'text-garnet'
    : ''

  return (
    <div className={`facet glass glass-hover specular border border-base-line ${pad} flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-quartz/50">{label}</p>
        {Icon && <Icon size={15} className="text-quartz/40 shrink-0" strokeWidth={1.75} />}
      </div>
      <p className={`font-display ${valueSize} font-semibold ${isEmpty ? 'text-quartz/30' : accentMap[accent]} mt-1.5`}>
        {value}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        {trend && !isEmpty && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-mono ${trendColor}`}>
            {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {trend.value}
          </span>
        )}
        {sub && <p className="text-xs text-quartz/40 font-mono">{sub}</p>}
      </div>
      {children && <div className="mt-2.5">{children}</div>}
    </div>
  )
}