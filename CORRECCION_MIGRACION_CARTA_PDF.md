# Corrección — Carta, PDF y separación de Sanity

## Qué significa "Contenido anterior pendiente de separar"

No es contenido perdido. Son los documentos `catalogItem/catalogCategory` que todavía alimentan la Carta actual pero aún no han sido copiados a los tipos nuevos `menuItem/menuCategory`.

Mientras no se ejecute la migración, **Elementos de la Carta** y **Categorías de la Carta** pueden verse vacíos, y el contenido aparece en el apartado de transición.

## Por qué la migración coincide con la Carta/PDF

La ruta `/carta` y `/carta/imprimir` usaban como fuente los elementos del catálogo cuya categoría tenía `showInPrintedMenu != false` (excepto Arte). La migración usa exactamente el mismo criterio.

Por eso no se seleccionan elementos por nombre ni mediante una lista inventada: se copia lo que realmente estaba configurado para la Carta.

En el estado observado en septiembre de 2026 aparecen como categorías de la Carta:

- Café — orden 10
- Chocolatería — orden 20
- Bebidas Andinas — orden 30
- Jugos & Smoothies — orden 35
- Sándwiches — orden 40
- Alimentos — orden 50
- Para llevar — orden 60

La migración copia también elementos inactivos. No aparecen públicamente, pero permanecen guardados en Sanity para no perder información.

## Qué datos conserva la Carta

Por elemento:

- nombre
- categoría
- subcategoría
- descripción corta
- imagen y texto alternativo
- precio
- visibilidad del precio
- moneda
- activo/inactivo
- orden

Por categoría:

- nombre y slug interno
- descripción
- subtítulo de TV
- título e historia de origen
- información de insumos/proveedores
- ficha de origen
- imagen de categoría
- orden
- visible/oculta

Es exactamente la información que consumen `/carta`, `/carta/imprimir` y `/carta/tv`.

## Galería de Arte

Los documentos históricos de la categoría `arte` se copian a `artItem/artCategory`. `manualidades` se conserva como documento histórico, pero no se convierte en una obra real.

## Ejecutar

En Windows, desde la raíz del proyecto:

```text
MIGRAR_CONTENIDO_SANITY.bat
```

El archivo realiza:

1. dry run (solo lectura)
2. confirmación
3. migración real
4. verificación de paridad

También se puede hacer manualmente:

```bash
npm run content:split:dry
npm run content:split
npm run content:split:verify
```

## Verificación reforzada

`content:split:verify` ya no comprueba solo cantidades. Contrasta los documentos nuevos contra los documentos originales y avisa si se pierde o cambia alguno de los campos necesarios para Carta o Galería.

También existe:

```text
VERIFICAR_CARTA_SANITY.bat
```

que solo ejecuta la comprobación, sin escribir datos.

## Seguridad

- La migración no borra los `catalogItem` originales.
- Los originales quedan como respaldo y reciben `migrationDestination`.
- Una vez marcados, dejan de mostrarse en Productos de Origen.
- Si se vuelve a ejecutar la migración, sincroniza de nuevo los campos de destino; no depende únicamente de `createIfNotExists`.
- Las listas de "contenido anterior" en Studio ya no permiten crear documentos nuevos desde el botón `+`; son únicamente vistas de transición/respaldo.
