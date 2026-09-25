const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

/**
 * Error with a stable `code` (CHAT_DISABLED, RATE_LIMITED, UPSTREAM_TIMEOUT, UPSTREAM_ERROR,
 * DAILY_LIMIT, INVALID_INPUT, NETWORK, ...). `fallback` marks transport failures where retrying the
 * non-streaming endpoint makes sense.
 */
export class ApiError extends Error {
  constructor(code, message, { status, fallback = false } = {}) {
    super(message || code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fallback = fallback;
  }
}

function withTimeout(signal, timeoutMs) {
  if (!timeoutMs) return signal;
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!signal) return timeout;
  if (AbortSignal.any) return AbortSignal.any([signal, timeout]);
  return signal;
}

async function request(path, { method = 'GET', body, signal, timeoutMs } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: withTimeout(signal, timeoutMs),
    });
  } catch (err) {
    if (signal?.aborted) throw err; // caller cancelled: propagate AbortError
    throw new ApiError('NETWORK', 'Network error', { fallback: true });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.code || 'HTTP_ERROR', data?.error, { status: res.status });
  }
  return data;
}

/** GET /health – used to wake a sleeping Render instance. */
export const pingHealth = ({ signal, timeoutMs = 10_000 } = {}) => request('/health', { signal, timeoutMs });

/** GET /api/chat/status → { enabled } */
export const getChatStatus = ({ signal, timeoutMs = 8_000 } = {}) => request('/api/chat/status', { signal, timeoutMs });

/**
 * POST /api/chat → reply text (non-streaming fallback).
 * `history` is the recent conversation: [{ role: 'user'|'assistant', content }].
 */
export async function sendChatMessage({ message, history, signal }) {
  const data = await request('/api/chat', { method: 'POST', body: { message, history }, signal });
  return data.reply;
}

/**
 * POST /api/chat/stream (Server-Sent Events). Calls onToken(text) per chunk; resolves on `end`.
 * Throws ApiError; `fallback: true` means the stream transport failed before any tokens arrived.
 */
export async function streamChatMessage({ message, history, signal, onToken }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ message, history }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError('NETWORK', 'Network error', { fallback: true });
  }

  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('text/event-stream') || !res.body) {
    const data = await res.json().catch(() => null);
    if (data?.code) throw new ApiError(data.code, data.error, { status: res.status });
    throw new ApiError('STREAM_UNAVAILABLE', 'Streaming unavailable', { status: res.status, fallback: true });
  }

  let received = false;
  try {
    for await (const { event, data } of readSSE(res.body)) {
      if (event === 'token') {
        received = true;
        onToken(data?.text ?? '');
      } else if (event === 'error') {
        throw new ApiError(data?.code || 'UPSTREAM_ERROR', data?.error);
      } else if (event === 'end') {
        return;
      }
    }
  } catch (err) {
    if (err instanceof ApiError || signal?.aborted) throw err;
    throw new ApiError('NETWORK', 'Connection lost', { fallback: !received });
  }
  // Stream closed without an `end` event.
  throw new ApiError('NETWORK', 'Connection lost', { fallback: !received });
}

/** Parse a text/event-stream body into { event, data } objects. */
export async function* readSSE(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        let event = 'message';
        const dataLines = [];
        for (const line of block.split('\n')) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
        }
        if (!dataLines.length) continue; // comment / heartbeat
        let data;
        try {
          data = JSON.parse(dataLines.join('\n'));
        } catch {
          data = dataLines.join('\n');
        }
        yield { event, data };
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Fetch GitHub repositories
 * @param {number} limit - Maximum number of repos to fetch
 * @returns {Promise<Array>} - Array of repository objects
 */
export async function fetchGitHubRepos(limit = 6) {
  const data = await request(`/api/github/repos?limit=${limit}`);
  return data?.repos || [];
}
