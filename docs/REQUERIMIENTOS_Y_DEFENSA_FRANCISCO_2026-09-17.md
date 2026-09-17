# Requerimientos y defensa de alcance — Francisco — 17/09/2026

Este documento relaciona lo solicitado por Francisco, los insumos que efectivamente entregó, la implementación incluida en esta versión y los puntos que no pueden considerarse omisiones del desarrollo porque el dato no fue entregado.

## 1. Fuentes conservadas dentro de esta entrega

Se guardan copias de la evidencia original en `docs/evidencia-francisco-2026-09-17/`:

- `chat-01.png` a `chat-04.png`: capturas de WhatsApp entregadas para esta actualización.
- `Lista_Oficial_Productos_Origen_Finca_La_Fortuna.pdf`: lista oficial de Productos de Origen y precios.
- `Fichas_Arte_Ceramica_Quinua.pdf`: textos oficiales de las tres piezas de Galería de Arte.
- Fotografías originales entregadas para café, cacao/chocolate, miel/polen, queso, Torito, Iglesia y Retablo.

La imagen usada para Panadería Tradicional & Granos Andinos no fue entregada en este lote. Se reutiliza, de forma referencial, una fotografía documental que ya existía en el proyecto de Karen Córdova / Panadería Kullany (`public/media/people/karen-01.webp`).

---

## 2. Relación directa: lo que Francisco dijo → lo que se implementó

| Requerimiento / evidencia | Interpretación aplicada | Implementación | Estado |
| --- | --- | --- | --- |
| “los precios de productos que se deben incluir en los productos section. Esto tiene que estar como tal y luego en los boxes por separado, en los separados pones las fotos” | La página debe mostrar primero una lista fiel de productos, presentaciones y precios, y después boxes visuales por familia con sus fotos. | `OriginOfficialList` muestra la lista estructurada y `OriginCategoryGrid` muestra los boxes. Ambos consumen los mismos datos de Sanity para evitar dos fuentes manuales distintas. | Implementado en el ZIP. |
| “Café (ponerlo empezando los boxes)” | Café debe ser el primer box. | Orden 10 para Café de Origen. | Implementado. |
| “Miel y Polen” | Deben formar parte de Productos de Origen. | Categoría Apicultura con Miel 500 g, Miel 250 g y Polen 250 g. | Implementado. |
| “Queso” | Debe formar parte de Productos de Origen. | Categoría Quesos Artesanales con Queso Fresco Pasteurizado y Queso Aromatizado. | Implementado. |
| “Chocolates en barra” | Debe existir la familia de chocolates de barra. | Chocolates Finos 45 g, 70 g y 100 g dentro de Chocolatería & Cacao Artesanal. | Implementado. |
| “Cacao: Mermelada / Jalea / Polvo / Nibs” | Los cuatro derivados deben aparecer. | Mermelada, Jalea, Polvo y Nibs cargados en la misma familia. | Implementado. |
| “Aquí te envío descripciones de las artesanías más importantes y tradicionales” | Las fichas de arte deben usar el PDF entregado, sin inventar otra narrativa. | Seed de Galería construido a partir de `Fichas_Arte_Ceramica_Quinua.pdf`. | Implementado. |
| “Y en Galería de Arte te envío foto: Torito / Iglesia / Retablo” | Esas son las tres piezas del nuevo lote de Galería. | Torito de Quinua, Iglesia de Quinua y Retablo Tradicional con sus fotos reales. | Implementado. |
| Confirmación posterior del alcance: las tres piezas nuevas reemplazan a todos los elementos actuales de Galería de Arte. | El contenido anterior deja de ser público, pero no se destruye. | La migración marca como inactivas las piezas anteriores y oculta sus categorías; crea las 3 piezas oficiales. | Implementado en script de migración. |

---

## 3. Reunión anterior: checklist y relación con la versión actual

### Catálogo / Productos de Origen

**Nota:** “Solo los elementos que el Sr Francisco nos va a mandar”.

Aplicación: la migración deja activos únicamente los 20 registros definidos por el PDF y los mensajes de esta entrega. Los placeholders y productos anteriores quedan inactivos. No se borran físicamente, de modo que existe reversibilidad y trazabilidad.

**Nota:** “Sr Arica nos va a pasar los elementos exactos del Catálogo”.

Aplicación: el documento oficial entregado el 17/09/2026 pasa a ser la referencia de esta entrega. Se conservó dentro del ZIP.

### Hero Section

Orden pedido:

1. Carta
2. Productos de Origen
3. Nuestra Historia
4. Cómo llegar

Estado en código: coincide. `components/Hero.tsx` mantiene exactamente ese orden.

### Drop Down Menu

Orden pedido:

1. Carta
2. Catálogo → renombrado a Productos de Origen
3. Arte → Galería de Arte
4. Acerca de Nosotros
   - Nuestra Historia
   - Personas
5. Publicaciones
6. Visítanos

Estado en código: coincide. `components/SiteHeaderClient.tsx` usa un único arreglo `navItems` para escritorio y móvil, de forma que ambos menús conservan la misma jerarquía.

### Carta vs. Catálogo

Notas:

- “La Carta -> Se mantiene como está”.
- “Catálogo -> Productos de Origen”.
- “[VER LA DIFERENCIA DE CATALOGO Y CARTA]”.

Aplicación: se mantienen modelos, consultas, rutas y cachés separados:

- Carta: `menuItem`, `menuCategory`, `/carta`, tags `menu`/`menuCategories`.
- Productos de Origen: `catalogItem`, `catalogCategory`, `/productos-de-origen`, tags `catalog`/`catalogCategories`.
- Galería de Arte: `artItem`, `artCategory`, `/galeria-de-arte`, tags `artGallery`/`artCategories`.

La migración Francisco modifica Productos de Origen y Galería; no modifica `menuItem` ni `menuCategory`.

### “Arte de Lized (pendiente a confirmar nombre)”

Esa nota pertenecía a una etapa anterior. El material posterior entregó específicamente Torito, Iglesia y Retablo para Galería, y el alcance de esta entrega confirmó que esas tres piezas reemplazan el contenido anterior de la Galería de Arte.

Para no borrar historia del proyecto, las referencias a Lized que pertenecen a **Nuestra Historia / fundadores / fotografías documentales** no se eliminan automáticamente. Lo que sí se retira del dominio **Galería de Arte** es la narrativa anterior centrada en “La obra de Lized” y sus placeholders. Son ámbitos diferentes.

---

## 4. Productos exactos incluidos

### Café de Origen

- Café de Especialidad Tostado — Bolsa 500 g — S/ 55.00
- Café de Especialidad Tostado — Bolsa 250 g — S/ 30.00
- Café Verde / En Grano — Bolsa 250 g — S/ 20.00

### Chocolatería & Cacao Artesanal

- Chocolates Finos — Barra 45 g — S/ 10.00
- Chocolates Finos — Barra 70 g — S/ 18.00
- Chocolates Finos — Stevia — Barra 100 g — S/ 27.00
- Mermelada Artesanal de Cacao — Frasco 220 g — S/ 25.00
- Jalea Concentrada de Cacao — Frasco 300 g — S/ 52.00
- Polvo de Cacao — Bolsa 250 g — **Consultar**
- Nibs de Cacao — Bolsa 250 g — **Consultar**

### Apicultura

- Miel de Abeja Pura de Valle — Frasco 500 g — S/ 48.00
- Miel de Abeja Pura de Valle — Frasco 250 g — S/ 22.00
- Polen Silvestre — Frasco 250 g — S/ 40.00

### Quesos Artesanales

- Queso Fresco Pasteurizado — Molde entero — S/ 38.00
- Queso Aromatizado — Molde entero — S/ 41.00
- Nota de la fuente: disponible por peso desde 100 g.

### Panadería Tradicional & Granos Andinos

- Pan Chapla Tradicional — Bolsa x 3 — S/ 2.00
- Tanta Wawa — 1 unidad — S/ 4.00
- Tanta Wawa — Bolsa x 3 — S/ 10.00
- Cancha Paccho Tradicional — Bolsa 200 g / 250 g — **Consultar**
- Mix de Frutos Secos — Bolsa 150 g / 200 g — **Consultar**

---

## 5. Datos NO entregados: no deben considerarse omisiones del desarrollo

### Precios no proporcionados

1. Polvo de Cacao.
2. Nibs de Cacao.
3. Cancha Paccho Tradicional.
4. Mix de Frutos Secos.

**Justificación:** Polvo y Nibs aparecen en el mensaje/foto, pero el PDF de precios no consigna un precio para ellos. Cancha Paccho y Mix sí aparecen en el PDF, pero la columna de precio contiene un guion. La implementación muestra **Consultar**, no un precio inventado.

### Foto no proporcionada

No se entregó una fotografía específica para Panadería Tradicional & Granos Andinos en este lote. Se usa temporalmente una fotografía documental existente del proyecto relacionada con Karen Córdova / Panadería Kullany. Si Francisco entrega una foto específica, basta reemplazar la imagen de la categoría en Sanity; no requiere cambiar arquitectura ni código.

### Medidas/precios de arte

El PDF de Galería indica “Disponibilidad / Medidas: Consultar pieza” y no entrega precios de Torito, Iglesia ni Retablo. Por ello las fichas se publican sin precio fijo y con consulta directa.

---

## 6. Respuestas objetivas ante posibles reclamos posteriores

### “Falta un producto que yo había pedido”

Comprobar primero el PDF oficial y las capturas conservadas. La propia reunión estableció “solo los elementos que el Sr Francisco nos va a mandar”. Si el producto no figura en esas fuentes, se trata de un requerimiento nuevo, no de una omisión de esta entrega.

### “¿Por qué este producto dice Consultar y no tiene precio?”

Porque la fuente no proporcionó precio. No se inventó un valor comercial. Los cuatro casos están identificados en la sección 5.

### “¿Por qué Panadería tiene esa foto?”

Porque no se entregó una foto específica de esa categoría. Se reutilizó una fotografía documental ya existente y relacionada con panadería ayacuchana, en lugar de inventar contenido como si fuera material enviado por Francisco.

### “Yo quería que Carta y Productos de Origen fueran lo mismo”

Las notas de reunión dicen expresamente lo contrario: “La Carta -> Se mantiene como está”, “Catálogo -> Productos de Origen” y “[VER LA DIFERENCIA DE CATALOGO Y CARTA]”. La implementación mantiene ambos dominios separados.

### “Quería que siguiera la galería anterior”

Esta entrega usa las tres piezas entregadas específicamente como nueva Galería y el alcance fue confirmado como reemplazo total. Los registros antiguos no se destruyeron: quedan ocultos/inactivos para poder recuperarlos si se formula un nuevo cambio de alcance.

### “Faltan QRs”

La nota original solo dice “QR para la página web!!! / QR de todos los links” y no enumera un subconjunto. Para evitar ambigüedad se generó un paquete más amplio con 15 QRs: sitio, `/links`, navegación principal, Google Maps y todos los canales oficiales detectados en `/links` al momento de la auditoría. La relación exacta está en `entrega/qr/QR_MANIFIESTO.json`.

### “Falta YouTube”

En los insumos de esta entrega y en la página `/links` auditada no existía un enlace oficial de YouTube. No se generó un QR que llevara a una cuenta inventada. Si se proporciona la URL oficial, se puede añadir sin modificar la arquitectura.

---

## 7. Regla de cambios futuros

Toda modificación posterior debe clasificarse antes de aplicarse:

- **Corrección de esta entrega:** la fuente original sí contenía el dato y la implementación no lo reflejó correctamente.
- **Dato faltante completado:** Francisco entrega ahora un precio, foto, medida, URL o texto que antes no había suministrado.
- **Cambio de alcance:** se agrega, retira, reordena o redefine algo respecto de lo documentado aquí.

Esta distinción evita confundir nuevos pedidos con errores de la entrega anterior.

---

## 8. Auditoría de contactos y QRs: discrepancia que NO se debe ocultar

Durante la auditoría del 17/09/2026 se detectó una diferencia entre dos fuentes del propio proyecto:

- El `/links` publicado mostraba WhatsApp con destino `https://wa.me/992383843`.
- El fallback histórico del código (`data/social.ts`) conserva `https://wa.me/51915123159` (+51 915 123 159).

Los PDFs, fotografías y mensajes de Francisco entregados para esta actualización **no indican cuál de esos dos números debe sustituir al otro**. Por tanto, esta versión no cambia silenciosamente el contacto de Sanity ni declara que uno sea “el correcto” sin confirmación.

Medidas tomadas:

1. En `/links`, el QR de WhatsApp se genera a partir del `href` real que llega desde Sanity; se retiró el QR estático de respaldo para WhatsApp para evitar que una tarjeta muestre un enlace y codifique otro número.
2. El paquete físico de QR refleja el WhatsApp que estaba publicado en `/links` en la fecha de auditoría.
3. **Antes de imprimir una tirada grande de QR de WhatsApp, Francisco debe confirmar el número definitivo.** Si pide otro número después, eso es un dato de contacto nuevo/corregido, no un defecto de la implementación documentada aquí.

Instagram, Facebook y correo coinciden entre el fallback local y los canales publicados auditados. TikTok se detectó en `/links` publicado, aunque no forma parte del fallback mínimo histórico.

## 9. Qué QR se interpreta que pidió Francisco

La anotación original dice únicamente:

- `QR para la página web!!!`
- `QR de todos los links`

No especifica un número exacto de QR ni limita “todos los links” a una sola subsección. Para cubrir el requerimiento sin dejar huecos se entrega:

1. Sitio web principal.
2. Página `/links` (un QR único que sirve como concentrador).
3. La Carta.
4. Productos de Origen.
5. Galería de Arte.
6. Nuestra Historia.
7. Personas.
8. Publicaciones.
9. Visítanos.
10. Google Maps / Cómo llegar.
11. WhatsApp publicado al momento de la auditoría.
12. TikTok publicado al momento de la auditoría.
13. Correo electrónico.
14. Instagram.
15. Facebook.

No se generó YouTube porque no había URL oficial entregada ni visible en `/links`. Añadir un QR que no tenga destino confirmado sería inventar información.

Los 15 QR individuales y una hoja completa están en `entrega/qr/`. La URL exacta de cada uno está registrada en `QR_MANIFIESTO.json`, lo cual permite demostrar qué codificaba cada imagen en la fecha de entrega.
