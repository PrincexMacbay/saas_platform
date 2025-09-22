-- =====================================================
-- Supabase Database Setup Script
-- Copy and paste this entire script into Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extended with Career Center fields)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    guid UUID DEFAULT gen_random_uuid() UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    about TEXT,
    "profileImage" VARCHAR(255),
    "coverImage" VARCHAR(255),
    status INTEGER DEFAULT 1,
    visibility INTEGER DEFAULT 1,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    "lastLogin" TIMESTAMP,
    
    -- Career Center fields
    "userType" VARCHAR(20) CHECK ("userType" IN ('individual', 'company')),
    
    -- Individual fields
    resume VARCHAR(500),
    "workExperience" TEXT,
    "jobPreferences" TEXT,
    
    -- Company fields
    "companyName" VARCHAR(255),
    "companyLogo" VARCHAR(500),
    industry VARCHAR(100),
    "companySize" VARCHAR(50),
    website VARCHAR(255),
    location VARCHAR(255),
    
    -- Common fields
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "profileType" VARCHAR(20) DEFAULT 'individual' CHECK ("profileType" IN ('individual', 'company')),
    bio TEXT,
    skills TEXT[],
    "socialLinks" JSONB,
    "contactInfo" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual Profiles table
CREATE TABLE IF NOT EXISTS individual_profiles (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "dateOfBirth" DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    "currentLocation" VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "linkedinProfile" VARCHAR(255),
    "githubProfile" VARCHAR(255),
    "portfolioWebsite" VARCHAR(255),
    "expectedSalary" DECIMAL(10,2),
    "availabilityStatus" VARCHAR(50) DEFAULT 'available',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "companyDescription" TEXT,
    "foundedYear" INTEGER,
    "companyType" VARCHAR(50),
    "benefits" TEXT[],
    "companyCulture" TEXT,
    "hiringProcess" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SOCIAL FEATURES
-- =====================================================

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    guid UUID DEFAULT gen_random_uuid() UNIQUE,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "postType" VARCHAR(20) DEFAULT 'text' CHECK ("postType" IN ('text', 'image', 'video', 'link')),
    "mediaUrls" TEXT[],
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
    "spaceId" INTEGER,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    "postId" INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "parentId" INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    "postId" INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("postId", "userId")
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    "followerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "followingId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("followerId", "followingId")
);

-- Spaces table
CREATE TABLE IF NOT EXISTS spaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "createdBy" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CAREER CENTER TABLES
-- =====================================================

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    "companyId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    "jobType" VARCHAR(50) CHECK ("jobType" IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    "experienceLevel" VARCHAR(50) CHECK ("experienceLevel" IN ('entry', 'mid', 'senior', 'executive')),
    location VARCHAR(255),
    "remoteWork" BOOLEAN DEFAULT false,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    "currency" VARCHAR(3) DEFAULT 'USD',
    "applicationDeadline" DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    "jobId" INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "coverLetter" TEXT,
    resume VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
    "appliedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("jobId", "userId")
);

-- Saved Jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    "jobId" INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("jobId", "userId")
);

-- Application Forms table
CREATE TABLE IF NOT EXISTS application_forms (
    id SERIAL PRIMARY KEY,
    "jobId" INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    "formTitle" VARCHAR(255) NOT NULL,
    "formDescription" TEXT,
    "formFields" JSONB NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table (for custom forms)
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    "formId" INTEGER REFERENCES application_forms(id) ON DELETE CASCADE,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "formData" JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
    "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MEMBERSHIP SYSTEM TABLES
-- =====================================================

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    "billingCycle" VARCHAR(20) DEFAULT 'monthly' CHECK ("billingCycle" IN ('monthly', 'yearly', 'lifetime')),
    features JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "isPublic" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "planId" INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
    "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP,
    "autoRenew" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "planId" INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
    "stripeSubscriptionId" VARCHAR(255),
    "currentPeriodStart" TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "subscriptionId" INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    "paymentMethod" VARCHAR(50),
    "transactionId" VARCHAR(255),
    "paymentDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Payments table
CREATE TABLE IF NOT EXISTS scheduled_payments (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "subscriptionId" INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    "scheduledDate" TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processed', 'failed', 'cancelled')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Payment Info table
CREATE TABLE IF NOT EXISTS user_payment_info (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "paymentDetails" JSONB NOT NULL,
    "isDefault" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "subscriptionId" INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    "invoiceNumber" VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    "dueDate" TIMESTAMP,
    "paidDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debts table
CREATE TABLE IF NOT EXISTS debts (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "subscriptionId" INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'paid', 'written_off')),
    "dueDate" TIMESTAMP,
    "paidDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    "discountType" VARCHAR(20) CHECK ("discountType" IN ('percentage', 'fixed')),
    "discountValue" DECIMAL(10,2) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER DEFAULT 0,
    "validFrom" TIMESTAMP,
    "validUntil" TIMESTAMP,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Digital Cards table
CREATE TABLE IF NOT EXISTS digital_cards (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "cardType" VARCHAR(50) NOT NULL,
    "cardData" JSONB NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membership Settings table
CREATE TABLE IF NOT EXISTS membership_settings (
    id SERIAL PRIMARY KEY,
    "settingKey" VARCHAR(100) UNIQUE NOT NULL,
    "settingValue" JSONB NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "reminderType" VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "reminderDate" TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_userType ON users("userType");

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts("userId");
CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON posts("createdAt");
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments("postId");
CREATE INDEX IF NOT EXISTS idx_comments_userId ON comments("userId");

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_postId ON likes("postId");
CREATE INDEX IF NOT EXISTS idx_likes_userId ON likes("userId");

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_followerId ON follows("followerId");
CREATE INDEX IF NOT EXISTS idx_follows_followingId ON follows("followingId");

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_companyId ON jobs("companyId");
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_jobType ON jobs("jobType");
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

-- Job Applications indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_jobId ON job_applications("jobId");
CREATE INDEX IF NOT EXISTS idx_job_applications_userId ON job_applications("userId");
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Memberships indexes
CREATE INDEX IF NOT EXISTS idx_memberships_userId ON memberships("userId");
CREATE INDEX IF NOT EXISTS idx_memberships_planId ON memberships("planId");
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_planId ON subscriptions("planId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_userId ON payments("userId");
CREATE INDEX IF NOT EXISTS idx_payments_subscriptionId ON payments("subscriptionId");
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample plans
INSERT INTO plans (name, description, price, "billingCycle", features, "isPublic") VALUES
('Free', 'Basic features for individuals', 0.00, 'monthly', '{"posts": 10, "connections": 50, "job_applications": 5}', true),
('Professional', 'Advanced features for professionals', 29.99, 'monthly', '{"posts": 100, "connections": 500, "job_applications": 50, "analytics": true}', true),
('Business', 'Full features for businesses', 99.99, 'monthly', '{"posts": 1000, "connections": 2000, "job_applications": 200, "analytics": true, "custom_branding": true}', true),
('Enterprise', 'Custom solutions for large organizations', 299.99, 'monthly', '{"posts": -1, "connections": -1, "job_applications": -1, "analytics": true, "custom_branding": true, "api_access": true}', false)
ON CONFLICT DO NOTHING;

-- Insert sample membership settings
INSERT INTO membership_settings ("settingKey", "settingValue", description) VALUES
('default_plan', '1', 'Default plan for new users'),
('trial_period_days', '14', 'Number of days for free trial'),
('max_free_posts', '10', 'Maximum posts for free users'),
('max_free_connections', '50', 'Maximum connections for free users'),
('payment_grace_period_days', '7', 'Grace period for failed payments')
ON CONFLICT ("settingKey") DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This script has created all necessary tables for your SaaS platform
-- You can now use your Supabase database with your application!

SELECT 'Database setup completed successfully! All tables have been created.' as message;
