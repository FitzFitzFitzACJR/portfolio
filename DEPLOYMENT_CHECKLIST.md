# Deployment Checklist

Use this checklist when deploying to Render.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] Flowise chatflow is created and deployed
- [ ] Flowise API URL/chatflow ID is ready
- [ ] GitHub profile URL is correct

## Backend Deployment

- [ ] Created Web Service on Render
- [ ] Connected GitHub repository
- [ ] Set Root Directory: `backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Added all environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000` (optional, Render sets this)
  - [ ] `FLOWISE_API_URL` (or `FLOWISE_CHATFLOW_ID` + `FLOWISE_BASE_URL`)
  - [ ] `FLOWISE_API_KEY` (if required)
  - [ ] `GITHUB_PROFILE_URL`
  - [ ] `FRONTEND_URL` (update after frontend deploys)
- [ ] Backend deployed successfully
- [ ] Backend URL copied (e.g., `https://portfolio-ai-backend.onrender.com`)
- [ ] Health check works: `GET /health`

## Frontend Deployment

- [ ] Created Static Site on Render
- [ ] Connected GitHub repository
- [ ] Set Root Directory: `frontend`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Publish Directory: `dist`
- [ ] Added environment variables:
  - [ ] `VITE_API_BASE_URL` (backend URL)
  - [ ] `VITE_GITHUB_PROFILE_URL`
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied (e.g., `https://portfolio-ai-frontend.onrender.com`)

## Post-Deployment

- [ ] Updated backend `FRONTEND_URL` to frontend URL
- [ ] Backend redeployed with updated `FRONTEND_URL`
- [ ] Tested frontend → backend API calls
- [ ] Tested chatbot functionality
- [ ] Tested projects display
- [ ] Verified all GitHub links work
- [ ] Checked CORS is working (no errors in browser console)
- [ ] Tested on mobile/tablet (responsive design)

## Testing

- [ ] Backend health endpoint: `/health`
- [ ] Backend projects endpoint: `/api/github/repos`
- [ ] Frontend loads correctly
- [ ] Projects section displays
- [ ] Chatbot opens and responds
- [ ] All navigation links work
- [ ] GitHub profile links work

## Troubleshooting

If issues occur:
- [ ] Check Render deployment logs
- [ ] Verify all environment variables are set
- [ ] Check CORS configuration
- [ ] Test API endpoints directly
- [ ] Verify Flowise API is accessible
- [ ] Check browser console for errors

---

**Quick Reference:** See [RENDER_QUICK_REFERENCE.md](./RENDER_QUICK_REFERENCE.md)

