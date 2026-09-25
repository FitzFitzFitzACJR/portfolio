import express from 'express';
import { GitHubUnavailableError } from '../services/github.js';

export const DEFAULT_LIMIT = 6;
export const MAX_LIMIT = 30;

/** "?limit=" → integer in [1, MAX_LIMIT]; missing or invalid → DEFAULT_LIMIT. */
export function parseLimit(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

/** @param {{ github: { getRepos: Function } }} deps */
export default function createGitHubRouter({ github }) {
  const router = express.Router();

  /**
   * GET /api/github/repos?limit=6
   * → { repos: Repo[], external: Repo[], count, source: 'live'|'cache'|'stale', fetchedAt }
   * `repos` excludes forks, archived, featured and hidden repos; `external` holds featured team repos.
   */
  router.get('/github/repos', async (req, res, next) => {
    try {
      const result = await github.getRepos({ limit: parseLimit(req.query.limit) });
      res.set('Cache-Control', 'public, max-age=300').json({ ...result, count: result.repos.length });
    } catch (err) {
      if (!(err instanceof GitHubUnavailableError)) return next(err);
      console.error(`[github] ${err.message}`);
      res.status(503).json({ error: 'Projects from GitHub are unavailable right now.', code: 'GITHUB_UNAVAILABLE' });
    }
  });

  return router;
}
