@echo off
title Lancement GEOPROExpert

echo ========================================
echo     Lancement de GEOPROExpert
echo ========================================
echo.

echo Lancement du Backend...
start "Backend GEOPROExpert" cmd /k "cd /d C:\Users\YUSEF\Desktop\Projet PFE Dev\Backend && node app.js"

timeout /t 4 >nul

echo Lancement du Frontend...
start "Frontend GEOPROExpert" cmd /k "cd /d C:\Users\YUSEF\Desktop\Projet PFE Dev\Frontend && npm run dev"

timeout /t 6 >nul

echo Ouverture de la plateforme...
start http://localhost:5173

echo.
echo GEOPROExpert est lance.
echo Ne ferme pas les fenetres Backend et Frontend.
pause