# Catálogo administrado con Sanity

## Qué se administra desde `/studio`

- Configuración del sitio: logo, texto alternativo y redes sociales.
- Catálogo > Categorías: nombre, slug, descripción, orden y visibilidad.
- Catálogo > Productos: contenido, imágenes, procedencia, estado, destacado y orden.

El catálogo público ya no usa `localStorage`, el editor demo ni el array de productos de `data/site.ts`.

## Migración inicial

El repositorio incluye un seed determinista con los productos que antes estaban hardcodeados.

1. Crea un token de escritura temporal en Sanity Manage.
2. Añádelo solo a `.env.local`:

```env
SANITY_API_WRITE_TOKEN=...
```

3. Revisa primero el dry run:

```bash
npm run catalog:migrate:dry
```

4. Ejecuta la migración:

```bash
npm run catalog:migrate
```

5. Revisa en `/studio` cada imagen, especialmente el producto Miel, y reemplaza cualquier fotografía de referencia por la fotografía final aprobada.
6. Elimina `SANITY_API_WRITE_TOKEN` de `.env.local` y revoca el token temporal.

La migración usa IDs deterministas (`catalogCategory.<slug>` y `catalogItem.<slug>`), por lo que repetirla no crea duplicados. Las imágenes existentes no se vuelven a subir si el producto ya tiene una imagen principal.

## Webhook

Actualiza el webhook existente con el filtro y proyección documentados en `sanity/WEBHOOKS.md`. Debe responder a:

- `siteSettings`
- `catalogCategory`
- `catalogItem`

Publicar un cambio debe devolver `200` y actualizar la portada, `/catalogo` y la ficha correspondiente sin redeploy.

## Verificación mínima

- Cambiar el logo actualiza navbar, footer y `/links`.
- Ocultar o reordenar una red actualiza footer y `/links`.
- Marcar un producto como destacado controla la portada.
- Desactivar un producto lo retira de todas las vistas públicas.
- Cambiar un slug invalida la ficha anterior y activa la nueva.
- `Consultar` utiliza el WhatsApp configurado en `siteSettings`.
