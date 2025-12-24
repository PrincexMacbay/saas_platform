# Environment Variables Setup

Create a `.env` file in this folder (`server/.env`) with the following variables:

```env
# Required
JWT_SECRET=your_super_secret_jwt_key_here_development_only_change_in_production

# Database Configuration
# Option 1: Use your remote database (recommended for quick start)
DATABASE_URL=postgresql://username:password@host:port/database

# Option 2: Use local PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=humhub_clone
# DB_USER=postgres
# DB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development

# Client URLs
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email (Optional - uncomment if needed)
# EMAIL_SERVICE=gmail
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your_app_password
# EMAIL_FROM="Social Network" <noreply@yourdomain.com>

# Cloud Storage (Optional - Recommended for Production)
# Without these, files will be stored locally and lost on server restart/redeploy
# Sign up at https://cloudinary.com (free tier available)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# API URL (for local file URLs when Cloudinary is not configured)
# API_URL=http://localhost:5000
# BACKEND_URL=https://your-backend-url.onrender.com
```

## Quick Setup

1. Copy the content above
2. Create `server/.env` file
3. Fill in your database credentials (use your existing remote DB or local PostgreSQL)
4. Save the file
5. Run `npm run dev` to start the server

