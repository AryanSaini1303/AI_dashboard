import { useState } from 'react'
import { Link2, SlidersHorizontal, Palette, Keyboard, Download, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import api, { setApiBaseUrl } from '../services/api'
import { applyTheme } from '../services/theme'
import ConfirmDialog, { DangerZone } from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="facet glass border border-base-line p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} className="text-amethyst" />
        <h2 className="font-display font-semibold">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { toast } = useToast()
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('mv_api_url') || '')
  const [darkMode, setDarkMode] = useState(localStorage.getItem('mv_theme') !== 'light')
  const [threshold, setThreshold] = useState(Number(localStorage.getItem('mv_confidence_threshold')) || 80)
  const [testState, setTestState] = useState('idle') // idle | testing | ok | fail
  const [clearOpen, setClearOpen] = useState(false)

  function toggleTheme() {
    const next = !darkMode
    setDarkMode(next)
    applyTheme(next ? 'dark' : 'light')
  }

  async function testConnection() {
    setTestState('testing')
    try {
      await api.get('/health', { baseURL: apiUrl || undefined, timeout: 5000 })
      setTestState('ok')
    } catch {
      setTestState('fail')
    }
  }

  function save() {
    localStorage.setItem('mv_api_url', apiUrl)
    localStorage.setItem('mv_confidence_threshold', String(threshold))
    localStorage.setItem('mv_theme', darkMode ? 'dark' : 'light')
    setApiBaseUrl(apiUrl)
    applyTheme(darkMode ? 'dark' : 'light')
    toast({ title: 'Settings saved', variant: 'success' })
  }

  function exportData() {
    const data = {
      settings: { apiUrl, threshold, theme: darkMode ? 'dark' : 'light' },
      notifications: JSON.parse(localStorage.getItem('mv_notifications') || '[]'),
      modelHistory: JSON.parse(localStorage.getItem('mv_model_history') || '[]'),
      user: JSON.parse(localStorage.getItem('mv_user') || 'null'),
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mineralvision-data.json'
    a.click()
    toast({ title: 'Data exported', message: 'Your local workspace data was downloaded.', variant: 'success' })
  }

  function clearLocalData() {
    ['mv_api_url', 'mv_confidence_threshold', 'mv_notifications', 'mv_model_history'].forEach((k) => localStorage.removeItem(k))
    toast({ title: 'Local data cleared', message: 'Preferences and activity log reset.', variant: 'info' })
    setApiUrl('')
    setThreshold(80)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Section icon={Link2} title="Connection">
        <div>
          <label className="block text-xs uppercase tracking-wide text-quartz/50 mb-1">API URL</label>
          <div className="flex gap-2">
            <input value={apiUrl} onChange={(e) => { setApiUrl(e.target.value); setTestState('idle') }}
              placeholder="https://your-service.onrender.com/api"
              className="flex-1 bg-base border border-base-line rounded px-3 py-2 text-sm font-mono focus:border-amethyst outline-none" />
            <button onClick={testConnection} disabled={testState === 'testing'}
              className="facet-sm border border-base-line px-3 py-2 text-sm inline-flex items-center gap-1.5 hover:border-amethyst/60 disabled:opacity-50">
              {testState === 'testing' ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
            </button>
          </div>
          <div className="h-5 mt-1.5 text-xs">
            {testState === 'ok' && <span className="text-malachite inline-flex items-center gap-1"><CheckCircle2 size={13} /> Connection successful</span>}
            {testState === 'fail' && <span className="text-garnet inline-flex items-center gap-1"><XCircle size={13} /> Couldn't reach that URL</span>}
            {testState === 'idle' && <span className="text-quartz/40">Points the dashboard at your deployed backend. Applied on save.</span>}
          </div>
        </div>
      </Section>

      <Section icon={SlidersHorizontal} title="Detection">
        <div>
          <label className="block text-xs uppercase tracking-wide text-quartz/50 mb-2">
            Confidence alert threshold: <span className="font-mono text-amethyst">{threshold}%</span>
          </label>
          <input type="range" min={50} max={99} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-amethyst" />
          <div className="mt-3 facet-sm border border-base-line bg-base-raised/40 p-3 flex items-center gap-3">
            <div className="h-2 flex-1 bg-base rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pyrite to-malachite transition-all" style={{ width: `${threshold}%` }} />
            </div>
            <span className="text-xs text-quartz/50">Predictions under {threshold}% are flagged for review.</span>
          </div>
        </div>
      </Section>

      <Section icon={Palette} title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm">Dark mode</span>
            <p className="text-xs text-quartz/40">Crystalline dark palette (default) or light stone.</p>
          </div>
          <button onClick={toggleTheme} aria-label="Toggle dark mode"
            className={`w-11 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-amethyst' : 'bg-base-line'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-quartz transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('mv:shortcuts'))}
          className="text-sm text-amethyst inline-flex items-center gap-2 hover:gap-2.5 transition-all">
          <Keyboard size={15} /> View keyboard shortcuts
        </button>
      </Section>

      <button onClick={save} className="specular facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold py-2.5 px-6 text-sm transition-colors">
        Save settings
      </button>

      <Section icon={Download} title="Data & privacy">
        <p className="text-sm text-quartz/60">Download everything this workspace stores locally — settings, activity log, and model history — as JSON.</p>
        <button onClick={exportData} className="facet-sm border border-base-line px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-amethyst/60 transition-colors">
          <Download size={15} /> Export my data
        </button>
      </Section>

      <DangerZone title="Danger zone" description="These actions reset local workspace state and cannot be undone.">
        <button onClick={() => setClearOpen(true)} className="facet-sm border border-garnet/40 text-garnet px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-garnet/10 transition-colors">
          <Trash2 size={15} /> Clear local data
        </button>
      </DangerZone>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={clearLocalData}
        title="Clear local data?"
        message="This removes your saved API URL, confidence threshold, activity log, and model history from this browser. Your account is not affected."
        confirmLabel="Clear data"
        danger
      />
    </div>
  )
}
