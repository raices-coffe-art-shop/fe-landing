# Corrección: Carta vacía en Sanity Studio

La sección `Carta` usa tipos propios (`menuItem` y `menuCategory`). Si en Studio aparecen vacías las listas **Elementos de la Carta** y **Categorías de la Carta**, los documentos históricos todavía no fueron copiados desde el antiguo catálogo.

No es necesario recrear la Carta manualmente.

## Migración recomendada

Ejecutar desde la raíz del proyecto:

```text
MIGRAR_SOLO_CARTA.bat
```

El proceso:

1. Ejecuta una vista previa (`dry run`) sin modificar Sanity.
2. Lista las categorías y elementos que alimentaban la Carta histórica.
3. Pide confirmación antes de escribir.
4. Copia categorías a `menuCategory` y elementos a `menuItem`.
5. Conserva los documentos antiguos como respaldo; no los borra.
6. Marca los documentos históricos migrados para que no sigan mezclándose con Productos de Origen.
7. Ejecuta la verificación general al terminar.

Después, recargar `/studio` con `Ctrl + F5` y comprobar:

- Carta -> Elementos de la Carta
- Carta -> Categorías de la Carta
- `/carta`
- `/carta/imprimir?fotos=no`
- `/carta/tv`

No confirmar la migración si el dry run no coincide con la Carta que ya estaba publicada.
