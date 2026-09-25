// Formatting helpers shared by the UI and scripts/export-knowledge-base.mjs (plain JS, no browser APIs).

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-01" → "Jan 2026", "2022" → "2022", null → "Present". */
export function formatMonth(value) {
  if (!value) return 'Present';
  const [year, month] = String(value).split('-');
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

/** ("2026-01", "2026-05") → "Jan 2026 – May 2026" */
export function formatPeriod(start, end) {
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

/** Drop null/empty values so optional fields can be skipped in one place. */
export const present = (value) =>
  value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
