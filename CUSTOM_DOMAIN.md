# OnTime Custom Domain Setup (ontimeapp.es)

## DNS Configuration

You need to configure your domain's DNS settings. Here's what you need to add:

### For Frontend (ontimeapp.es on Vercel)

**Option 1: Root domain (ontimeapp.es)**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**Option 2: WWW subdomain (www.ontimeapp.es)**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### For Backend API (api.ontimeapp.es on Render)

- Type: `CNAME`
- Name: `api`
- Value: `your-app-name.onrender.com` (get this from Render dashboard)

---

## Deployment with Custom Domain

### Step 1: Deploy Backend (Render.com)

1. Go to [render.com](https://render.com) and create Web Service
2. Configure as before, but use these environment variables:

```env
APP_NAME=OnTime
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_GENERATED_KEY
APP_URL=https://api.ontimeapp.es

DB_CONNECTION=mysql
DB_HOST=<render-mysql-host>
DB_PORT=3306
DB_DATABASE=ontime
DB_USERNAME=<render-mysql-user>
DB_PASSWORD=<render-mysql-password>

SANCTUM_STATEFUL_DOMAINS=ontimeapp.es,www.ontimeapp.es
SESSION_DOMAIN=.ontimeapp.es
FRONTEND_URL=https://ontimeapp.es
```

3. After deployment, get the Render URL (e.g., `ontime-api-xxx.onrender.com`)

4. **Add Custom Domain in Render:**
   - Go to your service → Settings → Custom Domain
   - Add: `api.ontimeapp.es`
   - Copy the CNAME value shown

### Step 2: Configure DNS

Go to your domain registrar (where you bought ontimeapp.es) and add:

```
Type: CNAME
Name: api
Value: <your-render-url>.onrender.com
TTL: 3600
```

### Step 3: Deploy Frontend (Vercel)

1. Deploy to Vercel with environment variable:
```env
VITE_API_URL=https://api.ontimeapp.es/api
```

2. **Add Custom Domain in Vercel:**
   - Go to Project Settings → Domains
   - Add: `ontimeapp.es` and/or `www.ontimeapp.es`
   - Vercel will show you DNS records to add

### Step 4: Add DNS Records for Frontend

In your DNS settings, add:

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For www subdomain (optional):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## DNS Propagation

- DNS changes can take 5 minutes to 48 hours to propagate
- Usually takes 10-30 minutes
- Check status: [dnschecker.org](https://dnschecker.org)

---

## Test Your Domain

After DNS propagates:

1. **Frontend:** Visit https://ontimeapp.es
2. **Backend API:** Test https://api.ontimeapp.es/api/health

---

## SSL/HTTPS

Both Vercel and Render automatically provide free SSL certificates:
- ✅ Auto-renews
- ✅ Covers custom domains
- ✅ Ready within minutes after DNS propagates

---

## Final URLs

- **Frontend:** https://ontimeapp.es
- **Backend API:** https://api.ontimeapp.es
- **Health Check:** https://api.ontimeapp.es/api/health

Perfect for your presentation! 🎉
