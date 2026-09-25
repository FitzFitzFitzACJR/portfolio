import { useEffect, useRef, useState } from 'react'
import profile from '../../content/profile'
import useActiveSection from '../../hooks/useActiveSection'
import useTheme from '../../hooks/useTheme'

export const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]
const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

export default function Navbar() {
  const active = useActiveSection(SECTION_IDS)
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)

  // Close the mobile menu on Escape and when switching to the desktop layout.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 768px)')
    const onResize = (event) => event.matches && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onResize)
    }
  }, [menuOpen])

  const linkClass = (id) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active === id ? 'text-accent' : 'text-muted hover:text-fg'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/95">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <a href="#home" className="mr-auto font-display text-lg font-bold text-fg">
          {profile.name}
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={linkClass(item.id)}
                aria-current={active === item.id ? 'true' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <ThemeToggle theme={theme} onToggle={toggle} />

        <button
          ref={menuButtonRef}
          type="button"
          className="rounded-md p-2 text-fg hover:bg-surface-2 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      <div id="mobile-menu" hidden={!menuOpen} className="border-t border-line bg-canvas md:hidden">
        <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-3 py-3 text-base font-medium ${active === item.id ? 'text-accent' : 'text-fg'}`}
                aria-current={active === item.id ? 'true' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-fg"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {dark ? (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeWidth={2}
            d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
          />
        </svg>
      )}
    </button>
  )
}
