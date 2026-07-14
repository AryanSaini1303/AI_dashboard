import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Printer, FileText } from 'lucide-react'
import { crystalSystem } from '../services/crystalSystems'

// A previewable, branded identification report. Shows exactly what will be
// produced before the user commits, then offers a print/save-as-PDF path
// (zero backend) or a plain-text fallback. This is the client-side stand-in
// for the roadmapped server PDF export.
function buildTop3(result) {
  return [...(result.probabilities || [])].sort((a, b) => b.value - a.value).slice(0, 3)
}

function printReport(result, preview) {
  const cs = crystalSystem(result.prediction)
  const top3 = buildTop3(result)
  const when = new Date().toLocaleString()
  const rows = top3
    .map((p) => {
      const pct = (p.value * 100).toFixed(1)
      return `<tr><td>${p.mineral}</td><td class="mono">${pct}%</td>
        <td><div class="bar"><span style="width:${pct}%"></span></div></td></tr>`
    })
    .join('')

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
  <title>MineralVision Report — ${result.prediction}</title>
  <style>
    @page { margin: 24mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Segoe UI, Inter, sans-serif; color:#1D2024; margin:0; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .head { display:flex; align-items:center; gap:10px; border-bottom:2px solid #8B6FD1; padding-bottom:12px; }
    .dot { width:12px;height:12px;background:#8B6FD1;transform:rotate(45deg); }
    h1 { font-size:20px; margin:0; }
    .brand span { color:#8B6FD1; }
    .grid { display:flex; gap:24px; margin-top:24px; }
    .card { border:1px solid #D8D3C7; border-radius:8px; padding:16px; }
    .big { font-size:34px; font-weight:700; color:#5B4A8A; margin:4px 0; }
    .label { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#7a756a; }
    img { max-width:220px; max-height:220px; object-fit:contain; border:1px solid #D8D3C7; border-radius:8px; }
    table { width:100%; border-collapse:collapse; margin-top:8px; }
    td { padding:6px 8px; font-size:13px; border-bottom:1px solid #eee; }
    .bar { background:#eee; height:8px; border-radius:4px; overflow:hidden; width:160px; }
    .bar span { display:block; height:100%; background:#8B6FD1; }
    .foot { margin-top:32px; font-size:11px; color:#9a958a; border-top:1px solid #eee; padding-top:10px; }
  </style></head><body>
    <div class="head"><div class="dot"></div><h1 class="brand">Mineral<span>Vision</span> — Identification Report</h1></div>
    <div class="grid">
      ${preview ? `<img src="${preview}" alt="sample"/>` : ''}
      <div style="flex:1">
        <div class="label">Predicted mineral</div>
        <div class="big">${result.prediction}</div>
        <div class="mono" style="font-size:13px;color:#555">Confidence ${(result.confidence * 100).toFixed(1)}% ·
          ${cs.system}${cs.hint ? ` · ${cs.hint}` : ''} · ${result.inferenceTimeMs} ms</div>
        <table>${rows}</table>
      </div>
    </div>
    <div class="foot">Generated ${when} · MineralVision AI · SqueezeNet1.1. Confidence reflects model probability, not a guarantee of identity.</div>
    <script>window.onload = () => { window.print(); }</script>
  </body></html>`

  const w = window.open('', '_blank', 'width=900,height=1000')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}

function downloadTxt(result) {
  const cs = crystalSystem(result.prediction)
  const lines = [
    'MineralVision Identification Report',
    '===================================',
    `Prediction:      ${result.prediction}`,
    `Confidence:      ${(result.confidence * 100).toFixed(1)}%`,
    `Crystal system:  ${cs.system}`,
    `Inference time:  ${result.inferenceTimeMs} ms`,
    '',
    'Probability breakdown:',
    ...(result.probabilities || []).map((p) => `  ${p.mineral.padEnd(12)} ${(p.value * 100).toFixed(1)}%`),
    '',
    `Generated ${new Date().toLocaleString()}`
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mineralvision-report-${Date.now()}.txt`
  a.click()
}

export default function ReportPreview({ open, onClose, result, preview }) {
  if (!result) return null
  const cs = crystalSystem(result.prediction)
  const top3 = buildTop3(result)

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[93] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative glass facet border border-base-line w-full max-w-lg p-6 shadow-elev-3"
            role="dialog"
            aria-label="Report preview"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-quartz/40 hover:text-quartz" aria-label="Close">
              <X size={18} />
            </button>
            <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4">Report preview</p>

            <div className="facet-sm border border-base-line bg-base-raised/30 p-4">
              <div className="flex items-center gap-2 pb-3 border-b border-base-line">
                <span className="w-2.5 h-2.5 bg-amethyst facet-sm" />
                <span className="font-display font-semibold">Mineral<span className="text-amethyst">Vision</span> — Identification Report</span>
              </div>
              <div className="flex gap-4 mt-4">
                {preview && <img src={preview} alt="sample" className="w-24 h-24 object-contain facet-sm border border-base-line" />}
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-quartz/50">Predicted mineral</p>
                  <p className="font-display text-2xl font-semibold text-amethyst">{result.prediction}</p>
                  <p className="text-xs font-mono text-quartz/50 mt-1">
                    {(result.confidence * 100).toFixed(1)}% · {cs.system} · {result.inferenceTimeMs} ms
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {top3.map((p) => (
                  <div key={p.mineral}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-quartz/70">{p.mineral}</span>
                      <span className="font-mono text-quartz/50">{(p.value * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-base rounded overflow-hidden">
                      <div className="h-full bg-amethyst" style={{ width: `${p.value * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <button onClick={() => printReport(result, preview)} className="facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold px-4 py-2 text-sm inline-flex items-center gap-2 transition-colors">
                <Printer size={15} /> Save as PDF / Print
              </button>
              <button onClick={() => downloadTxt(result)} className="facet-sm border border-base-line px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-amethyst/60 transition-colors">
                <FileText size={15} /> Download .txt
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
