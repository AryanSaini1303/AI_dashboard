import { useEffect, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Brush, ReferenceLine,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList
} from 'recharts'
import { BarChart3, Calendar } from 'lucide-react'
import { getStats } from '../services/mineralService'
import { Stagger, Rise } from '../components/motion'
import { SkeletonChart } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ActivityHeatmap from '../components/ActivityHeatmap'
import { CHART_COLORS, tooltipStyle, gridStroke, axisStyle } from '../components/chartTheme'

const RANGES = [
  { id: '7', label: '7 days' },
  { id: '30', label: '30 days' },
  { id: '90', label: '90 days' },
  { id: 'all', label: 'All time' }
]

function Panel({ title, children, className = '', action }) {
  return (
    <div className={`facet glass border border-base-line p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-wide text-quartz/50">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [range, setRange] = useState('30')

  useEffect(() => {
    getStats().then(setStats)
  }, [])

  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-[1400px]">
        <SkeletonChart />
        <SkeletonChart />
        <SkeletonChart />
      </div>
    )
  }

  const predictionCounts = stats.predictionCounts || []
  const mineralDistribution = stats.mineralDistribution || []
  const dailyPredictions = stats.dailyPredictions || []
  const accuracyTrend = stats.accuracyTrend || []
  const empty = predictionCounts.length === 0 && mineralDistribution.length === 0

  if (empty) {
    return (
      <div className="facet glass border border-base-line max-w-[1400px]">
        <EmptyState icon={BarChart3} title="No analytics yet" message="Once you start identifying samples, trends and distributions will appear here." action={{ to: '/detect', label: 'Identify a sample' }} />
      </div>
    )
  }

  const rangeControl = (
    <div className="flex facet-sm border border-base-line p-0.5">
      {RANGES.map((r) => (
        <button key={r.id} onClick={() => setRange(r.id)}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${range === r.id ? 'bg-amethyst text-base' : 'text-quartz/50 hover:text-quartz'}`}>
          {r.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* <div className="flex items-center justify-between">
        <p className="text-sm text-quartz/50 inline-flex items-center gap-2"><Calendar size={15} /> Showing {RANGES.find((r) => r.id === range)?.label.toLowerCase()}</p>
        {rangeControl}
      </div> */}

      <Stagger className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Hero: accuracy trend with model-swap annotation + brush */}
        <Rise className="lg:col-span-4">
          <Panel title="Accuracy trend" className="h-full">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={accuracyTrend} margin={{ top: 8, right: 12 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="week" {...axisStyle} />
                <YAxis domain={[88, 100]} {...axisStyle} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                {accuracyTrend.length > 2 && (
                  <ReferenceLine x={accuracyTrend[Math.floor(accuracyTrend.length / 2)]?.week}
                    stroke="#D4A72C" strokeDasharray="4 4"
                    label={{ value: 'model swap', fill: '#D4A72C', fontSize: 10, position: 'top' }} />
                )}
                <Line type="monotone" dataKey="accuracy" stroke="#D4A72C" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
                {accuracyTrend.length > 6 && <Brush dataKey="week" height={20} stroke="#8B6FD1" fill="#1D2024" travellerWidth={8} />}
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </Rise>

        {/* Distribution donut with direct labels */}
        <Rise className="lg:col-span-3">
          <Panel title="Distribution" className="h-full">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={mineralDistribution} dataKey="value" nameKey="name" outerRadius={90} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false} animationDuration={800}>
                  {mineralDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#1D2024" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        </Rise>

        {/* Prediction count by mineral */}
        <Rise className="lg:col-span-3">
          <Panel title="Prediction count by mineral" className="h-full">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={predictionCounts}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" {...axisStyle} />
                <YAxis {...axisStyle} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="count" fill="#8B6FD1" radius={[4, 4, 0, 0]} animationDuration={800}>
                  <LabelList dataKey="count" position="top" fill="#ECE7DD80" fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </Rise>

        {/* Daily */}
        <Rise className="lg:col-span-4">
          <Panel title="Daily predictions" className="h-full">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyPredictions}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="day" {...axisStyle} />
                <YAxis {...axisStyle} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="count" fill="#2E8B67" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </Rise>

        {/* Activity heatmap full width */}
        <Rise className="lg:col-span-7">
          <Panel title="Prediction activity">
            <ActivityHeatmap data={dailyPredictions} weeks={20} />
          </Panel>
        </Rise>
      </Stagger>
    </div>
  )
}
