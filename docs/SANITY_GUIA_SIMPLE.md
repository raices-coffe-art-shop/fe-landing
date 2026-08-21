# Guía simple de Sanity — Raíces

Sanity es el panel donde se cambia el contenido del sitio sin tocar código. En cada campo aparece un botón **i**. Al pulsarlo se explica en lenguaje simple qué significa, qué conviene escribir y, cuando hace falta, un ejemplo.

## Tres controles que parecen similares, pero no lo son

- **¿Mostrar este producto en el sitio?** controla si la ficha existe públicamente. Si marcas **No**, el producto desaparece del catálogo sin borrarse de Sanity.
- **¿Se puede comprar o pedir ahora?** controla el estado comercial. Si marcas **No**, la ficha sigue visible, pero se indica que el producto no está disponible en ese momento.
- **¿Destacar este producto en la portada?** solo decide si tiene prioridad en la portada. No controla su disponibilidad ni su visibilidad normal en el catálogo.

Ejemplo: un café agotado puede seguir visible para que la gente conozca el producto. En ese caso: **Mostrar en el sitio = Sí** y **Se puede comprar ahora = No**.

## Productos

- **Título:** nombre público del producto.
- **Dirección web (slug):** parte final de la URL; normalmente se genera desde el título.
- **Categoría:** grupo principal del catálogo.
- **Subcategoría:** clasificación más específica, solo si aporta información adicional.
- **Procedencia:** lugar general de origen.
- **Lugar específico (opcional):** solo si da más precisión que Procedencia. No debe repetir exactamente el mismo texto.
- **Descripción corta:** 1 o 2 frases naturales. No es una lista de tags.
- **Descripción completa:** texto más amplio para contar historia y contexto.
- **Imagen principal / Galería:** fotos del producto.
- **Descripción de imagen:** explica qué se ve; sirve para accesibilidad y ayuda a los buscadores a interpretar la imagen.
- **Productor, artesano o creador:** persona, familia, asociación o taller responsable.
- **Presentaciones:** tamaños o formas de venta, por ejemplo 250 g o 500 g.
- **¿Se puede comprar o pedir ahora?:** Sí/No. No es cantidad de stock y no oculta la ficha.
- **Proceso:** cómo se produce, prepara o crea.
- **Ingredientes / Alérgenos:** información alimentaria cuando corresponda.
- **Afirmaciones verificadas:** solo datos que puedan respaldarse.
- **Precio / Moneda:** monto y moneda. La moneda aparece solo cuando existe un precio.
- **¿Mostrar el precio de este producto?:** aparece solo cuando hay un precio y permite ocultar ese monto sin borrarlo.
- **Mensaje de consulta por WhatsApp:** texto personalizado al pulsar Consultar. Si queda vacío, se genera automáticamente.
- **Tono visual:** acento gráfico de la tarjeta; no cambia la categoría ni el contenido.
- **¿Mostrar este producto en el sitio?:** visibilidad completa de la ficha.
- **¿Destacar este producto en la portada?:** prioridad en portada; el producto puede seguir en catálogo aunque marques No.
- **Orden:** números menores aparecen primero.

## SEO (Google)

SEO no significa llenar campos con palabras sueltas o tags. El contenido debe leerse como texto normal escrito para una persona.

Ejemplo incorrecto: `café, ayacucho, lima, artesanal, comprar café, café peruano`

Ejemplo correcto: `Café molido de origen ayacuchano, disponible en Raíces Café y Cultura en Lima.`

- **Título para Google:** título corto y natural. Si queda vacío, se usa el nombre normal del producto.
- **Descripción para Google:** 1 o 2 frases que expliquen qué encontrará la persona. Si queda vacía, se usa la descripción corta.

Estos campos son una **sobrescritura opcional**, no información que tengas que duplicar. Si no necesitas una versión distinta para Google, déjalos vacíos.

## Categorías

- **Nombre / slug:** identifican la categoría y permiten los filtros del catálogo.
- **Descripción:** se usa en la carta impresa y en datos para buscadores.
- **Imagen de la categoría:** se usa en carta impresa y TV; si falta, el sistema toma una foto de producto.
- **Descripción de la imagen:** solo aparece cuando existe una imagen de categoría.
- **Orden:** determina la posición entre categorías.
- **¿Mostrar esta categoría en el sitio?:** oculta o muestra la categoría completa y sus productos.

## Configuración del sitio

- **Logo principal:** logo usado en distintas zonas del sitio.
- **Descripción del logo:** texto de accesibilidad del logo.
- **¿Permitir mostrar precios en el sitio?:** control general. Si marcas No, se ocultan todos los precios sin borrar montos.
- **Redes sociales y contacto:** administra los botones del footer y de `/links`.

Se eliminó el antiguo **Título interno** porque no tenía efecto en la web.

## Redes sociales y contacto

Cada enlace tiene únicamente Plataforma, Texto visible, URL, Visibilidad y Orden. Se eliminó **Nombre personalizado** porque duplicaba la función del texto visible del botón y no tenía uso real en la página.
