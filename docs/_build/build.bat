@echo off
cd /d "%~dp0"
echo [1/3] Instalando dependencias...
call npm install --silent
echo [2/3] Generando memoria completa (Cap 1 + Cap 2)...
node generate-all.js
echo [3/3] Listo!
echo.
echo El archivo se ha generado en: docs\memoria-MatchUp.docx
echo.
timeout /t 10
