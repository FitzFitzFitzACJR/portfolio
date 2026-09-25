import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import profile from './src/content/profile.js'

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Fill %PROFILE_*% placeholders in index.html from the profile (single source of truth).
const profileHtml = () => ({
  name: 'profile-html',
  transformIndexHtml(html) {
    const values = {
      PROFILE_TITLE: `${profile.name} – ${profile.title}`,
      PROFILE_DESCRIPTION: profile.summary,
    }
    return html.replace(/%(PROFILE_[A-Z_]+)%/g, (match, key) => (key in values ? escapeHtml(values[key]) : match))
  },
})

export default defineConfig({
  plugins: [react(), profileHtml()],
  server: {
    port: 5173,
    host: true
  }
})
