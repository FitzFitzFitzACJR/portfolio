import express from 'express';
import rateLimit from 'express-rate-limit';
import { ChatError } from '../services/flowise.js';

export const MAX_MESSAGE_LENGTH = 1000;
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;
const HEARTBEAT_MS = 15_000;

// Short, visitor-safe messages. Full detail only goes to server logs.
const PUBLIC_MESSAGES = {
  CHAT_DISABLED: 'The assistant is currently offline.',
  RATE_LIMITED: 'Too many messages. Please wait a few minutes and try again.',
  UPSTREAM_TIMEOUT: 'The assistant took too long to respond.',
  UPSTREAM_ERROR: 'The assistant could not answer right now.',
};

const sendError = (res, status, code, message = PUBLIC_MESSAGES[code]) =>
  res.status(status).json({ error: message, code });

/**
 * @param {object} deps
 * @param {{ enabled: boolean }} deps.config - resolved Flowise config
 * @param {{ predict: Function, stream: Function } | null} deps.client - Flowise client (null when disabled)
 * @param {{ windowMs?: number, limit?: number }} [deps.rateLimit]
 */
export default function createChatRouter({ config, client, rateLimit: limits = {} }) {
  const router = express.Router();

  const chatLimiter = rateLimit({
    windowMs: limits.windowMs ?? 5 * 60 * 1000,
    limit: limits.limit ?? 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => sendError(res, 429, 'RATE_LIMITED'),
  });

  const requireEnabled = (req, res, next) =>
    config.enabled ? next() : sendError(res, 503, 'CHAT_DISABLED');

  const validate = (req, res, next) => {
    const { message, sessionId } = req.body ?? {};
    if (typeof message !== 'string' || !message.trim()) {
      return sendError(res, 400, 'INVALID_INPUT', 'Message is required.');
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return sendError(res, 400, 'INVALID_INPUT', `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
    }
    if (sessionId !== undefined && (typeof sessionId !== 'string' || !SESSION_ID_PATTERN.test(sessionId))) {
      return sendError(res, 400, 'INVALID_INPUT', 'Invalid session id.');
    }
    req.chat = { question: message.trim(), sessionId };
    next();
  };

  router.get('/chat/status', (req, res) => {
    res.set('Cache-Control', 'no-store').json({ enabled: config.enabled });
  });

  router.post('/chat', chatLimiter, requireEnabled, validate, async (req, res) => {
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
  router.post('/chat/stream', chatLimiter, requireEnabled, validate, async (req, res) => {
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
        const code = err instanceof ChatError && err.code === 'UPSTREAM_TIMEOUT' ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_ERROR';
        send('error', { code, error: PUBLIC_MESSAGES[code] });
      }
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  });

  return router;
}

/** Abort the upstream Flowise request if the browser disconnects before we finish. */
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
