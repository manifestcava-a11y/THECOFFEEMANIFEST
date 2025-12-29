# Run this script to push to main - it will show you all output
Write-Host "Starting push process..." -ForegroundColor Green

# 1. Make sure we're on 1.3 and have latest
git checkout 1.3
git add -A
git status --short
git commit -m "Push to main - $(Get-Date)" -a || Write-Host "Nothing to commit" -ForegroundColor Yellow

# 2. Update main branch
Write-Host "`nUpdating main branch..." -ForegroundColor Yellow
git checkout main
git reset --hard 1.3

# 3. Show what we're about to push
Write-Host "`nCommits to push:" -ForegroundColor Yellow
git log --oneline -5

# 4. Push with verbose output
Write-Host "`nPushing to remote..." -ForegroundColor Yellow
Write-Host "Remote: $(git remote get-url origin)" -ForegroundColor Cyan
Write-Host ""

git push origin main --force --verbose

Write-Host "`nExit code: $LASTEXITCODE" -ForegroundColor $(if ($LASTEXITCODE -eq 0) { "Green" } else { "Red" })

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ PUSH FAILED!" -ForegroundColor Red
    Write-Host "`nPossible reasons:" -ForegroundColor Yellow
    Write-Host "1. Authentication required - you need a GitHub Personal Access Token" -ForegroundColor White
    Write-Host "2. Repository doesn't exist or you don't have push access" -ForegroundColor White
    Write-Host "3. Network connectivity issue" -ForegroundColor White
    Write-Host "`nTry running: git push origin main --force" -ForegroundColor Cyan
} else {
    Write-Host "`n✅ PUSH SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Check: https://github.com/manifestcava-a11y/FINAL" -ForegroundColor Cyan
}






