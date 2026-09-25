import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createGitHubService, GitHubUnavailableError } from '../services/github.js';
import { parseLimit } from '../routes/github.js';
import { makeApp } from './helpers.js';

const repo = (name, extra = {}) => ({
  id: name.length + (extra.id ?? 0),
  name,
  full_name: `me/${name}`,
  owner: { login: 'me' },
  html_url: `https://github.com/me/${name}`,
  fork: false,
  archived: false,
  private: false,
  pushed_at: '2026-01-01T00:00:00Z',
  stargazers_count: 1,
  language: 'JavaScript',
  ...extra,
});

const OWN = [
  repo('older', { pushed_at: '2025-01-01T00:00:00Z' }),
  repo('newest', { pushed_at: '2026-09-01T00:00:00Z' }),
  repo('a-fork', { fork: true }),
  repo('old-archive', { archived: true }),
  repo('pic'),
  repo('portfolio'),
];

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });

function service({ fetchImpl, now = () => 0, ttlMs = 1000 } = {}) {
  return createGitHubService({
    username: 'me',
    featuredRepos: ['ME/Portfolio', 'team/capstone'],
    hiddenRepos: ['pic'],
    externalRepos: [{ owner: 'team', name: 'capstone', label: 'Team project' }],
    fetchImpl,
    now,
    ttlMs,
  });
}

const okFetch = async (url) =>
  url.includes('/users/')
    ? json(OWN)
    : json({ ...repo('capstone'), full_name: 'team/capstone', owner: { login: 'team' } });

describe('GitHub service', () => {
  it('filters forks, archived, hidden and featured repos, sorts by push date, and labels team repos', async () => {
    const result = await service({ fetchImpl: okFetch }).getRepos({ limit: 10 });
    expect(result.source).toBe('live');
    expect(result.repos.map((r) => r.name)).toEqual(['newest', 'older']);
    expect(result.external).toEqual([expect.objectContaining({ fullName: 'team/capstone', label: 'Team project' })]);
  });

  it('caches for the TTL and de-duplicates concurrent refreshes', async () => {
    let calls = 0;
    let t = 0;
    const svc = service({
      fetchImpl: async (url) => {
        calls++;
        await new Promise((r) => setTimeout(r, 10));
        return okFetch(url);
      },
      now: () => t,
    });
    await Promise.all([svc.getRepos(), svc.getRepos(), svc.getRepos()]);
    expect(calls).toBe(2); // one user-repos call + one external repo call
    expect((await svc.getRepos()).source).toBe('cache');
    t = 5000;
    expect((await svc.getRepos()).source).toBe('live');
    expect(calls).toBe(4);
  });

  it('serves the last good result when GitHub fails after the cache expires', async () => {
    let t = 0;
    let down = false;
    const svc = service({
      fetchImpl: async (url) => (down ? Promise.reject(new TypeError('fetch failed')) : okFetch(url)),
      now: () => t,
    });
    await svc.getRepos();
    t = 5000;
    down = true;
    const result = await svc.getRepos();
    expect(result.source).toBe('stale');
    expect(result.repos.map((r) => r.name)).toEqual(['newest', 'older']);
  });

  it('throws GitHubUnavailableError (with a rate-limit hint) when nothing is cached', async () => {
    const svc = service({
      fetchImpl: async () => json({}, 403, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1790000000' }),
    });
    const error = await svc.getRepos().catch((e) => e);
    expect(error).toBeInstanceOf(GitHubUnavailableError);
    expect(error.message).toMatch(/rate limit.*GITHUB_TOKEN/);
  });

  it('sends the token when configured', async () => {
    let auth;
    const svc = createGitHubService({
      username: 'me',
      token: 'ghp_test',
      fetchImpl: async (url, init) => {
        auth = init.headers.Authorization;
        return json([]);
      },
    });
    await svc.getRepos();
    expect(auth).toBe('Bearer ghp_test');
  });
});

describe('GET /api/github/repos', () => {
  it('parses and clamps limit', () => {
    expect(parseLimit(undefined)).toBe(6);
    expect(parseLimit('abc')).toBe(6);
    expect(parseLimit('0')).toBe(1);
    expect(parseLimit('999')).toBe(30);
    expect(parseLimit('12')).toBe(12);
  });

  it('returns repos with a cache header', async () => {
    const github = service({ fetchImpl: okFetch });
    const res = await request(makeApp({ github })).get('/api/github/repos?limit=1').expect(200);
    expect(res.headers['cache-control']).toBe('public, max-age=300');
    expect(res.body).toMatchObject({ count: 1, source: 'live' });
    expect(res.body.repos[0].name).toBe('newest');
  });

  it('returns 503 GITHUB_UNAVAILABLE when GitHub is down and nothing is cached', async () => {
    const github = service({ fetchImpl: async () => Promise.reject(new TypeError('fetch failed')) });
    const res = await request(makeApp({ github })).get('/api/github/repos').expect(503);
    expect(res.body.code).toBe('GITHUB_UNAVAILABLE');
  });
});
