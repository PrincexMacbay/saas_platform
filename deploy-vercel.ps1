# Quick Vercel Deployment Script
# This script deploys both frontend and backend to Vercel

Write-Host "🚀 Starting Vercel deployment..." -ForegroundColor Green

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
$loginStatus = vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel. Please run: vercel login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in as: $loginStatus" -ForegroundColor Green

# Deploy backend
Write-Host "🔧 Deploying backend..." -ForegroundColor Yellow
Set-Location server
vercel --prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Deploy frontend
Write-Host "🎨 Deploying frontend..." -ForegroundColor Yellow
Set-Location client
vercel --prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Don't forget to:" -ForegroundColor Cyan
Write-Host "1. Set up your database" -ForegroundColor White
Write-Host "2. Configure environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "3. Test your deployed application" -ForegroundColor White
