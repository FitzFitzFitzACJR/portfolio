import express from 'express';
import rateLimit from 'express-rate-limit';

export const LIMITS = { name: 100, email: 254, messageMin: 10, messageMax: 5000 };
// Deliberately simple: one @, no spaces, a dot in the domain. The real check is the reply.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendError = (res, status, code, error) => res.status(status).json({ error, code });

/** Returns { value } or { error } for a contact submission. */
export function validateContact(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > LIMITS.name) return { error: `Please enter your name (up to ${LIMITS.name} characters).` };
  if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email)
    return { error: 'Please enter a valid email address.' };
  if (message.length < LIMITS.messageMin || message.length > LIMITS.messageMax) {
    return { error: `Please write a message between ${LIMITS.messageMin} and ${LIMITS.messageMax} characters.` };
  }
  return { value: { name, email, message } };
}

/**
 * @param {object} deps
 * @param {{ enabled: boolean }} deps.config - resolved mailer config
 * @param {{ send: Function } | null} deps.mailer
 * @param {{ windowMs?: number, limit?: number }} [deps.rateLimit]
 */
export default function createContactRouter({ config, mailer, rateLimit: limits = {} }) {
  const router = express.Router();

  const limiter = rateLimit({
    windowMs: limits.windowMs ?? 60 * 60 * 1000,
    limit: limits.limit ?? 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) =>
      sendError(
        res,
        429,
        'RATE_LIMITED',
        'Too many messages from your network. Please try again later or email directly.'
      ),
  });

  router.get('/contact/status', (req, res) => {
    res.set('Cache-Control', 'no-store').json({ enabled: config.enabled });
  });

  router.post('/contact', limiter, async (req, res) => {
    // Honeypot: real visitors never see or fill the `website` field. Pretend success so bots move on.
    if (typeof req.body?.website === 'string' && req.body.website.trim()) {
      console.warn('[contact] honeypot triggered; message dropped');
      return res.json({ ok: true });
    }

    const { value, error } = validateContact(req.body);
    if (error) return sendError(res, 400, 'INVALID_INPUT', error);

    if (!config.enabled) {
      return sendError(res, 503, 'CONTACT_DISABLED', 'The contact form is not available right now.');
    }

    try {
      await mailer.send(value);
      res.json({ ok: true });
    } catch (err) {
      console.error(`[contact] send failed: ${err?.message ?? err}`);
      sendError(res, 502, 'CONTACT_FAILED', 'Your message could not be sent.');
    }
  });

  return router;
}
