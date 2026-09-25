/**
 * Flowise prediction API client.
 * Docs: POST <host>/api/v1/prediction/<chatflowId>
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

const PREDICT_TIMEOUT_MS = 45_000;
const STREAM_TIMEOUT_MS = 90_000;

export function createFlowiseClient(
  config,
  { fetchImpl = fetch, predictTimeoutMs = PREDICT_TIMEOUT_MS, streamTimeoutMs = STREAM_TIMEOUT_MS } = {}
) {
  const headers = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  const buildBody = ({ question, sessionId, streaming }) => {
    const body = { question, streaming };
    if (sessionId) {
      // chatId groups messages in Flowise; overrideConfig.sessionId keys the Memory node.
      body.chatId = sessionId;
      body.overrideConfig = { sessionId };
    }
    return JSON.stringify(body);
  };

  async function post({ question, sessionId, streaming, signal, timeoutMs }) {
    const timeout = AbortSignal.timeout(timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let res;
    try {
      res = await fetchImpl(config.url, {
        method: 'POST',
        headers: streaming ? { ...headers, Accept: 'text/event-stream' } : headers,
        body: buildBody({ question, sessionId, streaming }),
        signal: combined,
      });
    } catch (err) {
      throw toChatError(err, timeout);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const text = await safeText(res);
      throw new ChatError('UPSTREAM_ERROR', `Flowise HTTP ${res.status}: ${hint(res.status)} ${text.slice(0, 300)}`);
    }
    if (contentType.includes('text/html')) {
      throw new ChatError(
        'UPSTREAM_ERROR',
        'Flowise returned HTML instead of JSON – the URL points at the web UI, not /api/v1/prediction/<id>'
      );
    }
    return { res, contentType, timeout };
  }

  /** Non-streaming prediction. Resolves with the full reply text. */
  async function predict({ question, sessionId, signal }) {
    const { res, timeout } = await post({ question, sessionId, streaming: false, signal, timeoutMs: predictTimeoutMs });
    let data;
    try {
      data = await res.json();
    } catch (err) {
      throw toChatError(err, timeout, 'Flowise returned a non-JSON body');
    }
    return extractText(data);
  }

  /**
   * Streaming prediction. Calls onToken(text) for each chunk and resolves when Flowise ends.
   * If the chatflow can't stream, Flowise answers with plain JSON; that is relayed as one token.
   */
  async function stream({ question, sessionId, signal, onToken }) {
    const { res, contentType, timeout } = await post({
      question,
      sessionId,
      streaming: true,
      signal,
      timeoutMs: streamTimeoutMs,
    });

    if (!contentType.includes('text/event-stream')) {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw toChatError(err, timeout, 'Flowise returned a non-JSON body');
      }
      onToken(extractText(data));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    try {
      for await (const chunk of res.body) {
        buffer += decoder.decode(chunk, { stream: true }).replace(/\r\n/g, '\n');
        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const event = parseFlowiseEvent(block);
          if (!event) continue;
          if (event.event === 'token' && typeof event.data === 'string') onToken(event.data);
          else if (event.event === 'error') throw new ChatError('UPSTREAM_ERROR', `Flowise stream error: ${stringify(event.data)}`);
          else if (event.event === 'end') return;
        }
      }
    } catch (err) {
      throw toChatError(err, timeout);
    }
  }

  return { predict, stream };
}

/** Flowise SSE blocks look like "message:\ndata:{"event":"token","data":"Hi"}". */
export function parseFlowiseEvent(block) {
  const data = block
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).replace(/^ /, ''))
    .join('\n');
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function extractText(data) {
  if (typeof data === 'string') return data.trim();
  const text = data?.text ?? data?.answer ?? data?.json;
  if (typeof text === 'string') return text.trim();
  if (text && typeof text === 'object') return JSON.stringify(text);
  throw new ChatError('UPSTREAM_ERROR', `Unexpected Flowise response shape: ${JSON.stringify(data).slice(0, 200)}`);
}

function toChatError(err, timeoutSignal, context) {
  if (err instanceof ChatError) return err;
  if (timeoutSignal?.aborted) return new ChatError('UPSTREAM_TIMEOUT', 'Flowise did not respond in time');
  if (err?.name === 'AbortError') return new ChatError('ABORTED', 'Request aborted by client');
  const cause = err?.cause?.code ? ` (${err.cause.code})` : '';
  return new ChatError('UPSTREAM_ERROR', `${context ?? 'Flowise request failed'}: ${err?.message ?? err}${cause}`);
}

function hint(status) {
  if (status === 401 || status === 403) return 'check FLOWISE_API_KEY and that the key is assigned to the chatflow.';
  if (status === 404) return 'chatflow not found – check the chatflow id (Cloud V1 flows may not exist on V2).';
  if (status === 429) return 'Flowise rate limit hit.';
  return '';
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function stringify(value) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}
