# Cambio final de navegación — Raíces

## Qué cambió

- El CTA principal del hero ahora es **La Carta** y abre `/catalogo/carta`.
- Debajo quedan, en este orden: **Productos de Origen**, **Nuestra Historia**, **Cómo llegar**.
- **Catálogo** pasa a llamarse **Productos de Origen** y su ruta pública cambia a `/productos-de-origen`.
- Las fichas de producto pasan de `/catalogo/[slug]` a `/productos-de-origen/[slug]`.
- `/catalogo` y `/catalogo/[slug]` se conservan como redirecciones para no romper enlaces antiguos.
- Las rutas técnicas de Carta se conservan: `/catalogo/carta`, `/catalogo/imprimir` y `/catalogo/tv`.
- **Arte** pasa a mostrarse como **Galería de Arte**. La ruta `/arte` no se cambia.
- Navbar y menú móvil quedan en el mismo orden:
  1. La Carta
  2. Productos de Origen
  3. Galería de Arte
  4. Acerca de nosotros
     - Nuestra Historia
     - Personas
  5. Publicaciones
  6. Visítanos
- `/links` separa La Carta, Productos de Origen y Galería de Arte y genera QR para cada destino.
- Se añadieron QR estáticos de respaldo para Carta, Productos de Origen y Galería de Arte.
- El footer, las tarjetas, los enlaces de arte, relacionados, sitemap, canonical, JSON-LD y webhook de Sanity fueron actualizados.
- El Studio mantiene los tipos internos `catalogItem` y `catalogCategory` para no romper datos existentes, pero muestra la nueva terminología al usuario.

## Qué revisar después del deploy

### 1. Hero
- El botón blanco debe decir **La Carta** y abrir `/catalogo/carta`.
- Deben aparecer en orden: Productos de Origen, Nuestra Historia, Cómo llegar.
- Nuestra Historia debe bajar a `#historia` y Cómo llegar a `#visita`.

### 2. Navbar de escritorio
- Comprobar el orden de los seis elementos.
- Abrir **Acerca de nosotros** y confirmar: Nuestra Historia primero, Personas segundo.
- Verificar que el desplegable no quede cortado y que funcione con el navbar transparente y con el navbar después de hacer scroll.

### 3. Menú sándwich móvil
- Confirmar el mismo orden de seis elementos.
- Abrir y cerrar **Acerca de nosotros**.
- Probar Nuestra Historia y Personas.
- Comprobar que el menú cierre después de tocar un enlace y que el fondo no haga scroll mientras está abierto.

### 4. Productos de Origen
- Abrir `/productos-de-origen` directamente.
- Abrir una ficha y comprobar que la URL sea `/productos-de-origen/<slug>`.
- Probar filtros, búsqueda, precios, WhatsApp y productos relacionados.
- Comprobar enlaces desde la portada y desde Galería de Arte.

### 5. Compatibilidad antigua
- `/catalogo` debe redirigir a `/productos-de-origen`.
- `/catalogo?categoria=...` debe conservar el filtro al redirigir.
- Una URL vieja `/catalogo/<slug>` debe redirigir a `/productos-de-origen/<slug>`.
- `/#catalogo` debe seguir llevando visualmente a la sección de Productos de Origen mediante el ancla de compatibilidad.

### 6. Carta
- `/catalogo/carta` debe seguir mostrando la carta sin controles internos.
- `/catalogo/imprimir?fotos=no` debe seguir permitiendo imprimir/descargar PDF.
- `/catalogo/imprimir?fotos=si` debe seguir mostrando la versión con fotos.
- `/catalogo/tv` debe seguir rotando las pantallas normalmente.
- El QR de la TV debe abrir `/catalogo/carta`.
- El QR del pie de la carta impresa debe abrir `/productos-de-origen`.

### 7. Galería de Arte
- Navbar, portada, footer y `/links` deben mostrar **Galería de Arte**.
- `/arte` y `/arte/<slug>` deben seguir funcionando.
- Los botones “Ver en Productos de Origen” deben abrir la ficha correcta.

### 8. `/links`
- Revisar por separado: La Carta, Productos de Origen y Galería de Arte.
- Abrir cada tarjeta y escanear/probar su QR.
- Revisar también Historia, Personas y los enlaces sociales de Sanity.

### 9. Sanity Studio
- Entrar a `/studio`.
- Confirmar que los productos existentes siguen apareciendo: no se cambiaron `_type`, IDs ni referencias.
- Editar un producto existente y comprobar que la vista del slug muestre `/productos-de-origen/<slug>`.
- Cambiar temporalmente un campo visible (por ejemplo título o descripción), publicar y comprobar que se actualicen:
  - portada,
  - `/productos-de-origen`,
  - la ficha del producto,
  - carta/TV cuando ese campo corresponda.
- Revertir el cambio de prueba.
- Probar una categoría y su opción **¿Mostrar en la carta del café?** para confirmar que sigue separando Carta de Productos de Origen.

### 10. Webhook / revalidación
- Publicar un cambio en Sanity y verificar que el webhook responda 200.
- Confirmar que no sea necesario redeploy para ver el cambio.
- Si cambia un slug, comprobar tanto la nueva ficha como la URL anterior.

### 11. SEO y rutas
- Revisar `/sitemap.xml`: debe contener `/catalogo/carta`, `/productos-de-origen` y las fichas bajo `/productos-de-origen/...`.
- Revisar canonical de Productos de Origen y de las fichas.
- La Carta ya no canoniza al antiguo catálogo.
- `/robots.txt` debe permitir `/catalogo/carta`, pero mantener fuera las herramientas `/catalogo/imprimir` y `/catalogo/tv`.

## Nota técnica

No se renombraron los tipos internos de Sanity (`catalogItem`, `catalogCategory`) ni las funciones `getCatalog...`. Eso es intencional: son nombres de implementación y cambiarlos no aporta nada al usuario, pero sí podría romper consultas, referencias, migraciones o contenido existente.
