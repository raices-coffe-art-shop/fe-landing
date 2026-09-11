# Auditoría de campos de Sanity

## Estructura vigente

La administración se separó en tres dominios:

- **Carta:** `menuCategory` y `menuItem`.
- **Productos de Origen:** `catalogCategory` y `catalogItem`.
- **Galería de Arte:** `artCategory` y `artItem`.

## Productos de Origen

Se conservaron los campos de producto que el cliente ya conocía para no alterar su flujo editorial. La antigua categoría `arte` se excluye del apartado.

Los campos de `catalogCategory` que antes alimentaban Carta (`tagline`, historia, sourcing, ficha, imagen de Carta y `showInPrintedMenu`) se mantienen almacenados por compatibilidad/migración, pero están ocultos y en solo lectura en Productos de Origen. No se eliminan datos históricos.

## Carta

Tiene sus propios campos y consultas. Cambiar un `menuItem` ya no modifica un Producto de Origen. Las categorías conservan únicamente la información que la Carta impresa/TV realmente usa.

## Galería de Arte

Se creó una ficha deliberadamente simple: contenido, imágenes, procedencia/autor, disponibilidad/precio y publicación. No se añadieron campos de SEO o proceso separados que no fueran necesarios para la vista actual.

## Resultado

Cada input editable restante tiene un uso concreto en su sección pública o en una herramienta vinculada (Carta, impresión, TV, ficha, filtro, precio, WhatsApp, accesibilidad o publicación).
