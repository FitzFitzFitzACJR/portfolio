import { readFileSync } from 'node:fs';

/**
 * Contact-form email via Resend's REST API (https://resend.com/docs/api-reference/emails/send-email).
 * Plain-text only: visitor input never ends up in HTML.
 */

const RESEND_URL = 'https://api.resend.com/emails';
const REQUEST_TIMEOUT_MS = 10_000;
// Resend's shared test sender. It may only deliver to the Resend account's own address;
// verify a domain in Resend and set CONTACT_FROM_EMAIL to send from your own address.
export const DEFAULT_FROM = 'Portfolio Contact <onboarding@resend.dev>';
const PROFILE_URL = new URL('../content/profile.json', import.meta.url);

export class MailerError extends Error {
  constructor(detail) {
    super(detail);
    this.name = 'MailerError';
  }
}

const clean = (value) => (typeof value === 'string' ? value.trim() : '');
const oneLine = (value) => value.replace(/[\r\n]+/g, ' ').trim();

/** Resolve mailer settings. Never throws: disabled (with a reason) when not configured. */
export function resolveMailerConfig(env = process.env) {
  const apiKey = clean(env.RESEND_API_KEY);
  let defaultTo = '';
  try {
    defaultTo = JSON.parse(readFileSync(PROFILE_URL, 'utf8')).contactEmail ?? '';
  } catch {
    /* generated file missing: CONTACT_TO_EMAIL must be set */
  }
  const to = clean(env.CONTACT_TO_EMAIL) || defaultTo;
  const from = clean(env.CONTACT_FROM_EMAIL) || DEFAULT_FROM;

  if (!apiKey || /[<>]/.test(apiKey)) return { enabled: false, reason: 'set RESEND_API_KEY' };
  if (!to) return { enabled: false, reason: 'no recipient (CONTACT_TO_EMAIL or profile email)' };
  return { enabled: true, apiKey, to, from };
}

export function describeMailerConfig(config) {
  return config.enabled
    ? `Contact form: enabled (to ${config.to})`
    : `Contact form: DISABLED – ${config.reason} (visitors get a mailto: fallback)`;
}

export function createResendMailer(config, { fetchImpl = fetch } = {}) {
  /** @param {{ name: string, email: string, message: string }} msg - already validated */
  async function send({ name, email, message }) {
    const body = {
      from: config.from,
      to: [config.to],
      reply_to: email,
      subject: `Portfolio contact from ${oneLine(name)}`.slice(0, 150),
      text: `From: ${oneLine(name)} <${email}>\n\n${message}\n\n-- Sent from the portfolio contact form`,
    };
    let res;
    try {
      res = await fetchImpl(RESEND_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (err) {
      throw new MailerError(`Resend request failed: ${err?.message ?? err}`);
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new MailerError(`Resend HTTP ${res.status}: ${detail.slice(0, 300)}`);
    }
  }

  return { send };
}
