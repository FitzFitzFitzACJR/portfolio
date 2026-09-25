import express from 'express';
import rateLimit from 'express-rate-limit';
import { ChatError } from '../services/assistant.js';

export const MAX_MESSAGE_LENGTH = 1000;
// Conversation context sent by the browser (the API itself is stateless).
export const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_ENTRY_LENGTH = 2000;
const MAX_HISTORY_TOTAL_LENGTH = 12000;
const HEARTBEAT_MS = 15_000;

// Short, visitor-safe messages. Full detail only goes to server logs.
const PUBLIC_MESSAGES = {
  CHAT_DISABLED: 'The assistant is currently offline.',
  RATE_LIMITED: 'Too many messages. Please wait a few minutes and try again.',
  DAILY_LIMIT: "The assistant has reached today's message limit.",
  UPSTREAM_TIMEOUT: 'The assistant took too long to respond.',
  UPSTREAM_ERROR: 'The assistant could not answer right now.',
};

const sendError = (res, status, code, message = PUBLIC_MESSAGES[code]) =>
  res.status(status).json({ error: message, code });

/**
 * Validate `history` ([{ role: 'user'|'assistant', content }]) and build the Messages API list:
 * the most recent turns that fit the limits, starting with a user turn, then the new message.
 * Returns null when the shape is invalid.
 */
export function buildMessages(question, history = []) {
  if (!Array.isArray(history)) return null;
  const turns = [];
  for (const entry of history) {
    if (!entry || (entry.role !== 'user' && entry.role !== 'assistant') || typeof entry.content !== 'string') {
      return null;
    }
    const content = entry.content.trim().slice(0, MAX_HISTORY_ENTRY_LENGTH);
    if (content) turns.push({ role: entry.role, content });
  }

  const recent = [];
  let total = 0;
  for (const turn of turns.slice(-MAX_HISTORY_MESSAGES).reverse()) {
    if (total + turn.content.length > MAX_HISTORY_TOTAL_LENGTH) break;
    total += turn.content.length;
    recent.unshift(turn);
  }
  while (recent.length && recent[0].role !== 'user') recent.shift(); // must start with a user turn

  return [...recent, { role: 'user', content: question }];
}

/** Global cap on chat messages per UTC day, protecting the API bill. 0 disables it. */
export function createDailyCounter(limit, now = () => new Date()) {
  let day = null;
  let count = 0;
  return {
    tryConsume() {
      if (!limit) return true;
      const today = now().toISOString().slice(0, 10);
      if (today !== day) {
        day = today;
        count = 0;
      }
      if (count >= limit) return false;
      count += 1;
      return true;
    },
  };
}

/**
 * @param {object} deps
 * @param {{ enabled: boolean, dailyLimit?: number }} deps.config - resolved assistant config
 * @param {{ predict: Function, stream: Function } | null} deps.client - assistant client (null when disabled)
 * @param {{ windowMs?: number, limit?: number }} [deps.rateLimit]
 */
export default function createChatRouter({ config, client, rateLimit: limits = {} }) {
  const router = express.Router();
  const daily = createDailyCounter(config.dailyLimit ?? 0);

  const chatLimiter = rateLimit({
    windowMs: limits.windowMs ?? 5 * 60 * 1000,
    limit: limits.limit ?? 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => sendError(res, 429, 'RATE_LIMITED'),
  });

  const requireEnabled = (req, res, next) => (config.enabled ? next() : sendError(res, 503, 'CHAT_DISABLED'));

  const validate = (req, res, next) => {
    const { message, history } = req.body ?? {};
    if (typeof message !== 'string' || !message.trim()) {
      return sendError(res, 400, 'INVALID_INPUT', 'Message is required.');
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return sendError(res, 400, 'INVALID_INPUT', `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
    }
    const messages = buildMessages(message.trim(), history ?? []);
    if (!messages) return sendError(res, 400, 'INVALID_INPUT', 'Invalid conversation history.');
    req.chat = { messages };
    next();
  };

  // Counted after validation so malformed requests don't use up the day's budget.
  const enforceDailyLimit = (req, res, next) => {
    if (daily.tryConsume()) return next();
    console.warn('[chat] daily message limit reached');
    sendError(res, 429, 'DAILY_LIMIT');
  };

  router.get('/chat/status', (req, res) => {
    res.set('Cache-Control', 'no-store').json({ enabled: config.enabled });
  });

  router.post('/chat', chatLimiter, requireEnabled, validate, enforceDailyLimit, async (req, res) => {
    const controller = abortOnClientGone(res);
    try {
      const reply = await client.predict({ ...req.chat, signal: controller.signal });
      res.json({ reply });
    } catch (err) {
      if (err instanceof ChatError && err.code === 'ABORTED') return;
      logChatError('/api/chat', err);
      const code = err instanceof ChatError && err.code === 'UPSTREAM_TIMEOUT' ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_ERROR';
      sendError(res, code === 'UPSTREAM_TIMEOUT' ? 504 : 502, code);
    }
  });

  /**
   * Server-Sent Events. Events:
   *   token  data: {"text": "..."}
   *   end    data: {}
   *   error  data: {"code": "...", "error": "..."}
   */
  router.post('/chat/stream', chatLimiter, requireEnabled, validate, enforceDailyLimit, async (req, res) => {
    const controller = abortOnClientGone(res);

    res.status(200).set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    const send = (event, data) => {
      if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    // Comment lines keep proxies from closing the connection while the model thinks.
    const heartbeat = setInterval(() => !res.writableEnded && res.write(': ping\n\n'), HEARTBEAT_MS);

    try {
      await client.stream({
        ...req.chat,
        signal: controller.signal,
        onToken: (text) => send('token', { text }),
      });
      send('end', {});
    } catch (err) {
      if (!(err instanceof ChatError && err.code === 'ABORTED')) {
        logChatError('/api/chat/stream', err);
        const code =
          err instanceof ChatError && err.code === 'UPSTREAM_TIMEOUT' ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_ERROR';
        send('error', { code, error: PUBLIC_MESSAGES[code] });
      }
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  });

  return router;
}

/** Abort the upstream Claude request if the browser disconnects before we finish. */
function abortOnClientGone(res) {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });
  return controller;
}

function logChatError(route, err) {
  console.error(`[chat] ${route} failed: ${err?.code ?? 'ERROR'} – ${err?.message ?? err}`);
}
