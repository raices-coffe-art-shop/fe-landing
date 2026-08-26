# Catálogo administrado con Sanity

## Qué se administra desde `/studio`

- Configuración del sitio: logo, texto alternativo y redes sociales.
- Catálogo > Categorías: nombre, slug, descripción, fotografía, orden, visibilidad y si la categoría entra en la carta del café.
- Catálogo > Productos: contenido, imágenes, procedencia, estado, destacado y orden.
- Publicaciones: el blog editable por el cliente (ver ).

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

## Qué sale en la carta del café

La carta impresa (`/catalogo/imprimir`) y la pantalla del local (`/catalogo/tv`) muestran lo que se
consume en la mesa; el catálogo web muestra todo lo que Raíces vende. Cada categoría tiene el campo
**¿Mostrar en la carta del café?**: en **No**, la categoría desaparece de la carta y de la TV pero
sigue en `/catalogo`. Así está configurada Arte, que se vende en el local pero no forma parte de la carta.

El equipo puede cambiarlo desde el Studio en cualquier momento, sin tocar código.

## Carta de café y chocolatería (agosto 2026)

La carta que entregó el cliente se carga con un script aparte, que **no pisa** las ediciones hechas en
el Studio: crea lo que falta y actualiza solo los campos de la carta (título, precio, categoría, orden).

```bash
npm run carta:migrate:dry   # simula y valida, no escribe nada
npm run carta:migrate       # aplica los cambios
```

Las fotografías se leen del disco, fuera del repositorio. Por defecto busca en `~/Downloads/fotos-raices`;
se puede apuntar a otra carpeta con la variable `CARTA_PHOTOS_DIR`.

Qué hace: crea las 5 categorías de bebidas (Clásicos, Filtrados & Métodos, Con Leche, Opciones Frías y
Bebidas de Chocolate) con sus 17 productos, renombra “Café y cacao” como **Para llevar** conservando su
id (para no romper las referencias de sus productos), marca Arte como fuera de la carta y oculta el
producto genérico “Café preparado”, que queda reemplazado por el desglose real.

Solo 5 productos tienen fotografía propia (Espresso, Café Pasado, Cappuccino, Chiri Muxsa y Qoñi
Chocolate). El resto queda sin foto hasta que el cliente la suba desde el Studio: la imagen principal
ya no es obligatoria, así que el producto no aparece como incompleto.

## Webhook

Actualiza el webhook existente con el filtro y proyección documentados en `sanity/WEBHOOKS.md`. Debe responder a:

- `siteSettings`
- `catalogCategory`
- `catalogItem`
- `post`

Publicar un cambio debe devolver `200` y actualizar la portada, `/catalogo` y la ficha correspondiente sin redeploy.

## Verificación mínima

- Cambiar el logo actualiza navbar, footer y `/links`.
- Ocultar o reordenar una red actualiza footer y `/links`.
- Marcar un producto como destacado controla la portada.
- Desactivar un producto lo retira de todas las vistas públicas.
- Cambiar un slug invalida la ficha anterior y activa la nueva.
- `Consultar` utiliza el WhatsApp configurado en `siteSettings`.
