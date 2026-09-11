# Cambio de presencia de Lized — referencia de mantenimiento

## Estado actual de esta entrega

La versión activa es **CON Lized**. Se conserva expresamente porque el cliente ya vio esta variante.

Incluye:

- Lized en las fotografías vigentes donde corresponde.
- El relato de origen con Francisco Arica y Lized.
- La introducción de **Galería de Arte**: `La mirada de Lized también forma parte de la historia de Raíces.`
- Referencias editoriales a su obra y a su participación en la historia de Raíces.

## Importante después de la nueva arquitectura

Ya no existe una relación `Arte → Producto de Origen`. Si en el futuro se retira a Lized, **no se debe tocar Productos de Origen para esconder la Galería de Arte**.

Las secciones definitivas son:

- `/carta`
- `/productos-de-origen`
- `/galeria-de-arte`

Las piezas artísticas se administran como `artItem` desde **Galería de Arte** en Sanity.

## Imágenes conservadas

Las variantes maestras siguen en `public/media/lized-variants/`:

### Hero
- CON Lized: `/media/lized-variants/hero-con-lized.webp`
- SIN Lized: `/media/lized-variants/hero-sin-lized.webp`
- Ruta activa del sitio: `/hero-principal.webp`

### Personas — Pedro
- CON Lized: `/media/lized-variants/pedro-campo-con-lized.webp`
- SIN Lized: `/media/lized-variants/pedro-campo-sin-lized.webp`
- Ruta activa: `/media/people/pedro-03.webp`

### Personas — Dina
- CON Lized: `/media/lized-variants/dina-visita-con-lized.webp`
- SIN Lized: `/media/lized-variants/dina-visita-sin-lized.webp`
- Ruta activa: `/media/people/dina-02.webp`

No borrar `public/media/lized-variants/`.

## Archivos editoriales que contienen referencias a Lized

Si el cliente vuelve a cambiar de opinión, revisar como mínimo:

- `app/page.tsx`
- `app/galeria-de-arte/page.tsx`
- `data/art.ts`
- `data/social.ts`
- `data/heroImages.ts`
- `data/peopleMedia.ts`
- `messages/qu.json`
- las piezas `artItem` relacionadas con Lized dentro de Sanity

También revisar historias ya publicadas en Sanity que puedan mencionarla.

## Nota sobre comandos antiguos

Versiones anteriores del proyecto documentaban comandos `npm run lized:con` y `npm run lized:sin`. **No están definidos en el `package.json` de esta entrega**, por lo que no deben usarse ni asumirse como disponibles. Esta nota evita aplicar un script antiguo que pudiera restaurar rutas `/arte` o volver a mezclar arte con el catálogo previo.
