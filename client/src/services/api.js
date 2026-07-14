import axios from 'axios'

// Base URL comes from Settings page / env so the same build can point at
// localhost while developing and at your deployed Render/Railway URL in prod.
const api = axios.create({
  baseURL: localStorage.getItem('mv_api_url') || import.meta.env.VITE_API_URL || '/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mv_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers["x-api-key"] = import.meta.env.VITE_MODEL_API_KEY

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''
    const isAuthCall = url.includes('/auth/')
    const onLoginPage = window.location.pathname === '/login'

    // Only bounce to login for a genuine 401 on a normal (non-auth) request,
    // and never while already on the login page — that caused a redirect loop
    // in demo mode where the placeholder token gets rejected by every call.
    if (status === 401 && !isAuthCall && !onLoginPage) {
      localStorage.removeItem('mv_token')
      localStorage.removeItem('mv_user')
      // Pass context so Login explains the expiry instead of showing a bare form.
      window.location.href = '/login?expired=1'
    }
    return Promise.reject(err)
  }
)

// Lets the Settings page repoint the dashboard at a new backend without a
// full reload (axios caches baseURL at creation time otherwise).
export function setApiBaseUrl(url) {
  api.defaults.baseURL = url || import.meta.env.VITE_API_URL || '/api'
}

export default api
