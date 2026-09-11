# Correcciones — Galería, navegación móvil y separación de Sanity

## 1. Ficha de Galería de Arte

Se corrigió el solapamiento que aparecía entre la ficha técnica (por ejemplo, **Artista o creador**) y la descripción de la pieza.

La causa era responsive: entre 761 y 1000 px la ficha pasaba a una sola columna, pero el `aside` seguía siendo `sticky`. Ahora deja de ser sticky en cuanto la ficha pasa a una columna.

### Revisar

- `/galeria-de-arte/<slug>` a 1920, 1366, 1024, 940, 768 y móvil.
- Hacer scroll lento por toda la ficha.
- Verificar piezas con y sin “Artista o creador”.
- Verificar descripciones de una y varias líneas.

## 2. Piezas recomendadas

`Más piezas de la galería` recupera el preview flotante usado por Productos de Origen:

- desktop con mouse: la imagen aparece al hacer hover y sigue al cursor;
- teclado: aparece también al enfocar el enlace;
- móvil/táctil: se mantiene la miniatura dentro de cada recomendación.

## 3. Acerca de nosotros — menú sándwich

El submenú móvil ya no depende de `<details>` para abrir/cerrar. Se controla explícitamente con `aria-expanded`, por lo que ahora puede animar **tanto la apertura como el cierre**.

Revisar:

- abrir Menú;
- abrir `Acerca de nosotros`;
- cerrar `Acerca de nosotros`;
- repetir varias veces;
- probar Nuestra Historia y Personas;
- probar con teclado (Tab / Enter / Escape).

## 4. Sanity Studio — tres áreas separadas

Se mantienen tres áreas independientes:

1. **Carta** (`menuItem`, `menuCategory`)
2. **Productos de Origen** (`catalogItem`, `catalogCategory` que no hayan sido migrados)
3. **Galería de Arte** (`artItem`, `artCategory`)

El contenido antiguo no se borra. Al migrarlo:

- se crea la copia en el tipo nuevo;
- la copia conserva una referencia oculta al documento original;
- el documento original recibe `migrationDestination` y deja de aparecer en Productos de Origen;
- el documento original completo sigue existiendo como respaldo en Sanity.

`manualidades` NO se convierte en una pieza de arte; se mantiene fuera de las colecciones públicas como placeholder antiguo.

## 5. Migrar el contenido que ya existe en Sanity

El ZIP incluye `MIGRAR_CONTENIDO_SANITY.bat` para Windows.

También puede hacerse por terminal:

```bash
npm run content:split:dry
npm run content:split
npm run content:split:verify
```

### Qué toma como Carta

Todas las categorías del catálogo antiguo que tenían `Mostrar en Carta` activado y **todos sus documentos**, incluso los ocultos/inactivos. Conserva:

- categoría y subcategoría;
- nombre;
- descripción corta;
- imagen;
- precio/moneda/visibilidad del precio;
- orden;
- visibilidad;
- datos editoriales de la categoría usados por Carta/TV.

Los demás datos del documento original no se eliminan: el original se conserva y queda enlazado como respaldo.

### Qué toma como Galería de Arte

Los documentos cuya categoría antigua tiene slug `arte`, excepto el placeholder `manualidades`.

Se crean categorías de Galería a partir de su subcategoría antigua, por ejemplo Pinturas, Retablos o Cerámica, y se conservan nombre, imágenes, descripción, procedencia, creador, disponibilidad, precio y orden.

## 6. Compatibilidad de enlaces antiguos

Después de la migración:

- un slug antiguo que ahora pertenece a Carta lleva a `/carta`;
- un slug antiguo de arte lleva a `/galeria-de-arte/<slug>` cuando existe su nueva ficha;
- un producto que realmente sigue siendo Producto de Origen mantiene `/productos-de-origen/<slug>`;
- `/catalogo/<slug>` resuelve primero el destino real, en vez de mandar todo a Productos de Origen.

## 7. Scroll de Sanity

Se retiró el `overflow:auto` del wrapper exterior del Studio. Ese contenedor podía quedarse con la rueda en vez del panel interno de Sanity. `/studio` usa ahora viewport fijo exterior y deja que Sanity controle sus propios paneles de scroll.

Probar la rueda en:

- lista principal;
- lista de documentos;
- formulario largo de un producto;
- selector de referencias;
- imágenes;
- grupos/pestañas del formulario.

## 8. Webhook

El webhook de Sanity debe incluir los tipos nuevos:

```groq
_type in ["siteSettings", "menuCategory", "menuItem", "catalogCategory", "catalogItem", "artCategory", "artItem", "post"]
```

Así las ediciones de Carta revalidan `/carta`, `/carta/imprimir` y `/carta/tv`, mientras Galería de Arte y Productos de Origen revalidan sus propias páginas.

## Corrección adicional — piezas de Arte que siguen apareciendo como pendientes

Si Studio todavía muestra **Cuadros de Lized**, **Retablos** y **Toritos de Ayacucho** dentro de “Piezas anteriores pendientes de separar”, significa que esos `catalogItem` aún no tienen `migrationDestination = "galeria-de-arte"` en la perspectiva que está mostrando Studio.

Se añadió `MIGRAR_SOLO_GALERIA_ARTE.bat`. Este migrador no depende únicamente de `category->slug.current == "arte"`: también reconoce la referencia directa a la categoría y su título, y usa la perspectiva de drafts de Sanity para coincidir con lo que se ve en Studio. No borra los documentos viejos.

Flujo recomendado:

1. Ejecutar `MIGRAR_SOLO_GALERIA_ARTE.bat`.
2. El dry run debe listar las piezas antiguas de Arte (actualmente deberían aparecer Cuadros de Lized, Retablos y Toritos de Ayacucho).
3. Confirmar la migración.
4. El verificador debe terminar con `Pendientes detectados: 0`.
5. Refrescar `/studio` con `Ctrl+F5`.
6. Las piezas deben estar en **Galería de Arte → Piezas** y el apartado de pendientes debe quedar vacío.
