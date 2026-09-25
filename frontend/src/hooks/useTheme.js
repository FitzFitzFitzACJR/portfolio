import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Light/dark theme. Follows the OS setting until the visitor picks one, then remembers it.
 * index.html applies the same logic before first paint to avoid a flash.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Track OS changes only while the visitor hasn't chosen explicitly.
  useEffect(() => {
    const query = media()
    const onChange = (event) => {
      if (!readSaved()) setTheme(event.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* storage unavailable: theme still applies for this visit */
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
