-- Update user role to admin
-- Run this in your Supabase SQL Editor

UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Verify the update
SELECT id, username, email, role, status 
FROM users 
WHERE email = 'admin@example.com';
