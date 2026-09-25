# AI Assistant (Claude)

The portfolio chatbot calls **Claude Haiku 4.5** directly through the Anthropic Messages API from the Express backend.
(It used Flowise before; Flowise reached end-of-life on 31 Aug 2026, so it was removed.)

```
Browser ──POST /api/chat/stream──▶ Express backend ──Messages API (streaming)──▶ Claude
         ◀──SSE token/end/error──                 ◀──text deltas──
```

- **What it knows:** `backend/assistant/system-prompt.md`: instructions plus a knowledge base,
  **generated** from `frontend/src/content/profile.js` (the same file the website reads). Don't edit it by hand.
- **Memory:** the backend is stateless. The browser sends the last 10 turns of the conversation
  with each message (capped at 2,000 characters per turn / 12,000 total).
- **Cost controls:** replies capped at 1,024 tokens; 20 messages / 5 min per IP; a global daily cap
  (`CHAT_DAILY_LIMIT`, default 300). The system prompt is marked for prompt caching, but Haiku 4.5
  only caches prompts of 4,096+ tokens, so caching kicks in only once the knowledge base grows (currently ~2.5k tokens).
  At Haiku 4.5 pricing ($1 / $5 per million input/output tokens) a typical message costs about half a US cent.

## 1. Get an API key

1. Sign in at https://console.anthropic.com and add a little prepaid credit (Settings → Billing).
2. **Set a monthly spend limit** (Settings → Limits) as a safety net on top of `CHAT_DAILY_LIMIT`.
3. Create a key (Settings → API Keys). Treat it like a password.

## 2. Configure the backend

`backend/.env` (gitignored; on Render use the service's Environment tab):

```env
ANTHROPIC_API_KEY=<your-key>
# optional
ANTHROPIC_MODEL=claude-haiku-4-5
CHAT_DAILY_LIMIT=300
```

Restart the backend. The startup log tells you whether it worked:

```
Chatbot: enabled (claude-haiku-4-5, daily limit 300)
Chatbot: DISABLED – set ANTHROPIC_API_KEY
```

`GET /health` also reports `"chatbot": "enabled" | "disabled"`. Test without the UI:

```bash
curl -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d '{"message":"Is Arnold a graduate?"}'
```

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/chat -ContentType 'application/json' -Body '{"message":"Is Arnold a graduate?"}'
```

## 3. Update what the assistant knows

1. Edit `frontend/src/content/profile.js`.
2. Run `npm run kb:export`. It rewrites `backend/assistant/system-prompt.md` and lists any `TODO`s still open in the profile.
3. Commit and redeploy (or restart the backend locally). The prompt is loaded at startup.

`npm run kb:check` fails if the committed prompt is out of date (useful in CI).

## 4. Troubleshooting

Visitors only see short friendly messages. The real cause is in the backend logs, prefixed `[chat]`.
Each successful reply also logs its token usage (`in=… out=… cache_read=…`).

| Log / symptom | Cause | Fix |
|---|---|---|
| `Chatbot: DISABLED – set ANTHROPIC_API_KEY` | Key missing | Add it to `backend/.env` / Render and restart. |
| `…system-prompt.md is missing` | Generated prompt not committed | Run `npm run kb:export` and commit the file. |
| `Claude API 401: invalid ANTHROPIC_API_KEY` | Wrong or revoked key | Create a new key in the Console. |
| `Claude API 402: out of credit` | Prepaid credit used up | Add credit in the Console. |
| `Claude API 404: unknown model` | Typo in `ANTHROPIC_MODEL` | Remove it to use the default. |
| `Claude API 429` / `529 (overloaded_error)` | Anthropic rate limit or temporary overload | Retried once automatically; otherwise wait. |
| `daily message limit reached` | `CHAT_DAILY_LIMIT` hit | Raise it, or wait until 00:00 UTC. |
| Timeout (`UPSTREAM_TIMEOUT`) | No response within 45 s | Usually transient; try again. |
| Answers are wrong or outdated | Stale profile / prompt | Update `profile.js`, `npm run kb:export`, redeploy. |
