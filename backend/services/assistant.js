import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude-backed portfolio assistant (Anthropic Messages API).
 * The system prompt (instructions + knowledge base) is identical on every request, so it is
 * marked for prompt caching; Claude Haiku 4.5 only caches prefixes of 4096+ tokens, so this
 * starts paying off once the knowledge base grows past that.
 */

export class ChatError extends Error {
  /**
   * @param {'UPSTREAM_TIMEOUT'|'UPSTREAM_ERROR'|'ABORTED'} code - stable code sent to the client
   * @param {string} detail - full detail for server logs only
   */
  constructor(code, detail) {
    super(detail);
    this.name = 'ChatError';
    this.code = code;
  }
}

// Replies are meant to be short chat answers; this also caps cost per message.
const MAX_OUTPUT_TOKENS = 1024;
const REQUEST_TIMEOUT_MS = 45_000;

/**
 * @param {{ apiKey: string, model: string, systemPrompt: string }} config
 * @param {{ anthropic?: Anthropic }} [deps] - inject a client (or one with a mock baseURL) for tests
 */
export function createAssistantClient(config, { anthropic } = {}) {
  const client = anthropic ?? new Anthropic({ apiKey: config.apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });

  const buildParams = (messages) => ({
    model: config.model,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [{ type: 'text', text: config.systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages,
  });

  /** Non-streaming reply. Resolves with the full text. */
  async function predict({ messages, signal }) {
    try {
      const response = await client.messages.create(buildParams(messages), { signal });
      logUsage(response);
      return extractText(response);
    } catch (err) {
      throw toChatError(err);
    }
  }

  /** Streaming reply. Calls onToken(text) for each text delta; resolves when the message ends. */
  async function stream({ messages, signal, onToken }) {
    let emitted = false;
    try {
      const messageStream = client.messages.stream(buildParams(messages), { signal });
      for await (const event of messageStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta' && event.delta.text) {
          emitted = true;
          onToken(event.delta.text);
        }
      }
      const final = await messageStream.finalMessage();
      logUsage(final);
      if (!emitted) throw new ChatError('UPSTREAM_ERROR', `Empty reply (stop_reason: ${final.stop_reason})`);
    } catch (err) {
      throw toChatError(err);
    }
  }

  return { predict, stream };
}

function extractText(response) {
  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
  if (!text) throw new ChatError('UPSTREAM_ERROR', `Empty reply (stop_reason: ${response.stop_reason})`);
  return text;
}

function logUsage(message) {
  const u = message.usage ?? {};
  console.log(
    `[chat] ${message.model} stop=${message.stop_reason} in=${u.input_tokens ?? 0} out=${u.output_tokens ?? 0} cache_read=${u.cache_read_input_tokens ?? 0} cache_write=${u.cache_creation_input_tokens ?? 0}`
  );
}

/** Map SDK errors to stable codes; the message keeps the detail for server logs. */
export function toChatError(err) {
  if (err instanceof ChatError) return err;
  // Most specific first: the abort/timeout classes extend the broader ones.
  if (err instanceof Anthropic.APIUserAbortError) return new ChatError('ABORTED', 'Request aborted by client');
  if (err instanceof Anthropic.APIConnectionTimeoutError)
    return new ChatError('UPSTREAM_TIMEOUT', 'Claude API timed out');
  if (err instanceof Anthropic.AuthenticationError) {
    return new ChatError('UPSTREAM_ERROR', 'Claude API 401: invalid ANTHROPIC_API_KEY');
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return new ChatError('UPSTREAM_ERROR', `Claude API 403: key lacks access to this model – ${err.message}`);
  }
  if (err instanceof Anthropic.NotFoundError) {
    return new ChatError('UPSTREAM_ERROR', `Claude API 404: unknown model (check ANTHROPIC_MODEL) – ${err.message}`);
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new ChatError('UPSTREAM_ERROR', `Claude API 429: rate limited – ${err.message}`);
  }
  if (err instanceof Anthropic.APIError && err.status === 402) {
    return new ChatError('UPSTREAM_ERROR', 'Claude API 402: out of credit – add credit in the Anthropic Console');
  }
  if (err instanceof Anthropic.APIError && err.status) {
    return new ChatError('UPSTREAM_ERROR', `Claude API ${err.status} (${err.type ?? 'error'}): ${err.message}`);
  }
  if (err instanceof Anthropic.APIConnectionError)
    return new ChatError('UPSTREAM_ERROR', `Cannot reach Claude API: ${err.message}`);
  if (err?.name === 'AbortError') return new ChatError('ABORTED', 'Request aborted by client');
  return new ChatError('UPSTREAM_ERROR', `Unexpected assistant error: ${err?.message ?? err}`);
}
