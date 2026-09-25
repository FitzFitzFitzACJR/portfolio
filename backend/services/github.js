/**
 * Public GitHub repositories for the "More on GitHub" feed, plus metadata for featured team repos.
 * Results are cached in memory (1 h by default); if GitHub fails, the last good result is served.
 */

const API = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 8_000;
export const DEFAULT_TTL_MS = 60 * 60 * 1000;

export class GitHubUnavailableError extends Error {
  constructor(detail) {
    super(detail);
    this.name = 'GitHubUnavailableError';
  }
}

/** Shape sent to the browser. */
export function toRepo(raw) {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    owner: raw.owner?.login ?? null,
    description: raw.description ?? null,
    url: raw.html_url,
    homepage: raw.homepage || null,
    language: raw.language ?? null,
    stars: raw.stargazers_count ?? 0,
    forks: raw.forks_count ?? 0,
    topics: raw.topics ?? [],
    pushedAt: raw.pushed_at ?? null,
  };
}

/**
 * @param {object} options
 * @param {string} options.username
 * @param {string[]} [options.featuredRepos] - "owner/name" already shown as featured
 * @param {string[]} [options.hiddenRepos] - repo names (owned by `username`) to leave out
 * @param {{ owner: string, name: string, label?: string }[]} [options.externalRepos]
 * @param {string} [options.token] - optional GITHUB_TOKEN (5,000 req/h instead of 60)
 */
export function createGitHubService({
  username,
  featuredRepos = [],
  hiddenRepos = [],
  externalRepos = [],
  token,
  ttlMs = DEFAULT_TTL_MS,
  fetchImpl = fetch,
  now = Date.now,
}) {
  const featured = new Set(featuredRepos.map((r) => r.toLowerCase()));
  const hidden = new Set(hiddenRepos.map((r) => r.toLowerCase()));
  let cache = null; // { repos, external, fetchedAt }
  let inflight = null;

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'portfolio-backend',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  async function getJson(path) {
    let res;
    try {
      res = await fetchImpl(`${API}${path}`, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (err) {
      throw new GitHubUnavailableError(`GitHub request failed (${path}): ${err?.message ?? err}`);
    }
    if (!res.ok) {
      const remaining = res.headers.get('x-ratelimit-remaining');
      const reset = res.headers.get('x-ratelimit-reset');
      const rateLimited = (res.status === 403 || res.status === 429) && remaining === '0';
      throw new GitHubUnavailableError(
        rateLimited
          ? `GitHub rate limit exhausted until ${new Date(Number(reset) * 1000).toISOString()} (set GITHUB_TOKEN to raise it)`
          : `GitHub HTTP ${res.status} for ${path}`
      );
    }
    return res.json();
  }

  async function fetchOwnRepos() {
    const raw = await getJson(`/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100`);
    return raw
      .filter((r) => !r.fork && !r.archived && !r.private)
      .filter((r) => !hidden.has(r.name.toLowerCase()) && !featured.has(r.full_name.toLowerCase()))
      .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
      .map(toRepo);
  }

  async function fetchExternalRepos(previous = []) {
    const results = await Promise.allSettled(
      externalRepos.map(async ({ owner, name, label }) => ({
        ...toRepo(await getJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`)),
        label: label ?? 'Team project',
      }))
    );
    return results.flatMap((result, i) => {
      if (result.status === 'fulfilled') return [result.value];
      console.warn(`[github] ${result.reason?.message}`);
      // Keep the last known metadata for this repo rather than dropping it.
      const { owner, name } = externalRepos[i];
      return previous.filter((r) => r.fullName?.toLowerCase() === `${owner}/${name}`.toLowerCase());
    });
  }

  async function refresh() {
    const [repos, external] = await Promise.all([fetchOwnRepos(), fetchExternalRepos(cache?.external)]);
    cache = { repos, external, fetchedAt: now() };
    return cache;
  }

  /**
   * @returns {Promise<{ repos, external, source: 'live'|'cache'|'stale', fetchedAt: string }>}
   * @throws {GitHubUnavailableError} when GitHub fails and nothing is cached yet
   */
  async function getRepos({ limit = 6 } = {}) {
    let source = 'cache';
    if (!cache || now() - cache.fetchedAt >= ttlMs) {
      inflight ??= refresh().finally(() => {
        inflight = null;
      });
      try {
        await inflight;
        source = 'live';
      } catch (err) {
        if (!cache) throw err;
        console.warn(`[github] serving stale cache: ${err.message}`);
        source = 'stale';
      }
    }
    return {
      repos: cache.repos.slice(0, limit),
      external: cache.external,
      source,
      fetchedAt: new Date(cache.fetchedAt).toISOString(),
    };
  }

  return { getRepos };
}
