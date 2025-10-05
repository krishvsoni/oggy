@echo off
echo Installing Oggy CLI globally...

:: Create Oggy directory in Program Files
if not exist "%ProgramFiles%\Oggy" mkdir "%ProgramFiles%\Oggy"

:: Download latest release
echo Downloading latest Oggy release...
powershell -Command "& {$response = Invoke-RestMethod -Uri 'https://api.github.com/repos/krishvsoni/oggy/releases/latest'; $downloadUrl = ($response.assets | Where-Object {$_.name -eq 'oggy.exe'}).browser_download_url; Invoke-WebRequest -Uri $downloadUrl -OutFile '%ProgramFiles%\Oggy\oggy.exe'}"

if not exist "%ProgramFiles%\Oggy\oggy.exe" (
    echo Failed to download oggy.exe
    echo Please download manually from: https://github.com/krishvsoni/oggy/releases/latest
    pause
    exit /b 1
)

:: Add to PATH (requires admin privileges)
setx PATH "%PATH%;%ProgramFiles%\Oggy" /M >nul 2>&1

if %errorlevel% equ 0 (
    echo Oggy installed successfully!
    echo You can now run 'oggy' from anywhere in your terminal.
    echo Please restart your terminal for changes to take effect.
) else (
    echo Installation completed but couldn't add to PATH automatically.
    echo Please add "%ProgramFiles%\Oggy" to your PATH manually.
    echo Or run the executable directly from: %ProgramFiles%\Oggy\oggy.exe
)

pause