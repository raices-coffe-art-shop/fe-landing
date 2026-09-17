@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo Raices - Aplicar contenido Francisco 17-09-2026 a Sanity
echo ============================================================
echo Este proceso modifica Productos de Origen y Galeria de Arte.
echo NO modifica Carta. Los registros anteriores se ocultan, no se borran.
echo.

echo [1/3] Auditoria estatica...
call npm run francisco:audit:static
if errorlevel 1 goto :error

echo.
echo [2/3] Dry-run de Sanity...
call npm run francisco:update:dry
if errorlevel 1 goto :error

echo.
set /p CONFIRM=Escribe APLICAR para ejecutar la migracion REAL: 
if /I not "%CONFIRM%"=="APLICAR" (
  echo Cancelado. No se hicieron cambios en Sanity.
  pause
  exit /b 0
)

echo.
echo Ejecutando migracion real...
call npm run francisco:update
if errorlevel 1 goto :error

echo.
echo [3/3] Verificando contenido activo...
call npm run francisco:verify
if errorlevel 1 goto :error

echo.
echo ============================================================
echo ACTUALIZACION Y VERIFICACION COMPLETADAS.
echo Ahora puedes desplegar el codigo y revisar visualmente el sitio.
echo ============================================================
pause
exit /b 0

:error
echo.
echo ============================================================
echo ERROR: el proceso se detuvo. Revisa el mensaje anterior.
echo ============================================================
pause
exit /b 1
