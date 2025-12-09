-- Quick SQL script to verify your admin account
-- Run this in your Render database console if you need immediate access

-- Verify admin account by email
UPDATE users 
SET "emailVerified" = true, 
    "emailVerifiedAt" = NOW()
WHERE email = '20234417@std.neu.edu.tr';

-- Or verify all admin accounts
UPDATE users 
SET "emailVerified" = true, 
    "emailVerifiedAt" = NOW()
WHERE role = 'admin' AND "emailVerified" = false;

-- Or verify ALL existing users (use with caution)
-- UPDATE users 
-- SET "emailVerified" = true, 
--     "emailVerifiedAt" = NOW()
-- WHERE "emailVerified" = false;

-- Verify the update
SELECT id, username, email, role, "emailVerified", "emailVerifiedAt"
FROM users 
WHERE email = '20234417@std.neu.edu.tr';

