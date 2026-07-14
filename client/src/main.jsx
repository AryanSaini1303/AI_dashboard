import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { CommandPaletteProvider } from './components/CommandPalette.jsx'
import ShortcutsCheatsheet from './components/ShortcutsCheatsheet.jsx'
import { initTheme } from './services/theme'
import './index.css'

initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <CommandPaletteProvider>
              <App />
              <ShortcutsCheatsheet />
            </CommandPaletteProvider>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
