# Vercel Deployment Setup Script
# Run this script to prepare your project for Vercel deployment

Write-Host "🚀 Setting up Vercel deployment..." -ForegroundColor Green

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
} else {
    Write-Host "✅ Vercel CLI is already installed" -ForegroundColor Green
}

# Check if user is logged in to Vercel
Write-Host "🔐 Checking Vercel login status..." -ForegroundColor Yellow
$loginStatus = vercel whoami 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Logged in as: $loginStatus" -ForegroundColor Green
} else {
    Write-Host "❌ Not logged in to Vercel. Please run: vercel login" -ForegroundColor Red
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Create .vercelignore file
Write-Host "📝 Creating .vercelignore file..." -ForegroundColor Yellow
@"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Git
.git/
.gitignore

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Documentation
*.md
!README.md

# Test files
test/
tests/
__tests__/
*.test.js
*.spec.js

# Error logs
error_log/
"@ | Out-File -FilePath ".vercelignore" -Encoding UTF8

Write-Host "✅ .vercelignore file created" -ForegroundColor Green

# Check if project is already linked to Vercel
Write-Host "🔗 Checking Vercel project link..." -ForegroundColor Yellow
if (Test-Path ".vercel") {
    Write-Host "✅ Project is already linked to Vercel" -ForegroundColor Green
} else {
    Write-Host "🔗 Linking project to Vercel..." -ForegroundColor Yellow
    Write-Host "   Please follow the prompts to link your project." -ForegroundColor Cyan
    vercel link
}

Write-Host "🎉 Vercel setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up your database (Vercel Postgres, Supabase, or Railway)" -ForegroundColor White
Write-Host "2. Deploy backend: vercel --prod" -ForegroundColor White
Write-Host "3. Deploy frontend: cd client && vercel --prod" -ForegroundColor White
Write-Host "4. Set environment variables in Vercel dashboard" -ForegroundColor White
Write-Host ""
Write-Host "📚 Read VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Yellow
