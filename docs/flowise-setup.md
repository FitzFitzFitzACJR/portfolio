# Flowise Setup & Troubleshooting

How to create, connect and debug the Flowise chatflow behind the portfolio assistant.

> Flowise Cloud lives at **https://cloud.flowiseai.com**. (Not `cloud.flowise.ai`, which older versions of these docs used.)
> Cloud V2 accounts do not sync with V1, so a chatflow or credential created on V1 may need to be recreated.

Related files:
- [`flowise-system-prompt.txt`](./flowise-system-prompt.txt): system prompt to paste into the Chat Model node.
- [`flowise-knowledge-base.md`](./flowise-knowledge-base.md): portfolio facts and FAQs to load as a document.

---

## 1. Create the chatflow

1. Log in at https://cloud.flowiseai.com (or your self-hosted instance) and create a new chatflow, e.g. "Portfolio Assistant".
2. Add a **Chat Model** node (OpenAI, Anthropic, Google, etc.) and attach your LLM credential. Credentials are per account, so re-add them after a V1 → V2 move.
3. Paste the contents of `flowise-system-prompt.txt` into the model's **System Message**.
4. Add a **Memory** node (e.g. Buffer Memory) so the assistant remembers earlier turns. The backend sends a per-visitor `sessionId` so each visitor gets their own history.
5. Suggested model settings: temperature 0.7–0.9, max tokens 500–1000.
6. Save, then test in Flowise's own chat panel before touching the portfolio:
   - "What technologies does Arnold use?"
   - "Tell me about Arnold's projects"
   - "How can I contact Arnold?"

```
[Start] → [Document Loader (knowledge base)] → [Chat Model + system prompt] → [Memory] → [Output]
```

## 2. Add the knowledge base

Pick one:

| Method | How | When |
|---|---|---|
| **Document Loader** (recommended) | Add a Document Loader / File Loader node, upload `flowise-knowledge-base.md` (Markdown or Text), connect it to the chat chain. | Small knowledge base like this one. |
| **Vector Store + Retrieval** | Document Loader → Embeddings → Vector Store → Retrieval QA → Chat Model. Chunk size 1000–2000, overlap 200–500, top K 3–5. | Large or frequently growing content. |
| **Inline in the system prompt** | Paste the FAQ section into the system message. | Simplest, but you must edit the prompt on every change. |

Whenever your info changes, update the knowledge base file, re-upload it, and re-test.

## 3. Connect the backend

1. Open the chatflow and click the **`</>` (API Endpoint)** button. Copy the prediction URL:
   `https://cloud.flowiseai.com/api/v1/prediction/<chatflow-id>`
2. If the chatflow requires a key: **Flowise → API Keys**, create one, and assign it to the chatflow.
3. Put both in `backend/.env` (gitignored), never in `.env.example`:
   ```env
   FLOWISE_API_URL=https://cloud.flowiseai.com/api/v1/prediction/<chatflow-id>
   FLOWISE_API_KEY=<your-key>
   ```
   Alternatively set `FLOWISE_BASE_URL=https://cloud.flowiseai.com` + `FLOWISE_CHATFLOW_ID=<id>` and leave `FLOWISE_API_URL` empty.
4. Restart the backend and test without the UI:
   ```bash
   curl -X POST http://localhost:5000/api/chat -H "Content-Type: application/json" -d '{"message":"Hello"}'
   ```
   PowerShell:
   ```powershell
   Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/chat -ContentType 'application/json' -Body '{"message":"Hello"}'
   ```

You can also call Flowise directly to rule out the backend:
```bash
curl -X POST https://cloud.flowiseai.com/api/v1/prediction/<chatflow-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-key>" \
  -d '{"question": "Hello"}'
```
Expected: JSON like `{"text": "Hello! ..."}`.

## 4. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Response is HTML (`<!DOCTYPE html>`) | URL is the site root, a share/embed link, or missing `/api/v1/prediction/` | Use the exact URL from the `</>` button. |
| 404 Not Found | Wrong chatflow ID, or chatflow was on Cloud V1 and no longer exists | Re-copy the ID; recreate the chatflow if needed. |
| 401 / 403 | Missing or wrong `FLOWISE_API_KEY`, or key not assigned to the chatflow | Create/assign a key in Flowise → API Keys. |
| `ENOTFOUND` / cannot connect | Typo in the host (e.g. `cloud.flowise.ai`) | Host must be `cloud.flowiseai.com` or your own instance. |
| Timeout | Slow model, or chatflow errors internally | Test the chatflow in Flowise's chat panel; check its logs. |
| Works locally, not on Render | Env vars not set on Render, or changed without redeploying | Set them in the service's Environment tab and redeploy. |
| Bot forgets previous messages | No Memory node in the chatflow | Add a Memory node (the backend supplies `sessionId`). |
| Bot ignores the knowledge base | Loader not connected, or retrieval threshold too strict | Check node wiring; raise chunk size / lower similarity threshold. |

Checklist:
- [ ] URL contains `/api/v1/prediction/` and the host is correct
- [ ] Chatflow is saved and answers in Flowise's own chat panel
- [ ] `backend/.env` exists and the backend was restarted after editing it
- [ ] API key (if required) is valid and assigned to the chatflow
- [ ] Direct `curl` to Flowise returns JSON, not HTML
