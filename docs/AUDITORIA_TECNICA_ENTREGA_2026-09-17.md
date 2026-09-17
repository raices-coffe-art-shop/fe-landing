# Auditoría técnica — entrega Raíces / Francisco — 17/09/2026

## Resultado general

La arquitectura actual permite aplicar el nuevo contenido sin volver a mezclar Carta, Productos de Origen y Galería de Arte. Esta versión añade una migración específica e idempotente para la entrega del 17/09/2026 y conserva los documentos anteriores ocultos, no borrados.

## Matriz de auditoría

| Área | Requerimiento | Estado del código de esta entrega | Acción necesaria en Sanity/producción |
| --- | --- | --- | --- |
| Hero | Carta → Productos de Origen → Nuestra Historia → Cómo llegar | OK | Ninguna. |
| Menú | Carta, Productos de Origen, Galería, Acerca de Nosotros, Publicaciones, Visítanos | OK | Ninguna. |
| Acerca de Nosotros | Nuestra Historia antes que Personas | OK | Ninguna. |
| Carta | Mantener independiente | OK | La migración Francisco no toca `menuItem`/`menuCategory`. |
| `/catalogo` | Compatibilidad con nombre/ruta vieja | OK | Redirige a `/productos-de-origen`. |
| Productos de Origen | Solo contenido entregado por Francisco | Preparado | Ejecutar `npm run francisco:update`. |
| Lista oficial | Lista antes de los boxes | OK | Se nutre de los mismos datos de Sanity que los boxes. |
| Boxes | Foto + productos por categoría + WhatsApp | OK | Las imágenes se cargan con la migración. |
| Café primero | Primer box | OK | Orden 10. |
| Precios faltantes | No inventar | OK | Se guardan sin `price` y `showPrice=false`. |
| Galería | Reemplazar contenido anterior por Torito/Iglesia/Retablo | Preparado | Ejecutar migración; antiguos quedan `isActive=false`. |
| Home / preview de Galería | No conservar narrativa antigua de Lized dentro de Galería | OK | El preview consume `artItem` reales y usa fallback nuevo. |
| Home / preview de Productos | No mezclar pinturas/piezas con Productos de Origen | OK | Texto corregido y consulta separada. |
| `/links` | QR dinámico por enlace | OK + corregido | Se eliminaron fallbacks incorrectos reutilizados entre plataformas. |
| QRs físicos | Página web + todos los links | OK | 15 PNG grandes + hoja completa + manifiesto. |
| Caché | Mantener aislamiento de tags | OK | No se cambió la estrategia ya estabilizada. |

## Aislamiento confirmado

### Carta

- Ruta: `/carta`.
- Tipos Sanity: `menuItem`, `menuCategory`.
- Librería: `sanity/lib/menu.ts`.
- No es tocada por `scripts/update-francisco-2026-09.mjs`.

### Productos de Origen

- Ruta: `/productos-de-origen`.
- Tipos Sanity: `catalogItem`, `catalogCategory`.
- Librería: `sanity/lib/catalog.ts`.
- Tags: `catalog`, `catalogCategories`, `catalogItem:<slug>`.
- Los registros antiguos que pudieran seguir apareciendo públicamente se marcan inactivos/ocultos antes de publicar el nuevo conjunto.

### Galería de Arte

- Ruta: `/galeria-de-arte`.
- Tipos Sanity: `artItem`, `artCategory`.
- Librería: `sanity/lib/art.ts`.
- Tags: `artGallery`, `artCategories`, `artItem:<slug>`.
- Las piezas anteriores quedan inactivas; se conservan como historial.

## Cambios técnicos principales incluidos

1. `components/OriginOfficialList.tsx`
   - Añade la lista oficial antes de los boxes.
   - No duplica datos: recibe los mismos `items` y `categories` que la vista de boxes.

2. `components/OriginCategoryGrid.tsx`
   - Se conserva como vista de boxes con foto, productos, presentación, precio/Consultar y WhatsApp.

3. `scripts/francisco-productos-origen-2026-09.json`
   - Fuente estructurada para 5 categorías y 20 productos.

4. `scripts/francisco-galeria-arte-2026-09.json`
   - Fuente estructurada para Cerámica Tradicional de Quinua y sus 3 piezas.

5. `scripts/update-francisco-2026-09.mjs`
   - Dry-run disponible.
   - Oculta contenido anterior en los dominios afectados.
   - Sube las imágenes locales a Sanity.
   - Crea/reemplaza IDs deterministas para evitar duplicados.
   - No modifica Carta.

6. `scripts/verify-francisco-2026-09.mjs`
   - Comprueba que el conjunto activo sea exactamente el esperado.
   - Comprueba categorías, slugs, precios, visibilidad e imágenes.
   - Informa recuentos de Carta solo como control de aislamiento.

7. `components/CulturalSplitShowcase.tsx`
   - Ya no depende de la antigua narrativa fija de Lized para representar Galería.
   - Recibe las piezas actuales de Sanity desde el Home.
   - Tiene fallback local con las 3 piezas nuevas.

8. `data/catalogFallback.ts`
   - Los fallbacks de desarrollo se alinean con esta entrega y dejan de introducir contenido viejo si Sanity no está disponible en desarrollo.

9. `components/LinksHub.tsx`
   - Los QR siguen generándose dinámicamente según el `href` real.
   - Se corrigieron QR estáticos de respaldo que reutilizaban archivos de otra plataforma.
   - Cuando no existe respaldo confiable, se muestra un placeholder hasta que el QR dinámico termine de generarse; nunca se muestra un QR que apunte deliberadamente a otra plataforma.

## Rutas heredadas verificadas

- `/catalogo` → `/productos-de-origen`.
- `/arte` → `/galeria-de-arte`.
- Las rutas antiguas de Carta bajo `/catalogo` se conservan como compatibilidad/redirección hacia `/carta`.

## Auditoría del sitio publicado antes de aplicar esta migración

El 17/09/2026, antes de ejecutar la nueva migración, el sitio publicado todavía mostraba:

- placeholders `Cat A 1`, `Cat B 2`, `Prod 1`, `Prod 2`, etc. en Productos de Origen;
- la narrativa anterior de Galería centrada en Lized;
- `/links` con Carta, Productos de Origen, Galería de Arte, Nuestra Historia, Personas, WhatsApp, TikTok, correo, Instagram y Facebook.

Eso significa que **subir únicamente el código sin ejecutar la migración no reemplaza el contenido almacenado en Sanity**. Por eso la entrega incluye los comandos específicos de actualización y verificación.

## Secuencia segura de despliegue

```bash
npm ci
npm run typecheck
npm run build
npm run francisco:update:dry
```

Revisar el dry-run. Debe indicar que Carta no se modifica y listar qué placeholders/contenido anterior se ocultará.

Luego:

```bash
npm run francisco:update
npm run francisco:verify
```

Si la verificación termina en `OK`, desplegar el código normalmente.

## Verificación visual posterior al despliegue

Comprobar en ventana privada o sesión nueva:

1. `/` — Hero y orden de navegación.
2. `/productos-de-origen` — lista oficial completa y luego 5 boxes.
3. Home — preview de Productos de Origen sin referencias a pinturas o piezas de arte.
4. `/galeria-de-arte` — solo Torito de Quinua, Iglesia de Quinua y Retablo Tradicional.
5. Home — preview de Galería con esas mismas piezas.
6. `/carta` — contenido sin alteraciones provocadas por esta migración.
7. `/links` — todos los enlaces abren el destino correcto y el QR de cada tarjeta corresponde al `href` real.
8. `/catalogo` y `/arte` — redirecciones de compatibilidad.
9. WhatsApp de cada box/producto — mensaje de consulta coherente con el elemento.
10. Precios sin fuente — muestran `Consultar`, nunca `S/ 0` ni un valor inventado.

## Pendientes que requieren un dato nuevo de Francisco, no código

- Precio de Polvo de Cacao.
- Precio de Nibs de Cacao.
- Precio de Cancha Paccho.
- Precio de Mix de Frutos Secos.
- Foto específica de Panadería Tradicional & Granos Andinos, si quiere reemplazar la foto documental referencial.
- Medidas/precios de las tres piezas de Galería, si desea publicarlos.
- URL oficial de YouTube, si desea que aparezca/generar QR para ese canal.

## Validaciones adicionales de esta entrega

Se añadió `npm run francisco:audit:static`, una auditoría que no necesita conectarse a Sanity y comprueba, entre otros puntos:

- 5 categorías y 20 productos del lote oficial;
- únicamente 4 productos sin precio y con precio oculto;
- 3 piezas exactas de Galería y sus archivos locales;
- orden de Hero y menú;
- separación de Carta / Productos de Origen / Galería;
- lista oficial antes de los boxes;
- conexión del Home con `artItem`;
- tags separados en el webhook de revalidación;
- ausencia de placeholders en las superficies públicas modificadas;
- 15 QR físicos, hoja completa y ausencia de un YouTube inventado.

La auditoría estática de esta entrega finaliza con **0 incidencias**.

### Validación de QR

Los 15 PNG individuales fueron decodificados de vuelta durante la preparación de esta entrega y cada uno devolvió la URL esperada de `QR_MANIFIESTO.json`. El QR de Google Maps usa una URL corta basada en las mismas coordenadas que ya utiliza el proyecto, en lugar de codificar la URL extensa de Street View; esto reduce la densidad del código para impresión física.

### Discrepancia de WhatsApp

Existe una diferencia previa entre el WhatsApp publicado en `/links` (`992383843`) y el fallback local histórico (`+51 915 123 159`). Los insumos de esta actualización no resuelven esa contradicción. Por seguridad, `LinksHub` genera el QR de WhatsApp siempre desde el href real y no usa un SVG estático de respaldo para ese canal. El punto queda documentado para confirmación del cliente antes de una impresión masiva.

### Limitación de la validación en este entorno

Se intentó reinstalar dependencias con `npm ci` para ejecutar `typecheck` y `build`, pero el entorno de trabajo no pudo resolver `registry.npmjs.org` (`EAI_AGAIN`) y no contaba con todos los tarballs en caché. Por ello no se declara falsamente un build ejecutado aquí.

Sí se realizaron y pasaron:

- validación sintáctica de los scripts Node nuevos con `node --check`;
- parse/transpilación sintáctica de todos los TS/TSX modificados usando TypeScript sin resolución de módulos;
- `npm run francisco:audit:static` (0 incidencias);
- verificación de archivos de imagen y sus dimensiones;
- decodificación de los 15 QR individuales.

El `typecheck` y `build` completos quedan incluidos en `VALIDAR_ENTREGA_FRANCISCO.bat` para ejecutarse en una máquina con acceso normal a npm antes del despliegue.
