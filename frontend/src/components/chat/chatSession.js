// Per-visit chat transcript, kept in sessionStorage so a reload doesn't lose the conversation
// (its recent turns are also sent to the backend as context). Storage can be unavailable
// (private mode, blocked cookies), in which case the chat simply isn't persisted.

const MESSAGES_KEY = 'portfolio.chat.messages'

function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  // randomUUID needs a secure context (e.g. not http://192.168.x.x); build a v4 UUID by hand.
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export const createMessageId = newId

export function clearMessages() {
  try {
    sessionStorage.removeItem(MESSAGES_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function loadMessages() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(MESSAGES_KEY) || 'null')
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveMessages(messages) {
  try {
    // Don't persist in-flight placeholders.
    const settled = messages.filter((m) => !m.pending)
    sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(settled.slice(-50)))
  } catch {
    /* storage unavailable or full */
  }
}
