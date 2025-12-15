# Render Deployment Guide

Complete guide for deploying the Portfolio AI application to Render.

## Deployment Architecture

- **Frontend:** Static Site (React/Vite)
- **Backend:** Web Service (Node.js/Express)

## Prerequisites

1. GitHub repository with your code
2. Render account (sign up at https://render.com)
3. Flowise AI chatflow configured

---

## Step 1: Backend Deployment (Web Service)

### 1.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `FitzFitzFitz69/portfolio`

### 1.2 Configure Backend Service

**Basic Settings:**
- **Name:** `portfolio-ai-backend` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)
- **Root Directory:** `backend`

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
Add these in the Render dashboard:

```env
NODE_ENV=production
PORT=10000
FLOWISE_API_URL=https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your_flowise_api_key_if_required
FLOWISE_CHATFLOW_ID=your-chatflow-id
FLOWISE_BASE_URL=https://cloud.flowise.ai
GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69
FRONTEND_URL=https://your-frontend.onrender.com
```

**Important Notes:**
- `PORT` is automatically set by Render, but you can specify it
- `FRONTEND_URL` should be your frontend Render URL (update after deploying frontend)
- Replace `your-chatflow-id` with your actual Flowise chatflow ID

### 1.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Copy the service URL (e.g., `https://portfolio-ai-backend.onrender.com`)

---

## Step 2: Frontend Deployment (Static Site)

### 2.1 Create New Static Site

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Select the repository: `FitzFitzFitz69/portfolio`

### 2.2 Configure Frontend Service

**Basic Settings:**
- **Name:** `portfolio-ai-frontend` (or your preferred name)
- **Branch:** `main` (or your default branch)
- **Root Directory:** `frontend`

**Build & Deploy:**
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

**Environment Variables:**
Add these in the Render dashboard:

```env
VITE_API_BASE_URL=https://portfolio-ai-backend.onrender.com
VITE_GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69
```

**Important Notes:**
- `VITE_API_BASE_URL` must match your backend service URL
- Replace `portfolio-ai-backend.onrender.com` with your actual backend URL
- All Vite env vars must start with `VITE_`

### 2.3 Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for deployment to complete
3. Copy the site URL (e.g., `https://portfolio-ai-frontend.onrender.com`)

---

## Step 3: Update Environment Variables

### 3.1 Update Backend FRONTEND_URL

After frontend is deployed, update the backend environment variable:

1. Go to your **Backend Web Service** on Render
2. Go to **"Environment"** tab
3. Update `FRONTEND_URL` to your frontend URL:
   ```env
   FRONTEND_URL=https://portfolio-ai-frontend.onrender.com
   ```
4. Click **"Save Changes"**
5. Render will automatically redeploy

### 3.2 Verify CORS

The backend CORS is configured to accept requests from your frontend URL. If you have issues:

1. Check that `FRONTEND_URL` in backend matches your frontend URL exactly
2. The backend allows all origins in development, but restricts in production

---

## Environment Variables Summary

### Backend (.env in Render)

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Flowise AI Configuration
FLOWISE_API_URL=https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your_flowise_api_key_if_required
FLOWISE_CHATFLOW_ID=your-chatflow-id
FLOWISE_BASE_URL=https://cloud.flowise.ai

# GitHub Configuration
GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69

# CORS Configuration
FRONTEND_URL=https://portfolio-ai-frontend.onrender.com
```

### Frontend (.env in Render)

```env
# API Configuration
VITE_API_BASE_URL=https://portfolio-ai-backend.onrender.com

# GitHub Configuration
VITE_GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69
```

---

## Deployment Commands Reference

### Backend (Web Service)

**Root Directory:** `backend`

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Local Testing:**
```bash
cd backend
npm install
npm start
```

### Frontend (Static Site)

**Root Directory:** `frontend`

**Build Command:**
```bash
npm install && npm run build
```

**Publish Directory:**
```
dist
```

**Local Testing:**
```bash
cd frontend
npm install
npm run build
npm run preview
```

---

## Post-Deployment Checklist

- [ ] Backend service is running and accessible
- [ ] Frontend static site is deployed
- [ ] Backend `FRONTEND_URL` matches frontend URL
- [ ] Frontend `VITE_API_BASE_URL` matches backend URL
- [ ] Flowise API URL is correct
- [ ] CORS is working (test API calls from frontend)
- [ ] Chatbot is responding correctly
- [ ] Projects are displaying correctly
- [ ] All GitHub links work

---

## Testing Deployment

### Test Backend

1. **Health Check:**
   ```
   GET https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"Portfolio AI Backend is running"}`

2. **Test API:**
   ```
   GET https://your-backend.onrender.com/api/github/repos
   ```
   Should return project data

### Test Frontend

1. Visit your frontend URL
2. Check that projects load
3. Test the chatbot
4. Verify all links work

---

## Troubleshooting

### Backend Issues

**Service won't start:**
- Check that `PORT` environment variable is set (Render sets this automatically)
- Verify all required environment variables are set
- Check build logs for errors

**CORS errors:**
- Ensure `FRONTEND_URL` in backend matches your frontend URL exactly
- Check that frontend is making requests to the correct backend URL
- Verify CORS configuration in `backend/server.js`

**Flowise API errors:**
- Verify `FLOWISE_API_URL` is correct
- Check that chatflow is deployed in Flowise
- Ensure API key is correct (if required)

### Frontend Issues

**Build fails:**
- Check that all dependencies are in `package.json`
- Verify Node.js version (Render uses Node 18+ by default)
- Check build logs for specific errors

**API calls fail:**
- Verify `VITE_API_BASE_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is running and accessible

**Projects not loading:**
- Check that `VITE_GITHUB_PROFILE_URL` is set
- Verify backend `/api/github/repos` endpoint works

---

## Custom Domain (Optional)

### Backend Custom Domain

1. Go to your Backend Web Service
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain
4. Update DNS records as instructed

### Frontend Custom Domain

1. Go to your Static Site
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain
4. Update DNS records as instructed
5. Update `FRONTEND_URL` in backend to match

---

## Auto-Deploy

Render automatically deploys when you push to your connected branch:

1. Push changes to `main` branch
2. Render detects the push
3. Automatically builds and deploys
4. Updates are live in a few minutes

---

## Cost Information

- **Static Sites:** Free tier available
- **Web Services:** Free tier available (spins down after inactivity)
- **Upgrade:** For always-on services, upgrade to paid plan

---

## Support

If you encounter issues:
1. Check Render deployment logs
2. Verify all environment variables
3. Test endpoints individually
4. Check Render status page
5. Review this guide's troubleshooting section

---

**Last Updated:** 2025
**Project:** Portfolio AI - Full-Stack Portfolio with AI Chatbot

