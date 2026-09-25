export const DEFAULT_FLOWISE_BASE_URL = 'https://cloud.flowiseai.com';
const PREDICTION_PATH = '/api/v1/prediction/';

// Values copied straight from .env.example look like "<your-chatflow-id>".
const isPlaceholder = (value) => /[<>]/.test(value);

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Resolve the Flowise configuration from environment variables.
 *
 * Order: FLOWISE_API_URL (full prediction endpoint) → FLOWISE_BASE_URL + FLOWISE_CHATFLOW_ID.
 * Never throws: returns { enabled: false, reason } when the chatbot can't be used, so the
 * server still boots.
 */
export function resolveFlowiseConfig(env = process.env) {
  const apiUrl = clean(env.FLOWISE_API_URL);
  const chatflowId = clean(env.FLOWISE_CHATFLOW_ID);
  const baseUrl = clean(env.FLOWISE_BASE_URL) || DEFAULT_FLOWISE_BASE_URL;
  let apiKey = clean(env.FLOWISE_API_KEY);
  const warnings = [];

  if (apiKey && isPlaceholder(apiKey)) {
    warnings.push('FLOWISE_API_KEY looks like a placeholder and was ignored');
    apiKey = '';
  }

  let url;
  if (apiUrl) {
    if (isPlaceholder(apiUrl)) {
      return disabled('FLOWISE_API_URL still contains a placeholder (<...>)', warnings);
    }
    if (!apiUrl.includes(PREDICTION_PATH)) {
      return disabled(
        `FLOWISE_API_URL must be the full prediction endpoint (…${PREDICTION_PATH}<chatflow-id>), not the site root`,
        warnings
      );
    }
    url = apiUrl;
  } else if (chatflowId) {
    if (isPlaceholder(chatflowId)) {
      return disabled('FLOWISE_CHATFLOW_ID still contains a placeholder (<...>)', warnings);
    }
    url = `${baseUrl.replace(/\/+$/, '')}${PREDICTION_PATH}${encodeURIComponent(chatflowId)}`;
  } else {
    return disabled('set FLOWISE_API_URL, or FLOWISE_CHATFLOW_ID (+ optional FLOWISE_BASE_URL)', warnings);
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return disabled(`Flowise URL is not a valid URL`, warnings);
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return disabled('Flowise URL must start with http:// or https://', warnings);
  }

  const id = parsed.pathname.split(PREDICTION_PATH)[1]?.replace(/\/+$/, '') ?? '';
  if (!id) {
    return disabled(`Flowise URL is missing the chatflow id after ${PREDICTION_PATH}`, warnings);
  }

  return {
    enabled: true,
    url: parsed.toString(),
    apiKey: apiKey || null,
    host: parsed.host,
    chatflowIdTail: id.slice(-4),
    warnings,
  };
}

function disabled(reason, warnings) {
  return { enabled: false, reason, warnings };
}

/** One human-readable status line for startup logs. Never includes secrets. */
export function describeFlowiseConfig(config) {
  return config.enabled
    ? `Chatbot: enabled (${config.host}, chatflow …${config.chatflowIdTail}${config.apiKey ? ', API key set' : ''})`
    : `Chatbot: DISABLED – ${config.reason}`;
}
