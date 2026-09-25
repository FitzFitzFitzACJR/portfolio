import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import createChatRouter from './routes/chat.js';
import createGitHubRouter from './routes/github.js';
import createContactRouter from './routes/contact.js';
import { resolveAssistantConfig } from './config/assistant.js';
import { createAssistantClient } from './services/assistant.js';
import { resolveGitHubConfig } from './config/github.js';
import { createGitHubService } from './services/github.js';
import { createResendMailer, resolveMailerConfig } from './services/mailer.js';

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

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
 * @param {object} [options.assistantConfig] - defaults to resolveAssistantConfig(env)
 * @param {object} [options.assistantClient] - defaults to a real Claude client when enabled
 * @param {object} [options.rateLimit] - { windowMs, limit } override for chat routes
 * @param {object} [options.github] - GitHub service ({ getRepos }); defaults to the real one
 * @param {object} [options.mailerConfig] - defaults to resolveMailerConfig(env)
 * @param {object} [options.mailer] - contact mailer ({ send }); defaults to Resend when configured
 * @param {object} [options.contactRateLimit] - { windowMs, limit } override for the contact route
 */
export function createApp({
  env = process.env,
  assistantConfig,
  assistantClient,
  rateLimit,
  github,
  mailerConfig,
  mailer,
  contactRateLimit,
} = {}) {
  const config = assistantConfig ?? resolveAssistantConfig(env);
  const client = assistantClient ?? (config.enabled ? createAssistantClient(config) : null);
  const githubService = github ?? createGitHubService(resolveGitHubConfig(env));
  const contactConfig = mailerConfig ?? resolveMailerConfig(env);
  const contactMailer = mailer ?? (contactConfig.enabled ? createResendMailer(contactConfig) : null);
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

  // Room for a message plus a short, capped conversation history (see routes/chat.js).
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (req, res) => {
    res.set('Cache-Control', 'no-store').json({
      status: 'ok',
      chatbot: config.enabled ? 'enabled' : 'disabled',
      uptime: Math.round(process.uptime()),
    });
  });

  app.use('/api', createChatRouter({ config, client, rateLimit }));
  app.use('/api', createGitHubRouter({ github: githubService }));
  app.use('/api', createContactRouter({ config: contactConfig, mailer: contactMailer, rateLimit: contactRateLimit }));

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

  return { app, config, contactConfig };
}
