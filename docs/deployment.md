# Deploying to Render

The app deploys as two Render services from the same repo:

| Service | Type | Root directory | Build command | Start / publish |
|---|---|---|---|---|
| Backend | Web Service | `backend` | `npm ci` | `npm start` |
| Frontend | Static Site | `frontend` | `npm ci && npm run build` | publish `dist` |

Node version: `22.x` (see `.nvmrc` and the `engines` field in each `package.json`).

## Order

1. **Deploy the backend** and copy its URL, e.g. `https://portfolio-ai-backend.onrender.com`.
2. **Deploy the frontend** with `VITE_API_BASE_URL` set to that backend URL.
3. **Set the backend's `FRONTEND_URL`** to the frontend URL and redeploy, so CORS allows it.

## Environment variables

Set these in each service's **Environment** tab. Never commit real values.

### Backend (Web Service)

| Variable | Required | Example / notes |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `PORT` | no | Set by Render automatically. |
| `FRONTEND_URL` | yes | `https://your-frontend.onrender.com` (comma-separate multiple origins) |
| `ANTHROPIC_API_KEY` | yes (for the chatbot) | Secret. Without it the site works and the chatbot shows as offline. |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-haiku-4-5`. |
| `CHAT_DAILY_LIMIT` | no | Global chat messages per UTC day. Default 300, `0` = off. |
| `GITHUB_PROFILE_URL` | yes | `https://github.com/FitzFitzFitz69` |

### Frontend (Static Site)

| Variable | Example / notes |
|---|---|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |

Vite bakes `VITE_*` values in at **build time**, so redeploy the static site after changing them.

## Verify

- [ ] `GET https://<backend>/health` returns `{"status":"ok", ...}`. The first hit after idling can take 30–60 s because free instances sleep.
- [ ] `GET https://<backend>/api/github/repos` returns project data
- [ ] Frontend loads; projects display; no CORS errors in the browser console
- [ ] Chatbot opens and replies
- [ ] All links work; layout OK on mobile

## Troubleshooting

| Problem | Check |
|---|---|
| Backend won't start | Build logs; Node version; env vars present. |
| CORS errors | `FRONTEND_URL` exactly matches the frontend origin (scheme + host, no trailing slash). |
| Chatbot errors | See [assistant.md](./assistant.md#4-troubleshooting). |
| Frontend calls the wrong API | `VITE_API_BASE_URL` set and the static site rebuilt after setting it. |
| Slow first response | Free Web Services spin down after inactivity; upgrade for always-on. |

## Custom domains

Add the domain under the service's **Settings → Custom Domains**, update DNS as instructed, then add the new origin to the backend's `FRONTEND_URL`.

## Auto-deploy

Render redeploys both services on every push to the connected branch (`main`).
