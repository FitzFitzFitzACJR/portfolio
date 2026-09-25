const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "2026-09-01T00:00:00Z" → "3 weeks ago" */
export function timeAgo(iso, now = Date.now()) {
  const seconds = (Date.parse(iso) - now) / 1000;
  if (!Number.isFinite(seconds)) return '';
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}
