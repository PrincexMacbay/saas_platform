-- ============================================
-- DELETE ALL ADMIN ACCOUNTS
-- ============================================
-- Run this in your Render PostgreSQL console
-- Steps: Render Dashboard → PostgreSQL Database → Connect → External Connection → Copy PSQL command
-- ============================================

-- Step 1: Check current admin accounts
SELECT id, email, username, "firstName", "lastName", role, "createdAt" 
FROM users 
WHERE role = 'admin';

-- Step 2: Delete ALL admin profiles (foreign key constraint)
DELETE FROM user_profiles 
WHERE "userId" IN (
  SELECT id FROM users WHERE role = 'admin'
);

-- Step 3: Delete ALL admin users
DELETE FROM users 
WHERE role = 'admin';

-- Step 4: Verify deletion (should return 0)
SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin';

-- ============================================
-- AFTER RUNNING THIS:
-- 1. Go to Render Dashboard
-- 2. Click your Backend Service
-- 3. Click "Manual Deploy" → "Deploy latest commit"
-- 4. Check logs - you should see "Admin account created successfully"
-- ============================================

