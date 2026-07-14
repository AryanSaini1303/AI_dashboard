import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { Activity, Zap, Cpu, MemoryStick, CheckCircle2, WifiOff } from 'lucide-react'
import { getApiHealth } from '../services/mineralService'
import { SkeletonCard } from '../components/Skeleton'

const REFRESH_MS = 15000

function Sparkline({ data, color, dataKey = 'v' }) {
  if (data.length < 2) return <div className="h-8" />
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data}>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function StatStrip({ label, value, accent, icon: Icon, spark, color }) {
  const accentMap = { amethyst: 'text-amethyst', malachite: 'text-malachite', pyrite: 'text-pyrite', garnet: 'text-garnet' }
  return (
    <div className="facet glass glass-hover border border-base-line p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-quartz/50">{label}</p>
        {Icon && <Icon size={16} className="text-quartz/40" />}
      </div>
      <p className={`font-display text-fluid-stat font-semibold mt-2 ${accentMap[accent]}`}>{value}</p>
      {spark && <div className="mt-2"><Sparkline data={spark} color={color} /></div>}
    </div>
  )
}

export default function ApiHealth() {
  const [health, setHealth] = useState(null)
  const [latHistory, setLatHistory] = useState([])
  const [samples, setSamples] = useState({ online: 0, total: 0 })
  const [incidents, setIncidents] = useState([])
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000)
  const lastStatus = useRef(null)

  useEffect(() => {
    let mounted = true
    async function poll() {
      const h = await getApiHealth()
      if (!mounted) return
      setHealth(h)
      setLatHistory((prev) => [...prev.slice(-23), { v: h.latencyMs }])
      setSamples((s) => ({ online: s.online + (h.status === 'online' ? 1 : 0), total: s.total + 1 }))
      if (lastStatus.current !== null && lastStatus.current !== h.status) {
        setIncidents((prev) => [{ status: h.status, at: Date.now() }, ...prev].slice(0, 8))
      }
      lastStatus.current = h.status
      setCountdown(REFRESH_MS / 1000)
    }
    poll()
    const id = setInterval(poll, REFRESH_MS)
    const tick = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => { mounted = false; clearInterval(id); clearInterval(tick) }
  }, [])

  if (!health) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1400px]">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const online = health.status === 'online'
  const uptime = samples.total ? (samples.online / samples.total) * 100 : (online ? 100 : 0)
  const ring = `conic-gradient(#2E8B67 ${uptime}%, #2C3036 ${uptime}% 100%)`

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Status banner + live indicator */}
      <div className={`facet glass border p-5 flex flex-wrap items-center justify-between gap-4 ${online ? 'border-base-line' : 'border-garnet/50 bg-garnet/10'}`}>
        <div className="flex items-center gap-3">
          {online ? (
            <span className="relative flex w-3 h-3">
              <span className="absolute inline-flex w-full h-full rounded-full bg-malachite opacity-60 pulse-live" />
              <span className="relative inline-flex rounded-full w-3 h-3 bg-malachite" />
            </span>
          ) : (
            <WifiOff size={20} className="text-garnet" />
          )}
          <div>
            <p className={`font-display text-lg font-semibold ${online ? 'text-malachite' : 'text-garnet'}`}>
              {online ? 'All systems operational' : 'Inference service offline'}
            </p>
            <p className="text-xs text-quartz/50">Live status of the ml-service inference endpoint</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-quartz/50 font-mono">
          <span className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#2C3036" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#8B6FD1" strokeWidth="3"
                strokeDasharray={2 * Math.PI * 15}
                strokeDashoffset={2 * Math.PI * 15 * (countdown / (REFRESH_MS / 1000))}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
          </span>
          refresh in {countdown}s
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uptime ring */}
        <div className="facet glass border border-base-line p-5 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 rounded-full" style={{ background: ring }}>
            <div className="absolute inset-[6px] rounded-full bg-base-panel flex flex-col items-center justify-center">
              <span className="font-display text-xl font-semibold text-malachite">{uptime.toFixed(1)}%</span>
              <span className="text-[10px] text-quartz/40">uptime</span>
            </div>
          </div>
          <p className="text-xs text-quartz/50 mt-3 font-mono">{samples.total} checks this session</p>
        </div>

        <StatStrip label="Latency" value={`${health.latencyMs} ms`} accent="amethyst" icon={Zap} spark={latHistory} color="#8B6FD1" />
        <StatStrip label="Model loaded" value={health.modelLoaded ? 'Yes' : 'No'} accent={health.modelLoaded ? 'malachite' : 'garnet'} icon={Activity} />
        <StatStrip label="Status" value={online ? 'Online' : 'Offline'} accent={online ? 'malachite' : 'garnet'} icon={Activity} />
        <StatStrip label="GPU" value={health.gpu ? 'Enabled' : 'CPU only'} accent="pyrite" icon={Cpu} />
        <StatStrip label="RAM usage" value={`${health.ramGb} GB`} accent="malachite" icon={MemoryStick} />
      </div>

      {/* Incident timeline */}
      <div className="facet glass border border-base-line p-5">
        <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4">Incident timeline</p>
        {incidents.length === 0 ? (
          <p className="text-sm text-quartz/40 inline-flex items-center gap-2">
            <CheckCircle2 size={16} className="text-malachite" /> No incidents recorded this session.
          </p>
        ) : (
          <ol className="space-y-3">
            {incidents.map((inc, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className={`w-2 h-2 rounded-full ${inc.status === 'online' ? 'bg-malachite' : 'bg-garnet'}`} />
                <span className={inc.status === 'online' ? 'text-malachite' : 'text-garnet'}>
                  {inc.status === 'online' ? 'Service recovered' : 'Service went offline'}
                </span>
                <span className="font-mono text-xs text-quartz/40 ml-auto">{new Date(inc.at).toLocaleTimeString()}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
