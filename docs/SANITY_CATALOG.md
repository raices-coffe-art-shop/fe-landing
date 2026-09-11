# Carta, Productos de Origen y Galería de Arte en Sanity

Desde septiembre de 2026 los tres contenidos se administran por separado. Esta separación evita que una pieza de arte termine como producto o que un cambio del catálogo altere la Carta.

## 1. Carta

Tipos de Sanity:

- `menuCategory` — categorías de la Carta.
- `menuItem` — bebidas, alimentos y demás elementos de la Carta.

Rutas:

- `/carta` — vista pública.
- `/carta/imprimir` — impresión/PDF.
- `/carta/tv` — pantalla vertical del local.

Los elementos de Carta no tienen ficha `/carta/[slug]`.

Las categorías pueden conservar los textos de origen, ficha de procedencia y foto usados por la versión impresa y TV. Los elementos mantienen nombre, categoría, subcategoría, descripción corta, foto, precio, visibilidad y orden.

## 2. Productos de Origen

Tipos de Sanity:

- `catalogCategory`
- `catalogItem`

Rutas:

- `/productos-de-origen`
- `/productos-de-origen/[slug]`

Este apartado conserva la ficha amplia que el cliente ya conocía. La categoría histórica `arte` queda excluida de Productos de Origen y ya no puede seleccionarse para productos nuevos.

Los campos antiguos que pertenecían a Carta se conservan en los documentos históricos para no perder información, pero están ocultos y en solo lectura en este editor.

## 3. Galería de Arte

Tipos de Sanity:

- `artCategory`
- `artItem`

Rutas:

- `/galeria-de-arte`
- `/galeria-de-arte/[slug]`

Cada pieza puede tener nombre, categoría, subcategoría, textos, imágenes, procedencia, artista/artesano, disponibilidad, precio y orden. No debe crearse como `catalogItem`.

La introducción editorial de Lized forma parte de la página de Galería de Arte, pero las piezas reales se administran aquí.

## Migración desde el modelo anterior

El despliegue mantiene lectura de compatibilidad para no vaciar el sitio. Antes de editar por separado, ejecutar:

```bash
npm run content:split:dry
npm run content:split
```

El script copia el contenido a los tipos nuevos sin borrar ni modificar los documentos antiguos. No ejecutar los scripts históricos `carta:migrate` o `cartas:migrate` para la administración normal después de esta separación.

## TV

`/carta/tv` está pensada para pantalla vertical. El intervalo puede ajustarse con `?s=15` y los modos de entrada existentes siguen aceptando `?animation=...`.

Ejemplo:

```text
/carta/tv?s=14&animation=giro
```

El QR de TV apunta a `/carta`.

## Revalidación

El webhook debe incluir `menuCategory`, `menuItem`, `catalogCategory`, `catalogItem`, `artCategory`, `artItem`, `post` y `siteSettings`. Revisar `sanity/WEBHOOKS.md`.
