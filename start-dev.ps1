# Development startup script for SaaS Platform
Write-Host "Starting SaaS Platform in Development Mode..." -ForegroundColor Green

# Stop any existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Build and start development containers
Write-Host "Building and starting development containers..." -ForegroundColor Yellow
docker-compose up --build

Write-Host "Development environment is ready!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Database: localhost:5432" -ForegroundColor Cyan
