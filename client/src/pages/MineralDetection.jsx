import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { AnimatePresence, motion } from 'framer-motion'
import {
  UploadCloud, ScanSearch, FileDown, Share2, Sparkles, ChevronDown,
  AlertTriangle, Camera, RotateCcw
} from 'lucide-react'
import ConfidenceFacet from '../components/ConfidenceFacet'
import EmptyState from '../components/EmptyState'
import ReportPreview from '../components/ReportPreview'
import { predictImage } from '../services/mineralService'
import { crystalSystem } from '../services/crystalSystems'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'

export default function MineralDetection() {
  const { toast } = useToast()
  const { notify } = useNotifications()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | uploading | inferring | done
  const [uploadPct, setUploadPct] = useState(0)
  const [whyOpen, setWhyOpen] = useState(false)
  const [heatmap, setHeatmap] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const threshold = Number(localStorage.getItem('mv_confidence_threshold')) || 80

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setPhase('idle')
    setWhyOpen(false)
    setHeatmap(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: false
  })

  async function runPrediction() {
    if (!file) return
    setPhase('uploading')
    setUploadPct(0)
    // simulate distinct upload phase then inference
    for (let p = 0; p <= 100; p += 20) {
      setUploadPct(p)
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 40))
    }
    setPhase('inferring')
    const data = await predictImage(file)
    setResult(data)
    setPhase('done')
    const pct = Math.round(data.confidence * 100)
    if (pct < threshold) {
      notify({ title: 'Low-confidence prediction', message: `${data.prediction} at ${pct}% — below your ${threshold}% threshold.`, variant: 'warning' })
      toast({ title: 'Flagged for review', message: `Confidence ${pct}% is below threshold.`, variant: 'warning' })
    } else {
      toast({ title: 'Identified', message: `${data.prediction} · ${pct}% confidence`, variant: 'success' })
    }
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setPhase('idle')
  }

  const top3 = useMemo(() => {
    if (!result?.probabilities) return []
    return [...result.probabilities].sort((a, b) => b.value - a.value).slice(0, 3)
  }, [result])

  const confPct = result ? Math.round(result.confidence * 100) : 0
  const isLow = result && confPct < threshold
  const margin = top3.length > 1 ? Math.round((top3[0].value - top3[1].value) * 100) : null
  const cs = crystalSystem(result?.prediction)

  async function share() {
    const text = `MineralVision identified this sample as ${result.prediction} (${confPct}% confidence).`
    try {
      if (navigator.share) await navigator.share({ title: 'MineralVision result', text })
      else {
        await navigator.clipboard.writeText(text)
        toast({ title: 'Copied to clipboard', message: 'Result summary ready to share.', variant: 'success' })
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1400px]">
      {/* Upload */}
      <div className="facet glass border border-base-line p-5">
        <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4">Upload sample</p>
        <div
          {...getRootProps()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              open()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload a mineral image"
          className={`facet-sm border-2 border-dashed h-72 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden ${
            isDragActive
              ? 'border-amethyst bg-amethyst/10 scale-[1.01] shadow-glow-amethyst'
              : 'border-base-line hover:border-amethyst/60 hover:bg-base-raised/40'
          }`}
        >
          <input {...getInputProps()} capture="environment" />
          {preview ? (
            <>
              <img src={preview} alt="preview" className="max-h-full max-w-full object-contain p-2" />
              {heatmap && (
                <span className="absolute inset-2 pointer-events-none facet-sm bg-[radial-gradient(circle_at_50%_45%,rgba(179,63,75,0.55),rgba(212,167,44,0.35)_40%,transparent_70%)] mix-blend-screen" />
              )}
            </>
          ) : (
            <motion.div
              animate={{ y: isDragActive ? -4 : 0 }}
              className="flex flex-col items-center gap-3 px-6 text-center"
            >
              <div className="facet-sm mesh-amethyst border border-base-line w-14 h-14 flex items-center justify-center">
                <UploadCloud size={24} className="text-amethyst" />
              </div>
              <p className="text-sm text-quartz/60">
                {isDragActive ? 'Drop to load the sample' : 'Drag an image here, or click to choose a file'}
              </p>
              <span className="text-xs text-quartz/35 font-mono">PNG · JPG · up to ~10MB</span>
            </motion.div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={open}
            className="facet-sm border border-base-line px-3 py-1.5 text-xs inline-flex items-center gap-1.5 hover:border-amethyst/60 transition-colors"
          >
            <Camera size={14} /> Choose / capture
          </button>
          {file && (
            <button onClick={reset} className="facet-sm border border-base-line px-3 py-1.5 text-xs inline-flex items-center gap-1.5 hover:border-garnet/50 hover:text-garnet transition-colors">
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        {/* Progress: upload vs inference distinct */}
        <AnimatePresence>
          {(phase === 'uploading' || phase === 'inferring') && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
              {phase === 'uploading' ? (
                <>
                  <div className="flex justify-between text-xs text-quartz/50 mb-1.5">
                    <span>Uploading image…</span>
                    <span className="font-mono">{uploadPct}%</span>
                  </div>
                  <div className="h-1.5 bg-base-raised rounded overflow-hidden">
                    <div className="h-full bg-amethyst transition-all duration-100" style={{ width: `${uploadPct}%` }} />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-quartz/60">
                  <Sparkles size={14} className="text-amethyst animate-pulse" />
                  Running inference on the model…
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={runPrediction}
          disabled={!file || phase === 'uploading' || phase === 'inferring'}
          className="w-full mt-4 specular facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold py-2.5 text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-colors"
        >
          <ScanSearch size={16} />
          {phase === 'uploading' ? 'Uploading…' : phase === 'inferring' ? 'Identifying…' : 'Identify mineral'}
        </button>
      </div>

      {/* Result */}
      <div className="facet glass border border-base-line p-5">
        <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4">Result</p>

        {!result ? (
          <EmptyState
            icon={ScanSearch}
            title="No prediction yet"
            message="Upload an image and run inference to see the identified mineral, confidence, and reasoning."
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`space-y-5 ${!isLow ? 'relative' : ''}`}>
            {!isLow && <span className="absolute -inset-1 -z-10 mesh-amethyst opacity-40 pointer-events-none facet" />}
            <div className="flex items-center gap-5">
              <ConfidenceFacet value={result.confidence} />
              <div className="min-w-0">
                <p className="font-display text-fluid-stat font-semibold text-amethyst truncate">{result.prediction}</p>
                <p className="text-xs text-quartz/50 font-mono mt-1">
                  {cs.system}{cs.hint && ` · ${cs.hint}`}
                </p>
                <p className="text-xs text-quartz/50 font-mono">Inference {result.inferenceTimeMs} ms</p>
              </div>
            </div>

            {isLow && (
              <div className="facet-sm border border-pyrite/40 bg-pyrite/10 p-3 flex gap-2">
                <AlertTriangle size={16} className="text-pyrite shrink-0 mt-0.5" />
                <p className="text-xs text-quartz/70">
                  Confidence is below your {threshold}% threshold — try a clearer photo, better lighting, or a different angle.
                </p>
              </div>
            )}

            {/* Top-3 comparative */}
            <div>
              <p className="text-xs uppercase tracking-wide text-quartz/50 mb-3">Top predictions</p>
              <div className="space-y-2.5">
                {top3.map((p, i) => {
                  const pct = Math.round(p.value * 100)
                  return (
                    <div key={p.mineral}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={i === 0 ? 'text-quartz font-medium' : 'text-quartz/60'}>{p.mineral}</span>
                        <span className="font-mono text-quartz/60">{pct}%</span>
                      </div>
                      <div className="h-2 bg-base-raised rounded overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                          className={i === 0 ? 'h-full bg-amethyst' : 'h-full bg-amethyst/40'}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Why this prediction */}
            <div className="facet-sm border border-base-line">
              <button
                onClick={() => setWhyOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm"
                aria-expanded={whyOpen}
              >
                <span className="inline-flex items-center gap-2"><Sparkles size={15} className="text-amethyst" /> Why this prediction?</span>
                <ChevronDown size={16} className={`transition-transform ${whyOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {whyOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 text-xs text-quartz/60 space-y-2">
                      <p>
                        The model assigns <span className="text-quartz font-medium">{result.prediction}</span> the highest probability
                        {margin != null && (
                          <> — a <span className="font-mono text-amethyst">{margin}%</span> margin over the next candidate.</>
                        )}
                      </p>
                      <p>
                        {margin != null && margin > 40
                          ? 'A wide margin indicates the visual features strongly match a single class.'
                          : 'A narrow margin means two classes share visual features — the heatmap can help you judge the call.'}
                      </p>
                      <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input type="checkbox" checked={heatmap} onChange={(e) => setHeatmap(e.target.checked)} className="accent-amethyst" />
                        <span className="text-quartz/70">Overlay attention heatmap <span className="text-quartz/35">(Grad-CAM preview)</span></span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => setReportOpen(true)} className="facet-sm border border-base-line px-3 py-2 text-xs inline-flex items-center gap-1.5 hover:border-amethyst/60 transition-colors">
                <FileDown size={14} /> Preview report
              </button>
              <button onClick={share} className="facet-sm border border-base-line px-3 py-2 text-xs inline-flex items-center gap-1.5 hover:border-amethyst/60 transition-colors">
                <Share2 size={14} /> Share result
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <ReportPreview open={reportOpen} onClose={() => setReportOpen(false)} result={result} preview={preview} />
    </div>
  )
}
