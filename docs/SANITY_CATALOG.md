# Carta, Productos de Origen y Galería de Arte en Sanity

Desde septiembre de 2026, Carta, Productos de Origen y Galería de Arte se administran por separado en Sanity.

Esta separación evita que un producto de la Carta aparezca como Producto de Origen o que una pieza de arte termine dentro del catálogo comercial.

## 1. Carta

Tipos de Sanity:

- `menuCategory` — categorías o secciones de la Carta.
- `menuItem` — bebidas, alimentos y demás elementos de la Carta.

Rutas:

- `/carta` — vista pública de la Carta.
- `/carta/imprimir` — vista preparada para impresión o PDF.
- `/carta/tv` — pantalla vertical del local.

Los elementos de Carta no tienen una ficha pública `/carta/[slug]`.

### Organización

La Carta funciona en dos niveles:

- **Sección:** categoría principal, por ejemplo Café, Chocolatería, Bebidas Andinas, Jugos & Smoothies, Sándwiches, Alimentos o Para llevar.
- **Subsección:** clasificación interna de los productos, por ejemplo Clásicos, Filtrados & Métodos, Con Leche, Opciones Frías, Triples, etc.

Cada categoría puede conservar información narrativa y de origen, como:

- descripción;
- subtítulo;
- título de historia;
- historia de origen;
- insumos y productores;
- ficha de origen y productores;
- imagen;
- orden.

Cada elemento puede mantener:

- nombre;
- categoría;
- subcategoría;
- descripción;
- imagen;
- precio;
- moneda;
- visibilidad del precio;
- activo/inactivo;
- orden.

### Carta y TV

`/carta`, `/carta/imprimir` y `/carta/tv` utilizan los documentos separados de Carta.

La pantalla del local acepta parámetros de URL.

Ejemplo:

```text
/carta/tv?s=14&animation=giro
```

El intervalo `s` controla el tiempo entre pantallas.

Los modos de animación disponibles siguen siendo los utilizados por la pantalla del local.

La ruta antigua:

```text
/catalogo/tv
```

se conserva únicamente como redirección de compatibilidad hacia:

```text
/carta/tv
```

También conserva los parámetros `s` y `animation`.

## 2. Productos de Origen

Tipos de Sanity:

- `catalogCategory`
- `catalogItem`

Rutas:

- `/productos-de-origen`
- `/productos-de-origen/[slug]`

Productos de Origen corresponde a lo que anteriormente se mostraba públicamente como Catálogo.

Cada producto puede tener una ficha individual y mantener los campos que ya utilizaba anteriormente, como:

- título;
- slug;
- categoría;
- subcategoría;
- descripción;
- imagen principal;
- galería;
- precio;
- procedencia;
- productor, artesano o creador;
- disponibilidad;
- presentaciones;
- estado;
- orden.

La categoría histórica `arte` queda excluida de Productos de Origen.

Las piezas artísticas deben administrarse desde Galería de Arte y no como `catalogItem`.

## 3. Galería de Arte

Tipos de Sanity:

- `artCategory`
- `artItem`

Rutas:

- `/galeria-de-arte`
- `/galeria-de-arte/[slug]`

Cada pieza puede tener:

- nombre;
- slug;
- categoría;
- subcategoría;
- descripción corta;
- descripción amplia;
- imagen principal;
- galería;
- procedencia;
- artista, artesano o creador;
- disponibilidad;
- precio;
- estado;
- orden.

La introducción editorial relacionada con Lized forma parte de la página de Galería de Arte, pero las piezas reales se administran mediante `artItem`.

No deben crearse piezas de arte como `catalogItem`.

## 4. Migración desde el modelo anterior

La separación original se realizó copiando los documentos anteriores a sus nuevos tipos sin borrar los documentos históricos.

Comandos:

```bash
npm run content:split:dry
npm run content:split
npm run content:split:verify
```

- `content:split:dry` muestra lo que se migrará sin escribir nada.
- `content:split` realiza la separación.
- `content:split:verify` comprueba cantidades, referencias y paridad.

También existen scripts específicos para Carta y Galería de Arte cuando se necesita revisar una migración por separado.

Después de la separación no deben utilizarse los scripts históricos de carga de Carta como procedimiento normal de administración.

La edición cotidiana debe hacerse directamente desde Sanity Studio.

## 5. Estado actual de la separación

La Carta utiliza:

- `menuCategory`
- `menuItem`

Productos de Origen utiliza:

- `catalogCategory`
- `catalogItem`

Galería de Arte utiliza:

- `artCategory`
- `artItem`

Esto permite editar cada sección de forma independiente sin alterar las otras dos.

## 6. Revalidación

El webhook de Sanity debe responder, como mínimo, a cambios en:

- `menuCategory`
- `menuItem`
- `catalogCategory`
- `catalogItem`
- `artCategory`
- `artItem`
- `post`
- `siteSettings`

Las rutas revalidadas deben corresponder a la sección afectada.

### Carta

- `/carta`
- `/carta/imprimir`
- `/carta/tv`

### Productos de Origen

- `/productos-de-origen`
- `/productos-de-origen/[slug]`

### Galería de Arte

- `/galeria-de-arte`
- `/galeria-de-arte/[slug]`

Consultar `sanity/WEBHOOKS.md` para el filtro y la proyección completos.

## 7. Rutas antiguas

Las rutas antiguas bajo `/catalogo` pueden mantenerse como redirecciones para no romper enlaces guardados, QR o accesos antiguos.

La arquitectura pública actual es:

```text
/carta
/carta/imprimir
/carta/tv

/productos-de-origen
/productos-de-origen/[slug]

/galeria-de-arte
/galeria-de-arte/[slug]
```