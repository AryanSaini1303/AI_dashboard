import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Info, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import CrystalHero from '../components/CrystalHero'
import api from '../services/api'

function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0..4
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const expired = new URLSearchParams(location.search).get('expired') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demo, setDemo] = useState(false)
  const [mode, setMode] = useState('login')

  const emailValid = emailRe.test(email)
  const strength = useMemo(() => passwordStrength(password), [password])
  const strengthColor = ['bg-garnet', 'bg-garnet', 'bg-pyrite', 'bg-pyrite', 'bg-malachite'][strength]
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength]

  const canSubmit =
    emailValid && password.length >= (mode === 'register' ? 8 : 1) && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') await api.post('/auth/register', { email, password })
      await login(email, password)
      navigate('/')
    } catch (err) {
      if (!err.response) {
        setDemo(true)
        localStorage.setItem('mv_token', 'demo-token')
        localStorage.setItem('mv_user', JSON.stringify({ email, role: 'admin' }))
        setTimeout(() => (window.location.href = '/'), 700)
        return
      }
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Hero panel */}
      <div className="relative hidden lg:flex flex-col items-center justify-center mesh-amethyst crystal-bg overflow-hidden">
        <CrystalHero size={260} />
        <div className="text-center mt-8 px-10">
          <h2 className="font-display text-3xl font-semibold">
            RYM'S AI-<span className="text-amethyst">LAB</span>
          </h2>
          <p className="text-sm text-quartz/60 mt-2 max-w-xs mx-auto">
            A centralized AI operations platform delivering real-time analysis, intelligent insights, and seamless model management across your entire workflow.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 crystal-bg lg:bg-base">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-1 lg:hidden">
            <span className="w-2.5 h-2.5 bg-amethyst facet-sm" />
            <span className="font-display font-semibold text-xl">
              Mineral<span className="text-amethyst">Vision</span>
            </span>
          </div>

          {/* Mode toggle */}
          <div className="relative flex facet-sm border border-base-line p-1 mb-6 mt-2">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`relative flex-1 py-2 text-sm font-medium rounded z-10 transition-colors ${mode === m ? 'text-base' : 'text-quartz/60 hover:text-quartz'
                  }`}
              >
                {m === 'login' ? 'Log in' : 'Create account'}
              </button>
            ))}
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              className="absolute top-1 bottom-1 bg-amethyst facet-sm"
              style={{ width: 'calc(50% - 4px)', left: mode === 'login' ? 4 : 'calc(50%)' }}
            />
          </div>

          {expired && !demo && (
            <div className="facet-sm border border-pyrite/40 bg-pyrite/10 p-3 mb-4 text-xs text-quartz/70 flex gap-2">
              <Info size={15} className="text-pyrite shrink-0 mt-0.5" />
              Your session expired — please log in again to continue.
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 12 : -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <label className="block text-xs uppercase tracking-wide text-quartz/50 mb-1">Email</label>
              <div className="relative mb-1">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-quartz/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={`w-full bg-base border rounded pl-9 pr-3 py-2 text-sm outline-none transition-colors ${touched.email && !emailValid ? 'border-garnet' : 'border-base-line focus:border-amethyst'
                    }`}
                />
              </div>
              <p className="h-4 text-xs text-garnet mb-2">{touched.email && !emailValid ? 'Enter a valid email address' : ''}</p>

              <label className="block text-xs uppercase tracking-wide text-quartz/50 mb-1">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-quartz/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-base border border-base-line rounded pl-9 pr-3 py-2 text-sm focus:border-amethyst outline-none transition-colors"
                />
              </div>

              {mode === 'register' && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded ${i < strength ? strengthColor : 'bg-base-raised'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-quartz/50 mt-1 font-mono">{strengthLabel}</p>
                </div>
              )}

              {error && <p className="text-garnet text-xs mt-3">{error}</p>}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full mt-4 specular facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {demo ? (
                  <><CheckCircle2 size={16} /> Entering demo…</>
                ) : loading ? (
                  'Please wait…'
                ) : (
                  <>{mode === 'register' ? 'Create account & log in' : 'Log in'} <ArrowRight size={16} /></>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* <div className="facet-sm border border-base-line bg-base-raised/40 p-3 mt-5 text-xs text-quartz/50 flex gap-2">
            <Info size={14} className="text-amethyst shrink-0 mt-0.5" />
            {demo
              ? 'Backend unreachable — running in demo mode with simulated data.'
              : "If the backend isn't running, sign-in is simulated and the dashboard opens in demo mode."}
          </div> */}
        </div>
      </div>
    </div>
  )
}
