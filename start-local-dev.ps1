# Local Development Startup Script
# This script helps you start both server and client for local development

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Local Development Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists in server folder
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠️  WARNING: server\.env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env.example as a template..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Copy server\.env.example to server\.env" -ForegroundColor Yellow
    Write-Host "2. Fill in your database credentials" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

# Check if node_modules exist
if (-not (Test-Path "server\node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
    Write-Host ""
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
    Write-Host "✅ Client dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🚀 Starting development servers..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Client will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start both servers using concurrently (if available) or separate windows
if (Get-Command npm -ErrorAction SilentlyContinue) {
    # Check if concurrently is installed
    $concurrentlyInstalled = Test-Path "server\node_modules\concurrently"
    
    if ($concurrentlyInstalled) {
        Write-Host "Starting both servers in one window..." -ForegroundColor Green
        Set-Location server
        npx concurrently "npm run dev" "cd ../client && npm run dev"
    } else {
        Write-Host "Opening separate windows for server and client..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Terminal 1 - Server:" -ForegroundColor Cyan
        Write-Host "  cd server" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "Terminal 2 - Client:" -ForegroundColor Cyan
        Write-Host "  cd client" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        
        # Start server in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev"
        
        # Wait a bit then start client
        Start-Sleep -Seconds 2
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm run dev"
    }
} else {
    Write-Host "❌ Error: npm not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

