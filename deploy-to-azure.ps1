# Upload Poker Form to Azure Storage
# Quick deployment for testing on mobile

param(
    [Parameter(Mandatory=$true)]
    [string]$StorageAccountName,
    
    [Parameter(Mandatory=$false)]
    [string]$ContainerName = "poker-forms"
)

Write-Host "?? Deploying Poker Game Recorder to Azure..." -ForegroundColor Cyan

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "? Azure CLI not found. Please install: https://aka.ms/installazurecli" -ForegroundColor Red
    exit 1
}

# Login check
Write-Host "Checking Azure login..." -ForegroundColor Yellow
az account show > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Azure..." -ForegroundColor Yellow
    az login
}

# Create container if not exists
Write-Host "Creating/checking container: $ContainerName" -ForegroundColor Yellow
az storage container create `
    --name $ContainerName `
    --account-name $StorageAccountName `
    --public-access blob `
    --auth-mode login

if ($LASTEXITCODE -ne 0) {
    Write-Host "? Failed to create container. Check storage account name and permissions." -ForegroundColor Red
    exit 1
}

# Upload the file
Write-Host "Uploading easy-game-recorder.html..." -ForegroundColor Yellow
az storage blob upload `
    --account-name $StorageAccountName `
    --container-name $ContainerName `
    --name "easy-game-recorder.html" `
    --file "web/easy-game-recorder.html" `
    --content-type "text/html; charset=utf-8" `
    --auth-mode login `
    --overwrite

if ($LASTEXITCODE -eq 0) {
    $url = "https://$StorageAccountName.blob.core.windows.net/$ContainerName/easy-game-recorder.html"
    
    Write-Host "`n? SUCCESS! Your poker form is now online!" -ForegroundColor Green
    Write-Host "`n?? URL for iPhone:" -ForegroundColor Cyan
    Write-Host $url -ForegroundColor Yellow
    Write-Host "`n?? Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open this URL on your iPhone" -ForegroundColor White
    Write-Host "2. Add to home screen (Safari: Share ? Add to Home Screen)" -ForegroundColor White
    Write-Host "3. Use it like a native app!" -ForegroundColor White
    
    # Try to open in browser
    Write-Host "`nOpening in browser..." -ForegroundColor Yellow
    Start-Process $url
    
    # Copy URL to clipboard
    Set-Clipboard -Value $url
    Write-Host "? URL copied to clipboard!" -ForegroundColor Green
} else {
    Write-Host "? Upload failed. Check permissions." -ForegroundColor Red
    exit 1
}
