import { useMemo, useState } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend, Tooltip
} from 'recharts'
import { GitCompareArrows, ArrowLeftRight, RotateCcw, ImagePlus, ChartArea } from 'lucide-react'
import ConfidenceFacet from '../components/ConfidenceFacet'
import { compareImages } from '../services/mineralService'
import { useToast } from '../context/ToastContext'
import { tooltipStyle } from '../components/chartTheme'

const CLASSES = ['Calcite', 'Granite', 'Limestone']

// Derive a probability profile for the radar when the backend only returns a
// top prediction — spreads remaining mass across the other classes so the
// two samples are visually comparable without changing the API contract.
function profile(sample) {
  if (sample?.probabilities?.length) {
    const m = {}
    sample.probabilities.forEach((p) => (m[p.mineral] = p.value))
    return m
  }
  const conf = sample?.confidence ?? 0
  const rest = (1 - conf) / (CLASSES.length - 1)
  const m = {}
  CLASSES.forEach((c) => (m[c] = c === sample?.prediction ? conf : rest))
  return m
}

function Slot({ label, preview, onChange, onClear }) {
  return (
    <div className="facet glass border border-base-line p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide text-quartz/50">{label}</p>
        {preview && (
          <button onClick={onClear} className="text-xs text-quartz/40 hover:text-garnet">Clear</button>
        )}
      </div>
      <label className="facet-sm border-2 border-dashed border-base-line hover:border-amethyst/60 hover:bg-base-raised/40 h-48 flex flex-col items-center justify-center cursor-pointer transition-all gap-2">
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onChange} />
        {preview ? (
          <img src={preview} alt={label} className="max-h-full max-w-full object-contain p-2" />
        ) : (
          <>
            <ImagePlus size={22} className="text-quartz/40" />
            <span className="text-sm text-quartz/40">Click to choose image</span>
          </>
        )}
      </label>
    </div>
  )
}

export default function CompareImages() {
  const { toast } = useToast()
  const [fileA, setFileA] = useState(null)
  const [fileB, setFileB] = useState(null)
  const [previewA, setPreviewA] = useState(null)
  const [previewB, setPreviewB] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showRadar, setShowRadar] = useState(false)

  const same = result && result.similarity > 0.6

  const radarData = useMemo(() => {
    if (!result) return []
    const pa = profile(result.a)
    const pb = profile(result.b)
    return CLASSES.map((c) => ({
      mineral: c,
      'Sample 1': Math.round((pa[c] || 0) * 100),
      'Sample 2': Math.round((pb[c] || 0) * 100)
    }))
  }, [result])

  async function run() {
    if (!fileA || !fileB) return
    setLoading(true)
    const data = await compareImages(fileA, fileB)
    setResult(data)
    setLoading(false)
    toast({ title: 'Comparison complete', message: data.verdict, variant: same ? 'success' : 'info' })
  }

  function swap() {
    setFileA(fileB); setFileB(fileA)
    setPreviewA(previewB); setPreviewB(previewA)
    setResult(null)
  }

  function reset() {
    setFileA(null); setFileB(null); setPreviewA(null); setPreviewB(null); setResult(null)
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
        <Slot label="Sample 1" preview={previewA}
          onChange={(e) => { const f = e.target.files[0]; if (!f) return; setFileA(f); setPreviewA(URL.createObjectURL(f)); setResult(null) }}
          onClear={() => { setFileA(null); setPreviewA(null); setResult(null) }} />
        <Slot label="Sample 2" preview={previewB}
          onChange={(e) => { const f = e.target.files[0]; if (!f) return; setFileB(f); setPreviewB(URL.createObjectURL(f)); setResult(null) }}
          onClear={() => { setFileB(null); setPreviewB(null); setResult(null) }} />

        {/* VS badge connecting the two slots */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <span className="w-11 h-11 facet-sm bg-base-raised border border-base-line flex items-center justify-center font-display font-semibold text-amethyst text-sm shadow-elev-2">
            VS
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={run} disabled={!fileA || !fileB || loading}
          className="specular facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold py-2.5 px-6 text-sm disabled:opacity-50 inline-flex items-center gap-2 transition-colors">
          <GitCompareArrows size={16} /> {loading ? 'Comparing…' : 'Compare samples'}
        </button>
        <button onClick={swap} disabled={!fileA && !fileB}
          className="facet-sm border border-base-line px-4 py-2.5 text-sm inline-flex items-center gap-2 hover:border-amethyst/60 disabled:opacity-40 transition-colors">
          <ArrowLeftRight size={15} /> Swap
        </button>
        <button onClick={reset} disabled={!fileA && !fileB && !result}
          className="facet-sm border border-base-line px-4 py-2.5 text-sm inline-flex items-center gap-2 hover:border-garnet/50 hover:text-garnet disabled:opacity-40 transition-colors">
          <RotateCcw size={15} /> Reset
        </button>
      </div>

      {result && (
        <>
          <div className="facet glass border border-base-line p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4">
              <ConfidenceFacet value={result.a.confidence} size={72} />
              <div>
                <p className="text-xs text-quartz/50">Sample 1</p>
                <p className="font-display font-semibold text-amethyst">{result.a.prediction}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-quartz/50">Similarity</p>
              <p className={`font-display text-fluid-stat font-semibold ${same ? 'text-malachite' : 'text-garnet'}`}>
                {Math.round(result.similarity * 100)}%
              </p>
              <p className={`text-sm mt-1 font-medium ${same ? 'text-malachite' : 'text-garnet'}`}>
                {same ? 'Likely the same mineral' : 'Different minerals'}
              </p>
            </div>
            <div className="flex items-center gap-4 md:justify-end">
              <div className="md:text-right">
                <p className="text-xs text-quartz/50">Sample 2</p>
                <p className="font-display font-semibold text-amethyst">{result.b.prediction}</p>
              </div>
              <ConfidenceFacet value={result.b.confidence} size={72} />
            </div>
          </div>

          <div className="facet glass border border-base-line p-5">
            <button onClick={() => setShowRadar((s) => !s)}
              className="flex items-center gap-2 text-xs uppercase tracking-wide text-quartz/50 hover:text-quartz mb-2">
              <ChartArea size={14} /> {showRadar ? 'Hide' : 'Show'} probability profile
            </button>
            {showRadar && (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="#2C3036" />
                  <PolarAngleAxis dataKey="mineral" tick={{ fill: '#ECE7DD90', fontSize: 12 }} />
                  <Radar name="Sample 1" dataKey="Sample 1" stroke="#8B6FD1" fill="#8B6FD1" fillOpacity={0.35} />
                  <Radar name="Sample 2" dataKey="Sample 2" stroke="#D4A72C" fill="#D4A72C" fillOpacity={0.25} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  )
}
