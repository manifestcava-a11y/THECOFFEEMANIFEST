# Comprehensive push script with detailed output
$ErrorActionPreference = 'Continue'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUSHING TO MAIN BRANCH" -ForegroundColor Cyan
Write-Host "  Repository: manifestcava-a11y/FINAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify remote
Write-Host "[1/8] Checking remote configuration..." -ForegroundColor Yellow
$remoteUrl = git config --get remote.origin.url
Write-Host "  Remote URL: $remoteUrl" -ForegroundColor White
if ($remoteUrl -ne "https://github.com/manifestcava-a11y/FINAL.git") {
    Write-Host "  ⚠️  Updating remote URL..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/manifestcava-a11y/FINAL.git
    Write-Host "  ✓ Remote updated" -ForegroundColor Green
} else {
    Write-Host "  ✓ Remote is correct" -ForegroundColor Green
}

# Step 2: Check current branch
Write-Host "`n[2/8] Checking current branch..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "  Current branch: $currentBranch" -ForegroundColor White

# Step 3: Stage all changes
Write-Host "`n[3/8] Staging all changes..." -ForegroundColor Yellow
git add -A
$unstaged = git status --porcelain
if ($unstaged) {
    Write-Host "  Files to commit:" -ForegroundColor White
    git status --short | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    
    # Step 4: Commit
    Write-Host "`n[4/8] Committing changes..." -ForegroundColor Yellow
    $commitMsg = "Push to main branch - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMsg
    Write-Host "  ✓ Changes committed" -ForegroundColor Green
} else {
    Write-Host "  ✓ No changes to commit" -ForegroundColor Green
}

# Step 5: Switch to main branch
Write-Host "`n[5/8] Switching to main branch..." -ForegroundColor Yellow
git checkout main 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Creating main branch from current..." -ForegroundColor Yellow
    git checkout -b main
}
Write-Host "  ✓ On main branch" -ForegroundColor Green

# Step 6: Update main with latest from 1.3
Write-Host "`n[6/8] Updating main branch with latest code..." -ForegroundColor Yellow
if ($currentBranch -ne "main") {
    git reset --hard $currentBranch
    Write-Host "  ✓ Main branch updated" -ForegroundColor Green
} else {
    Write-Host "  ✓ Already on main" -ForegroundColor Green
}

# Step 7: Verify we have commits
Write-Host "`n[7/8] Verifying commits..." -ForegroundColor Yellow
$commitCount = git rev-list --count HEAD
Write-Host "  Commit count: $commitCount" -ForegroundColor White
if ($commitCount -eq 0) {
    Write-Host "  ⚠️  WARNING: No commits found!" -ForegroundColor Red
    Write-Host "  Creating initial commit..." -ForegroundColor Yellow
    git add -A
    git commit -m "Initial commit"
}

# Step 8: Push to remote
Write-Host "`n[8/8] Pushing to remote main branch..." -ForegroundColor Yellow
Write-Host "  This may require authentication..." -ForegroundColor Gray
Write-Host ""

$pushOutput = git push origin main --force --set-upstream 2>&1
$pushExitCode = $LASTEXITCODE

Write-Host ""
if ($pushExitCode -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ PUSH SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository: https://github.com/manifestcava-a11y/FINAL" -ForegroundColor Cyan
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ PUSH FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $pushOutput -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Authentication required - you may need to:" -ForegroundColor White
    Write-Host "     - Set up a Personal Access Token" -ForegroundColor Gray
    Write-Host "     - Use: git credential-manager-core configure" -ForegroundColor Gray
    Write-Host "  2. Repository may not exist or you may not have push access" -ForegroundColor White
    Write-Host "  3. Check: git ls-remote origin main" -ForegroundColor Gray
}

Write-Host ""






