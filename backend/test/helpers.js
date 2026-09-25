import { createApp } from '../app.js';

export const noGitHub = { getRepos: async () => ({ repos: [], external: [], source: 'cache', fetchedAt: '' }) };

export const enabledAssistant = { enabled: true, model: 'test-model', dailyLimit: 0, systemPrompt: 'test' };

/** Build an app with safe defaults: no real network services, generous limits. */
export function makeApp(overrides = {}) {
  return createApp({
    env: {},
    github: noGitHub,
    assistantConfig: { enabled: false, reason: 'test' },
    mailerConfig: { enabled: false, reason: 'test' },
    rateLimit: { limit: 1000 },
    contactRateLimit: { limit: 1000 },
    ...overrides,
  }).app;
}

/** Parse an SSE body into [{ event, data }]. */
export function parseSSE(text) {
  return text
    .split('\n\n')
    .filter((block) => block.includes('data:'))
    .map((block) => {
      const event = /^event: (.+)$/m.exec(block)?.[1];
      const data = JSON.parse(/^data: (.+)$/m.exec(block)[1]);
      return { event, data };
    });
}
