$ErrorActionPreference = 'Continue'
Write-Host "Creating and pushing branch 1.4" -ForegroundColor Cyan

# Create and checkout branch
git checkout -b 1.4 2>&1
if ($LASTEXITCODE -ne 0) {
    git checkout 1.4 2>&1
}

# Push to both remotes
Write-Host "`nPushing to origin..." -ForegroundColor Yellow
git push -u origin 1.4 2>&1

Write-Host "`nPushing to georgelna..." -ForegroundColor Yellow  
git push -u georgelna 1.4 2>&1

Write-Host "`nDone! Check the output above for any errors." -ForegroundColor Green






