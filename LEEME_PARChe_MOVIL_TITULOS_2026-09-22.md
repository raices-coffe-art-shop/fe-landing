# Raíces · Ajuste visual de Productos de Origen y Galería de Arte

## Qué se corrigió

- Las tablas de la lista de Productos de Origen cambian a fichas legibles en pantallas pequeñas (producto, presentación y precio). En escritorio se conserva la tabla habitual.
- Se retiraron frases de coordinación interna de títulos y subtítulos visibles en las páginas de Productos de Origen y Galería de Arte, incluidos los avisos de búsqueda sin resultados.
- Se sustituyeron exclusivamente cinco textos antiguos de la primera carga de Productos de Origen que aludían a Francisco o a documentos/precios pendientes. El precio sin confirmar sigue apareciendo como «Consultar»; NO se inventaron importes.
- La Galería muestra categoría y procedencia en líneas separadas cuando se seleccionan dos piezas por fila en móvil.

## Instalación (sin volver a migrar los productos)

Opción A, ZIP del parche: descomprimir sobre la raíz de tu proyecto Raíces, aceptando reemplazar archivos con la misma ruta. Respaldar previamente el proyecto y conservar tu `.env.local`.

Opción B, ZIP del proyecto completo: extraer en una carpeta nueva y conservar tu `.env.local` local sin compartirlo. Instalar dependencias en tu PC si fuese necesario, verificar el build y desplegar la nueva versión.

**No ejecutes `APLICAR_ENTREGA_FRANCISCO.bat` ni la migración de Sanity para este ajuste visual.** Los productos y las piezas ya cargados permanecen igual. La web limpia las notas internas heredadas al mostrarlas, mientras que el archivo de carga inicial también queda corregido si lo usas en un entorno nuevo.

Los textos previos pueden seguir figurando en los campos de Sanity Studio hasta que los edites allí. Esta entrega no modifica directamente los documentos existentes de Sanity, solo su representación pública y los archivos de carga.

## Validación

La prueba de diseño en un navegador sin conectarse a Sanity mostró cero desplazamiento horizontal con ejemplos de la tabla a 320, 375, 390, 430, 760, 768, 820, 821 y 1024 px. Prueba de sintaxis de TSX/TS y auditoría estática correctas. No pudo realizarse el `npm run build` en este entorno por falta de dependencias en caché para instalación offline; hazlo en tu proyecto local antes del despliegue.

## Documento PDF para Francisco

El PDF breve de entrega se prepara después de recibir las últimas capturas definitivas de las categorías restantes de Productos de Origen y el Retablo, preferiblemente tras desplegar el parche y comprobar las vistas móviles.
