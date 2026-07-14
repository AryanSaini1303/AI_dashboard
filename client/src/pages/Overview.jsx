import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import {
  Layers, CalendarClock, Target, Cpu, ScanSearch, GitCompareArrows, Activity, WifiOff, ArrowRight
} from 'lucide-react'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import ActivityHeatmap from '../components/ActivityHeatmap'
import { Stagger, Rise } from '../components/motion'
import { SkeletonCard, SkeletonChart } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { getStats, getApiHealth } from '../services/mineralService'
import { CHART_COLORS, tooltipStyle, gridStroke, axisStyle } from '../components/chartTheme'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-quartz/70">{payload[0].value} predictions</p>
    </div>
  )
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <p className="font-semibold">{payload[0].name}: {payload[0].value}</p>
    </div>
  )
}

export default function Overview() {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const [stats, setStats] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const notifiedRef = useRef(false)

  useEffect(() => {
    Promise.all([getStats(), getApiHealth()]).then(([s, h]) => {
      setStats(s)
      setHealth(h)
      setLoading(false)
      if (!notifiedRef.current && h?.status !== 'online') {
        notifiedRef.current = true
        notify({ title: 'Inference service degraded', message: 'API health check did not report online.', variant: 'warning' })
      }
    })
  }, [notify])

  const name = (user?.email || 'there').split('@')[0]
  const online = health?.status === 'online'

  const dailyPredictions = stats?.dailyPredictions || []
  const mineralDistribution = stats?.mineralDistribution || []
  const totalPredictions = stats?.totalPredictions ?? 0
  const hasData = totalPredictions > 0

  return (
    <Stagger className="space-y-6 max-w-[1400px]">
      {/* Greeting + quick actions */}
      <Rise className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-quartz/50">{greeting()},</p>
          <h2 className="font-display text-fluid-hero font-semibold capitalize">{name}</h2>
          <p className="text-sm text-quartz/50 mt-1">
            {hasData
              ? `${totalPredictions.toLocaleString()} samples identified so far.`
              : 'No samples identified yet — start by uploading one.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/detect" className="specular facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold px-4 py-2.5 text-sm inline-flex items-center gap-2 transition-colors">
            <ScanSearch size={16} /> Identify a sample
          </Link>
          <Link to="/compare" className="facet-sm border border-base-line hover:border-amethyst/60 px-4 py-2.5 text-sm inline-flex items-center gap-2 transition-colors">
            <GitCompareArrows size={16} /> Compare
          </Link>
        </div>
      </Rise>

      {/* Loud offline banner */}
      {!loading && !online && (
        <Rise className="facet border border-garnet/50 bg-garnet/10 p-4 flex items-center gap-3">
          <WifiOff size={20} className="text-garnet shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-garnet">Inference service is offline</p>
            <p className="text-xs text-quartz/60">Predictions are running on cached demo data. Check the ML service.</p>
          </div>
          <Link to="/health" className="text-xs facet-sm border border-garnet/40 text-garnet px-3 py-1.5 hover:bg-garnet/10">
            View health
          </Link>
        </Rise>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <SkeletonCard className="lg:col-span-2 lg:row-span-2" />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Hero stat */}
          <Rise className="col-span-2 lg:row-span-2">
            <StatCard
              variant="hero"
              label="Model accuracy"
              value={stats?.accuracy != null ? `${stats.accuracy}%` : '—'}
              accent="pyrite"
              icon={Target}
              trend={stats?.accuracy != null ? { direction: 'up', value: '+1.2% vs last model', good: true } : undefined}
              className="h-full"
            >
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-quartz/50 mb-3">Prediction activity</p>
                <ActivityHeatmap data={dailyPredictions} weeks={14} />
              </div>
            </StatCard>
          </Rise>

          <Rise><StatCard label="Total predictions" value={totalPredictions.toLocaleString()} accent="amethyst" icon={Layers} /></Rise>
          <Rise><StatCard label="Today's uploads" value={stats?.todaysUploads ?? 0} accent="malachite" icon={CalendarClock} /></Rise>

          <Rise className="col-span-2">
            <StatCard
              label="Active model"
              value={stats?.activeModel || '—'}
              accent="amethyst"
              icon={Cpu}
              sub="switch in Model Management"
            >
              <Link to="/model" className="text-xs text-amethyst inline-flex items-center gap-1 hover:gap-2 transition-all mt-1">
                Manage <ArrowRight size={12} />
              </Link>
            </StatCard>
          </Rise>

          {/* Trend chart */}
          <Rise className="col-span-2">
            <div className="facet glass border border-base-line p-5 h-full">
              <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4">Predictions this week</p>
              {hasData ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyPredictions}>
                    <defs>
                      <linearGradient id="ovArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C86B3C" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#C86B3C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="day" {...axisStyle} />
                    <YAxis {...axisStyle} />
                    <Tooltip content={<AreaTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#C86B3C" strokeWidth={2} fill="url(#ovArea)" animationDuration={800} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={Activity} title="No trend data yet" message="Your weekly prediction volume will appear here." action={{ to: '/detect', label: 'Identify your first sample' }} />
              )}
            </div>
          </Rise>

          {/* Distribution donut */}
          <Rise className="col-span-2">
            <div className="facet glass border border-base-line p-5 h-full">
              <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4">Mineral distribution</p>
              {mineralDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={mineralDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={2} animationDuration={800}>
                      {mineralDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#1D2024" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12, color: '#ECE7DD99' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={Layers} title="No distribution yet" message="Identify samples to see which minerals appear most." />
              )}
            </div>
          </Rise>
        </Stagger>
      )}
    </Stagger>
  )
}