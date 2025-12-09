-- Email Verification System - Database Migration SQL
-- Run this script on your Render PostgreSQL database
-- 
-- This migration:
-- 1. Adds emailVerified and emailVerifiedAt columns to users table
-- 2. Creates email_verification_tokens table
-- 3. Creates necessary indexes

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

-- Verification: Check that everything was created
SELECT 
  'Users table columns' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('emailVerified', 'emailVerifiedAt')
ORDER BY column_name;

SELECT 
  'Email verification tokens table' as check_type,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'email_verification_tokens';

