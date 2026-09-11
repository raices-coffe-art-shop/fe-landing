@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo Raices - Verificar Carta y Galeria despues de la migracion
echo ============================================================
echo.
echo Esta comprobacion contrasta los documentos nuevos con los
 echo documentos antiguos que alimentaban la Carta/PDF y Galeria.
echo No escribe ni borra datos.
echo.
call npm run content:split:verify
set RESULT=%ERRORLEVEL%
echo.
if "%RESULT%"=="0" (
  echo OK: la separacion y la paridad de datos pasaron la verificacion.
) else (
  echo ATENCION: se encontro una diferencia o contenido pendiente.
  echo Copia el resultado de esta ventana antes de continuar editando.
)
echo.
pause
exit /b %RESULT%
