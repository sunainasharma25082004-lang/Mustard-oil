# 🚀 Render.com Deployment Guide (Same Folder Structure)

## ⚡ Already deployed? — Git push only

Agar Render pe **3 services pehle se connected** hain (API + Store + Admin):

1. Local check (optional): `npm run verify:deploy`
2. Git push karo → Render **auto-deploy** karega teeno services
3. Deploy ke baad verify: `https://karyor-api.onrender.com/api/health`
4. Admin login → Orders / Shipping / Payment test karo

**Zaroori:** Render dashboard mein env vars pehle se set honi chahiye (neeche list).  
`SETTINGS_ENCRYPTION_KEY` deploy ke baad **mat badalna** — warna saved Razorpay/Shiprocket passwords decrypt nahi honge.

---

Bhai, yeh project **3 alag parts** mein hai isliye hume Render pe **3 services** banana padega:

1. **Backend (API)** → `server/` folder (Node.js + Express + MongoDB)
2. **Main Store** → Root `dist/` (Customer wala frontend)
3. **Admin Panel** → `admin/dist/` (Alag admin frontend)

Yeh sab **same folder structure** ke saath deploy hoga using `render.yaml`.

---

## 📋 Prerequisites

- GitHub pe code pushed hona chahiye (Render Git se connect karega)
- MongoDB Atlas account (ya koi aur MongoDB)
- Razorpay account (production keys chahiye production ke liye)
- Render account (https://dashboard.render.com)

---

## 1️⃣ Environment Variables (Bahut Important)

### Backend (karyor-api) ke liye

| Variable | Example / Kya daalna hai | Required |
|----------|---------------------------|----------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/karyor` | ✅ |
| `JWT_SECRET` | koi bhi strong random string (32+ chars) | ✅ |
| `RAZORPAY_KEY_ID` | `rzp_live_xxxxxxxx` | ✅ |
| `RAZORPAY_KEY_SECRET` | `xxxxxxxxxxxx` | ✅ |
| `ADMIN_EMAIL` | `admin@yourdomain.com` | ✅ |
| `ADMIN_PASSWORD` | strong password | ✅ |
| `CLIENT_URL` | `https://karyor.com,https://www.karyor.com,https://karyor-store.onrender.com,https://karyor-admin.onrender.com` | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `ADMIN_NAME` | `Karyor Admin` | Optional |
| `SETTINGS_ENCRYPTION_KEY` | strong random string (32+ chars) — **production mein zaroori**, deploy ke baad mat badalna | ✅ |
| `API_PUBLIC_URL` | `https://karyor-api.onrender.com` | ✅ (webhook URL ke liye) |
| `SHIPROCKET_EMAIL` | API user email (Shiprocket → Settings → API) | ✅ |
| `SHIPROCKET_PASSWORD` | API user password | ✅ |
| `SHIPROCKET_WEBHOOK_SECRET` | koi strong random token | ✅ |
| `SHIPROCKET_PICKUP_LOCATION` | `Primary` (Shiprocket panel jaisa naam) | ✅ |
| `SHIPROCKET_PICKUP_PINCODE` | `125001` (Hisar warehouse) | ✅ |
| `SHIPROCKET_COMPANY_NAME` | `Karyor Farms` | ✅ |
| `SHIPROCKET_COMPANY_PHONE` | `8708621377` | ✅ |
| `SHIPROCKET_COMPANY_EMAIL` | `karyorfarms@gmail.com` | ✅ |
| `SHIPROCKET_COMPANY_CITY` | `Hisar` | ✅ |
| `SHIPROCKET_COMPANY_STATE` | `Haryana` | ✅ |
| `SHIPROCKET_COMPANY_PINCODE` | `125001` | ✅ |

### Main Store Frontend (karyor-store) ke liye

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://karyor-api.onrender.com` (backend ka URL) |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_xxxxxx` (public key) |

### Admin Panel (karyor-admin) ke liye

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://karyor-api.onrender.com` |
| `VITE_STORE_URL` | `https://karyor-store.onrender.com` (yeh zaroori hai images ke liye) |

---

## 2️⃣ Step-by-Step Deployment (Sabse Easy Tarika)

### Method A: Using render.yaml (Recommended)

1. **Code GitHub pe push karo** (render.yaml already root mein hai)

2. Render Dashboard mein jao → **New +** → **Blueprint**

3. Apna GitHub repo select karo

4. Render automatically `render.yaml` padhega aur 3 services suggest karega:
   - `karyor-api`
   - `karyor-store`
   - `karyor-admin`

5. **Environment variables** set karo (jo `sync: false` hain unko manually daalna padega)

6. **Deploy** karo

7. Pehle `karyor-api` deploy hone do (MongoDB connect hona chahiye)

8. API deploy hone ke baad:
   - `karyor-store` aur `karyor-admin` ke **VITE_API_URL** update kar do agar zaroorat pade (redeploy hoga)

---

### Method B: Manual (Dashboard se alag-alag)

#### Step 1: Backend Service

1. **New Web Service**
2. Connect repo
3. **Name**: `karyor-api`
4. **Root Directory**: leave empty (`.` use hoga)
5. **Build Command**:
   ```
   cd server && npm install
   ```
6. **Start Command**:
   ```
   cd server && npm start
   ```
7. **Plan**: Free (ya Starter agar disk chahiye)
8. Environment variables upar wali list se daal do
9. **Create Web Service**

#### Step 2: Main Store (Static Site)

1. **New Static Site**
2. Same repo
3. **Name**: `karyor-store`
4. **Build Command**:
   ```
   npm install && npm run build
   ```
5. **Publish Directory**:
   ```
   dist
   ```
6. Environment variables:
   - `VITE_API_URL` = `https://karyor-api.onrender.com`
   - `VITE_RAZORPAY_KEY_ID` = your public key
7. Deploy

#### Step 3: Admin Panel (Static Site)

1. **New Static Site**
2. **Name**: `karyor-admin`
3. **Build Command**:
   ```
   npm install && cd admin && npm install && npm run build
   ```
4. **Publish Directory**:
   ```
   admin/dist
   ```
5. Environment variables:
   - `VITE_API_URL` = `https://karyor-api.onrender.com`
   - `VITE_STORE_URL` = `https://karyor-store.onrender.com`
6. Deploy

---

## 3️⃣ Post Deployment - URLs Update Karna

Jab sab deploy ho jaye:

1. Backend settings mein `CLIENT_URL` update karo (include custom domain + all frontends):
   ```
   https://karyor.com,https://www.karyor.com,https://karyor-store.onrender.com,https://karyor-admin.onrender.com
   ```
   (Manual deploy/restart karna padega backend ka taaki env apply ho)

2. Agar frontend mein galat API URL hai to:
   - Static Site settings → Environment → update `VITE_API_URL`
   - Phir **Manual Deploy** karo

3. Admin login kar ke test karo (seed hua admin use karo)

4. **Health check** kholo: `https://karyor-api.onrender.com/api/health`  
   - `integrations.payment.enabled` = true  
   - `integrations.shiprocket.enabled` = true  

5. **Admin → Payment Gateways** — Razorpay validate + active gateway = Razorpay

6. **Admin → Shipping Settings** — Test connection → Enabled ON

---

## 3️⃣B Shiprocket Webhook (Production)

1. Render backend deploy hone ke baad webhook URL:
   ```
   https://karyor-api.onrender.com/api/webhooks/shiprocket
   ```
   (Admin → Shipping Settings mein bhi dikhega agar `API_PUBLIC_URL` set hai)

2. Shiprocket panel → **Settings → Webhooks** → Add URL

3. Secret token = same jo `SHIPROCKET_WEBHOOK_SECRET` mein daala hai backend pe

4. Isse order status auto-update hoga: shipped, delivered, etc.

---

## 4️⃣ File Uploads (Product Images) - Important Warning

**Problem**: Render ke free plan pe disk **ephemeral** hota hai. Matlab:
- Admin se product image upload ki
- Deploy kiya ya restart hua
- **Saari images gayab** ho jayengi

### Solutions:

#### Option 1: Render Disk (Paid)
- Backend service ko **Starter plan** pe le jao
- Disk attach karo (1GB kaafi hai shuru ke liye)
- `render.yaml` mein disk section uncomment kar do
- Mount path sahi rakhna (code mein `server/uploads` use hota hai)

#### Option 2: Cloudinary (Recommended for Production)
Yeh best long-term solution hai. Image upload ko Cloudinary pe shift kar do. Bahut easy hai aur free tier bhi accha hai.

Agar abhi jaldi chahiye to Option 1 use karo.

---

## 5️⃣ Useful Render Commands / Tips

- Backend health check: `https://karyor-api.onrender.com/api/health`
- Pehli baar admin seed hoga (`.env` wale credentials se)
- Free services 15 min inactivity ke baad **spin down** ho jaate hain (cold start lagta hai)
- Custom domain add karna ho to Static Site / Web Service settings mein jaake "Custom Domain" add karo
- **Important for SPA (React Router)**: Page refresh on any route other than `/` (e.g. /products, /dashboard) will 404 unless you have rewrite rule (we have added in render.yaml under both static sites: `routes` → rewrite `/*` to `/index.html`). After any change to render.yaml, re-deploy the static sites.

---

## 6️⃣ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| CORS error | `CLIENT_URL` mein sab frontend URLs daalo including https://karyor.com (comma separated). Phir backend restart/deploy. |
| Images nahi dikh rahe (admin mein) | `VITE_STORE_URL` set karo admin ke liye |
| `/uploads` wali images nahi aa rahi | `VITE_API_URL` backend ka URL hona chahiye |
| Admin login nahi ho raha | `ADMIN_EMAIL` / `ADMIN_PASSWORD` sahi daala? Backend restart kiya? |
| Payment disabled on store | `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` backend env mein; Admin → Payment Gateways → Razorpay enabled |
| Shiprocket shipment nahi banta | `SHIPROCKET_*` env vars + Admin → Shipping → Enabled; pickup location name match karo |
| Webhook status update nahi | `SHIPROCKET_WEBHOOK_SECRET` + URL Shiprocket panel mein sahi? |
| Build fail ho raha | `npm install` command sahi hai kya? Node version check karo (Render default 18/20 hota hai) |
| Page refresh (F5) on /products, /about, /dashboard etc. gives 404 or "not found" | This is normal for React SPA. We added `routes` rewrite in `render.yaml` (SPA fallback to index.html). Re-deploy the static sites (karyor-store and karyor-admin) after updating render.yaml or add the rewrite manually in Render dashboard under the static site → "Redirects and Rewrites". |

---

## 7️⃣ Final Architecture (After Deploy)

```
https://karyor-store.onrender.com     → Customer Store (public)
https://karyor-admin.onrender.com     → Admin Panel (protected)
https://karyor-api.onrender.com       → Backend API + uploaded images
```

---

## Next Steps (Optional but Recommended)

1. Custom domain add karo (store. yourdomain.com + admin.yourdomain.com)
2. Razorpay Live keys laga do
3. Cloudinary integrate karo images ke liye
4. Backend ko Starter plan pe le jao (always on + disk)

---

Koi dikkat aaye to yeh file + console logs bhej dena. Main help kar dunga!

**Good luck bhai!** 🔥
