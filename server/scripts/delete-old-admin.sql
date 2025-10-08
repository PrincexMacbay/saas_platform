-- Delete ALL existing admin accounts from database
-- Run this in your Render database console or via psql

-- First, check ALL current admin accounts
SELECT id, email, username, "firstName", "lastName", role, "createdAt" 
FROM users 
WHERE role = 'admin';

-- Delete ALL admin user profiles (foreign key constraint)
DELETE FROM user_profiles 
WHERE "userId" IN (
  SELECT id FROM users WHERE role = 'admin'
);

-- Delete ALL admin users
DELETE FROM users 
WHERE role = 'admin';

-- Verify deletion (should return 0)
SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin';

-- After running this, restart your Render service
-- The init-admin script will create a new admin with your environment variables

