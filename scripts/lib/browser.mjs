// Headless Chrome/Edge helpers for build scripts (résumé PDF, icons, social image).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CANDIDATES = [
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

export function findBrowser() {
  const browser = CANDIDATES.find((candidate) => existsSync(candidate));
  if (!browser) {
    console.error('No Chrome/Edge found. Install one or set CHROME_PATH to a Chromium-based browser.');
    process.exit(1);
  }
  return browser;
}

/**
 * Write `html` to a temp file and run the browser on it headlessly with extra flags
 * (e.g. --print-to-pdf=..., --screenshot=... --window-size=W,H). Relative asset URLs in the
 * HTML won't resolve, so pass absolute file:// URLs (see fileUrl).
 */
export function renderHtml(html, flags) {
  const browser = findBrowser();
  const workDir = mkdtempSync(path.join(tmpdir(), 'portfolio-render-'));
  const htmlPath = path.join(workDir, 'page.html');
  try {
    writeFileSync(htmlPath, html, 'utf8');
    execFileSync(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        `--user-data-dir=${path.join(workDir, 'profile')}`,
        ...flags,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: 'ignore', timeout: 60_000 }
    );
    return path.basename(browser);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

export const fileUrl = (p) => pathToFileURL(p).href;
