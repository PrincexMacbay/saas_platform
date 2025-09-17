# Docker Setup Guide for SaaS Platform

## What is Docker?

Docker is a containerization platform that packages your application and its dependencies into lightweight, portable containers. This ensures your application runs consistently across different environments.

### Benefits:
- **Consistency**: Same environment everywhere (dev, staging, production)
- **Isolation**: Each service runs independently
- **Portability**: Easy deployment on any Docker-enabled system
- **Scalability**: Easy to scale services up/down
- **Environment Management**: No more "works on my machine" issues

## Project Structure

Your SaaS platform consists of:
- **Frontend**: React app (port 3000)
- **Backend**: Node.js API server (port 5000)
- **Database**: PostgreSQL (port 5432)

## Docker Files Created

### 1. Backend Dockerfile (`server/Dockerfile`)
- Uses Node.js 18 Alpine (lightweight)
- Installs production dependencies
- Exposes port 5000
- Includes health check

### 2. Frontend Dockerfile (`client/Dockerfile`)
- Multi-stage build (build + nginx)
- Builds React app in first stage
- Serves with nginx in second stage
- Includes API proxy configuration

### 3. Docker Compose (`docker-compose.yml`)
- Orchestrates all services
- Sets up networking between containers
- Manages volumes for data persistence
- Includes health checks and dependencies

### 4. Nginx Configuration (`client/nginx.conf`)
- Handles client-side routing
- Proxies API calls to backend
- Enables gzip compression

## Prerequisites

1. **Install Docker Desktop**:
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop
   - Verify installation: `docker --version`

2. **Install Docker Compose** (usually included with Docker Desktop):
   - Verify: `docker-compose --version`

## Quick Start

### 1. Build and Start All Services
```bash
# From project root directory
docker-compose up --build
```

This will:
- Build backend and frontend images
- Start PostgreSQL database
- Start backend API server
- Start frontend React app
- Set up networking between services

### 2. Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### 3. Stop Services
```bash
docker-compose down
```

## Development Workflow

### Option 1: Full Docker Development
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Hybrid Development (Recommended)
Run database in Docker, but run frontend/backend locally:

```bash
# Start only database
docker-compose up database

# In separate terminals:
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

## Useful Docker Commands

### Container Management
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop a specific container
docker stop <container_name>

# Remove a container
docker rm <container_name>

# View container logs
docker logs <container_name>
```

### Image Management
```bash
# List images
docker images

# Remove an image
docker rmi <image_name>

# Remove all unused images
docker image prune
```

### Docker Compose Commands
```bash
# Start services in background
docker-compose up -d

# Rebuild specific service
docker-compose up --build backend

# View logs for specific service
docker-compose logs -f backend

# Execute command in running container
docker-compose exec backend bash

# Scale a service
docker-compose up --scale backend=3
```

## Environment Configuration

### Production Environment Variables
Update these in `docker-compose.yml` for production:

```yaml
environment:
  NODE_ENV: production
  DATABASE_URL: postgresql://postgres:your_secure_password@database:5432/saas_platform
  JWT_SECRET: your_very_secure_jwt_secret
  EMAIL_USER: your_production_email@gmail.com
  EMAIL_PASS: your_production_email_password
```

### Development Environment
For development, you can override environment variables:

```bash
# Create .env file in project root
echo "JWT_SECRET=dev_secret" > .env
echo "EMAIL_USER=dev@example.com" >> .env
echo "EMAIL_PASS=dev_password" >> .env
```

## Database Management

### Access Database
```bash
# Connect to PostgreSQL container
docker-compose exec database psql -U postgres -d saas_platform

# Run database scripts
docker-compose exec backend node scripts/seed-database.js
```

### Backup Database
```bash
# Create backup
docker-compose exec database pg_dump -U postgres saas_platform > backup.sql

# Restore backup
docker-compose exec -T database psql -U postgres saas_platform < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :5000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check database health
   docker-compose exec database pg_isready -U postgres
   
   # View database logs
   docker-compose logs database
   ```

3. **Build Failures**
   ```bash
   # Clean build (removes cache)
   docker-compose build --no-cache
   
   # Remove all containers and images
   docker-compose down --rmi all
   ```

4. **Permission Issues (Windows)**
   - Ensure Docker Desktop is running
   - Check if WSL2 is enabled
   - Restart Docker Desktop

### Debugging Commands
```bash
# Enter running container
docker-compose exec backend bash
docker-compose exec frontend sh

# View detailed container info
docker inspect <container_name>

# Monitor resource usage
docker stats
```

## Production Deployment

### 1. Environment Setup
- Use production environment variables
- Set up proper secrets management
- Configure SSL certificates
- Set up monitoring and logging

### 2. Docker Compose Override
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'
services:
  backend:
    environment:
      NODE_ENV: production
    restart: always
    
  frontend:
    restart: always
    
  database:
    restart: always
```

### 3. Deploy
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Next Steps

1. **Test the Docker setup**:
   ```bash
   docker-compose up --build
   ```

2. **Verify all services are running**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api/health
   - Database: Check with `docker-compose ps`

3. **Test the application**:
   - Register a new user
   - Test membership features
   - Verify database persistence

4. **Set up monitoring** (optional):
   - Add health checks
   - Set up logging
   - Configure alerts

## Benefits of This Docker Setup

✅ **Consistent Environment**: Same setup everywhere  
✅ **Easy Deployment**: One command to start everything  
✅ **Isolated Services**: Each service runs independently  
✅ **Scalable**: Easy to scale individual services  
✅ **Development Friendly**: Can run services individually  
✅ **Production Ready**: Optimized for production deployment  

Your SaaS platform is now containerized and ready for deployment anywhere Docker is supported!
