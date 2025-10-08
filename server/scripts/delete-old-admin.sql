-- Delete old admin account from database
-- Run this in your Render database console or via psql

-- First, check current admin accounts
SELECT id, email, username, "firstName", "lastName", role, "createdAt" 
FROM users 
WHERE role = 'admin' OR username = 'superadmin';

-- Delete the old admin (replace with the actual email if different)
DELETE FROM user_profiles WHERE "userId" IN (
  SELECT id FROM users WHERE username = 'superadmin' OR email LIKE '%neu.edu.tr'
);

DELETE FROM users 
WHERE username = 'superadmin' OR email LIKE '%neu.edu.tr';

-- Verify deletion
SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin';

-- You can also delete by specific email:
-- DELETE FROM user_profiles WHERE "userId" IN (SELECT id FROM users WHERE email = '20234417@std.neu.edu.tr');
-- DELETE FROM users WHERE email = '20234417@std.neu.edu.tr';

