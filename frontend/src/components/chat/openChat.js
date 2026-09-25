// Lets any component (e.g. the hero CTA) open the assistant without importing the lazy panel.
export const OPEN_CHAT_EVENT = 'portfolio:open-chat'

export function openChat() {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT))
}
