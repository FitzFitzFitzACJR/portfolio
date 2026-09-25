import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'theme'

// The theme lives on <html class="dark">, set before first paint by the inline script in
// index.html (saved choice, else the OS preference). This hook reads and updates it.
const listeners = new Set()
const getSnapshot = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
// The page is prerendered without knowing the visitor's theme; React re-renders with the real
// value right after hydration instead of reporting a mismatch.
const getServerSnapshot = () => 'light'

function apply(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  listeners.forEach((listener) => listener())
}

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function subscribe(listener) {
  listeners.add(listener)
  // Follow OS changes only while the visitor hasn't chosen explicitly.
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = (event) => {
    if (!readSaved()) apply(event.matches ? 'dark' : 'light')
  }
  query.addEventListener('change', onChange)
  return () => {
    listeners.delete(listener)
    query.removeEventListener('change', onChange)
  }
}

/** Light/dark theme: follows the OS until the visitor picks one, then remembers it. */
export default function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback(() => {
    const next = getSnapshot() === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable: theme still applies for this visit */
    }
    apply(next)
  }, [])

  return { theme, toggle }
}
