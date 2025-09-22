# Render Docker Deployment Guide

## 🐳 Option 1: Backend as Docker Web Service (Recommended)

### Step 1: Create a Docker Web Service
1. Go to your Render dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Choose **"Docker"** as the build method

### Step 2: Configure the Service
- **Name**: `social-network-backend-docker`
- **Build Command**: (leave empty - Docker will handle this)
- **Start Command**: (leave empty - Docker will handle this)
- **Dockerfile Path**: `server/Dockerfile`

### Step 3: Set Environment Variables
```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=https://social-network-frontend-k0ml.onrender.com
```

### Step 4: Deploy
- Click **"Create Web Service"**
- Render will build and deploy your Docker container

## 🐳 Option 2: Full Stack with Docker Compose

### Step 1: Create a Docker Compose Service
1. Go to your Render dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Choose **"Docker Compose"** as the build method

### Step 2: Configure the Service
- **Name**: `social-network-fullstack`
- **Docker Compose File**: `docker-compose.prod.yml`
- **Service to Deploy**: `backend` (or `frontend`)

### Step 3: Set Environment Variables
```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=https://your-frontend-url.onrender.com
```

## 🐳 Option 3: Separate Services

### Backend Service
- **Type**: Web Service (Docker)
- **Dockerfile**: `server/Dockerfile`
- **Port**: 5000

### Frontend Service
- **Type**: Static Site (or Web Service with Docker)
- **Dockerfile**: `client/Dockerfile`
- **Port**: 80

## 🎯 Recommended Approach

**Use Option 1** - Deploy backend as Docker web service:

### Advantages:
- ✅ Uses your existing Dockerfile
- ✅ Easy to configure
- ✅ Automatic deployments
- ✅ Built-in health checks
- ✅ Easy environment variable management

### Steps:
1. **Create Docker Web Service** in Render
2. **Point to your repository**
3. **Set Dockerfile path** to `server/Dockerfile`
4. **Add environment variables**
5. **Deploy**

## 🔧 Dockerfile Optimization for Render

Your current `server/Dockerfile` is already optimized for production:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p uploads
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["npm", "start"]
```

## 🚀 Deployment Steps

1. **Push your code** to GitHub
2. **Create Docker Web Service** in Render
3. **Configure environment variables**
4. **Deploy**
5. **Test your endpoints**

## 🔍 Environment Variables Needed

```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=https://social-network-frontend-k0ml.onrender.com
```

## ✅ Benefits of Docker Deployment

- **Consistent environment** across development and production
- **Easy scaling** and management
- **Built-in health checks**
- **Automatic restarts** on failure
- **Easy rollbacks** if needed

## 🎉 After Deployment

Your Docker container will:
- ✅ Build automatically from your Dockerfile
- ✅ Run your Node.js application
- ✅ Connect to your Render database
- ✅ Handle all API requests
- ✅ Restart automatically if it crashes
