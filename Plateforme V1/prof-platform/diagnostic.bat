@echo off
REM Script de diagnostic pour identifier les problemes
REM Double-cliquez sur ce fichier pour executer le diagnostic

setlocal enabledelayedexpansion
color 0E
cls

echo.
echo ============================================================
echo    DIAGNOSTIC DU PROJET prof-platform
echo ============================================================
echo.

REM Se positionner dans le repertoire du script
cd /d "%~dp0"

echo Repertoire courant: %CD%
echo.

REM Verifier Python
echo [1/5] Verification de Python...
python --version > nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installe ou non dans le PATH
    echo Solution: Installez Python depuis https://www.python.org/
    goto :error
) else (
    for /f "tokens=*" %%i in ('python --version') do echo ✓ %%i
)

echo.

REM Verifier Node.js
echo [2/5] Verification de Node.js...
node --version > nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe ou non dans le PATH
    echo Solution: Installez Node.js depuis https://nodejs.org/
    goto :error
) else (
    for /f "tokens=*" %%i in ('node --version') do (
        echo ✓ Node.js %%i
    )
    for /f "tokens=*" %%i in ('npm --version') do (
        echo ✓ npm %%i
    )
)

echo.

REM Verifier la structure du projet
echo [3/5] Verification de la structure du projet...
if not exist "backend" (
    echo [ERREUR] Dossier backend non trouve
    goto :error
) else (
    echo ✓ Dossier backend trouve
)

if not exist "frontend" (
    echo [ERREUR] Dossier frontend non trouve
    goto :error
) else (
    echo ✓ Dossier frontend trouve
)

if not exist "backend\app.py" (
    echo [ERREUR] Fichier backend\app.py non trouve
    goto :error
) else (
    echo ✓ Fichier backend\app.py trouve
)

if not exist "frontend\package.json" (
    echo [ERREUR] Fichier frontend\package.json non trouve
    goto :error
) else (
    echo ✓ Fichier frontend\package.json trouve
)

echo.

REM Verifier la base de donnees MySQL
echo [4/5] Verification de MySQL...
mysql --version > nul 2>&1
if errorlevel 1 (
    echo ! MySQL n'est pas dans le PATH (mais pas critique pour le demarrage)
    echo  Vous devrez configurer .env avec vos identifiants MySQL
) else (
    for /f "tokens=*" %%i in ('mysql --version') do echo ✓ %%i
)

echo.

REM Verifier les fichiers de configuration
echo [5/5] Verification des fichiers de configuration...
if not exist "backend\.env.example" (
    echo [WARNING] backend\.env.example non trouve
) else (
    echo ✓ backend\.env.example trouve
)

if not exist "backend\.env" (
    echo ! backend\.env non trouve (creation en cours...)
    copy "backend\.env.example" "backend\.env" > nul 2>&1
    echo ✓ backend\.env cree a partir du modele
    echo   NOTE: Modifiez-le avec vos identifiants MySQL
) else (
    echo ✓ backend\.env existe
)

echo.
echo ============================================================
echo    DIAGNOSTIC TERMINE - OK
echo ============================================================
echo.
echo Prochaines etapes:
echo.
echo 1. Configurez backend\.env avec vos identifiants MySQL
echo    DB_HOST=localhost
echo    DB_USER=root
echo    DB_PASSWORD=votre_mot_de_passe
echo.
echo 2. Demarrez l'application:
echo    Double-cliquez sur start.bat
echo.
echo 3. Ouvrez http://localhost:5173 dans votre navigateur
echo.
echo ============================================================
echo.
pause
goto :eof

:error
echo.
echo ============================================================
echo    [ERREUR] Diagnostic echoue
echo ============================================================
echo.
pause
exit /b 1
