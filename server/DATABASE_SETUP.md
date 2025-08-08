# Database Setup Guide

This guide provides instructions for setting up the database for the Social Platform with Career Center functionality.

## 📋 Prerequisites

- PostgreSQL installed and running
- Access to create databases and tables
- Basic knowledge of SQL

## 🚀 Quick Setup

### Option 1: Using the Simple Script (Recommended)

1. **Create the database:**
   ```sql
   CREATE DATABASE humhub_clone;
   ```

2. **Connect to the database:**
   ```sql
   \c humhub_clone;
   ```

3. **Run the simple setup script:**
   ```bash
   psql -d humhub_clone -f setup-database-simple.sql
   ```

### Option 2: Using the Comprehensive Script

1. **Create the database:**
   ```sql
   CREATE DATABASE humhub_clone;
   ```

2. **Connect to the database:**
   ```sql
   \c humhub_clone;
   ```

3. **Run the comprehensive setup script:**
   ```bash
   psql -d humhub_clone -f setup-database.sql
   ```

## 📊 Database Structure

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with Career Center fields |
| `spaces` | Community spaces/groups |
| `posts` | User posts and content |
| `comments` | Comments on posts |
| `memberships` | User-space relationships |
| `follows` | Following relationships |
| `likes` | Like/unlike system |

### Career Center Tables

| Table | Description |
|-------|-------------|
| `jobs` | Job postings |
| `job_applications` | Job applications |
| `saved_jobs` | User's saved jobs |

## 🔧 Manual Setup Steps

If you prefer to run commands manually:

### 1. Create Database
```sql
CREATE DATABASE humhub_clone;
```

### 2. Connect to Database
```sql
\c humhub_clone;
```

### 3. Create Tables (Core)
```sql
-- Users table
CREATE TABLE users (
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

-- Continue with other tables...
```

### 4. Create Indexes
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
-- ... other indexes
```

### 5. Insert Sample Data
```sql
INSERT INTO users (username, email, password, "firstName", "lastName", about, status) 
VALUES (
    'admin',
    'admin@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO',
    'Admin',
    'User',
    'System administrator',
    1
);
```

## 🔍 Verification

After setup, verify the database was created correctly:

```sql
-- Check all tables
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
```

## 🎯 Expected Results

After successful setup, you should have:

- **10 tables** created
- **1 admin user** created (admin@example.com / password123)
- **Proper foreign key relationships**
- **Performance indexes** for optimal queries

## 🔧 Configuration

Update your `.env` file with the database credentials:

```env
DB_NAME=humhub_clone
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secure_jwt_secret_here_12345
```

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure your PostgreSQL user has CREATE privileges
   - Run: `GRANT ALL PRIVILEGES ON DATABASE humhub_clone TO your_user;`

2. **Database Already Exists**
   - Drop existing database: `DROP DATABASE IF EXISTS humhub_clone;`
   - Recreate: `CREATE DATABASE humhub_clone;`

3. **Connection Issues**
   - Check PostgreSQL is running: `sudo systemctl status postgresql`
   - Verify connection: `psql -U postgres -h localhost`

4. **UUID Extension Missing**
   - Install: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## 📝 Notes

- The scripts use `IF NOT EXISTS` to prevent errors if tables already exist
- Sample data includes an admin user with password: `password123`
- All tables include proper foreign key constraints with CASCADE delete
- Indexes are created for optimal query performance
- The database supports both social networking and career center features

## 🎉 Success

Once setup is complete, you can:

1. Start the server: `npm start`
2. Test the API: `http://localhost:5000/api/health`
3. Login with: `admin@example.com` / `password123`
4. Explore the Career Center functionality
