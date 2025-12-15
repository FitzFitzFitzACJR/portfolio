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
   FLOWISE_API_URL=https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id
   FLOWISE_API_KEY=your_flowise_api_key_here
   FLOWISE_CHATFLOW_ID=your-chatflow-id
   FLOWISE_BASE_URL=https://cloud.flowise.ai
   GITHUB_PROFILE_URL=https://github.com/yourusername
   PORT=5000
   ```

   **Frontend (.env):**
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_GITHUB_PROFILE_URL=https://github.com/yourusername
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

**📝 Flowise Resources Available:**
- `FLOWISE_SYSTEM_PROMPT.txt` - Copy-paste ready system prompt (quickest option)
- `FLOWISE_PROMPT_TEMPLATE.md` - Comprehensive guide with detailed instructions
- `FLOWISE_QUICK_START.md` - Step-by-step setup guide
- `FLOWISE_TROUBLESHOOTING.md` - Troubleshooting guide (especially if getting HTML responses)
- `FLOWISE_KNOWLEDGE_BASE.md` - Complete knowledge base document with portfolio info and FAQs
- `FLOWISE_KNOWLEDGE_BASE_SETUP.md` - Guide for setting up knowledge base in Flowise

### Getting Your Flowise Chatflow URL

1. **If using Flowise Cloud:**
   - Sign up at [cloud.flowise.ai](https://cloud.flowise.ai)
   - Create a new chatflow
   - **Use the prompt template** from `FLOWISE_PROMPT_TEMPLATE.md` to configure your chatflow
   - Configure your chatflow with portfolio assistant prompts
   - Copy the chatflow API URL (format: `https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id`)
   - Or copy just the chatflow ID

2. **If using self-hosted Flowise:**
   - Deploy Flowise on your server
   - Create a chatflow
   - **Use the prompt template** from `FLOWISE_PROMPT_TEMPLATE.md` to configure your chatflow
   - Use your Flowise instance URL (format: `http://your-flowise-instance/api/v1/prediction/your-chatflow-id`)

### Configuration Options

You can configure Flowise in two ways:

**Option 1: Full API URL**
```env
FLOWISE_API_URL=https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your_api_key_if_required
```

**Option 2: Chatflow ID + Base URL**
```env
FLOWISE_CHATFLOW_ID=your-chatflow-id
FLOWISE_BASE_URL=https://cloud.flowise.ai
FLOWISE_API_KEY=your_api_key_if_required
```

## Environment Variables

### Backend (.env)

- `FLOWISE_API_URL` - Full Flowise chatflow API URL (e.g., `https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id`) - **OR** use `FLOWISE_CHATFLOW_ID` + `FLOWISE_BASE_URL`
- `FLOWISE_API_KEY` - Your Flowise API key (optional, required if your chatflow has authentication)
- `FLOWISE_CHATFLOW_ID` - Your Flowise chatflow ID (alternative to FLOWISE_API_URL)
- `FLOWISE_BASE_URL` - Flowise base URL (default: `https://cloud.flowise.ai`, used with FLOWISE_CHATFLOW_ID)
- `GITHUB_PROFILE_URL` - Your GitHub profile URL (required for projects section, e.g., `https://github.com/username`)
- `PORT` - Server port (default: 5000)

### Frontend (.env)

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5000)
- `VITE_GITHUB_PROFILE_URL` - GitHub profile URL (optional)

## Render Deployment

**📘 For detailed deployment instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)**

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
FLOWISE_API_URL=https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your_api_key_if_required
FLOWISE_CHATFLOW_ID=your-chatflow-id
FLOWISE_BASE_URL=https://cloud.flowise.ai
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
VITE_GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69
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

### POST /api/chat

Send a message to the Flowise AI chatbot.

**Request:**
```json
{
  "message": "What technologies do you use?",
  "history": [] // Optional: chat history for context
}
```

**Response:**
```json
{
  "reply": "I use React, Node.js, Express, and various modern web technologies..."
}
```

**Note:** The chatbot uses Flowise AI's chatflow API. Make sure you have:
1. Created a chatflow in Flowise (self-hosted or cloud)
2. Configured the chatflow with your portfolio assistant prompts
3. Set the `FLOWISE_API_URL` or `FLOWISE_CHATFLOW_ID` in your environment variables

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

