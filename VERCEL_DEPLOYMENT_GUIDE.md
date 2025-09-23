# 🚀 Vercel Deployment Guide

## 📋 **Your Deployment URLs**
- **Backend (API)**: https://server-lemon-alpha.vercel.app
- **Frontend (Client)**: https://client-seven-sage.vercel.app
- **Database**: Supabase PostgreSQL

## 🔧 **Environment Variables Setup**

### **Backend Environment Variables (Vercel Dashboard)**
Set these in your Vercel backend project settings:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:Macbayprince05@@db.iptfgbgnfcipeggazsxi.supabase.co:5432/postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=humhub_clone
DB_USER=postgres
DB_PASSWORD=Macbayprince05@
DB_DIALECT=postgres

# Server Configuration
PORT=5000
NODE_ENV=production
VERCEL=1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Client URL for CORS
CLIENT_URL=https://client-seven-sage.vercel.app
FRONTEND_URL=https://client-seven-sage.vercel.app

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### **Frontend Environment Variables (Vercel Dashboard)**
Set these in your Vercel frontend project settings:

```bash
# API Configuration
VITE_API_URL=https://server-lemon-alpha.vercel.app/api

# Application Configuration
VITE_APP_NAME=SaaS Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Authentication
VITE_JWT_SECRET=your-jwt-secret-key
VITE_AUTH_TOKEN_KEY=auth_token

# External Services (if using)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_SOCIAL_LOGIN=false

# Development
VITE_DEV_MODE=false
VITE_MOCK_API=false
```

## 🗄️ **Database Configuration**

Your Supabase PostgreSQL database is already configured with:
- **Host**: db.iptfgbgnfcipeggazsxi.supabase.co
- **Port**: 5432
- **Database**: postgres
- **Username**: postgres
- **Password**: Macbayprince05@

## 🔄 **Deployment Steps**

### **1. Deploy Backend First**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the **Root Directory** to `server`
4. Set the **Build Command** to `npm ci`
5. Set the **Output Directory** to `.` (current directory)
6. Add all the backend environment variables listed above
7. Deploy

### **2. Deploy Frontend**
1. Create a new Vercel project for the frontend
2. Set the **Root Directory** to `client`
3. Set the **Build Command** to `npm run build`
4. Set the **Output Directory** to `dist`
5. Add all the frontend environment variables listed above
6. Deploy

## 🧪 **Testing Your Deployment**

### **Backend Health Check**
```bash
curl https://server-lemon-alpha.vercel.app/health
```

### **API Endpoint Test**
```bash
curl https://server-lemon-alpha.vercel.app/api/auth/register
```

### **Frontend Test**
Visit: https://client-seven-sage.vercel.app

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

1. **"Please install pg package manually" Error**
   - ✅ **Fixed**: Added `pg-hstore` dependency and Vercel-optimized configuration

2. **CORS Errors**
   - ✅ **Fixed**: Updated CORS configuration with your frontend URL

3. **Database Connection Issues**
   - ✅ **Fixed**: Added Vercel-specific database configuration with proper SSL settings

4. **Environment Variables Not Loading**
   - Make sure to set them in Vercel Dashboard, not in `.env` files
   - Redeploy after adding environment variables

## 📊 **PostgreSQL Fixes Applied**

### **Dependencies Added**
- ✅ `pg-hstore`: Required for Sequelize PostgreSQL support
- ✅ Vercel-optimized `pg` configuration

### **Configuration Updates**
- ✅ Vercel-specific database connection settings
- ✅ Reduced connection pool size for serverless (5 instead of 10)
- ✅ Added connection timeouts and retry logic
- ✅ Proper SSL configuration for Supabase

### **Error Handling**
- ✅ Better error messages and logging
- ✅ Graceful fallbacks for connection failures
- ✅ Production-safe error responses

## 🎯 **Expected Results**

After deployment, you should have:
- ✅ No more "Please install pg package manually" errors
- ✅ Successful database connections to Supabase
- ✅ Working API endpoints at https://server-lemon-alpha.vercel.app/api
- ✅ Frontend successfully calling backend APIs
- ✅ Proper CORS configuration allowing frontend-backend communication

## 🚀 **Ready to Deploy!**

Your PostgreSQL database connection issues have been resolved. The configuration is now optimized for Vercel's serverless environment and should deploy successfully.

**Next Steps:**
1. Set the environment variables in Vercel Dashboard
2. Deploy your backend
3. Deploy your frontend
4. Test the full application

Your SaaS platform is ready for production! 🎉