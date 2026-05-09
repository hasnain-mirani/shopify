# Complete Deployment Guide - Shopify Store

## Project Overview
- **Frontend**: Next.js (Vercel-ready)
- **Backend**: Express.js (Render-ready)
- **Database**: SQLite (with persistent storage)
- **File Storage**: Local + Cloudinary

## Deployment Architecture

```
Frontend (Next.js)  →  Vercel
Backend (Express.js) →  Render
Database (SQLite)    →  Render Persistent Disk
File Storage         →  Cloudinary (CDN)
```

## Phase 1: Backend Deployment (Render)

### Path Configuration
**Backend Directory**: `backend/`

**Key Files Created/Modified**:
- ✅ `backend/render.yaml` - Render deployment configuration
- ✅ `backend/.env.example` - Environment variables template
- ✅ `backend/.gitignore` - Git ignore rules
- ✅ `backend/README.md` - Backend deployment guide
- ✅ `backend/server.js` - Updated for production
- ✅ `backend/package.json` - Added dotenv and engines

### Step-by-Step Render Deployment

#### 1. Push Code to GitHub
```bash
cd C:\Users\Hp\Desktop\shopifyStore\my-shopify-store
git add backend/
git commit -m "Configure backend for Render deployment"
git push origin master
```

#### 2. Create Render Account
- Go to https://render.com
- Sign up/login with GitHub
- Authorize Render to access your repository

#### 3. Create Web Service
1. Dashboard → "New +" → "Web Service"
2. Select: `my-shopify-store` repository
3. Configure:

**Basic Settings**:
- **Name**: `shopify-store-backend`
- **Region**: Singapore (or closest to Pakistan)
- **Branch**: `master`
- **Root Directory**: `backend`
- **Runtime**: `Node 18`

**Build Settings**:
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance**:
- **Type**: Free (for testing) → Standard ($7/mo for production)
- **RAM**: 512 MB → 1 GB+ (production)

#### 4. Add Environment Variables
In Render Dashboard → Environment section:

```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend.vercel.app

# Firebase
FIREBASE_PROJECT_ID=sshub-c4a3e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC95sOyoks72m56\nbRfZK5+fK7wTvn67c1JcU7YW9uOe2XfyJ+X2OuVruuKVZdgvffmQYs3gJB5U4Yrt\nZ5atKqVtFuw5P+WDxzW/0CdnE9MimtQ+szLn9dginvTB4mJb/A0cUfEQdnpySpxN\nT/3safQ3PHd3XMTQWiOOR/M5tWT3qCBGBV8FjZdOF42nBEOmN+HdObPJykBROZ5G\nMNUJ45GGb4SfA1iPfjscBT645s69AtCZrMcfndgM/cD+gYUzwjA8R6oMbqmAlwwA\nNVCYg+/qwEN26+idTNFQf+CLBD6YQxSetdmVFXwQjsU3MMrFSwcrbWHVrmSPM+ir\naaEKcrOfAgMBAAECggEAPGBUowRXgCGcE3+A4BKvDtfEVdCwkV+CdYlF8Pow922z\n5YFK62ThUUWbSZ2WRM88G+xWAWfqXtlQptdTAB55dvwdQbxvd9zL2X7QMEUM0UlB\npuepjTdMLwGz1rrnw9AYyQLCbpYEqzbOiAQhOtubAj7OytvrVUT7Xf7BNX1XKye0\nSOQk2DiVvCGUI6yRTknupp85HUKb7NoAvI3QXtyepUgCZ2n70PEzFthp95isd5s8\nc24NJA25CIcMRbopXoTMsTOeWhu99dvwysHBaZiPtv8H5gB5+hJV8CZXYsBh9zyP\nra2lThBZNEmG/hvtwz1z/wYbdwaGFcMMGzHKSY1EuQKBgQDjm34a7CymT3B/o044\nRDQJjXMxjOhbfK3ojoY9/kq3/1I/RmVfweTBSs3cChz834Th84+QADk5QwVgWZob\neVoJAg2fOBjCpbmWSKqEAnQ64ZtCB6FjWdWBpdhLfrVH+GrE7rd8yp10zcQbUz99\ndaek7itXZyqX9oOapmM35BLTqQKBgQDVlyduaHi1no1/CzckKNz3W6bKCDPup0v7\nB2o/m9+M2FktAIuZ7jZ+Ay2IyC0JIYSKnPeR2rvR7Ukkkulm9JX0DkHJvakMHhcB\nl5dtXtd2rT9WCWEQ3TeO7yowhAJKAkf3/HI7shQ5jXIL5SwTBHgQ6uvSrPP+q9Qw\nIwRKpsnaBwKBgBWEueNpuL7we75Vfiurpw/QI7fnjoA3xWlbMC3kQMQsi2YYDbWD\n61Cq9dN70UnHCBUkpcoDe2WChJubXQqD6pM3cno/H3gnmugubpCUetCmS7tuZT+z\nWpArUcuxawom3lFIEGjn7wMAAS5kLHh8CyF4svhMdKZxU/fnCzJZib4hAoGANuLd\nziBojHtO7wupwtABYEscBCSxe61f+AUCx4+9lYru94KBXS/6rs0QQWr3L7Z+QcRu\nVfu4cgyg1BYwhjVp50pWm4nyS9vbm5wh3IgXpDaG5QwJ9nRyV3ecBtWVZQFLDy2/\nCRoM2nE/klD0z3pBhE9qBDxPgu0S3L/S1YAgtLcCgYAjfISTclJZExvY2/WxDWyU\nxspmt3mqloPadYwPLiFEcFrhcngqbr4mHX2X45rN6gEJR7Nn7MWjHIE0/sjZ4EK7\nJdXA9MECPKxS8DJjZYiepLnmEN5csgx9i+5RvP+MBT8JHT9Zq7T1+Mb71wzI61Gx\nnCNZqoAQARBFb+9453p+iw==\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sshub-c4a3e.iam.gserviceaccount.com

# SMTP
SMTP_HOST=mail.arcturuslogic.com
SMTP_PORT=465
SMTP_USER=hasnain@arcturuslogic.com
SMTP_PASS=Hasnain@mirani1100
```

#### 5. Add Persistent Disk
- Scroll to "Advanced" → "Add Disk"
- **Name**: `data`
- **Mount Path**: `/opt/render/project/backend/data`
- **Size**: 1 GB (Free tier)

#### 6. Deploy
- Click "Create Web Service"
- Wait for deployment (2-5 minutes)
- Get your backend URL: `https://shopify-store-backend.onrender.com`

## Phase 2: Frontend Deployment (Vercel)

### Step-by-Step Vercel Deployment

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy Frontend
```bash
cd C:\Users\Hp\Desktop\shopifyStore\my-shopify-store
vercel login
vercel
```

#### 3. Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```bash
# Shopify Configuration
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
SHOPIFY_STOREFRONT_API_VERSION=2025-01
SHOPIFY_ADMIN_API_ACCESS_TOKEN=your_admin_token
SHOPIFY_ADMIN_API_VERSION=2026-04

# Admin Panel
ADMIN_PANEL_PASSWORD=your_secure_password
ADMIN_SESSION_SECRET=your_random_secret

# Cache Revalidation
SHOPIFY_REVALIDATION_SECRET=your_random_secret

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dzm2kzvfd
CLOUDINARY_API_KEY=913962882668895
CLOUDINARY_API_SECRET=yGH3fKOPyCt8563kZTfXSJXqO-VA
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ECOMMERCE

# Backend URL (IMPORTANT)
NEXT_PUBLIC_API_URL=https://shopify-store-backend.onrender.com/api
```

#### 4. Deploy
```bash
vercel --prod
```

## Phase 3: Post-Deployment Configuration

### 1. Update Backend CORS
After deploying frontend, update the `FRONTEND_URL` in Render:
```bash
FRONTEND_URL=https://your-frontend.vercel.app
```

### 2. Test Connections
```bash
# Test backend health
curl https://shopify-store-backend.onrender.com/api/health

# Test frontend
# Visit your Vercel URL
```

### 3. Verify Endpoints
- Backend: `https://shopify-store-backend.onrender.com/api/health`
- Frontend: `https://your-project.vercel.app`
- Admin Panel: `https://your-project.vercel.app/admin`

## Important Considerations

### Backend (Render)
- **Free Tier**: Spins down after 15 min inactivity
- **Cold Starts**: 30-60 seconds
- **Database**: SQLite with persistent disk
- **Backups**: Not automatic - implement manually

### Frontend (Vercel)
- **Free Tier**: Always available
- **Performance**: Excellent
- **Backups**: Automatic
- **CDN**: Global

### Production Recommendations
1. Upgrade backend to Standard instance ($7/mo)
2. Implement database backups
3. Monitor logs and performance
4. Set up error tracking (Sentry)
5. Configure custom domains
6. Set up SSL certificates

## Cost Summary

### Free Tier (Testing)
- **Vercel**: $0/month
- **Render**: $0/month
- **Total**: $0/month

### Production (Recommended)
- **Vercel**: $20/month (Pro)
- **Render Standard**: $7/month
- **Cloudinary**: Free tier
- **Total**: ~$27/month

## Troubleshooting

### Backend Issues
- Check Render logs
- Verify environment variables
- Ensure persistent disk is mounted
- Test health endpoint

### Frontend Issues
- Check Vercel deployment logs
- Verify environment variables
- Test API connectivity
- Check CORS configuration

### Database Issues
- Verify disk persistence
- Check file permissions
- Monitor disk space usage

## Support Resources
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Project Backend Guide: `backend/README.md`
- Project Root Guide: `README.md`

## Next Steps
1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Configure environment variables
4. ✅ Test all functionality
5. ⏭️ Set up custom domains
6. ⏭️ Implement monitoring
7. ⏭️ Configure backups