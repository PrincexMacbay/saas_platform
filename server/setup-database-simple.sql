-- =====================================================
-- Simple Database Setup Script
-- Run this to create all tables for the social platform
-- =====================================================

-- Create database (uncomment if needed)
-- CREATE DATABASE humhub_clone;

-- Connect to database (uncomment if needed)
-- \c humhub_clone;

-- Users table
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
    "userType" VARCHAR(20) CHECK ("userType" IN ('individual', 'company')),
    resume VARCHAR(500),
    "workExperience" TEXT,
    "jobPreferences" TEXT,
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

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "spaceId" INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    status INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "spaceId")
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "objectModel" VARCHAR(50) NOT NULL,
    "objectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "objectModel", "objectId")
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "objectModel" VARCHAR(50) NOT NULL,
    "objectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "objectModel", "objectId")
);

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

-- Saved Jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "jobId" INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "jobId")
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts("userId");
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments("postId");
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs("userId");

-- Insert admin user (password: password123)
INSERT INTO users (username, email, password, "firstName", "lastName", about, status) 
VALUES (
    'admin',
    'admin@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO',
    'Admin',
    'User',
    'System administrator',
    1
) ON CONFLICT (username) DO NOTHING;

-- Verify tables created
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';
