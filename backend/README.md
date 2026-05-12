# Shopify Store Backend - Render Deployment Guide

## Overview
This is the Express.js backend for the Shopify store, designed to be deployed on Render.com.

## Project Structure
```
backend/
├── server.js              # Main Express server
├── database.js            # SQLite database setup
├── routes/                # API route handlers
│   ├── products.js
│   ├── orders.js
│   ├── cart.js
│   ├── users.js
│   ├── settings.js
│   ├── upload.js
│   ├── fcm-tokens.js
│   ├── notify.js
│   ├── site-notifications.js
│   └── product-ai.js
├── data/                  # SQLite database files (persisted on Render)
├── uploads/               # File upload storage (persisted on Render)
├── package.json
├── render.yaml           # Render deployment configuration
└── .env.example          # Environment variables template
```

## Render Deployment Steps

### 1. Prepare Your Repository
- Ensure the backend is in a Git repository
- The backend should be in the `backend/` directory of your project
- Update the `.gitignore` to exclude sensitive files

### 2. Create Render Account
- Go to [render.com](https://render.com) and sign up
- Connect your GitHub repository

### 3. Create New Web Service
1. Click "New +" → "Web Service"
2. Select your repository
3. Configure the service:

**Build & Deploy Settings:**
- **Name**: `shopify-store-backend` (or your preferred name)
- **Region**: Choose the region closest to your users
- **Branch**: `master` (or your main branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- **Instance Type**: `Free` (for testing) or `Standard` (for production)
- **RAM**: 512 MB (Free) or higher
- **CPU**: 0.1 (Free) or higher

**Environment Variables:**
Add these environment variables in the Render dashboard:

```bash
# Server Configuration
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-url.vercel.app

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# SMTP Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 4. Persistent Disk Configuration
To persist the SQLite database and uploaded files:

1. Scroll down to "Advanced" section
2. Click "Add Disk"
3. Configure:
   - **Name**: `data`
   - **Mount Path**: `/opt/render/project/backend/data`
   - **Size**: 1 GB (free tier) or more as needed
4. Click "Add"

### 5. Deploy
- Click "Create Web Service"
- Render will automatically deploy your backend
- Wait for the deployment to complete (usually 2-5 minutes)

### 6. Get Your Backend URL
After deployment, Render will provide a URL like:
```
https://shopify-store-backend.onrender.com
```

## Update Frontend Configuration

### 1. Update Frontend Environment Variables
In your Vercel dashboard or `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://shopify-store-backend.onrender.com/api
```

### 2. Update CORS in Backend
Ensure your deployed frontend URL is added to the CORS configuration:
- Add `FRONTEND_URL` environment variable in Render
- The backend will automatically include it in allowed origins

## Important Notes

### Database Persistence
- SQLite database is persisted using Render's Disk feature
- Database file location: `/opt/render/project/backend/data/store.db`
- Automatic backups are not included - consider implementing backup strategy

### File Uploads
- Uploaded files are stored in `/opt/render/project/backend/uploads`
- This directory is persisted using the same disk as the database
- For production, consider using cloud storage (Cloudinary is already configured)

### Free Tier Limitations
- Render Free tier spins down after 15 minutes of inactivity
- Cold starts can take 30-60 seconds
- No automatic backups
- 512 MB RAM limit

### Production Recommendations
1. **Upgrade to Standard instance**: Better performance and no spin-downs
2. **Implement database backups**: Regular backups of SQLite database
3. **Monitor logs**: Use Render's logging features
4. **Set up health checks**: Monitor `/api/health` endpoint
5. **Consider cloud database**: Migrate to PostgreSQL/MySQL for better scalability

## Testing the Deployment

### 1. Health Check
```bash
curl https://your-backend.onrender.com/api/health
```

### 2. Test API Endpoints
```bash
# Get products
curl https://your-backend.onrender.com/api/products

# Get settings
curl https://your-backend.onrender.com/api/settings
```

### 3. Check Logs
- Go to Render dashboard
- Select your service
- Click "Logs" tab to monitor real-time logs

## Troubleshooting

### Service Won't Start
- Check the "Logs" tab in Render dashboard
- Ensure all environment variables are set
- Verify the start command: `npm start`

### Database Errors
- Ensure the persistent disk is properly mounted
- Check disk space usage
- Verify database permissions

### CORS Issues
- Ensure `FRONTEND_URL` is set correctly
- Check the backend logs for CORS errors
- Verify the frontend is calling the correct backend URL

### Performance Issues
- Consider upgrading from Free tier
- Optimize database queries
- Implement caching where appropriate

## Alternative Deployment Options

If Render doesn't meet your needs, consider:

1. **Railway.com**: Similar to Render, good for Node.js apps
2. **Fly.io**: Global deployment, good performance
3. **Heroku**: Established platform, reliable (paid)
4. **DigitalOcean App Platform**: Good for scaling
5. **Self-hosted**: VPS providers like DigitalOcean, Linode

## Support

- Render Documentation: https://render.com/docs
- Express.js Documentation: https://expressjs.com/
- SQLite Documentation: https://www.sqlite.org/docs.html