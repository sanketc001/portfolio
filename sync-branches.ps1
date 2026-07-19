param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

$ErrorActionPreference = "Stop"

Write-Host "=== Starting Multi-Branch Sync ===" -ForegroundColor Cyan

# 1. Ensure we are on main
Write-Host "Checking out main branch..." -ForegroundColor Yellow
git checkout main

# Check if there are local modifications to commit
$status = git status --porcelain
if ($null -eq $status -or $status.Trim() -eq "") {
    Write-Host "No changes detected. Skipping commit. Proceeding with branch synchronization..." -ForegroundColor Gray
} else {
    Write-Host "Staging changes..." -ForegroundColor Yellow
    git add -A

    Write-Host "Committing changes with message: '$CommitMessage'..." -ForegroundColor Yellow
    git commit -m $CommitMessage

    Write-Host "Pushing main to origin..." -ForegroundColor Yellow
    git push origin main
}

# 2. Sync master
Write-Host "Syncing master branch..." -ForegroundColor Yellow
git checkout master
git merge main
Write-Host "Pushing master to origin..." -ForegroundColor Yellow
git push origin master

# 3. Sync windows-ui-emulation
Write-Host "Syncing windows-ui-emulation branch..." -ForegroundColor Yellow
git checkout windows-ui-emulation
git merge main
Write-Host "Pushing windows-ui-emulation to origin..." -ForegroundColor Yellow
git push origin windows-ui-emulation

# 4. Switch back to main
Write-Host "Returning to main branch..." -ForegroundColor Yellow
git checkout main

Write-Host "=== Sync Completed Successfully ===" -ForegroundColor Green
