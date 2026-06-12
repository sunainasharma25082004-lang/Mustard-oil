# 🚀 Render.com Deployment Guide (Same Folder Structure)

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

---

## 6️⃣ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| CORS error | `CLIENT_URL` mein sab frontend URLs daalo including https://karyor.com (comma separated). Phir backend restart/deploy. |
| Images nahi dikh rahe (admin mein) | `VITE_STORE_URL` set karo admin ke liye |
| `/uploads` wali images nahi aa rahi | `VITE_API_URL` backend ka URL hona chahiye |
| Admin login nahi ho raha | `ADMIN_EMAIL` / `ADMIN_PASSWORD` sahi daala? Backend restart kiya? |
| Build fail ho raha | `npm install` command sahi hai kya? Node version check karo (Render default 18/20 hota hai) |

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
