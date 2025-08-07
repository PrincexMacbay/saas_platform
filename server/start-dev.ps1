# Development startup script with environment variables

Write-Host "Setting up development environment..." -ForegroundColor Green

# Set environment variables
$env:JWT_SECRET = "your_super_secret_jwt_key_here_development_only_change_in_production"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "humhub_clone"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "Macbayprince05"
$env:CLIENT_URL = "http://localhost:3001"
$env:NODE_ENV = "development"
$env:PORT = "5000"

Write-Host "Environment variables set!" -ForegroundColor Yellow
Write-Host "JWT_SECRET: Set" -ForegroundColor Cyan
Write-Host "Database: PostgreSQL ($env:DB_HOST:$env:DB_PORT/$env:DB_NAME)" -ForegroundColor Cyan
Write-Host "Client URL: $env:CLIENT_URL" -ForegroundColor Cyan

Write-Host "`nStarting server..." -ForegroundColor Green
npm start
