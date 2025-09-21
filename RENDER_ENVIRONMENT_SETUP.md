# Render Environment Variables Setup

## 🚨 The Problem
Your frontend is calling `http://localhost:5000/api` instead of your Render backend URL, causing 400 errors.

## ✅ Solution Applied
I've updated your frontend to use the correct backend URL: `https://social-network-backend-w91a.onrender.com/api`

## 🔧 Next Steps

### 1. Deploy Your Frontend
1. Commit and push your changes to Git
2. Render will automatically redeploy your static site
3. Your frontend will now call the correct backend URL

### 2. Set Backend Environment Variables
You still need to set environment variables in your **backend web service**:

1. Go to your Render dashboard
2. Click on your **web service** (backend)
3. Look for **"Environment"** tab
4. Add these variables:

```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=https://social-network-frontend-k0ml.onrender.com
```

### 3. Get Your DATABASE_URL
1. Go to your **PostgreSQL database service**
2. Copy the **External Database URL**

## 🎯 What This Fixes

- ✅ Frontend now calls correct backend URL
- ✅ Backend will connect to Render database
- ✅ Registration endpoint will work properly
- ✅ 400 errors will be resolved

## 🚀 After Setup

1. **Deploy frontend** (automatic after Git push)
2. **Set backend environment variables**
3. **Redeploy backend** (automatic after env vars)
4. **Test registration** - should work now!

## 🔍 Testing

After deployment, test:
- Registration: `https://social-network-frontend-k0ml.onrender.com/register`
- Check browser network tab for correct API calls
- Verify no more 400 errors

## 🆘 If Still Having Issues

Check:
1. Backend logs for database connection errors
2. Frontend network tab for correct API URLs
3. Environment variables are set in both services
4. Both services are deployed and running
