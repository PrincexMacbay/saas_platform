# Local Development Guide

This guide will help you run the project offline (locally) so you can see changes before pushing online.

## Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** - Either:
   - Local PostgreSQL installation, OR
   - Use your existing remote database (Supabase/Render)
3. **npm** (comes with Node.js)

## Quick Start

### Option 1: Run Both Services Manually (Recommended)

#### Terminal 1 - Start the Server:
```bash
cd server
npm install
npm run dev
```
Server will run on: `http://localhost:5000`

#### Terminal 2 - Start the Client:
```bash
cd client
npm install
npm run dev
```
Client will run on: `http://localhost:3000`

### Option 2: Use PowerShell Script (Windows)

```powershell
cd server
.\start-dev.ps1
```

Then in another terminal:
```powershell
cd client
npm run dev
```

## Environment Setup

### Server Environment Variables

Create a `.env` file in the `server` folder:

```env
# Required
JWT_SECRET=your_super_secret_jwt_key_here_development_only_change_in_production

# Database Configuration (choose one option)

# Option 1: Use Remote Database (Supabase/Render)
DATABASE_URL=postgresql://username:password@host:port/database

# Option 2: Use Local Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=humhub_clone
DB_USER=postgres
DB_PASSWORD=your_local_password

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS and email links)
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional - for password reset, email verification)
# If you don't set these, email features won't work but the app will still run
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="Social Network" <noreply@yourdomain.com>
```

### Client Environment Variables (Optional)

Create a `.env` file in the `client` folder if you need to override the API URL:

```env
VITE_API_URL=http://localhost:5000
```

## Step-by-Step Setup

### 1. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 2. Configure Environment

1. Copy the environment variables above
2. Create `.env` file in `server` folder
3. Fill in your database credentials (use your existing remote DB or set up local PostgreSQL)

### 3. Start the Server

```bash
cd server
npm run dev
```

You should see:
```
✅ All required environment variables are set
✅ Database connection established successfully.
Server running on port 5000
```

### 4. Start the Client

Open a **new terminal**:

```bash
cd client
npm run dev
```

You should see:
```
VITE v7.0.6  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 5. Open in Browser

Navigate to: **http://localhost:3000**

## Troubleshooting

### Server Won't Start

**Issue: Missing environment variables**
- Solution: Create `.env` file in `server` folder with at least `JWT_SECRET`

**Issue: Database connection failed**
- Solution: Check your database credentials in `.env`
- If using remote database, ensure SSL is enabled
- If using local database, ensure PostgreSQL is running

**Issue: Port 5000 already in use**
- Solution: Change `PORT=5001` in `.env` and update `VITE_API_URL` in client

### Client Won't Start

**Issue: Port 3000 already in use**
- Solution: Use `npm run dev:3001` or `npm run dev:3002`

**Issue: Can't connect to API**
- Solution: Ensure server is running on port 5000
- Check `VITE_API_URL` in client `.env` matches server port

### Database Issues

**Using Remote Database (Recommended for Quick Start):**
- Use your existing Supabase or Render database URL
- Just copy the `DATABASE_URL` from your production environment

**Using Local Database:**
1. Install PostgreSQL locally
2. Create a database: `CREATE DATABASE humhub_clone;`
3. Update `.env` with local credentials
4. Run migrations: The server will auto-create tables on first start

## Development Workflow

1. **Make changes** to your code
2. **See changes instantly** - Both Vite (client) and Nodemon (server) auto-reload
3. **Test locally** before pushing to production
4. **Commit and push** when ready

## Available Scripts

### Server Scripts:
- `npm run dev` - Start server with auto-reload (nodemon)
- `npm start` - Start server without auto-reload
- `npm run db:seed` - Seed database with test data

### Client Scripts:
- `npm run dev` - Start dev server on port 3000
- `npm run dev:3001` - Start on port 3001
- `npm run dev:3002` - Start on port 3002
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Tips

- **Keep both terminals open** - One for server, one for client
- **Check console logs** - Both will show errors and helpful messages
- **Hot reload works** - Changes to code will automatically refresh
- **Use browser DevTools** - F12 to see console errors and network requests

## Next Steps

Once everything is running:
1. Test login/registration
2. Make your changes
3. See them instantly in the browser
4. When satisfied, commit and push to deploy online

Happy coding! 🚀

