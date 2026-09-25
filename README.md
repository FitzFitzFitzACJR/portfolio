# Portfolio AI - Full-Stack Web Developer Portfolio

A production-ready full-stack portfolio website with an integrated AI chatbot assistant, built for Arnold Cutad Jr.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Axios
- **Backend:** Node.js, Express
- **AI:** Flowise AI (Chatflow Cloud API)
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

- Node.js (v18 or higher)
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
   FLOWISE_API_URL=https://cloud.flowiseai.com/api/v1/prediction/your-chatflow-id
   FLOWISE_API_KEY=your_flowise_api_key_here
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

## Flowise AI Setup

The chatbot uses **Flowise AI** to power the chatflow. You can use either:
- **Flowise Cloud** (recommended for quick setup)
- **Self-hosted Flowise** instance

**📝 Flowise resources (in [`docs/`](./docs)):**
- [`docs/flowise-setup.md`](./docs/flowise-setup.md) - Create the chatflow, add the knowledge base, connect the backend, troubleshooting
- [`docs/flowise-system-prompt.txt`](./docs/flowise-system-prompt.txt) - Copy-paste ready system prompt
- [`docs/flowise-knowledge-base.md`](./docs/flowise-knowledge-base.md) - Portfolio facts and FAQs to load into Flowise

### Getting Your Flowise Chatflow URL

1. **If using Flowise Cloud:**
   - Sign up at [cloud.flowiseai.com](https://cloud.flowiseai.com)
   - Create a new chatflow
   - **Use the prompt template** from `docs/flowise-system-prompt.txt` to configure your chatflow
   - Configure your chatflow with portfolio assistant prompts
   - Copy the chatflow API URL (format: `https://cloud.flowiseai.com/api/v1/prediction/your-chatflow-id`)
   - Or copy just the chatflow ID

2. **If using self-hosted Flowise:**
   - Deploy Flowise on your server
   - Create a chatflow
   - **Use the prompt template** from `docs/flowise-system-prompt.txt` to configure your chatflow
   - Use your Flowise instance URL (format: `http://your-flowise-instance/api/v1/prediction/your-chatflow-id`)

### Configuration Options

You can configure Flowise in two ways:

**Option 1: Full API URL**
```env
FLOWISE_API_URL=https://cloud.flowiseai.com/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your_api_key_if_required
```

**Option 2: Chatflow ID + Base URL**
```env
FLOWISE_CHATFLOW_ID=your-chatflow-id
FLOWISE_BASE_URL=https://cloud.flowiseai.com
FLOWISE_API_KEY=your_api_key_if_required
```

## Environment Variables

### Backend (.env)

- `FLOWISE_API_URL` - Full Flowise chatflow API URL (e.g., `https://cloud.flowiseai.com/api/v1/prediction/your-chatflow-id`) - **OR** use `FLOWISE_CHATFLOW_ID` + `FLOWISE_BASE_URL`
- `FLOWISE_API_KEY` - Your Flowise API key (optional, required if your chatflow has authentication)
- `FLOWISE_CHATFLOW_ID` - Your Flowise chatflow ID (alternative to FLOWISE_API_URL)
- `FLOWISE_BASE_URL` - Flowise base URL (default: `https://cloud.flowiseai.com`, used with FLOWISE_CHATFLOW_ID)
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
FLOWISE_API_URL=https://cloud.flowiseai.com/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your_api_key_if_required
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
`CHAT_DISABLED`, `RATE_LIMITED`, `UPSTREAM_TIMEOUT`, `UPSTREAM_ERROR`, `INVALID_INPUT`, `CORS_REJECTED`.
Chat routes are rate-limited (20 requests / 5 min / IP); messages are capped at 1,000 characters.

### GET /health

`{ "status": "ok", "chatbot": "enabled" | "disabled", "uptime": 123 }`

### GET /api/chat/status

`{ "enabled": true }`. Never exposes URLs or keys.

### POST /api/chat

Non-streaming reply (used as a fallback).

**Request:**
```json
{ "message": "What technologies do you use?", "sessionId": "optional-uuid-for-memory" }
```

**Response:**
```json
{ "reply": "I use React, Node.js, Express, ..." }
```

`sessionId` is forwarded to Flowise (`overrideConfig.sessionId`) so a Memory node can keep context.

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

