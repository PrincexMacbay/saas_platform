# Quick Startup Guide

## Current Status ✅
- **Backend Server**: Running on `http://localhost:5000`
- **Frontend Client**: Running on `http://localhost:3000`
- **Database**: Connected and operational
- **Docker Development**: Fully configured with live code updates

## How to Start the Application

### Option 1: Docker Development (Recommended)

#### Quick Start:
```bash
.\start-dev.ps1
```

This single command will:
- Start PostgreSQL database
- Start backend with nodemon (auto-restart on changes)
- Start frontend with Vite (hot module replacement)
- Mount source code for live updates

### Option 2: Manual Startup (Without Docker)

#### 1. Start Backend Server
```bash
cd server
npm run dev
```
This starts the backend with nodemon for auto-reloading.

#### 2. Start Frontend Client (in a new terminal)
```bash
cd client
npm run dev
```
This starts the React development server.

### Option 3: Production Mode (Docker)
```bash
.\start-prod.ps1
```

## Verification Steps

### 1. Check Backend Health
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/health -Method GET
```
Should return `StatusCode: 200`

### 2. Check Frontend
Open your browser and navigate to:
- `http://localhost:3000` (or the port shown in the terminal)

### 3. Test Login
- Try logging in with existing credentials
- Or register a new account

## Common Issues & Solutions

### Issue: `net::ERR_CONNECTION_REFUSED`
**Solution**: Backend server is not running
1. Check if you're in the correct directory (`server/`)
2. Run `npm run dev`
3. Wait for the server to start (you should see "Server running on port 5000")

### Issue: Frontend can't connect to backend
**Solution**: 
1. Ensure backend is running on port 5000
2. Check that the frontend is using the correct API URL
3. Verify CORS settings in backend

### Issue: Database connection errors
**Solution**:
1. Check if PostgreSQL is running
2. Verify database credentials in `.env` file
3. Run database migrations if needed

## Development Workflow

### 1. Making Changes
- Backend changes auto-reload with nodemon
- Frontend changes auto-reload with Vite
- No need to restart servers for most changes

### 2. Database Changes
- Update models in `server/models/`
- Create migration scripts in `server/scripts/`
- Run migrations manually

### 3. Testing
- Backend: Check terminal for errors
- Frontend: Check browser console for errors
- API: Use browser dev tools or Postman

## Ports Used
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000` (or similar)
- **Database**: `localhost:5432` (PostgreSQL)

## Environment Variables
Make sure you have a `.env` file in the `server/` directory with:
```
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

## Recent Updates Applied ✅

### 1. Docker Development Environment
- Added development Dockerfiles for both frontend and backend
- Configured volume mounts for live code updates
- Updated to Node 20 for Vite 7 compatibility
- Created startup scripts for easy development

### 2. Organization Table Removal
- Removed Organization model and all references
- Cleaned up database schema and model associations
- Updated User, Plan, ApplicationForm, and DigitalCard models
- Fixed database initialization issues

### 3. Career Center Role Selection
- Fixed issue where new users were automatically assigned as job seekers
- Now users can choose between "Job Seeker" and "Employer" roles
- Backend no longer creates default user profiles during registration

### 4. Application Submission
- Fixed 500 error when submitting membership applications
- Backend now properly handles formData JSON parsing
- Extracts required fields (email, firstName, lastName) from formData

### 5. Database Schema
- Normalized user tables for better data organization
- Added plan-specific linking for application forms and digital cards
- Implemented free plans support

## Next Steps
1. Test the application thoroughly
2. Create test users and verify all features work
3. Check membership management functionality
4. Verify career center role selection works
5. Test application submission process
