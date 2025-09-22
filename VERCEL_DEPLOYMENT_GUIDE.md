# 🚀 Complete Vercel Deployment Guide

## Overview
This guide will help you deploy your SaaS platform on Vercel with both frontend and backend services.

## Prerequisites
- GitHub account
- Vercel account (free at https://vercel.com)
- Your project pushed to GitHub

## Step 1: Prepare Your Project

### 1.1 Update Frontend API Configuration
Your frontend is already configured to use environment variables. We'll set these in Vercel.

### 1.2 Database Setup
You'll need a PostgreSQL database. Options:
- **Vercel Postgres** (recommended for Vercel)
- **Supabase** (free tier available)
- **PlanetScale** (free tier available)
- **Railway** (if you want to keep using it)

## Step 2: Deploy Backend (API Routes)

### 2.1 Create Backend Project on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Configure the project:**
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: `npm ci`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm ci`

### 2.2 Set Environment Variables
In your Vercel project settings, add these environment variables:

```
NODE_ENV=production
DATABASE_URL=your_database_connection_string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=https://your-frontend-domain.vercel.app
PORT=3000
```

### 2.3 Deploy Backend
1. Click **"Deploy"**
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://your-backend.vercel.app`)

## Step 3: Deploy Frontend

### 3.1 Create Frontend Project on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import the same GitHub repository
4. **Configure the project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

### 3.2 Set Frontend Environment Variables
Add these environment variables:

```
VITE_API_URL=https://your-backend.vercel.app/api
```

### 3.3 Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment to complete
3. Note your frontend URL (e.g., `https://your-frontend.vercel.app`)

## Step 4: Database Setup

### Option A: Vercel Postgres (Recommended)
1. In your Vercel dashboard, go to **Storage**
2. Click **"Create Database"**
3. Choose **Postgres**
4. Copy the connection string
5. Use it as your `DATABASE_URL`

### Option B: Supabase (Free Alternative)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings > Database**
4. Copy the connection string
5. Use it as your `DATABASE_URL`

## Step 5: Set Up Database Tables

### 5.1 Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Set environment variables
vercel env add DATABASE_URL

# Run database setup
cd server
npm run db:setup-render
```

### 5.2 Using Database Client
1. Connect to your database using a client like pgAdmin or DBeaver
2. Run the SQL from `server/setup-database.sql`

## Step 6: Update Environment Variables

### 6.1 Update Backend Environment Variables
In your backend Vercel project:
```
NODE_ENV=production
DATABASE_URL=your_actual_database_url
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=https://your-frontend.vercel.app
PORT=3000
```

### 6.2 Update Frontend Environment Variables
In your frontend Vercel project:
```
VITE_API_URL=https://your-backend.vercel.app/api
```

## Step 7: Test Your Deployment

### 7.1 Test Backend
Visit: `https://your-backend.vercel.app/api/health`
Should return: `{"status":"OK","message":"Server is running"}`

### 7.2 Test Frontend
Visit: `https://your-frontend.vercel.app`
Should load your React application

### 7.3 Test Registration
Try registering a new user to ensure the full flow works.

## Step 8: Custom Domains (Optional)

### 8.1 Add Custom Domain
1. Go to your Vercel project settings
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure build commands are correct

2. **API Routes Not Working**
   - Verify environment variables are set
   - Check that `vercel.json` is configured correctly

3. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check database is accessible from Vercel

4. **CORS Issues**
   - Ensure `CLIENT_URL` matches your frontend domain
   - Check CORS configuration in your backend

### Useful Commands:
```bash
# Check Vercel CLI version
vercel --version

# View deployment logs
vercel logs

# Redeploy
vercel --prod
```

## Benefits of Vercel Deployment:

✅ **Free Tier**: Generous free tier for personal projects
✅ **Automatic Deployments**: Deploys on every Git push
✅ **Global CDN**: Fast loading worldwide
✅ **Serverless Functions**: Automatic scaling
✅ **Easy Environment Management**: Simple env var setup
✅ **Custom Domains**: Easy domain configuration
✅ **Analytics**: Built-in performance monitoring

## Next Steps:

1. Set up monitoring and analytics
2. Configure custom domains
3. Set up automated testing
4. Implement CI/CD pipelines
5. Add error tracking (Sentry, etc.)

## Support:

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Discord](https://vercel.com/discord)
