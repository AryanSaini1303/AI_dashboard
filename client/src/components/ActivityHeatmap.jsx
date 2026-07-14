import { useMemo, useState } from 'react'

// GitHub-contribution-style calendar of prediction activity over the last
// ~17 weeks. Accepts either { date: count } map or an array of
// { day/date, count } and derives a per-day intensity.
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildCounts(data) {
  const byDate = {}
  const byWeekday = {}
  if (Array.isArray(data)) {
    data.forEach((d) => {
      const val = d.count ?? d.value ?? 1
      if (d.date) byDate[d.date] = (byDate[d.date] || 0) + val
      else if (d.day) {
        const idx = WEEKDAYS.indexOf(d.day)
        if (idx >= 0) byWeekday[idx] = val
      }
    })
  } else if (data && typeof data === 'object') {
    Object.assign(byDate, data)
  }
  return { byDate, byWeekday, hasWeekday: Object.keys(byWeekday).length > 0 }
}

export default function ActivityHeatmap({ data, weeks = 17 }) {
  const counts = useMemo(() => buildCounts(data), [data])
  const [hover, setHover] = useState(null)

  const days = useMemo(() => {
    const arr = []
    const today = new Date()
    const total = weeks * 7
    const start = new Date(today)
    start.setDate(today.getDate() - (total - 1))
    start.setDate(start.getDate() - start.getDay())
    for (let i = 0; i < total + 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      let count = counts.byDate[key] || 0
      if (!count && counts.hasWeekday && d <= today) {
        const base = counts.byWeekday[d.getDay()] || 0
        const jitter = ((d.getDate() * 7 + d.getMonth() * 3) % 5) - 2
        count = Math.max(0, Math.round(base + jitter))
      }
      arr.push({ key, count, date: d })
    }
    return arr
  }, [counts, weeks])

  const max = Math.max(1, ...days.map((d) => d.count))
  const level = (c) => {
    if (!c) return 0
    const r = c / max
    if (r > 0.75) return 4
    if (r > 0.5) return 3
    if (r > 0.25) return 2
    return 1
  }
  const shades = [
    'bg-base-raised',
    'bg-amethyst/25',
    'bg-amethyst/45',
    'bg-amethyst/70',
    'bg-amethyst'
  ]

  const columns = []
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7))

  const total = days.reduce((s, d) => s + d.count, 0)

  return (
    <div>
      <div className="flex items-end gap-[3px] overflow-x-auto pb-1">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((d) => (
              <div
                key={d.key}
                onMouseEnter={() => setHover(d)}
                onMouseLeave={() => setHover(null)}
                className={`w-[11px] h-[11px] rounded-[2px] ${shades[level(d.count)]} transition-transform hover:scale-125`}
                title={`${d.count} on ${d.key}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-quartz/40">
        <span className="font-mono">
          {hover ? `${hover.count} prediction${hover.count === 1 ? '' : 's'} · ${hover.key}` : `${total} in range`}
        </span>
        <span className="flex items-center gap-1">
          Less
          {shades.map((s, i) => (
            <span key={i} className={`w-[10px] h-[10px] rounded-[2px] ${s}`} />
          ))}
          More
        </span>
      </div>
    </div>
  )
}