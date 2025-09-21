# Quick Render Database Setup Guide

## 🚀 Quick Steps to Fix Your 400 Error

The 400 error you're seeing is likely because your Render database doesn't have the necessary tables yet. Follow these steps:

### Step 1: Get Your Render Database URL
1. Go to your Render dashboard
2. Click on your PostgreSQL database service
3. Copy the **External Database URL** (it looks like: `postgresql://username:password@hostname:port/database_name`)

### Step 2: Set Environment Variables in Render
In your Render web service settings, add these environment variables:

```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_for_production_change_this
CLIENT_URL=https://social-network-frontend-k0ml.onrender.com
```

### Step 3: Set Up Database Tables
You have 3 options:

#### Option A: Use the Setup Script (Recommended)
1. Set your DATABASE_URL environment variable locally
2. Run: `npm run db:setup-render`
3. This will create all necessary tables automatically

#### Option B: Use Render's Database Console
1. Go to your Render database dashboard
2. Click "Connect" or "Console"
3. Copy and paste the SQL from `server/setup-database-simple.sql`
4. Execute the script

#### Option C: Use a Database Client
1. Use pgAdmin, DBeaver, or psql
2. Connect using your Render database credentials
3. Run the SQL script

### Step 4: Test the Connection
Run: `npm run db:test-render` to verify everything is working.

### Step 5: Deploy and Test
1. Deploy your application to Render
2. Test the registration endpoint
3. Check the logs for "Database connection established successfully"

## 🔧 Troubleshooting

### If you still get 400 errors:
1. Check Render logs for database connection errors
2. Verify your DATABASE_URL is correct
3. Make sure all tables were created successfully
4. Test the connection with: `npm run db:test-render`

### Common Issues:
- **SSL Required**: Render databases require SSL (already configured)
- **Wrong URL**: Make sure you're using the External Database URL
- **Missing Tables**: Run the setup script to create tables
- **Environment Variables**: Make sure they're set in Render, not just locally

## 📋 What Gets Created

The setup script creates these tables:
- `users` - User accounts and profiles
- `spaces` - Community spaces
- `posts` - User posts
- `comments` - Post comments
- `memberships` - User-space relationships
- `follows` - Following system
- `likes` - Liking system
- `jobs` - Job postings
- `job_applications` - Job applications
- `saved_jobs` - Saved jobs

Plus an admin user: `admin@example.com` / `password123`

## ✅ Success Indicators

You'll know it's working when:
- No database connection errors in logs
- Registration endpoint returns 200/201 instead of 400
- You can create new user accounts
- Database queries work properly

## 🆘 Need Help?

If you're still having issues:
1. Check the detailed guide in `RENDER_DATABASE_SETUP.md`
2. Run the test script: `npm run db:test-render`
3. Check your Render service logs for specific error messages
