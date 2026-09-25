import { describe, expect, it } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import { resolveAssistantConfig } from '../config/assistant.js';
import { ChatError, createAssistantClient } from '../services/assistant.js';

const config = { apiKey: 'test-key', model: 'claude-haiku-4-5', systemPrompt: 'You are a test.' };

/** Anthropic client whose HTTP layer is a fake fetch, so the real SDK error mapping runs. */
function clientWith(fetchImpl) {
  const anthropic = new Anthropic({
    apiKey: 'test-key',
    fetch: fetchImpl,
    maxRetries: 0,
    baseURL: 'http://anthropic.test',
  });
  return createAssistantClient(config, { anthropic });
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const sse = (events) =>
  new Response(
    events.map(([type, data]) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`).join(''),
    {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    }
  );

describe('resolveAssistantConfig', () => {
  it('is disabled without a key, with a placeholder key, or without a prompt', () => {
    expect(resolveAssistantConfig({}, { systemPrompt: 'x' })).toMatchObject({ enabled: false });
    expect(
      resolveAssistantConfig({ ANTHROPIC_API_KEY: '<your-anthropic-api-key>' }, { systemPrompt: 'x' })
    ).toMatchObject({
      enabled: false,
    });
    expect(resolveAssistantConfig({ ANTHROPIC_API_KEY: 'k' }, { systemPrompt: '' })).toMatchObject({ enabled: false });
  });

  it('defaults the model and daily limit', () => {
    const cfg = resolveAssistantConfig({ ANTHROPIC_API_KEY: 'k', CHAT_DAILY_LIMIT: 'abc' }, { systemPrompt: 'x' });
    expect(cfg).toMatchObject({ enabled: true, model: 'claude-haiku-4-5', dailyLimit: 300 });
  });
});

describe('createAssistantClient', () => {
  it('sends the cached system prompt and returns the reply text', async () => {
    let sent;
    const client = clientWith(async (url, init) => {
      sent = JSON.parse(init.body);
      return json(200, {
        id: 'msg_1',
        type: 'message',
        role: 'assistant',
        model: 'claude-haiku-4-5',
        content: [{ type: 'text', text: ' Hi there ' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 2 },
      });
    });
    await expect(client.predict({ messages: [{ role: 'user', content: 'hi' }] })).resolves.toBe('Hi there');
    expect(sent.model).toBe('claude-haiku-4-5');
    expect(sent.system).toEqual([{ type: 'text', text: 'You are a test.', cache_control: { type: 'ephemeral' } }]);
    expect(sent.max_tokens).toBeGreaterThan(0);
  });

  it('streams text deltas', async () => {
    const client = clientWith(async () =>
      sse([
        [
          'message_start',
          {
            message: {
              id: 'm',
              type: 'message',
              role: 'assistant',
              model: 'x',
              content: [],
              stop_reason: null,
              usage: { input_tokens: 1, output_tokens: 0 },
            },
          },
        ],
        ['content_block_start', { index: 0, content_block: { type: 'text', text: '' } }],
        ['content_block_delta', { index: 0, delta: { type: 'text_delta', text: 'Hel' } }],
        ['content_block_delta', { index: 0, delta: { type: 'text_delta', text: 'lo' } }],
        ['content_block_stop', { index: 0 }],
        ['message_delta', { delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 2 } }],
        ['message_stop', {}],
      ])
    );
    const tokens = [];
    await client.stream({ messages: [{ role: 'user', content: 'hi' }], onToken: (t) => tokens.push(t) });
    expect(tokens.join('')).toBe('Hello');
  });

  it.each([
    [401, { type: 'error', error: { type: 'authentication_error', message: 'bad key' } }, /401/],
    [404, { type: 'error', error: { type: 'not_found_error', message: 'model' } }, /404/],
    [429, { type: 'error', error: { type: 'rate_limit_error', message: 'slow down' } }, /429/],
    [529, { type: 'error', error: { type: 'overloaded_error', message: 'busy' } }, /529/],
  ])('maps HTTP %i to UPSTREAM_ERROR with a useful log message', async (status, body, pattern) => {
    const client = clientWith(async () => json(status, body));
    const error = await client.predict({ messages: [{ role: 'user', content: 'hi' }] }).catch((e) => e);
    expect(error).toBeInstanceOf(ChatError);
    expect(error.code).toBe('UPSTREAM_ERROR');
    expect(error.message).toMatch(pattern);
  });

  it('maps a client abort to ABORTED', async () => {
    const controller = new AbortController();
    const client = clientWith(
      (url, init) =>
        new Promise((_, reject) =>
          init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
        )
    );
    const pending = client.predict({ messages: [{ role: 'user', content: 'hi' }], signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' });
  });
});
