@echo off
echo Installing Oggy CLI globally...

:: Create Oggy directory in Program Files
if not exist "%ProgramFiles%\Oggy" mkdir "%ProgramFiles%\Oggy"

:: Copy executable
copy "oggy.exe" "%ProgramFiles%\Oggy\oggy.exe" >nul

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