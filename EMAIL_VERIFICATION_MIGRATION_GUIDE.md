# Email Verification System - Database Migration Guide

## Overview

This guide explains how to update your Render deployment with the new email verification system.

## What Changed?

### Code Changes
- ✅ New email verification system
- ✅ Confirm password field in registration
- ✅ Email verification required before login
- ✅ New email verification endpoints

**These code changes will be automatically deployed when you push to Render.**

### Database Changes (REQUIRES MANUAL MIGRATION)
- ⚠️ New columns in `users` table:
  - `emailVerified` (BOOLEAN, default: false)
  - `emailVerifiedAt` (TIMESTAMP, nullable)
- ⚠️ New table: `email_verification_tokens`

## Migration Steps for Render

### ✅ AUTOMATIC MIGRATION (Recommended - No Action Needed!)

**The migration now runs automatically when your Render service starts!**

When you deploy the latest code to Render:
1. Push your code to GitHub
2. Render automatically deploys the new code
3. **The migration runs automatically on server startup**
4. Check the Render logs to confirm migration completed

**No manual steps required!** 🎉

### Option 1: Manual Migration Script (If Needed)

If for some reason the automatic migration doesn't run, you can run it manually:

1. **Connect to your Render database** via SSH or use Render's database console:
   ```bash
   # If you have SSH access to Render
   cd /path/to/your/app
   node server/scripts/create-email-verification-tables.js
   ```

2. **Or run via npm script:**
   ```bash
   npm run db:migrate-email-verification
   ```

### Option 2: Manual SQL Migration

If you prefer to run SQL directly, connect to your Render PostgreSQL database and run:

```sql
-- Step 1: Add emailVerified column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;

-- Step 2: Add emailVerifiedAt column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP NULL;

-- Step 3: Set default values for existing users
UPDATE users 
SET "emailVerified" = false 
WHERE "emailVerified" IS NULL;

-- Step 4: Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  "usedAt" TIMESTAMP NULL,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
ON email_verification_tokens("userId");

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at 
ON email_verification_tokens("expiresAt");

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_used 
ON email_verification_tokens(used);
```

### Option 3: Using Render's Database Console

1. Go to your Render dashboard
2. Navigate to your PostgreSQL database
3. Click on "Connect" or "Console"
4. Run the SQL commands from Option 2 above

## Deployment Checklist

- [ ] **Code deployed to Render** (automatic on git push)
- [ ] **Check Render logs** - Verify migration ran automatically on startup
- [ ] **Database migration completed** (automatic, but verify in logs)
- [ ] **Environment variables set** (if not already):
  - `CLIENT_URL` - Your frontend URL
  - `EMAIL_SERVICE` - Email service (gmail, sendgrid, etc.)
  - `EMAIL_USER` - Email service username
  - `EMAIL_PASSWORD` - Email service password/API key
  - `EMAIL_FROM` - Sender email address
- [ ] **Test the system**:
  - Register a new user
  - Check email for verification link
  - Click verification link
  - Try to log in (should work after verification)

## What Happens to Existing Users?

- Existing users will have `emailVerified = false` by default
- They will need to verify their email before logging in
- You can either:
  1. **Require all users to verify** (recommended for security)
  2. **Manually set existing users to verified**:
     ```sql
     UPDATE users SET "emailVerified" = true, "emailVerifiedAt" = NOW() WHERE "emailVerified" = false;
     ```

## Troubleshooting

### Migration Script Fails
- Check database connection string in `.env`
- Ensure you have proper database permissions
- Check Render database logs for errors

### Users Can't Log In
- Verify migration completed successfully
- Check that `emailVerified` column exists
- Check application logs for errors

### Verification Emails Not Sending
- Verify email service configuration in environment variables
- Check email service logs
- Test email service connection

## Rollback (if needed)

If you need to rollback the email verification requirement:

```sql
-- Allow unverified users to log in (temporary)
-- You'll need to modify the login controller to skip verification check

-- Or set all users to verified
UPDATE users SET "emailVerified" = true, "emailVerifiedAt" = NOW();
```

## Support

If you encounter issues:
1. Check Render application logs
2. Check Render database logs
3. Verify all environment variables are set correctly
4. Test database connection

