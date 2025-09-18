# Docker Development Setup Guide

This guide explains how to run the SaaS Platform in development mode with live code updates using Docker.

## Quick Start

### Development Mode (Recommended for local development)
```bash
# Using PowerShell script
.\start-dev.ps1

# Or manually
docker-compose up --build
```

### Production Mode
```bash
# Using PowerShell script
.\start-prod.ps1

# Or manually
docker-compose -f docker-compose.prod.yml up --build -d
```

## Development Features

### Live Code Updates
- **Backend**: Uses `nodemon` for automatic server restarts when code changes
- **Frontend**: Uses Vite dev server with hot module replacement (HMR)
- **Volume Mounts**: Source code is mounted into containers for instant updates

### Ports
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### File Structure
```
├── docker-compose.yml          # Development setup (default)
├── docker-compose.dev.yml      # Alternative development setup
├── docker-compose.prod.yml     # Production setup
├── server/
│   ├── Dockerfile.dev          # Development backend container
│   └── Dockerfile              # Production backend container
└── client/
    ├── Dockerfile.dev          # Development frontend container
    └── Dockerfile              # Production frontend container
```

## Key Differences

### Development Mode
- Uses `nodemon` for backend auto-restart
- Uses Vite dev server for frontend with HMR
- Source code mounted as volumes
- `NODE_ENV=development`
- Frontend runs on port 3000 (Vite dev server)

### Production Mode
- Uses `node` directly for backend
- Uses nginx to serve built React app
- Source code copied into containers
- `NODE_ENV=production`
- Frontend runs on port 80 (nginx)

## Volume Mounts (Development)

### Backend
- `./server:/app` - Source code for live updates
- `/app/node_modules` - Anonymous volume to preserve node_modules
- `./server/uploads:/app/uploads` - File uploads

### Frontend
- `./client:/app` - Source code for live updates
- `/app/node_modules` - Anonymous volume to preserve node_modules

## Environment Variables

### Backend
- `NODE_ENV`: development/production
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `EMAIL_USER`: Email service username
- `EMAIL_PASS`: Email service password

### Database
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Code changes not reflected
- Ensure you're using the development Dockerfile
- Check that volumes are properly mounted
- Restart containers if needed: `docker-compose restart`

### Port conflicts
- Change ports in docker-compose.yml if needed
- Ensure no other services are using ports 3000, 5000, or 5432

### Node.js Version Issues
- The project uses Node 20 for compatibility with Vite 7
- If you encounter Vite errors, ensure you're using the development Dockerfiles

### Database Connection Issues
- Ensure PostgreSQL container is healthy before backend starts
- Check database credentials in docker-compose.yml
- Verify database initialization scripts are working

## Development Workflow

1. **Start Development Environment**:
   ```bash
   .\start-dev.ps1
   ```

2. **Make Code Changes**: Edit files in `server/` or `client/` directories

3. **See Changes Instantly**: 
   - Backend changes trigger automatic server restarts
   - Frontend changes trigger hot module replacement

4. **Stop Environment**:
   ```bash
   docker-compose down
   ```

## Advanced Usage

### Running Individual Services
```bash
# Start only database
docker-compose up database

# Start only backend
docker-compose up backend

# Start only frontend
docker-compose up frontend
```

### Viewing Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Follow logs in real-time
docker-compose logs -f backend
```

### Rebuilding Specific Service
```bash
# Rebuild and restart backend
docker-compose up --build backend

# Rebuild and restart frontend
docker-compose up --build frontend
```

### Database Management
```bash
# Access database shell
docker-compose exec database psql -U postgres -d saas_platform

# Run database scripts
docker-compose exec backend npm run db:seed
```

## Performance Tips

1. **Use .dockerignore**: Ensure large directories like `node_modules` are excluded
2. **Volume Optimization**: Anonymous volumes for `node_modules` prevent conflicts
3. **Resource Limits**: Adjust Docker Desktop resources if containers are slow
4. **Network Optimization**: Use Docker's internal networking for service communication

## Security Considerations

- Never commit `.env` files with real credentials
- Use environment variables for sensitive data
- Regularly update base images for security patches
- Use production configurations for deployed environments
