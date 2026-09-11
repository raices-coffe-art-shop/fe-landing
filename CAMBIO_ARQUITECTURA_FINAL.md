# Cambio final — Carta, Productos de Origen y Galería de Arte

## Arquitectura definitiva

El sitio queda dividido en tres contenidos que ya no deben mezclarse:

| Sección | Ruta pública | Detalle | Sanity |
| --- | --- | --- | --- |
| Carta | `/carta` | No tiene fichas individuales | `Carta > Elementos / Categorías` |
| Productos de Origen | `/productos-de-origen` | `/productos-de-origen/[slug]` | `Productos de Origen > Productos / Categorías` |
| Galería de Arte | `/galeria-de-arte` | `/galeria-de-arte/[slug]` | `Galería de Arte > Piezas / Categorías` |

Herramientas de la Carta:

- `/carta/tv`
- `/carta/imprimir`

## Compatibilidad con URLs anteriores

No se eliminan a ciegas los enlaces antiguos:

- `/catalogo` → `/productos-de-origen`
- `/catalogo/[slug]` → `/productos-de-origen/[slug]`; si ese slug era una pieza de arte antigua, la ficha nueva termina en `/galeria-de-arte/[slug]`
- el placeholder antiguo `manualidades` no se migra como pieza; sus enlaces viejos llevan a `/galeria-de-arte`
- `/catalogo/carta` → `/carta`
- `/catalogo/tv` → `/carta/tv` conservando sus parámetros
- `/catalogo/imprimir` → `/carta/imprimir` conservando `fotos`
- `/arte` → `/galeria-de-arte`
- `/arte/[slug]` → `/galeria-de-arte`
- `/#catalogo` sigue teniendo un ancla de compatibilidad

## Qué cambió en Sanity

### Carta

Tiene documentos propios. Al modificar un elemento o categoría de Carta se revalidan `/carta`, `/carta/imprimir` y `/carta/tv`.

### Productos de Origen

Conserva el modelo completo que ya conocía el cliente. La antigua categoría `arte` se excluye de la lista y ya no se puede elegir al crear nuevos Productos de Origen.

Los campos históricos que servían exclusivamente para Carta se conservan en los documentos antiguos para no perder datos, pero están ocultos y en solo lectura en el editor de Productos de Origen.

### Galería de Arte

Tiene piezas y categorías propias. La ficha se mantuvo intencionalmente sencilla: nombre, categoría, subcategoría opcional, texto corto, descripción, imágenes, procedencia, autor/artesano, disponibilidad, precio y publicación/orden.

La introducción editorial **“La mirada de Lized también forma parte de la historia de Raíces.”** se conserva. Debajo aparecen las piezas reales administradas desde Sanity.

## Migración de contenido existente

Antes de empezar a editar por separado, ejecutar desde el proyecto con `.env.local` configurado:

```bash
npm run content:split:dry
```

Revisar los conteos y nombres. Si son correctos:

```bash
npm run content:split
```

La migración:

- copia a Carta las categorías y elementos que antes formaban la carta;
- copia a Galería de Arte los `catalogItem` cuya categoría antigua era `arte`;
- no borra los documentos antiguos;
- conserva los originales completos como respaldo y solo añade la marca interna de destino;
- si se vuelve a ejecutar, sincroniza los campos de Carta/Galería con la fuente histórica para reparar migraciones parciales antes de comenzar a editar de forma independiente.

No empezar a crear manualmente un único `menuItem` o `artItem` antes de ejecutar la migración: las nuevas colecciones tienen prioridad sobre la lectura de compatibilidad en cuanto existen documentos nuevos.

## Webhook de Sanity

El webhook debe incluir estos tipos:

```groq
_type in ["siteSettings", "menuCategory", "menuItem", "catalogCategory", "catalogItem", "artCategory", "artItem", "post"]
```

La configuración completa está en `sanity/WEBHOOKS.md`.

## Checklist después del deploy

### 1. Navegación

- Escritorio: comprobar este orden: La Carta → Productos de Origen → Galería de Arte → Acerca de nosotros → Publicaciones → Visítanos.
- Móvil: comprobar el mismo orden.
- Abrir `Acerca de nosotros`; debe desplegarse con animación y mostrar primero Nuestra Historia y luego Personas.
- Verificar que abrir/cerrar repetidamente el desplegable no bloquee el scroll.

### 2. Hero

- El botón blanco principal debe decir **La Carta** y abrir `/carta`.
- Debajo: Productos de Origen → Nuestra Historia → Cómo llegar.

### 3. Carta

- Abrir `/carta` y comprobar categorías, elementos y precios.
- Editar un `Elemento de la Carta` en Sanity, publicar y confirmar que el cambio llega a `/carta`.
- Confirmar el mismo cambio en `/carta/tv` y `/carta/imprimir`.
- Probar `/carta/imprimir?fotos=no` y la descarga/impresión.
- Probar `/carta/tv?s=10` y, si se usa, los modos `animation`.
- El QR mostrado en TV debe apuntar a `/carta`.

### 4. Productos de Origen

- Abrir `/productos-de-origen`.
- El listado no debe mostrar Cuadros de Lized, Retablos, Toritos ni otros elementos de Galería de Arte.
- Abrir varias fichas `/productos-de-origen/[slug]`.
- Crear/editar un producto desde el apartado **Productos de Origen** de Sanity y confirmar revalidación.
- Revisar buscador, filtros, imágenes, precios, disponibilidad, productos relacionados y WhatsApp.

### 5. Galería de Arte

- Abrir `/galeria-de-arte`.
- Debe conservar la introducción de Lized y, debajo, mostrar tarjetas de piezas reales.
- Comprobar categorías/filtros y búsqueda.
- Abrir varias fichas `/galeria-de-arte/[slug]`.
- Crear una pieza de prueba en Sanity (por ejemplo Torito/Retablo/Nacimiento), publicar y comprobar que aparece sin tocar Productos de Origen.
- Revisar procedencia, autor/artesano, descripción, imágenes, precio, disponibilidad y WhatsApp.

### 6. Rutas antiguas

Probar manualmente:

```text
/catalogo
/catalogo/<slug-de-producto>
/catalogo/carta
/catalogo/imprimir?fotos=no
/catalogo/tv?s=10
/arte
/arte/obra-de-lized
```

Ninguna debe producir 404. También probar una URL antigua de una pieza de arte que haya vivido como `/catalogo/<slug>` y comprobar que termina en Galería de Arte.

### 7. `/links` y QR

- La Carta → `/carta`
- Productos de Origen → `/productos-de-origen`
- Galería de Arte → `/galeria-de-arte`
- Nuestra Historia y Personas siguen funcionando.
- Escanear los QR con un teléfono real, no limitarse a ver que el SVG carga.

### 8. Sanity Studio

- Ver tres bloques claros con iconos: Carta, Productos de Origen, Galería de Arte.
- Confirmar que Productos de Origen no ofrece la categoría antigua `arte`.
- Confirmar que Galería de Arte tiene Piezas y Categorías propias.
- Confirmar que la rueda del mouse funciona en listas, formularios largos y paneles internos.
- Probar scroll después de entrar al Studio desde otra página del sitio, no solo abriendo `/studio` directamente.
- Crear un borrador en cada uno de los tres apartados y comprobar que los campos y ayudas son comprensibles.

### 9. SEO y estructura

- Revisar `/sitemap.xml`: debe incluir `/carta`, `/productos-de-origen`, fichas de productos, `/galeria-de-arte` y fichas de arte.
- No debe anunciar `/catalogo` ni `/arte` como URLs canónicas.
- Verificar canonical de una ficha de producto y una ficha de arte.

### 10. Validación técnica

Antes del deploy definitivo:

```bash
npm ci
npm run typecheck
npm run build
```

Después del deploy, hacer una recarga forzada y repetir las pruebas esenciales en una ventana de incógnito para descartar caché del navegador o de Vercel.
