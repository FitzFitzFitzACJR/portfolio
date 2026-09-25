# Portfolio AI - Full-Stack Web Developer Portfolio

A production-ready full-stack portfolio website with an integrated AI chatbot assistant, built for Arnold Cutad Jr.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express
- **AI:** Claude Haiku 4.5 via the Anthropic API (streaming)
- **Deployment:** Render-ready

## Features

- Modern, responsive portfolio design
- AI chatbot assistant for portfolio inquiries
- **Dynamic GitHub projects** - Automatically displays your public repositories
- Sections: Hero, Skills, Projects, Contact
- Streaming-like chat responses
- Environment-based configuration

## Local Setup

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- npm or yarn

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:

   **Backend (.env):**
   ```env
   ANTHROPIC_API_KEY=<your-anthropic-api-key>
   GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69
   PORT=5000
   ```

   **Frontend (.env):**
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## AI Assistant

The chatbot calls **Claude Haiku 4.5** directly from the backend (Anthropic Messages API) and streams replies
to the browser. Its knowledge comes from `frontend/src/content/profile.js`: after editing that file, run
`npm run kb:export` to regenerate `backend/assistant/system-prompt.md`, then restart/redeploy the backend.

Setup, cost controls and troubleshooting: **[docs/assistant.md](./docs/assistant.md)**.

## Environment Variables

### Backend (.env)

- `ANTHROPIC_API_KEY` - Anthropic API key (required for the chatbot; without it the site works and the chatbot shows as offline)
- `ANTHROPIC_MODEL` - Optional, defaults to `claude-haiku-4-5`
- `CHAT_DAILY_LIMIT` - Optional global cap on chat messages per UTC day (default 300, `0` = off)
- `FRONTEND_URL` - Comma-separated origins allowed by CORS (your deployed frontend)
- `GITHUB_PROFILE_URL` - Your GitHub profile URL (required for projects section, e.g., `https://github.com/username`)
- `PORT` - Server port (default: 5000)

### Frontend (.env)

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5000)

## Render Deployment

**📘 For detailed deployment instructions, see [docs/deployment.md](./docs/deployment.md)**

### Quick Setup

#### Backend (Web Service)

**Settings:**
- **Type:** Web Service
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
```env
NODE_ENV=production
PORT=10000
ANTHROPIC_API_KEY=<your-anthropic-api-key>
GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69
FRONTEND_URL=https://your-frontend.onrender.com
```

#### Frontend (Static Site)

**Settings:**
- **Type:** Static Site
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

**Environment Variables:**
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

### Deployment Order

1. **Deploy Backend** → Copy the backend URL
2. **Deploy Frontend** → Use backend URL in `VITE_API_BASE_URL`
3. **Update Backend** → Set `FRONTEND_URL` to your frontend URL

### Important Notes

- CORS is configured to accept requests from your frontend URL
- Backend automatically uses `process.env.PORT` (Render sets this)
- Update `FRONTEND_URL` in backend after frontend is deployed
- All environment variables must be set in Render dashboard

## Project Structure

```
portfolio-ai/
├── frontend/          # React frontend
├── backend/           # Express backend
├── package.json       # Root package.json
└── README.md
```

## API Endpoints

Errors are JSON `{ "error": "<short message>", "code": "<CODE>" }` with codes such as
`CHAT_DISABLED`, `RATE_LIMITED`, `DAILY_LIMIT`, `UPSTREAM_TIMEOUT`, `UPSTREAM_ERROR`, `INVALID_INPUT`, `CORS_REJECTED`.
Chat routes are rate-limited (20 requests / 5 min / IP); messages are capped at 1,000 characters.

### GET /health

`{ "status": "ok", "chatbot": "enabled" | "disabled", "uptime": 123 }`

### GET /api/chat/status

`{ "enabled": true }`. Never exposes URLs or keys.

### POST /api/chat

Non-streaming reply (used as a fallback).

**Request:**
```json
{
  "message": "What technologies do you use?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! Ask me about Arnold." }
  ]
}
```

**Response:**
```json
{ "reply": "I use React, Node.js, Express, ..." }
```

`history` is optional: the last 10 turns (max 2,000 chars each, 12,000 total) sent as conversation context.

### POST /api/chat/stream

Same request body; responds with Server-Sent Events:
```
event: token
data: {"text":"Hello"}

event: end
data: {}
```
On failure an `error` event is sent: `data: {"code":"UPSTREAM_ERROR","error":"..."}`.

### GET /api/github/repos

Fetch GitHub repositories dynamically.

**Query Parameters:**
- `limit` (optional) - Maximum number of repos to return (default: 6)

**Response:**
```json
{
  "repos": [
    {
      "id": 123456789,
      "name": "portfolio-ai",
      "description": "Full-stack portfolio with AI chatbot",
      "url": "https://github.com/username/portfolio-ai",
      "language": "JavaScript",
      "languages": ["JavaScript", "HTML", "CSS"],
      "stars": 10,
      "forks": 2,
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

## Development

- `npm run install-all` - Install all dependencies
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build frontend for production
- `npm start` - Start backend server

## License

MIT

