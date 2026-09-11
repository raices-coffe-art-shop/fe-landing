# Corrección — Studio limpio y recomendaciones de Galería

## Sanity Studio

Una vez terminada la migración, los accesos transitorios ya no se muestran en la estructura del Studio:

- `Carta > Contenido anterior pendiente de separar`
- `Galería de Arte > Piezas anteriores pendientes de separar`

Los documentos históricos NO se eliminan del dataset; simplemente dejan de aparecer en la navegación normal del cliente. La edición diaria queda reducida a:

- Carta > Elementos de la Carta / Categorías de la Carta
- Productos de Origen > Productos / Categorías
- Galería de Arte > Piezas / Categorías

## Recomendaciones de Galería de Arte

La ficha `/galeria-de-arte/[slug]` ahora recomienda otras piezas de toda la Galería, no únicamente piezas de la misma categoría.

Prioridad:
1. otras piezas de la misma categoría, si existen;
2. después, otras piezas de la Galería hasta completar un máximo de 3.

Así una pieza no queda sin recomendaciones solo porque Retablos, Toritos y Cuadros estén clasificados en categorías diferentes.

## Previsualización con cursor

En escritorio, al poner el mouse sobre una recomendación:

- aparece su imagen flotante;
- la imagen sigue al cursor;
- se oculta al sacar el mouse;
- en móvil se mantiene la miniatura integrada en la fila y no aparece el flotante.

Se eliminó la dependencia de `pointer: coarse/hover: none` para decidir el comportamiento de escritorio, porque algunos equipos pueden reportar capacidades táctiles aunque el usuario esté utilizando un mouse. Ahora se usa el `pointerType` real del evento.

## Después de reemplazar los archivos

Si el Studio ya estaba abierto en `localhost`, reiniciar `npm run dev` y hacer `Ctrl + F5` para que `sanity.config.ts` se vuelva a cargar completamente.
