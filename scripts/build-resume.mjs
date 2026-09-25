#!/usr/bin/env node
/**
 * Build frontend/public/resume.pdf from frontend/src/content/profile.js.
 *
 *   npm run resume:build
 *
 * Renders an A4 HTML résumé and prints it with a locally installed Chrome/Edge in headless mode
 * (set CHROME_PATH to use a specific browser). Contact details are limited to what the public
 * site already shows: no phone number or street address.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import profile from '../frontend/src/content/profile.js';
import { formatPeriod, present } from '../frontend/src/content/format.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(root, 'frontend/public/resume.pdf');

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const list = (items) => (present(items) ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '');
const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

// "Arnold is an IT graduate…" → "IT graduate…" (résumés conventionally drop the subject).
const resumeSummary = (p) => {
  const text = p.summary.replace(new RegExp(`^${p.firstName} is an? `), '');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function html() {
  const p = profile;
  const contact = [
    `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`,
    `<a href="${esc(p.socials.linkedin)}">${esc(bare(p.socials.linkedin))}</a>`,
    `<a href="${esc(p.socials.github)}">${esc(bare(p.socials.github))}</a>`,
    p.siteUrl ? `<a href="${esc(p.siteUrl)}">${esc(bare(p.siteUrl))}</a>` : null,
    esc(p.location),
  ].filter(Boolean);

  const experience = p.experience
    .map(
      (e) => `
      <div class="entry">
        <div class="row"><h3>${esc(e.role)}, ${esc(e.organization)}${e.type ? ` <span class="muted">(${esc(e.type)})</span>` : ''}</h3>
        <span class="date">${esc(formatPeriod(e.start, e.end))}</span></div>
        ${list(e.highlights)}
      </div>`
    )
    .join('');

  const projects = p.featuredProjects
    .map((project) => {
      const link = project.repo ? ` · <a href="${esc(project.repo.url)}">${esc(bare(project.repo.url))}</a>` : '';
      return `
      <div class="entry">
        <div class="row"><h3>${esc(project.name)} <span class="muted">· ${esc(project.role)}${project.team ? ' · team project' : ''}</span></h3></div>
        <p>${esc(project.description)}${link}</p>
        <p class="tech">${esc(project.tech.join(', '))}</p>
      </div>`;
    })
    .join('');

  const education = p.education
    .map(
      (e) => `
      <div class="entry">
        <div class="row"><h3>${esc(e.degree)}</h3><span class="date">${esc(formatPeriod(e.start, e.end))}</span></div>
        <p>${esc(e.school)}${e.location ? `, ${esc(e.location)}` : ''}</p>
      </div>`
    )
    .join('');

  const skills = p.skills.map((g) => `<p><strong>${esc(g.category)}:</strong> ${esc(g.items.join(', '))}</p>`).join('');
  const certs = present(p.certifications)
    ? `<section><h2>Certifications</h2>${list(p.certifications.map((c) => `${c.issuer}: ${c.name}${c.year ? ` (${c.year})` : ''}`))}</section>`
    : '';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(p.name)}: Résumé</title>
<style>
  @page { size: A4; margin: 11mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Inter, Arial, sans-serif; color: #1a1418; font-size: 9.5pt; line-height: 1.35; margin: 0; }
  a { color: #9b3a5a; text-decoration: none; }
  header { border-bottom: 2px solid #b0406a; padding-bottom: 8px; margin-bottom: 10px; }
  h1 { font-size: 20pt; margin: 0; letter-spacing: -0.01em; }
  .title { font-size: 12pt; color: #9b3a5a; margin: 2px 0 6px; font-weight: 600; }
  .contact { font-size: 9pt; color: #4a4046; }
  .contact span + span::before { content: " · "; }
  h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: 0.08em; color: #9b3a5a; margin: 9px 0 3px; }
  h3 { font-size: 10.5pt; margin: 0; }
  section p { margin: 2px 0; }
  .entry { margin-bottom: 5px; break-inside: avoid; }
  .row { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
  .date { color: #5f555b; font-size: 9pt; white-space: nowrap; }
  .muted { color: #5f555b; font-weight: 400; }
  .tech { color: #5f555b; font-size: 9pt; }
  ul { margin: 3px 0 0; padding-left: 16px; }
  li { margin: 1px 0; }
</style></head>
<body>
  <header>
    <h1>${esc(p.name)}</h1>
    <p class="title">${esc(p.title)}</p>
    <p class="contact">${contact.map((c) => `<span>${c}</span>`).join('')}</p>
  </header>
  <section><h2>Summary</h2><p>${esc(resumeSummary(p))}</p></section>
  <section><h2>Technical skills</h2>${skills}</section>
  <section><h2>Experience</h2>${experience}</section>
  <section><h2>Projects</h2>${projects}</section>
  <section><h2>Education</h2>${education}</section>
  ${certs}
</body></html>`;
}

const browser = BROWSERS.find((candidate) => existsSync(candidate));
if (!browser) {
  console.error('No Chrome/Edge found. Install one or set CHROME_PATH to a Chromium-based browser.');
  process.exit(1);
}

const workDir = mkdtempSync(path.join(tmpdir(), 'resume-'));
const htmlPath = path.join(workDir, 'resume.html');
try {
  writeFileSync(htmlPath, html(), 'utf8');
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--user-data-dir=${path.join(workDir, 'profile')}`,
      `--print-to-pdf=${OUTPUT}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: 'ignore', timeout: 60_000 }
  );
  console.log(`Wrote ${path.relative(root, OUTPUT)} using ${path.basename(browser)}`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
