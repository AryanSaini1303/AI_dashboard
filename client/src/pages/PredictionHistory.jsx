import { Fragment, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, Download, Trash2, ChevronDown, ArrowUpDown, Rows3, Rows4, SlidersHorizontal
} from 'lucide-react'
import { getHistory, deleteHistoryItem } from '../services/mineralService'
import { SkeletonRow } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'

const CLASSES = ['Calcite', 'Granite', 'Limestone']

function breakdown(row) {
  const conf = (row.confidence || 0) / 100
  const rest = (1 - conf) / (CLASSES.length - 1)
  return CLASSES.map((c) => ({ mineral: c, value: c === row.prediction ? conf : rest }))
}

export default function PredictionHistory() {
  const { toast } = useToast()
  const [items, setItems] = useState(null)
  const [search, setSearch] = useState('')
  const [mineral, setMineral] = useState('all')
  const [minConf, setMinConf] = useState(0)
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' })
  const [dense, setDense] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    getHistory().then((data) => setItems(data?.items || []))
  }, [])

  const minerals = useMemo(
    () => ['all', ...new Set((items || []).map((i) => i.prediction).filter(Boolean))],
    [items]
  )

  const filtered = useMemo(() => {
    if (!items) return []
    const q = search.toLowerCase()
    const out = items.filter((i) => {
      const pred = (i.prediction || '').toLowerCase()
      const img = (i.image || '').toLowerCase()
      const matchesQ = pred.includes(q) || img.includes(q)
      const matchesM = mineral === 'all' || i.prediction === mineral
      const matchesC = (i.confidence || 0) >= minConf
      return matchesQ && matchesM && matchesC
    })
    out.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      const av = a[sort.key], bv = b[sort.key]
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
    return out
  }, [items, search, mineral, minConf, sort])

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))
  }

  function handleDelete(row) {
    const prev = items
    setItems((p) => p.filter((i) => i.id !== row.id))
    toast({
      title: 'Prediction deleted',
      message: `${row.prediction} · ${row.image}`,
      variant: 'info',
      duration: 6000,
      action: { label: 'Undo', onClick: () => setItems(prev) }
    })
    deleteHistoryItem(row.id)
  }

  function downloadCsv() {
    const header = 'Date,Image,Prediction,Confidence,Time(ms)\n'
    const rows = filtered.map((i) => `${i.date},${i.image},${i.prediction},${i.confidence},${i.timeMs}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mineralvision-history.csv'
    a.click()
    toast({ title: 'History exported', variant: 'success' })
  }

  const pad = dense ? 'py-1.5' : 'py-3'
  const hasItems = items && items.length > 0
  const hasFilters = search || mineral !== 'all' || minConf > 0

  const SortTh = ({ label, k }) => (
    <th className="py-2 pr-4">
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-quartz">
        {label} <ArrowUpDown size={12} className={sort.key === k ? 'text-amethyst' : 'text-quartz/30'} />
      </button>
    </th>
  )

  return (
    <div className="facet glass border border-base-line p-5 max-w-[1400px]">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-quartz/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by mineral or filename…"
            className="w-full bg-base border border-base-line rounded pl-9 pr-3 py-2 text-sm focus:border-amethyst outline-none" />
        </div>
        <button onClick={() => setShowFilters((s) => !s)}
          className={`facet-sm border px-3 py-2 text-sm inline-flex items-center gap-1.5 transition-colors ${showFilters || hasFilters ? 'border-amethyst/60 text-amethyst' : 'border-base-line hover:border-amethyst/60'}`}>
          <SlidersHorizontal size={14} /> Filters
        </button>
        <button onClick={() => setDense((d) => !d)} title="Toggle density"
          className="facet-sm border border-base-line px-3 py-2 text-sm inline-flex items-center gap-1.5 hover:border-amethyst/60">
          {dense ? <Rows4 size={15} /> : <Rows3 size={15} />} {dense ? 'Compact' : 'Comfortable'}
        </button>
        <button onClick={downloadCsv} className="facet-sm border border-base-line px-3 py-2 text-sm inline-flex items-center gap-1.5 hover:border-amethyst/60">
          <Download size={14} /> CSV
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="flex flex-wrap gap-6 pb-4 mb-2 border-b border-base-line">
              <div>
                <label className="block text-xs uppercase tracking-wide text-quartz/50 mb-1.5">Mineral</label>
                <select value={mineral} onChange={(e) => setMineral(e.target.value)}
                  className="bg-base border border-base-line rounded px-3 py-1.5 text-sm focus:border-amethyst outline-none">
                  {minerals.map((m) => <option key={m} value={m}>{m === 'all' ? 'All minerals' : m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-quartz/50 mb-1.5">
                  Min confidence: <span className="font-mono text-amethyst">{minConf}%</span>
                </label>
                <input type="range" min={0} max={100} value={minConf} onChange={(e) => setMinConf(Number(e.target.value))} className="accent-amethyst w-48" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!items ? (
        <div>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}</div>
      ) : !hasItems ? (
        <EmptyState title="No predictions yet" message="Every sample you identify will be logged here with its confidence and timing." action={{ to: '/detect', label: 'Identify your first sample' }} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-quartz/50 border-b border-base-line">
                <th className="py-2 pr-4 w-6"></th>
                <SortTh label="Date" k="date" />
                <th className="py-2 pr-4">Image</th>
                <SortTh label="Prediction" k="prediction" />
                <SortTh label="Confidence" k="confidence" />
                <SortTh label="Time" k="timeMs" />
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-base-line/60 hover:bg-base-raised/40 cursor-pointer" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                    <td className={`${pad} pr-2`}>
                      <ChevronDown size={14} className={`text-quartz/40 transition-transform ${expanded === row.id ? 'rotate-180' : ''}`} />
                    </td>
                    <td className={`${pad} pr-4 font-mono text-quartz/70`}>{row.date}</td>
                    <td className={`${pad} pr-4`}>{row.image}</td>
                    <td className={`${pad} pr-4 text-amethyst font-medium`}>{row.prediction}</td>
                    <td className={`${pad} pr-4 font-mono`}>
                      <span className={row.confidence < 80 ? 'text-pyrite' : 'text-quartz'}>{row.confidence}%</span>
                    </td>
                    <td className={`${pad} pr-4 font-mono text-quartz/60`}>{row.timeMs}ms</td>
                    <td className={`${pad} pr-4 text-right`}>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(row) }} className="text-quartz/40 hover:text-garnet p-1" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                  {expanded === row.id && (
                    <tr>
                      <td colSpan={7} className="bg-base-raised/30 px-6 py-4">
                        <p className="text-xs uppercase tracking-wide text-quartz/50 mb-3">Probability breakdown</p>
                        <div className="space-y-2 max-w-md">
                          {breakdown(row).map((p) => (
                            <div key={p.mineral}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className={p.mineral === row.prediction ? 'text-quartz' : 'text-quartz/60'}>{p.mineral}</span>
                                <span className="font-mono text-quartz/60">{Math.round(p.value * 100)}%</span>
                              </div>
                              <div className="h-1.5 bg-base rounded overflow-hidden">
                                <div className={p.mineral === row.prediction ? 'h-full bg-amethyst' : 'h-full bg-amethyst/40'} style={{ width: `${p.value * 100}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-quartz/40">
                    No predictions match your filters.
                    <button onClick={() => { setSearch(''); setMineral('all'); setMinConf(0) }} className="text-amethyst ml-2 hover:underline">Clear filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
