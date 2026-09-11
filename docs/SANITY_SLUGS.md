# Slugs en Sanity

La comprobación de unicidad se aplica a los documentos con slug de Productos de Origen, Galería de Arte y sus categorías.

## Qué debe pasar ahora

- Editar un producto ya publicado **no** debe marcar su propio slug como repetido.
- El borrador y la versión publicada del mismo documento cuentan como **un solo contenido**.
- Dos productos distintos no pueden compartir el mismo slug.
- Dos categorías distintas no pueden compartir el mismo slug.
- Un Producto de Origen y una pieza de Galería de Arte pueden tener el mismo slug porque viven en tipos y rutas distintas (`/productos-de-origen/...` y `/galeria-de-arte/...`).
- Las categorías de Carta y Galería usan slug como identificador interno/filtro; no crean una página pública propia.
- Si un documento se elimina realmente del dataset, su slug queda libre para volver a utilizarse.

La comprobación usa `perspective: raw` para detectar también borradores de otros documentos, pero excluye todas las versiones del documento que se está editando mediante `sanity::versionOf()`.

## Auditoría de datos existentes

Con el `.env.local` habitual del proyecto puedes ejecutar:

```bash
npm run sanity:audit-slugs
```

El comando **no modifica nada**. Solo informa de duplicados reales y distingue correctamente entre un borrador y su propia versión publicada.

También avisa si encuentra slugs con `/` o espacios. En Sanity debe guardarse `cafe-molido`, no `/cafe-molido`.
