# Render Database Setup Guide

## Step 1: Get Your Render Database Connection Details

1. Go to your Render dashboard
2. Navigate to your PostgreSQL database service
3. Copy the **External Database URL** - it should look like:
   ```
   postgresql://username:password@hostname:port/database_name
   ```

## Step 2: Set Environment Variables in Render

In your Render web service settings, add these environment variables:

### Required Environment Variables:
```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_for_production_change_this
CLIENT_URL=https://social-network-frontend-k0ml.onrender.com
```

### Alternative Database Configuration (if DATABASE_URL doesn't work):
```
DB_HOST=your_render_db_host
DB_PORT=5432
DB_NAME=your_render_db_name
DB_USER=your_render_db_user
DB_PASSWORD=your_render_db_password
DB_DIALECT=postgres
```

## Step 3: Database Setup Script

Run this SQL script on your Render database to create all necessary tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    "organizationName" VARCHAR(255),
    "organizationDescription" TEXT,
    "organizationLogo" VARCHAR(500),
    "organizationWebsite" VARCHAR(255),
    "organizationPhone" VARCHAR(20),
    "organizationAddress" TEXT,
    "isOrganization" BOOLEAN DEFAULT FALSE,
    "organizationSettings" TEXT,
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

-- Create indexes for performance
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
```

## Step 4: How to Run the Database Setup

### Option 1: Using Render's Database Console
1. Go to your Render database dashboard
2. Click on "Connect" or "Console"
3. Copy and paste the SQL script above
4. Execute the script

### Option 2: Using a Database Client
1. Use a tool like pgAdmin, DBeaver, or psql
2. Connect using your Render database credentials
3. Run the SQL script

### Option 3: Using the Application (Automatic)
Your application is configured to automatically create tables when it starts in development mode. However, for production, you should run the SQL script manually first.

## Step 5: Verify the Setup

After setting up the database, you can verify by:

1. Checking that all tables were created
2. Testing the registration endpoint
3. Checking the application logs for database connection success

## Troubleshooting

### Common Issues:

1. **SSL Connection Required**: Render databases require SSL connections. The configuration is already set up for this.

2. **Connection Timeout**: Make sure your DATABASE_URL is correct and includes all necessary parameters.

3. **Permission Issues**: Ensure your database user has the necessary permissions to create tables.

4. **UUID Extension**: The script includes `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` to enable UUID generation.

### Testing the Connection:

You can test if your database connection is working by checking the application logs after deployment. Look for:
- "Database connection established successfully."
- No connection errors

## Next Steps

1. Set the environment variables in Render
2. Run the database setup script
3. Deploy your application
4. Test the registration endpoint

The 400 error you're seeing is likely due to the database connection not being properly configured or the tables not existing yet.
