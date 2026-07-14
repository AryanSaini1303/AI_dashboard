import { useEffect, useRef, useState } from 'react'
import { Box, Cpu, Gauge, HardDrive, UploadCloud, Lock, History as HistoryIcon, Check } from 'lucide-react'
import { getModelInfo, uploadModel } from '../services/mineralService'
import StatCard from '../components/StatCard'
import ConfirmDialog, { DangerZone } from '../components/ConfirmDialog'
import { SkeletonCard } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'

const HISTORY_KEY = 'mv_model_history'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] } catch { return [] }
}

export default function ModelManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { notify } = useNotifications()
  const [model, setModel] = useState(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | uploading | swapping
  const [pending, setPending] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [swaps, setSwaps] = useState(loadHistory)
  const inputRef = useRef(null)

  const isClient = user?.role === 'client'

  useEffect(() => {
    getModelInfo().then(setModel)
  }, [])

  function pickFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setPending(file)
    setConfirmOpen(true)
  }

  async function confirmSwap() {
    if (!pending) return
    setPhase('uploading')
    setProgress(0)
    await uploadModel(pending, setProgress)
    setPhase('swapping')
    await new Promise((r) => setTimeout(r, 900)) // hot-swap window
    const info = await getModelInfo()
    setModel(info)
    setPhase('idle')

    const entry = {
      id: Date.now(),
      name: pending.name,
      sizeMb: (pending.size / 1e6).toFixed(2),
      by: user?.email || 'demo@mineralvision.ai',
      at: new Date().toISOString()
    }
    const next = [entry, ...swaps].slice(0, 20)
    setSwaps(next)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    setPending(null)
    toast({ title: 'Model swapped', message: `${entry.name} is now active.`, variant: 'success' })
    notify({ title: 'Active model changed', message: `${entry.name} deployed by ${entry.by}.`, variant: 'success' })
  }

  if (isClient) {
    return (
      <div className="facet glass border border-base-line max-w-lg p-10 text-center">
        <div className="facet-lg border border-base-line w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Lock size={26} className="text-quartz/40" />
        </div>
        <h2 className="font-display text-lg font-semibold">Restricted area</h2>
        <p className="text-sm text-quartz/50 mt-2">Model management is available to admin and researcher roles. Contact an administrator to swap the active model.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-2 text-xs text-pyrite">
        <span className="facet-sm border border-pyrite/40 bg-pyrite/10 px-2 py-1 uppercase tracking-wide font-medium">Admin area</span>
        <span className="text-quartz/40">Changes here affect every prediction across the platform.</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!model ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Current model" value={model.name} accent="amethyst" icon={Cpu} />
            <StatCard label="Accuracy" value={model.accuracy != null ? `${model.accuracy}%` : '—'} accent="malachite" icon={Gauge} />
            <StatCard label="Version" value={model.version} accent="pyrite" icon={Box} />
            <StatCard label="Size" value={`${model.sizeMb} MB`} accent="amethyst" icon={HardDrive} sub={`uploaded ${model.uploadedAt}`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version / audit timeline */}
        <div className="facet glass border border-base-line p-5">
          <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4 inline-flex items-center gap-2">
            <HistoryIcon size={14} /> Swap history
          </p>
          {swaps.length === 0 ? (
            <p className="text-sm text-quartz/40">No swaps recorded yet. The active model above is the baseline.</p>
          ) : (
            <ol className="relative border-l border-base-line ml-2 space-y-5">
              {swaps.map((s, i) => (
                <li key={s.id} className="ml-5">
                  <span className={`absolute -left-[7px] w-3.5 h-3.5 rounded-full border-2 ${i === 0 ? 'bg-amethyst border-amethyst' : 'bg-base-panel border-base-line'}`} />
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-quartz">{s.name}</p>
                    {i === 0 && <span className="text-[10px] font-mono text-malachite inline-flex items-center gap-0.5"><Check size={11} /> active</span>}
                  </div>
                  <p className="text-xs text-quartz/50 font-mono mt-0.5">{s.sizeMb} MB · {new Date(s.at).toLocaleString()}</p>
                  <p className="text-xs text-quartz/40">by {s.by}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Danger zone: swap */}
        <DangerZone title="Model swap" description="Hot-swaps the production model for every user. This is immediate and production-impacting.">
          <p className="text-sm text-quartz/60">
            Upload a PyTorch weights file (<span className="font-mono">.pth</span> / <span className="font-mono">.pt</span>). The ml-service swaps it in and every page keeps working against the new model — no frontend changes.
          </p>
          <input ref={inputRef} type="file" className="hidden" accept=".pth,.pt" onChange={pickFile} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={phase !== 'idle'}
            className="facet-sm bg-garnet hover:bg-garnet/90 text-base font-semibold py-2.5 px-5 text-sm inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <UploadCloud size={16} />
            {phase === 'uploading' ? `Uploading… ${progress}%` : phase === 'swapping' ? 'Swapping in…' : 'Upload & swap model'}
          </button>
          {phase === 'uploading' && (
            <div className="w-full max-w-xs h-1.5 bg-base-line rounded overflow-hidden">
              <div className="h-full bg-garnet transition-all duration-100" style={{ width: `${progress}%` }} />
            </div>
          )}
          {phase === 'swapping' && (
            <p className="text-xs text-pyrite font-mono">Hot-swapping active weights…</p>
          )}
        </DangerZone>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPending(null) }}
        onConfirm={confirmSwap}
        title="Swap the active model?"
        message="This replaces the production model immediately for all users."
        confirmLabel="Swap model"
        danger
      >
        {pending && (
          <div className="facet-sm border border-base-line bg-base-raised/40 p-3 text-sm">
            <div className="flex justify-between"><span className="text-quartz/50">File</span><span className="font-mono">{pending.name}</span></div>
            <div className="flex justify-between mt-1"><span className="text-quartz/50">Size</span><span className="font-mono">{(pending.size / 1e6).toFixed(2)} MB</span></div>
            <div className="flex justify-between mt-1"><span className="text-quartz/50">Format</span><span className="font-mono">{pending.name.split('.').pop()?.toUpperCase()}</span></div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
