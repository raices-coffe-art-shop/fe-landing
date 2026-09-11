@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo Raices - Separar Carta y Galeria de Arte en Sanity

echo 1/3 - Vista previa (NO escribe nada)...
call npm run content:split:dry
if errorlevel 1 goto :error

echo.
choice /M "La vista previa se ve correcta. Deseas aplicar la migracion real"
if errorlevel 2 goto :cancel

echo.
echo 2/3 - Aplicando migracion sin borrar documentos originales...
call npm run content:split
if errorlevel 1 goto :error

echo.
echo Refuerzo de Galeria - detectando tambien referencias/drafts que el split historico pudo no resolver...
call npm run art:split
if errorlevel 1 goto :error

echo.
echo 3/3 - Verificando referencias y pendientes...
call npm run content:split:verify
if errorlevel 1 goto :verifywarn

echo.
echo Migracion terminada correctamente.
pause
exit /b 0

:verifywarn
echo.
echo La migracion termino, pero la verificacion encontro algo pendiente.
echo Revisa el resultado anterior antes de editar contenido.
pause
exit /b 1

:cancel
echo.
echo Cancelado. No se modifico Sanity.
pause
exit /b 0

:error
echo.
echo Ocurrio un error. No continues hasta revisar el mensaje anterior.
pause
exit /b 1
