# Corrección: warning de Sanity y hydration mismatch

## 1. Sanity `structure-api-version-required-for-custom-filter`

Los dos `documentList()` personalizados de **Productos de Origen** tenían un `filter()` GROQ sin declarar la versión de API.

Se añadió `structureApiVersion` y `.apiVersion(structureApiVersion)` a:

- Productos
- Categorías

Esto elimina el warning de Sanity sin cambiar qué documentos se muestran.

## 2. `RESPONSIVE-VIEWER-ROOT`

Se buscó `RESPONSIVE-VIEWER-ROOT` en todo el proyecto y no existe ninguna referencia.

El error de hydration muestra que el navegador introduce un nodo con ese ID antes de que React hidrate la página. Eso es compatible con una extensión/herramienta de vista responsive que inyecta HTML en la página.

No se añadió `suppressHydrationWarning`, porque ocultaría el síntoma en lugar de solucionar la causa y podría esconder otros errores reales.

### Comprobación

1. Abrir la misma URL en una ventana de incógnito con extensiones desactivadas.
2. O desactivar temporalmente extensiones de responsive/design/devtools que modifiquen la página.
3. Recargar con Ctrl+F5.
4. Si desaparece el error, el proyecto no es el causante.

Si el error continúa en incógnito sin extensiones, guardar el nuevo stack trace; en ese caso sí habría que seguir investigando una causa interna distinta.
