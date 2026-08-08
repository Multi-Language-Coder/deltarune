@echo off
REM ============================================================
REM  DELTARUNE web port - OFFLINE launcher (no internet needed)
REM  Serves this folder on a local server and opens the menu.
REM  Requires Python (python.org). Close this window to stop.
REM ============================================================
setlocal
cd /d "%~dp0"
set PORT=8080

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found on PATH.
  echo Install Python from https://www.python.org/downloads/ ^(tick "Add to PATH"^),
  echo or serve this folder with any static web server, then open:
  echo     http://127.0.0.1:%PORT%/index.html
  echo.
  pause
  exit /b 1
)

echo Starting offline server on http://127.0.0.1:%PORT%/ ...
start "DELTARUNE offline server" cmd /c "python -m http.server %PORT%"
REM give the server a moment, then open the menu in the default browser
timeout /t 2 >nul
start "" "http://127.0.0.1:%PORT%/index.html"
echo.
echo The game is now running at http://127.0.0.1:%PORT%/
echo Close the "DELTARUNE offline server" window to stop.
endlocal
