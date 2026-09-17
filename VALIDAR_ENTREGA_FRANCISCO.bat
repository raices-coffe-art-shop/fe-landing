@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo Raices - Validacion entrega Francisco 17-09-2026
echo ============================================================

echo.
echo [1/5] Instalando dependencias exactas...
call npm ci
if errorlevel 1 goto :error

echo.
echo [2/5] Auditoria estatica de alcance...
call npm run francisco:audit:static
if errorlevel 1 goto :error

echo.
echo [3/5] TypeScript...
call npm run typecheck
if errorlevel 1 goto :error

echo.
echo [4/5] Build de produccion...
call npm run build
if errorlevel 1 goto :error

echo.
echo [5/5] Dry-run de la actualizacion de Sanity...
call npm run francisco:update:dry
if errorlevel 1 goto :error

echo.
echo ============================================================
echo VALIDACION COMPLETA OK.
echo No se ha modificado Sanity: el ultimo paso fue solo dry-run.
echo ============================================================
pause
exit /b 0

:error
echo.
echo ============================================================
echo ERROR: la validacion se detuvo en el paso anterior.
echo No ejecutes la migracion real hasta resolverlo.
echo ============================================================
pause
exit /b 1
