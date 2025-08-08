-- =====================================================
-- Social Platform Database Setup Script
-- This script creates all necessary tables for the social platform
-- including the Career Center functionality
-- =====================================================

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE humhub_clone;

-- Connect to the database
-- \c humhub_clone;

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
    
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spaces table
CREATE TABLE IF NOT EXISTS spaces (
    id SERIAL PRIMARY KEY,
    guid UUID DEFAULT gen_random_uuid() UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    about TEXT,
    url VARCHAR(45) UNIQUE,
    "joinPolicy" INTEGER DEFAULT 1,
    visibility INTEGER DEFAULT 1,
    color VARCHAR(7) DEFAULT '#3498db',
    status INTEGER DEFAULT 1,
    "ownerId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    guid UUID DEFAULT gen_random_uuid() UNIQUE,
    message TEXT NOT NULL,
    visibility INTEGER DEFAULT 1,
    archived BOOLEAN DEFAULT FALSE,
    "attachmentUrl" VARCHAR(500),
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "spaceId" INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    guid UUID DEFAULT gen_random_uuid() UNIQUE,
    message TEXT NOT NULL,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "postId" INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memberships table (junction table for users and spaces)
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "spaceId" INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    status INTEGER DEFAULT 1, -- 0: pending, 1: member, 2: admin, 3: moderator, 4: owner
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "spaceId")
);

-- Follows table (generic following system)
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "objectModel" VARCHAR(50) NOT NULL, -- 'User', 'Space', etc.
    "objectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "objectModel", "objectId")
);

-- Likes table (generic liking system)
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "objectModel" VARCHAR(50) NOT NULL, -- 'Post', 'Comment', etc.
    "objectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "objectModel", "objectId")
);

-- =====================================================
-- CAREER CENTER TABLES
-- =====================================================

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    guid UUID DEFAULT gen_random_uuid() UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    category VARCHAR(100) NOT NULL,
    "jobType" VARCHAR(20) NOT NULL CHECK ("jobType" IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    location VARCHAR(255) NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" VARCHAR(3) DEFAULT 'USD',
    "experienceLevel" VARCHAR(20) NOT NULL CHECK ("experienceLevel" IN ('entry', 'mid', 'senior', 'executive')),
    "remoteWork" BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
    "applicationDeadline" TIMESTAMP,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    guid UUID DEFAULT gen_random_uuid() UNIQUE,
    "coverLetter" TEXT,
    resume VARCHAR(500),
    status VARCHAR(20) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'hired')),
    notes TEXT,
    "appliedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "jobId" INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    "applicantId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Jobs table (junction table for users and jobs)
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "jobId" INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "jobId")
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users("userType");

-- Spaces indexes
CREATE INDEX IF NOT EXISTS idx_spaces_url ON spaces(url);
CREATE INDEX IF NOT EXISTS idx_spaces_owner ON spaces("ownerId");
CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);
CREATE INDEX IF NOT EXISTS idx_spaces_visibility ON spaces(visibility);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts("userId");
CREATE INDEX IF NOT EXISTS idx_posts_space ON posts("spaceId");
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts("createdAt");
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_archived ON posts(archived);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments("postId");
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments("userId");
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments("createdAt");

-- Memberships indexes
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships("userId");
CREATE INDEX IF NOT EXISTS idx_memberships_space ON memberships("spaceId");
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_user ON follows("userId");
CREATE INDEX IF NOT EXISTS idx_follows_object ON follows("objectModel", "objectId");

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes("userId");
CREATE INDEX IF NOT EXISTS idx_likes_object ON likes("objectModel", "objectId");

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs("userId");
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs("jobType");
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON jobs("experienceLevel");
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs("remoteWork");

-- Job Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications("jobId");
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON job_applications("applicantId");
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied ON job_applications("appliedAt");

-- Saved Jobs indexes
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs("userId");
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs("jobId");

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample admin user (password: password123)
INSERT INTO users (username, email, password, "firstName", "lastName", about, status) 
VALUES (
    'admin',
    'admin@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', -- password123
    'Admin',
    'User',
    'System administrator',
    1
) ON CONFLICT (username) DO NOTHING;

-- Insert sample spaces
INSERT INTO spaces (name, description, about, url, "joinPolicy", visibility, "ownerId")
SELECT 
    'General Discussion',
    'A place for general discussions and announcements',
    'Welcome to our main discussion space! Here you can share ideas, ask questions, and connect with other members.',
    'general',
    2, -- Free for all
    2, -- Public
    u.id
FROM users u WHERE u.username = 'admin'
ON CONFLICT (url) DO NOTHING;

-- Insert sample job
INSERT INTO jobs (title, description, requirements, benefits, category, "jobType", location, "salaryMin", "salaryMax", "experienceLevel", "remoteWork", "userId")
SELECT 
    'Senior Software Engineer',
    'We are looking for a senior software engineer to join our team.',
    '5+ years experience, React, Node.js, PostgreSQL',
    'Health insurance, remote work, flexible hours',
    'Technology',
    'full-time',
    'New York, NY',
    80000,
    120000,
    'senior',
    true,
    u.id
FROM users u WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check table counts
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'spaces', COUNT(*) FROM spaces
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'memberships', COUNT(*) FROM memberships
UNION ALL
SELECT 'follows', COUNT(*) FROM follows
UNION ALL
SELECT 'likes', COUNT(*) FROM likes
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'job_applications', COUNT(*) FROM job_applications
UNION ALL
SELECT 'saved_jobs', COUNT(*) FROM saved_jobs;

-- =====================================================
-- NOTES
-- =====================================================

/*
This script creates a complete database for the social platform with Career Center functionality.

Key Features:
- User management with Career Center fields
- Space/community management
- Post and comment system
- Following and liking system
- Job board functionality
- Application tracking
- Saved jobs feature

To run this script:
1. Create the database: CREATE DATABASE humhub_clone;
2. Connect to the database: \c humhub_clone;
3. Run this script: \i setup-database.sql;

The script includes:
- All necessary tables
- Proper foreign key relationships
- Performance indexes
- Sample data
- Verification queries

Demo accounts created:
- admin@example.com / password123
*/
