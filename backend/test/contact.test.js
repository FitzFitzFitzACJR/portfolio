import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { validateContact } from '../routes/contact.js';
import { createResendMailer, resolveMailerConfig } from '../services/mailer.js';
import { makeApp } from './helpers.js';

const mailerConfig = {
  enabled: true,
  apiKey: 're_test',
  to: 'owner@example.com',
  from: 'Portfolio <onboarding@resend.dev>',
};
const valid = {
  name: 'Jane Recruiter',
  email: 'jane@example.com',
  message: 'Hello! We would like to talk about a role.',
};

function appWithMailer({ fetchImpl = async () => new Response('{"id":"1"}'), limit = 1000 } = {}) {
  const fetchSpy = vi.fn(fetchImpl);
  const app = makeApp({
    mailerConfig,
    mailer: createResendMailer(mailerConfig, { fetchImpl: fetchSpy }),
    contactRateLimit: { limit },
  });
  return { app, fetchSpy };
}

describe('validateContact', () => {
  it.each([
    [{ ...valid, name: '' }, /name/],
    [{ ...valid, email: 'not-an-email' }, /email/],
    [{ ...valid, message: 'short' }, /message/],
    [{ ...valid, message: 'x'.repeat(5001) }, /message/],
  ])('rejects invalid input', (body, pattern) => {
    expect(validateContact(body).error).toMatch(pattern);
  });

  it('trims valid input', () => {
    expect(validateContact({ ...valid, name: '  Jane  ' }).value.name).toBe('Jane');
  });
});

describe('POST /api/contact', () => {
  it('sends a plain-text email with reply_to set to the visitor', async () => {
    const { app, fetchSpy } = appWithMailer();
    await request(app)
      .post('/api/contact')
      .send({ ...valid, name: 'Jane\r\nBcc: evil@x.com' })
      .expect(200, { ok: true });
    const [url, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test');
    expect(body).toMatchObject({ to: ['owner@example.com'], reply_to: 'jane@example.com' });
    expect(body.subject).not.toMatch(/[\r\n]/);
    expect(body).not.toHaveProperty('html');
  });

  it('silently drops honeypot submissions', async () => {
    const { app, fetchSpy } = appWithMailer();
    await request(app)
      .post('/api/contact')
      .send({ ...valid, website: 'http://spam.example' })
      .expect(200, { ok: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid input', async () => {
    const { app } = appWithMailer();
    const res = await request(app)
      .post('/api/contact')
      .send({ ...valid, email: 'nope' })
      .expect(400);
    expect(res.body.code).toBe('INVALID_INPUT');
  });

  it('returns 503 CONTACT_DISABLED when no mail provider is configured', async () => {
    const res = await request(makeApp()).post('/api/contact').send(valid).expect(503);
    expect(res.body.code).toBe('CONTACT_DISABLED');
    const status = await request(makeApp()).get('/api/contact/status').expect(200);
    expect(status.body).toEqual({ enabled: false });
  });

  it('returns 502 CONTACT_FAILED when the provider rejects the email', async () => {
    const { app } = appWithMailer({
      fetchImpl: async () => new Response('{"message":"domain not verified"}', { status: 403 }),
    });
    const res = await request(app).post('/api/contact').send(valid).expect(502);
    expect(res.body.code).toBe('CONTACT_FAILED');
    expect(JSON.stringify(res.body)).not.toContain('domain not verified');
  });

  it('rate-limits per IP', async () => {
    const { app } = appWithMailer({ limit: 1 });
    await request(app).post('/api/contact').send(valid).expect(200);
    const res = await request(app).post('/api/contact').send(valid).expect(429);
    expect(res.body.code).toBe('RATE_LIMITED');
  });
});

describe('resolveMailerConfig', () => {
  it('is disabled without RESEND_API_KEY and defaults the recipient to the profile email', () => {
    expect(resolveMailerConfig({})).toMatchObject({ enabled: false });
    const cfg = resolveMailerConfig({ RESEND_API_KEY: 're_x' });
    expect(cfg.enabled).toBe(true);
    expect(cfg.to).toMatch(/@/);
  });
});
