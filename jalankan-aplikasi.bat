@echo off
title Ticketing Trans Hamana - Server
cd /d "%~dp0"
echo ========================================================
echo   Ticketing Trans Hamana - Sistem Manajemen Tiket Helpdesk
echo ========================================================
echo.
echo Membuka aplikasi di browser (http://localhost:3000)...
start http://localhost:3000
echo.
echo Menjalankan Next.js server... (Tekan Ctrl+C untuk berhenti)
echo.
call npm.cmd run dev
pause
