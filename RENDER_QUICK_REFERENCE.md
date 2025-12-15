# Render Deployment - Quick Reference

## Backend (Web Service)

### Settings
- **Type:** Web Service
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Environment Variables
```env
NODE_ENV=production
PORT=10000
FLOWISE_API_URL=https://cloud.flowise.ai/api/v1/prediction/your-chatflow-id
FLOWISE_API_KEY=your_api_key_if_required
GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69
FRONTEND_URL=https://your-frontend.onrender.com
```

---

## Frontend (Static Site)

### Settings
- **Type:** Static Site
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### Environment Variables
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GITHUB_PROFILE_URL=https://github.com/FitzFitzFitz69
```

---

## Deployment Order

1. **Deploy Backend first** → Get backend URL
2. **Deploy Frontend** → Use backend URL in `VITE_API_BASE_URL`
3. **Update Backend** → Set `FRONTEND_URL` to frontend URL

---

## Commands

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

---

## URLs to Update

After deployment, update:
1. Backend `FRONTEND_URL` = Your frontend Render URL
2. Frontend `VITE_API_BASE_URL` = Your backend Render URL

