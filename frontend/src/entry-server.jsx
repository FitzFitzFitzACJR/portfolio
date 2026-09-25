// Build-time prerendering (scripts/prerender.mjs): renders the static page to HTML so content
// paints before JavaScript loads; main.jsx then hydrates it.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
