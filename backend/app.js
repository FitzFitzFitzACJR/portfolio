import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import createChatRouter from './routes/chat.js';
import githubRoutes from './routes/github.js';
import { resolveFlowiseConfig } from './config/flowise.js';
import { createFlowiseClient } from './services/flowise.js';

const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'];

/** Allowed browser origins: FRONTEND_URL (comma-separated), plus local Vite ports outside production. */
export function resolveAllowedOrigins(env = process.env) {
  const configured = (env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  const isProduction = env.NODE_ENV === 'production';
  return new Set(isProduction ? configured : [...configured, ...DEV_ORIGINS]);
}

/**
 * Build the Express app. Dependencies are injectable for tests.
 * @param {object} [options]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {object} [options.flowiseConfig] - defaults to resolveFlowiseConfig(env)
 * @param {object} [options.flowiseClient] - defaults to a real client when enabled
 * @param {object} [options.rateLimit] - { windowMs, limit } override for chat routes
 */
export function createApp({ env = process.env, flowiseConfig, flowiseClient, rateLimit } = {}) {
  const config = flowiseConfig ?? resolveFlowiseConfig(env);
  const client = flowiseClient ?? (config.enabled ? createFlowiseClient(config) : null);
  const allowedOrigins = resolveAllowedOrigins(env);
  const allowAnyOrigin = allowedOrigins.has('*');

  const app = express();
  app.disable('x-powered-by');
  // Render (and most hosts) sit behind one proxy; needed for correct client IPs in rate limiting.
  app.set('trust proxy', Number(env.TRUST_PROXY ?? (env.NODE_ENV === 'production' ? 1 : 0)));

  app.use(helmet());

  // Reject disallowed browser origins outright (requests without Origin, e.g. curl/health checks, pass).
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (!origin || allowAnyOrigin || allowedOrigins.has(origin)) return next();
    res.status(403).json({ error: 'Origin not allowed.', code: 'CORS_REJECTED' });
  });
  app.use(
    cors({
      origin: (origin, callback) => callback(null, true), // already filtered above
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      maxAge: 600,
    })
  );

  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (req, res) => {
    res.set('Cache-Control', 'no-store').json({
      status: 'ok',
      chatbot: config.enabled ? 'enabled' : 'disabled',
      uptime: Math.round(process.uptime()),
    });
  });

  app.use('/api', createChatRouter({ config, client, rateLimit }));
  app.use('/api', githubRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request is too large.', code: 'PAYLOAD_TOO_LARGE' });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON body.', code: 'INVALID_INPUT' });
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL' });
  });

  return { app, config };
}
