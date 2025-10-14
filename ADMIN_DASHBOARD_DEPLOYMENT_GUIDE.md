# Admin Dashboard Deployment Guide

## 🚀 Quick Fix for Database Migration Issue

The deployment is failing due to a PostgreSQL ENUM syntax error when trying to add the `role` column to the `users` table. Here's how to fix it:

### Option 1: Manual Database Migration (Recommended)

1. **Connect to your database** (via Render dashboard or psql)
2. **Run the manual migration script**:

```sql
-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;
        RAISE NOTICE 'Added role column to users table';
    ELSE
        RAISE NOTICE 'Role column already exists in users table';
    END IF;
END $$;

-- Update existing users to have 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';

-- Update admin users (replace with your actual admin credentials)
UPDATE users SET role = 'admin' 
WHERE email = 'your-admin@yourdomain.com' 
   OR username = 'superadmin';
```

3. **Redeploy your application** - it should now start successfully

### Option 2: Reset and Redeploy

If the manual migration doesn't work:

1. **Delete the database** (in Render dashboard)
2. **Create a new database**
3. **Update your DATABASE_URL** environment variable
4. **Redeploy** - the migration will run automatically

### Option 3: Use the Fixed Code

The code has been updated to:
- Use `VARCHAR(20)` instead of `ENUM` for the role field
- Handle migration more gracefully
- Avoid PostgreSQL syntax issues

## ✅ What's Fixed

1. **User Model**: Changed from `ENUM` to `VARCHAR(20)` with validation
2. **Migration Script**: Added proper column existence checking
3. **Server Startup**: Disabled automatic table alteration to prevent conflicts
4. **Manual Migration**: Created SQL script for manual database updates

## 🎯 Admin Dashboard Features

Once deployed, admin users will have access to:

- **Overview Dashboard**: System statistics and health monitoring
- **User Management**: Complete user administration with search/filter
- **Membership Management**: Plan and subscription analytics
- **Financial Management**: Revenue and payment tracking
- **Job Board Management**: Job posting and application analytics
- **Coupon Management**: Discount code analytics
- **System Configuration**: Platform settings and feature flags

## 🔐 Admin Access

- Admin users are automatically redirected to `/admin` upon login
- Regular users go to `/dashboard`
- Admin link appears in navbar only for admin users
- Role-based access control throughout the system

## 🚀 Deployment Steps

1. **Fix the database** using Option 1 above
2. **Redeploy your application**
3. **Login with admin credentials**
4. **Access admin dashboard at `/admin`**

The admin dashboard is fully functional and ready to use once the database migration is complete!
