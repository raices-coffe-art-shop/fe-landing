@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo RAICES - MIGRAR CARTA CON TU PROPIA SESION DE SANITY
echo ============================================================
echo.
echo Proyecto: otz8srw5
echo Dataset : production
echo.
echo Este metodo usa tu sesion de Sanity CLI.
echo NO crea productos a mano y NO borra los documentos antiguos.
echo.

if not exist "sanity.cli.ts" (
  echo ERROR: falta sanity.cli.ts en la raiz del proyecto.
  goto :error
)

echo [1/5] Comprobando sesion de Sanity...
call npx sanity api users/me >nul 2>&1
if not errorlevel 1 goto :dryrun

echo No hay sesion CLI valida. Se abrira el login oficial.
call npx sanity login --provider google
if errorlevel 1 goto :error

:dryrun
echo.
echo [2/5] Simulando migracion de Carta...
call npx sanity exec scripts/migrate-menu-user-token.mjs --with-user-token -- --dry-run
if errorlevel 1 goto :error

echo.
echo [3/5] REVISA LA LISTA DE ARRIBA.
echo Deben aparecer las categorias y elementos que forman la Carta actual.
echo.
choice /M "La lista coincide con la Carta y deseas crear los documentos nuevos"
if errorlevel 2 goto :cancel

echo.
echo [4/5] Escribiendo menuCategory y menuItem en Sanity...
call npx sanity exec scripts/migrate-menu-user-token.mjs --with-user-token
if errorlevel 1 goto :error

echo.
echo [5/5] Migracion terminada.
echo Arriba deben aparecer cantidades mayores a cero y 0 referencias rotas.
echo Abre /studio ^> Carta y presiona Ctrl+F5.
echo.
pause
exit /b 0

:cancel
echo.
echo Cancelado. No se modificaron datos.
pause
exit /b 0

:error
echo.
echo ERROR: la migracion no se completo.
echo NO crees los productos a mano ni borres los documentos anteriores.
echo Copia TODA la salida de esta ventana y enviala para revisarla.
pause
exit /b 1
