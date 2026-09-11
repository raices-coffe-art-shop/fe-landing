@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo Raices - Migrar SOLO Galeria de Arte en Sanity
echo ============================================================
echo.
echo 1/3 - Vista previa. NO escribe nada.
call npm run art:split:dry
if errorlevel 1 goto :error

echo.
choice /M "La lista anterior corresponde a las piezas de Galeria de Arte. Aplicar migracion"
if errorlevel 2 goto :cancel

echo.
echo 2/3 - Migrando piezas sin borrar los documentos antiguos...
call npm run art:split
if errorlevel 1 goto :error

echo.
echo 3/3 - Verificando que ya no queden pendientes...
call npm run art:split:verify
if errorlevel 1 goto :verifywarn

echo.
echo OK. Cierra y vuelve a abrir Studio o refresca con Ctrl+F5.
pause
exit /b 0

:verifywarn
echo.
echo La escritura termino, pero la verificacion encontro pendientes.
echo Copia toda esta salida y enviala para revisarla.
pause
exit /b 1

:cancel
echo.
echo Cancelado. No se modifico Sanity.
pause
exit /b 0

:error
echo.
echo Ocurrio un error. Copia toda esta salida antes de cerrar la ventana.
pause
exit /b 1
