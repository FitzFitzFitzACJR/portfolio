// Indirection over location changes so tests can observe them (jsdom can't navigate to mailto:).
export function openUrl(href) {
  window.location.href = href
}
