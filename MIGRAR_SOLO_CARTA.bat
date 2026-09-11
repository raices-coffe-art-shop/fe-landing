@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo Raices - Migrar SOLO Carta a su apartado propio de Sanity
echo ============================================================
echo.
echo 1/3 - Vista previa. NO modifica datos.
call npm run menu:split:dry
if errorlevel 1 goto :error

echo.
choice /M "La lista coincide con la Carta actual. Deseas migrarla ahora"
if errorlevel 2 goto :cancel

echo.
echo 2/3 - Copiando categorias y elementos a Carta...
call npm run menu:split
if errorlevel 1 goto :error

echo.
echo 3/3 - Verificando separacion...
call npm run content:split:verify
if errorlevel 1 goto :verifywarn

echo.
echo OK. La Carta ya debe aparecer en Sanity Studio.
echo Abre /studio, entra a Carta y presiona Ctrl+F5.
pause
exit /b 0

:verifywarn
echo.
echo La Carta se copio, pero la verificacion encontro alguna diferencia.
echo Copia la salida de esta ventana antes de seguir editando.
pause
exit /b 1

:cancel
echo.
echo Cancelado. No se modifico Sanity.
pause
exit /b 0

:error
echo.
echo Ocurrio un error. No se modifico nada adicional.
pause
exit /b 1
