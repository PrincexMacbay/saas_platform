-- Manual migration script for adding role column to users table
-- Run this if the automatic migration fails

-- Step 1: Add role column if it doesn't exist
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

-- Step 2: Update existing users without role to have 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';

-- Step 3: Update admin users to have 'admin' role
-- Replace 'admin@yourdomain.com' and 'superadmin' with your actual admin credentials
UPDATE users SET role = 'admin' 
WHERE email = COALESCE(NULLIF('', ''), 'admin@yourdomain.com') 
   OR username = COALESCE(NULLIF('', ''), 'superadmin');

-- Step 4: Verify the migration
SELECT 
    role,
    COUNT(*) as user_count
FROM users 
GROUP BY role
ORDER BY role;

-- Show admin users
SELECT id, username, email, role, "createdAt"
FROM users 
WHERE role = 'admin'
ORDER BY "createdAt";
