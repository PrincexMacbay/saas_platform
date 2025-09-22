# Clean up conflicting database environment variables
Write-Host "🧹 Cleaning up conflicting database environment variables..." -ForegroundColor Yellow

$variablesToRemove = @(
    "DATABASE_POSTGRES_URL",
    "DATABASE_POSTGRES_PRISMA_URL", 
    "DATABASE_DATABASE_URL_UNPOOLED",
    "DATABASE_POSTGRES_URL_NON_POOLING",
    "DATABASE_PGHOST",
    "DATABASE_POSTGRES_USER",
    "DATABASE_DATABASE_URL",
    "DATABASE_POSTGRES_PASSWORD",
    "DATABASE_POSTGRES_DATABASE",
    "DATABASE_PGPASSWORD",
    "DATABASE_PGDATABASE",
    "DATABASE_PGHOST_UNPOOLED",
    "DATABASE_PGUSER",
    "DATABASE_POSTGRES_URL_NO_SSL",
    "DATABASE_POSTGRES_HOST"
)

foreach ($var in $variablesToRemove) {
    Write-Host "Removing $var..." -ForegroundColor Cyan
    vercel env rm $var --yes
}

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "Now you can add your Supabase DATABASE_URL" -ForegroundColor Yellow
