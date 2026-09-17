# Relación de archivos modificados — entrega Francisco — 17/09/2026

Este documento enumera los cambios efectuados sobre el ZIP original `project(2).zip`. Sirve para distinguir esta entrega de cambios anteriores del proyecto.

## Frontend público

- `app/productos-de-origen/page.tsx`
  - Inserta la lista oficial antes de los boxes.
  - Mantiene los boxes como segunda vista del mismo conjunto de datos.
- `components/OriginOfficialList.tsx` **(nuevo)**
  - Tabla agrupada por categoría con producto/detalle, presentación y precio/Consultar.
- `app/globals.css`
  - Estilos de la lista oficial y placeholder seguro de QR.
- `components/CatalogPreview.tsx`
  - Corrige el texto del Home para que Productos de Origen no incluya pinturas/piezas de arte.
- `app/galeria-de-arte/page.tsx`
  - Sustituye la narrativa anterior de Galería por Cerámica Tradicional de Quinua y el lote Torito/Iglesia/Retablo.
- `components/CulturalSplitShowcase.tsx`
  - El preview de Galería en Home consume `artItem` reales y enlaza a las fichas de Galería.
- `app/page.tsx`
  - Carga `artItem`/`artCategory` y conecta el Home al dominio de Galería.
- `data/art.ts`
  - Fallback local de Galería actualizado a Torito, Iglesia y Retablo.
- `data/catalogFallback.ts`
  - Fallback de Productos de Origen alineado con el lote Francisco; Galería mantiene fallback separado para compatibilidad.
- `components/LinksHub.tsx`
  - Corrige respaldos QR por plataforma.
  - Evita mostrar un QR estático incorrecto cuando no hay respaldo confiable.
  - WhatsApp genera QR desde el `href` real por existir una discrepancia de número entre fuentes previas.

## Datos y migración

- `scripts/francisco-productos-origen-2026-09.json` **(nuevo)**
  - 5 categorías y 20 productos.
- `scripts/francisco-galeria-arte-2026-09.json` **(nuevo)**
  - 1 categoría y 3 piezas.
- `scripts/update-francisco-2026-09.mjs` **(nuevo)**
  - Dry-run y migración idempotente del lote.
  - Oculta contenido anterior sin borrarlo.
  - No escribe sobre Carta.
- `scripts/verify-francisco-2026-09.mjs` **(nuevo)**
  - Comprueba el conjunto activo esperado después de migrar.
- `scripts/audit-francisco-static.mjs` **(nuevo)**
  - Auditoría local de alcance, aislamiento, placeholders, QRs y archivos.
- `package.json`
  - Añade `francisco:update:dry`, `francisco:update`, `francisco:verify` y `francisco:audit:static`.

## Imágenes

Nueva carpeta `public/media/francisco-2026-09/`:

- `cafe-de-origen.jpg`
- `chocolates-en-barra.jpg`
- `mermelada-jalea-cacao.jpg`
- `polvo-nibs-cacao.jpg`
- `miel-polen.jpg`
- `quesos-artesanales.jpg`
- `panaderia-tradicional-referencial.webp`
- `torito-de-quinua.jpg`
- `iglesia-de-quinua.jpg`
- `retablo-tradicional.jpg`

La imagen de Panadería es una fotografía documental ya existente en el proyecto (`karen-02.webp`), reutilizada porque Francisco no entregó una imagen específica para esa categoría.

## QRs

- `entrega/qr/` **(nuevo)**
  - 15 PNG individuales de gran tamaño.
  - `QR_Raices_hoja_completa.png`.
  - `QR_MANIFIESTO.json` con destinos exactos.
- `scripts/generate-delivery-qrs.py` **(nuevo)**
  - Generador reproducible del paquete QR.
- `public/qr-codes/*.svg`
  - Regenerados/añadidos los respaldos correspondientes a destinos confirmados.
  - Se conservan archivos legacy que no forman parte de esta nueva entrega cuando sirven a compatibilidad histórica.

## Evidencia y control

- `docs/evidencia-francisco-2026-09-17/` **(nuevo)**: PDFs, capturas y fotos fuente.
- `docs/REQUERIMIENTOS_Y_DEFENSA_FRANCISCO_2026-09-17.md` **(nuevo)**.
- `docs/AUDITORIA_TECNICA_ENTREGA_2026-09-17.md` **(nuevo)**.
- `docs/CAMBIOS_ARCHIVOS_ENTREGA_2026-09-17.md` **(nuevo)**.
- `ENTREGA_FRANCISCO_2026-09-17.md` **(nuevo)**.
- `entrega/VALIDACION_FINAL.txt` **(nuevo)**.
- `VALIDAR_ENTREGA_FRANCISCO.bat` **(nuevo)**.
- `APLICAR_ENTREGA_FRANCISCO.bat` **(nuevo)**.

## Archivos que deliberadamente NO se modificaron por este pedido

- Modelos y contenido de Carta (`menuItem`, `menuCategory`).
- Orden del Hero, porque ya coincidía con la reunión.
- Orden del menú, porque ya coincidía con la reunión.
- Rutas de compatibilidad `/catalogo` y `/arte`, salvo que la auditoría confirma que siguen redirigiendo a los destinos actuales.
- Historia general/fundadores donde Lized aparece como parte de la historia del negocio; el reemplazo confirmado aplica al dominio Galería de Arte, no a borrar su presencia histórica del sitio.
