# Push to main branch script
Write-Host "=== Starting Push Process ===" -ForegroundColor Green

Write-Host "`n1. Checking git status..." -ForegroundColor Yellow
git status

Write-Host "`n2. Current branch:" -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Branch: $currentBranch" -ForegroundColor Cyan

Write-Host "`n3. Remote configuration:" -ForegroundColor Yellow
git remote -v

Write-Host "`n4. Staging all changes..." -ForegroundColor Yellow
git add -A
$status = git status --porcelain
if ($status) {
    Write-Host "Changes to commit:" -ForegroundColor Yellow
    git status --short
    Write-Host "`n5. Committing changes..." -ForegroundColor Yellow
    git commit -m "Push to main branch - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} else {
    Write-Host "No changes to commit" -ForegroundColor Green
}

Write-Host "`n6. Checking commit history..." -ForegroundColor Yellow
git log --oneline -5

Write-Host "`n7. Pushing to main branch..." -ForegroundColor Yellow
$pushOutput = git push origin HEAD:main --force 2>&1
Write-Host $pushOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== Push Successful! ===" -ForegroundColor Green
} else {
    Write-Host "`n=== Push Failed! ===" -ForegroundColor Red
    Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host "`n8. Verifying remote..." -ForegroundColor Yellow
git ls-remote origin main






