# Auditoría de campos de Sanity — Raíces

Objetivo: que cada campo editable tenga una función concreta y que dos campos no pidan al editor la misma decisión.

## Eliminados por redundancia o falta de efecto

- **Configuración del sitio → Título interno (`siteSettings.title`)**: no afectaba ninguna parte pública y el documento ya tiene un nombre fijo en el Studio.
- **Red social → Nombre personalizado (`customPlatformName`)**: solo servía para la vista previa interna; **Texto visible del botón** ya cumple esa función.

## Parecidos, pero necesarios porque hacen cosas distintas

- `isActive` → **¿Mostrar este producto en el sitio?**: controla la visibilidad completa de la ficha.
- `availability` → **¿Se puede comprar o pedir ahora?**: informa disponibilidad comercial sin ocultar la ficha y alimenta `InStock` / `OutOfStock` para buscadores.
- `siteSettings.showCatalogPrices` → control general de precios.
- `catalogItem.showPrice` → control de precio de una ficha concreta; se oculta si no existe precio.
- `origin` → procedencia general.
- `region` → lugar más específico; si repite exactamente la procedencia, Sanity advierte y el frontend evita mostrarlo duplicado.
- `category` → agrupación principal usada por filtros, carta y recomendaciones.
- `subcategory` → etiqueta específica opcional.
- `shortDescription` → texto visible y fallback para metadata.
- `seo.title` / `seo.description` → sobrescrituras opcionales para buscadores; si están vacíos se reutiliza el contenido normal.
- `price` → monto; `currency` → moneda. La moneda se oculta si no hay monto.

## Visibilidad en entidades distintas

Los controles de visibilidad de categoría, producto y enlace social no son duplicados entre sí porque afectan objetos diferentes. Se renombraron como preguntas específicas para que no aparezcan varios campos ambiguos llamados simplemente “Visible”.

## Resultado

Todos los inputs editables restantes tienen al menos un uso real: catálogo, ficha de producto, portada, filtros, recomendaciones, carta impresa, TV, WhatsApp, accesibilidad, SEO/datos estructurados o presentación visual.
