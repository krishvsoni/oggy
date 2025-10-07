# Install-Oggy.ps1
# PowerShell installation script for Oggy CLI

$ErrorActionPreference = "Stop"

Write-Host "Installing Oggy CLI globally..." -ForegroundColor Green

try {
    Write-Host "Fetching latest release..." -ForegroundColor Yellow
    $latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/krishvsoni/oggy/releases/latest"
    $version = $latestRelease.tag_name
    $downloadUrl = "https://github.com/krishvsoni/oggy/releases/download/$version/oggy.exe"

    Write-Host "Downloading Oggy $version for Windows..." -ForegroundColor Yellow

    $tempPath = Join-Path $env:TEMP "oggy.exe"
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath

    $installPath = Join-Path $env:USERPROFILE ".local\bin"
    New-Item -ItemType Directory -Force -Path $installPath | Out-Null
    
    $finalPath = Join-Path $installPath "oggy.exe"
    Move-Item $tempPath $finalPath -Force

    Write-Host "Oggy installed to: $finalPath" -ForegroundColor Green

    $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($userPath -notlike "*$installPath*") {
        [Environment]::SetEnvironmentVariable("PATH", "$userPath;$installPath", "User")
        Write-Host "Added $installPath to your PATH" -ForegroundColor Green
        Write-Host "Please restart your terminal to use 'oggy' command" -ForegroundColor Yellow
    } else {
        Write-Host "Path already configured" -ForegroundColor Green
    }

    Write-Host "`nOggy installed successfully!" -ForegroundColor Green
    Write-Host "You can now run 'oggy' from anywhere in your terminal." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Get your Groq API key from: https://console.groq.com" -ForegroundColor Gray
    Write-Host "2. Run: oggy setup" -ForegroundColor Gray
    Write-Host "3. Or set GROQ_API_KEY environment variable" -ForegroundColor Gray
    Write-Host "4. Test with: oggy analyze" -ForegroundColor Gray

} catch {
    Write-Host "Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nAs an alternative, you can:" -ForegroundColor Yellow
    Write-Host "1. Download oggy.exe manually from: https://github.com/krishvsoni/oggy/releases/latest" -ForegroundColor Gray
    Write-Host "2. Place it in a folder like C:\Tools\Oggy\" -ForegroundColor Gray
    Write-Host "3. Add that folder to your PATH environment variable" -ForegroundColor Gray
    exit 1
}