import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import profile from './src/content/profile.js'

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const OG_IMAGE = { path: '/og-image.png', width: 1200, height: 630 }

/**
 * SEO from the profile (single source of truth):
 * - fills %PROFILE_*% placeholders in index.html
 * - injects Open Graph / Twitter tags, canonical URL and JSON-LD Person data
 * - emits robots.txt and sitemap.xml at build time
 * Tags that need absolute URLs (canonical, og:url, og:image, sitemap) require VITE_SITE_URL
 * (or profile.siteUrl); without it they are left out rather than emitted broken.
 */
function seo({ siteUrl, apiUrl }) {
  const title = `${profile.name} – ${profile.title}`
  const description = profile.summary
  const abs = (p) => (siteUrl ? new URL(p, `${siteUrl}/`).toString() : null)
  const meta = (attr, key, content) => content && { tag: 'meta', attrs: { [attr]: key, content }, injectTo: 'head' }

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description,
    email: `mailto:${profile.email}`,
    url: siteUrl || undefined,
    image: abs(profile.avatar.src) || undefined,
    sameAs: [profile.socials.github, profile.socials.linkedin],
    address: { '@type': 'PostalAddress', addressLocality: profile.location.split(',')[0].trim(), addressCountry: 'PH' },
    alumniOf: profile.education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.school })),
    knowsAbout: profile.featuredSkills,
  }

  return {
    name: 'portfolio-seo',
    buildStart() {
      if (!siteUrl && this.meta.watchMode === false) {
        this.warn('VITE_SITE_URL is not set: canonical URL, og:url/og:image and sitemap.xml are omitted.')
      }
    },
    transformIndexHtml(html) {
      const values = { PROFILE_TITLE: title, PROFILE_DESCRIPTION: description }
      const filled = html.replace(/%(PROFILE_[A-Z_]+)%/g, (match, key) => (key in values ? escapeHtml(values[key]) : match))
      const tags = [
        meta('name', 'author', profile.name),
        siteUrl && { tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' },
        apiUrl && { tag: 'link', attrs: { rel: 'preconnect', href: apiUrl, crossorigin: '' }, injectTo: 'head' },
        meta('property', 'og:type', 'profile'),
        meta('property', 'og:site_name', profile.name),
        meta('property', 'og:title', title),
        meta('property', 'og:description', description),
        meta('property', 'og:locale', 'en_US'),
        meta('property', 'og:url', siteUrl && `${siteUrl}/`),
        meta('property', 'og:image', abs(OG_IMAGE.path)),
        siteUrl && meta('property', 'og:image:width', String(OG_IMAGE.width)),
        siteUrl && meta('property', 'og:image:height', String(OG_IMAGE.height)),
        siteUrl && meta('property', 'og:image:alt', `${profile.name}, ${profile.headline}`),
        meta('property', 'profile:first_name', profile.firstName),
        meta('name', 'twitter:card', siteUrl ? 'summary_large_image' : 'summary'),
        meta('name', 'twitter:title', title),
        meta('name', 'twitter:description', description),
        meta('name', 'twitter:image', abs(OG_IMAGE.path)),
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // Escape "<" so profile text can never close the script element.
          children: JSON.stringify(person).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ].filter(Boolean)
      return { html: filled, tags }
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', siteUrl && `Sitemap: ${siteUrl}/sitemap.xml`, ''].filter((l) => l !== false && l !== null && l !== undefined)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') })
      if (siteUrl) {
        const today = new Date().toISOString().slice(0, 10)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${escapeHtml(siteUrl)}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || profile.siteUrl || '').trim().replace(/\/+$/, '')
  const apiUrl = (env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
  return {
    plugins: [react(), seo({ siteUrl, apiUrl: apiUrl.startsWith('https://') ? apiUrl : '' })],
    server: {
      port: 5173,
      host: true,
    },
  }
})
