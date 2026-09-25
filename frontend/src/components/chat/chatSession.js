// Per-visit chat session: a random id (sent to Flowise for memory) and the transcript,
// kept in sessionStorage so a reload doesn't lose the conversation. Storage can be
// unavailable (private mode, blocked cookies), so everything falls back to memory.

const SESSION_KEY = 'portfolio.chat.sessionId';
const MESSAGES_KEY = 'portfolio.chat.messages';
let memorySessionId = null;

function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  // randomUUID needs a secure context (e.g. not http://192.168.x.x); build a v4 UUID by hand.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export const createMessageId = newId;

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = newId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return (memorySessionId ??= newId());
  }
}

export function resetSession() {
  memorySessionId = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(MESSAGES_KEY);
  } catch {
    /* storage unavailable */
  }
  return getSessionId();
}

export function loadMessages() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(MESSAGES_KEY) || 'null');
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveMessages(messages) {
  try {
    // Don't persist in-flight placeholders.
    const settled = messages.filter((m) => !m.pending);
    sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(settled.slice(-50)));
  } catch {
    /* storage unavailable or full */
  }
}
