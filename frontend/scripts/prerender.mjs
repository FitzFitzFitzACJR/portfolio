// Inject the server-rendered app into dist/index.html (runs after `vite build` + the SSR build).
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const serverEntry = path.join(root, 'dist-ssr/entry-server.js')
const indexPath = path.join(root, 'dist/index.html')

const { render } = await import(pathToFileURL(serverEntry).href)
const html = await readFile(indexPath, 'utf8')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error(`prerender: ${marker} not found in dist/index.html`)

let output = html.replace(marker, `<div id="root">${render()}</div>`)

// Inline the (small, single-page) stylesheet so first paint doesn't wait for another request.
// Font URLs in it are root-absolute (/assets/...), so they still resolve.
const cssLink = output.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (cssLink) {
  const css = await readFile(path.join(root, 'dist', cssLink[1]), 'utf8')
  output = output.replace(cssLink[0], () => `<style>${css}</style>`)
}

await writeFile(indexPath, output)
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log('prerender: wrote dist/index.html')
