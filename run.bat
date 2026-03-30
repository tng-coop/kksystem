@echo off
setlocal EnableDelayedExpansion

:: Change to the directory of the batch script
cd /d "%~dp0"

echo ==========================================
echo Starting kksystem...
echo ==========================================

:: Check if node is installed
node -v >nul 2>&1
if !errorlevel! neq 0 (
    echo [INFO] Node.js is not installed or not in PATH.
    echo [INFO] Attempting to install Node.js via winget...
    winget install --id OpenJS.NodeJS -e --source winget --accept-package-agreements --accept-source-agreements
    
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install Node.js automatically.
        echo Please download and install Node.js manually from: https://nodejs.org/
        pause
        exit /b 1
    )
    
    echo [SUCCESS] Node.js has been installed successfully.
    echo [IMPORTANT] Please close this command window and double-click run.bat again to reload the PATH configurations.
    pause
    exit /b 0
)

echo [INFO] Node.js is installed.

:: Check for node_modules
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing npm dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Dependencies found.
)

echo.
echo [INFO] Starting the kksystem server...
echo [INFO] A browser window should open automatically if everything completes.
echo.

call npm start

pause
