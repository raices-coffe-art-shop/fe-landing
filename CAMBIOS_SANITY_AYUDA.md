# Cambios en Sanity — ayuda para editores

## Qué se cambió

1. **Disponibilidad ahora es Sí / No**
   - El campo `availability` pasó a ser booleano.
   - En Studio se muestra como dos botones claros: **Sí** y **No**.
   - La ayuda deja explícito que no representa cantidad de stock.
   - La ficha pública muestra “Disponible para comprar: Sí/No”.
   - Los datos estructurados indican `InStock` o `OutOfStock` cuando el valor está definido.

2. **Botón de información en los campos de Sanity**
   - Se añadió un componente global de campo (`StudioHelpField`).
   - Cada campo definido por el proyecto tiene una explicación pensada para una persona no técnica.
   - La explicación está escondida hasta pulsar el botón **i**.

3. **SEO explicado en lenguaje simple**
   - Se aclara que SEO no es una lista de tags.
   - Se incluyen ejemplos de texto correcto e incorrecto.
   - Se explica qué ocurre si los campos SEO se dejan vacíos.

4. **Ayuda añadida a todas las áreas**
   - Productos.
   - Imágenes y textos alternativos.
   - Detalles del producto.
   - Publicación.
   - SEO.
   - Categorías.
   - Configuración global.
   - Redes sociales y contacto.

5. **Compatibilidad con datos anteriores**
   - El frontend todavía entiende valores antiguos de disponibilidad en texto mientras se actualiza el dataset.
   - Se incluye una migración opcional y segura para convertir valores antiguos claros a booleanos.
   - Los textos ambiguos, como “Consultar disponibilidad”, no se convierten automáticamente para evitar afirmar algo incorrecto.

## Migración opcional de datos antiguos

Primero revisar sin escribir cambios:

```bash
npm run sanity:migrate-availability:dry
```

Si el resultado es correcto:

```bash
npm run sanity:migrate-availability
```

Si los productos nunca tuvieron un valor escrito en “Disponibilidad”, esta migración no tendrá nada que cambiar.

## Auditoría posterior de redundancias

- Se revisó el uso real de los campos de Producto, Categoría, Configuración y Redes.
- `availability` se conserva porque NO duplica la visibilidad: permite dejar una ficha visible pero marcar el producto como temporalmente no disponible.
- Los booleanos importantes usan ahora preguntas específicas y selector **Sí / No**.
- Se eliminó `siteSettings.title`, que no tenía efecto público.
- Se eliminó `customPlatformName`, que duplicaba el nombre visible de un enlace de tipo “Otra”.
- `showPrice` se oculta si no existe precio.
- La descripción de imagen de categoría se oculta si no hay imagen.
- `region` se presenta como “Lugar específico (opcional)” y evita repetir la procedencia.
- Ver `docs/SANITY_AUDITORIA_CAMPOS.md`.
