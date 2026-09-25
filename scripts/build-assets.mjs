#!/usr/bin/env node
/**
 * Build static image assets in frontend/public from profile.js and favicon.svg:
 *
 *   favicon-32.png, apple-touch-icon.png (180), icon-192.png, icon-512.png   from favicon.svg
 *   og-image.png (1200x630)                                                  social preview card
 *
 *   npm run assets:build
 *
 * Uses a locally installed Chrome/Edge in headless mode (set CHROME_PATH to override).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileUrl, renderHtml } from './lib/browser.mjs';
import profile from '../frontend/src/content/profile.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(root, 'frontend/public');
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

function screenshot(html, file, width, height) {
  renderHtml(html, [
    `--screenshot=${path.join(PUBLIC, file)}`,
    `--window-size=${width},${height}`,
    '--default-background-color=00000000',
  ]);
  console.log(`Wrote frontend/public/${file} (${width}x${height})`);
}

// --- Icons -------------------------------------------------------------------------------------
const svg = readFileSync(path.join(PUBLIC, 'favicon.svg'), 'utf8');
const ICONS = [
  ['favicon-32.png', 32, true],
  ['apple-touch-icon.png', 180, false], // iOS applies its own rounding; use a full-bleed square
  ['icon-192.png', 192, true],
  ['icon-512.png', 512, true],
];
for (const [file, size, rounded] of ICONS) {
  const icon = rounded ? svg : svg.replace('rx="14"', 'rx="0"');
  const html = `<!doctype html><html><body style="margin:0;background:transparent">
    <div style="width:${size}px;height:${size}px">${icon.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div>
  </body></html>`;
  screenshot(html, file, size, size);
}

// --- Social preview (Open Graph / Twitter) ----------------------------------------------------
const avatar = fileUrl(path.join(PUBLIC, 'images/avatar-512.webp'));
const skills = profile.featuredSkills.slice(0, 6);
const site = profile.siteUrl ? profile.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';

const og = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; font-family: "Segoe UI", Inter, Arial, sans-serif; color: #fff;
         background: linear-gradient(135deg, #8c2f52, #5e1f38); overflow: hidden; position: relative; }
  .glow { position: absolute; border-radius: 50%; filter: blur(90px); background: rgba(247,180,198,.35); }
  .content { position: absolute; inset: 0; display: flex; align-items: center; gap: 64px; padding: 0 88px; }
  img { width: 300px; height: 300px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 10px rgba(255,255,255,.18); flex: none; }
  .eyebrow { font-size: 24px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; opacity: .88; }
  h1 { font-size: 76px; line-height: 1.05; margin: 14px 0 22px; letter-spacing: -.02em; }
  .chips { display: flex; flex-wrap: wrap; gap: 12px; max-width: 620px; }
  .chip { font-size: 24px; padding: 8px 18px; border-radius: 999px; background: rgba(255,255,255,.14); }
  .site { position: absolute; left: 88px; bottom: 44px; font-size: 24px; opacity: .85; }
</style></head><body>
  <div class="glow" style="width:520px;height:520px;right:-140px;top:-160px"></div>
  <div class="glow" style="width:420px;height:420px;left:-120px;bottom:-200px;opacity:.6"></div>
  <div class="content">
    <img src="${avatar}" alt="">
    <div>
      <p class="eyebrow">${esc(profile.headline)}</p>
      <h1>${esc(profile.name)}</h1>
      <div class="chips">${skills.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
    </div>
  </div>
  ${site ? `<p class="site">${esc(site)}</p>` : ''}
</body></html>`;
screenshot(og, 'og-image.png', 1200, 630);
