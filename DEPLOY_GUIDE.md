## 🚀 OnTime Deployment Guide

### Quick Deployment: Vercel + Render.com

---

## Step 1: Push to GitHub

```bash
# Make sure you're on dev branch
git status

# Add deployment files
git add .
git commit -m "chore: add deployment configurations"
git push origin dev
```

---

## Step 2: Deploy Backend on Render.com

### A. Create Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### B. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `ontime-api`
   - **Region:** Choose closest to your location
   - **Branch:** `dev`
   - **Root Directory:** `backend`
   - **Runtime:** `PHP`
   - **Build Command:** 
     ```bash
     composer install --no-dev --optimize-autoloader
     ```
   - **Start Command:**
     ```bash
     php artisan serve --host=0.0.0.0 --port=$PORT
     ```

### C. Create MySQL Database
1. Click **"New +"** → **"PostgreSQL"** (or use external MySQL)
2. **Name:** `ontime-db`
3. **Region:** Same as web service
4. Copy the connection details

### D. Environment Variables
Add these in Web Service → Environment:

```
APP_NAME=OnTime
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:GENERATE_THIS_WITH_ARTISAN_KEYGEN
APP_URL=https://ontime-api.onrender.com

DB_CONNECTION=mysql
DB_HOST=<your-db-host>
DB_PORT=3306
DB_DATABASE=ontime
DB_USERNAME=<your-db-user>
DB_PASSWORD=<your-db-password>

SANCTUM_STATEFUL_DOMAINS=ontime.vercel.app
SESSION_DOMAIN=.onrender.com
FRONTEND_URL=https://ontime.vercel.app
```

**Generate APP_KEY:**
```bash
# Run locally:
php artisan key:generate --show
# Copy the output to APP_KEY
```

### E. Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (~5-10 minutes)
3. Once deployed, you'll get a URL like: `https://ontime-api.onrender.com`

### F. Run Migrations
In Render dashboard → Shell:
```bash
php artisan migrate --force
php artisan db:seed --force
```

---

## Step 3: Deploy Frontend on Vercel

### A. Create Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### B. Import Project
1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### C. Environment Variables
Add in Vercel project settings:

```
VITE_API_URL=https://ontime-api.onrender.com/api
```

Replace `ontime-api.onrender.com` with your actual Render backend URL.

### D. Deploy
1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. You'll get a URL like: `https://ontime-xxx.vercel.app`

---

## Step 4: Update Backend CORS

After getting your Vercel URL, update backend environment:

In Render.com → ontime-api → Environment:
```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-actual-vercel-url.vercel.app
```

Redeploy the backend for changes to take effect.

---

## Step 5: Test Your Deployment

### Test Backend API
```bash
curl https://your-backend-url.onrender.com/api/health
```

### Test Frontend
1. Visit your Vercel URL
2. Try to login with:
   - **Admin:** admin@ontime.com / password
   - **Supervisor:** supervisor@ontime.com / password  
   - **Employee:** employee@ontime.com / password

### Check Browser Console
- No CORS errors
- API calls successful
- No 404 errors

---

## Troubleshooting

### CORS Errors
**Problem:** Frontend can't reach backend

**Solution:**
1. Check `FRONTEND_URL` in backend env vars
2. Verify `VITE_API_URL` in frontend
3. Ensure CORS config in `backend/config/cors.php`:
   ```php
   'allowed_origins' => [
       env('FRONTEND_URL', 'http://localhost:5173')
   ],
   ```

### Database Connection Failed
**Problem:** Backend can't connect to database

**Solution:**
1. Verify DB credentials in Render environment
2. Check database is running
3. Run migrations: `php artisan migrate --force`

### 500 Server Error
**Problem:** Backend crashes on start

**Solution:**
1. Check Render logs
2. Verify `APP_KEY` is set
3. Clear cache: `php artisan config:clear`

---

## URLs for Your Presentation

Once deployed, save these URLs:

- **Frontend (User Interface):** `https://your-app.vercel.app`
- **Backend API:** `https://your-api.onrender.com`
- **API Docs:** `https://your-api.onrender.com/api/health`

---

## Free Tier Limitations

### Render.com
- ✅ 750 hours/month free
- ⚠️ Spins down after 15 min inactivity
- ⚠️ First request after sleep takes ~30 seconds

**Tip:** Visit your app 5 minutes before presentation to wake it up!

### Vercel
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Always online, no sleep

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Test thoroughly
4. ✅ Save URLs
5. 🎉 Ready for presentation!

**Need help?** Check Render/Vercel logs for errors, or let me know!
