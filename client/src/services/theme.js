// Applies the saved colour theme by toggling a `light` class on <html>.
// The default (no class) is the dark crystalline palette; the `light`
// override lives in index.css.

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
  } else {
    root.classList.remove('light')
  }
}

export function initTheme() {
  applyTheme(localStorage.getItem('mv_theme') === 'light' ? 'light' : 'dark')
}
