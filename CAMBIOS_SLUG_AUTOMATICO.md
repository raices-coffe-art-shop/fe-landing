# Slug automático — corrección

- El slug ya no se edita manualmente en Sanity Studio.
- En documentos nuevos se genera automáticamente desde el título/nombre.
- Se normalizan tildes, espacios, barras y caracteres especiales.
- Si existe una dirección igual en otro documento del mismo tipo, se usa un sufijo numérico legible (`-2`, `-3`, etc.).
- La pareja borrador/publicado del mismo documento no cuenta como duplicado.
- En documentos ya publicados, una URL válida se conserva aunque cambie el título para no romper enlaces existentes.
- Slugs antiguos inválidos (por ejemplo `/test`) se corrigen automáticamente al abrir el documento.
- La validación final sigue bloqueando duplicados reales.
