# Entrega Francisco — 17/09/2026

Esta versión consolida Productos de Origen, Galería de Arte, auditoría de requerimientos y QRs físicos.

## Qué cambia

- Productos de Origen: 5 categorías y 20 productos según el PDF/mensajes entregados.
- Lista oficial visible antes de los boxes.
- Precios no entregados: `Consultar`.
- Galería de Arte: reemplazo público por Torito de Quinua, Iglesia de Quinua y Retablo Tradicional.
- Home: previews conectados a los dominios correctos; Galería deja de usar la narrativa anterior fija.
- Carta: no se modifica por esta migración.
- QRs físicos: 15 archivos grandes + hoja completa + manifiesto de destinos.

## Antes de subir a producción

```bash
npm ci
npm run typecheck
npm run build
npm run francisco:update:dry
```

Revisar el resultado del dry-run. Si coincide con la entrega:

```bash
npm run francisco:update
npm run francisco:verify
```

Después, desplegar normalmente el proyecto.

## Documentos de control

- `docs/REQUERIMIENTOS_Y_DEFENSA_FRANCISCO_2026-09-17.md`: qué pidió, qué se implementó, qué faltó y cómo responder ante discrepancias.
- `docs/AUDITORIA_TECNICA_ENTREGA_2026-09-17.md`: auditoría técnica, rutas, aislamiento, migración y verificación.
- `docs/evidencia-francisco-2026-09-17/`: capturas, PDFs y fotografías originales de esta entrega.

## QRs

Los archivos están en `entrega/qr/`.

Se incluyeron:

- Sitio web.
- Todos los links (`/links`).
- Carta.
- Productos de Origen.
- Galería de Arte.
- Nuestra Historia.
- Personas.
- Publicaciones.
- Visítanos.
- Google Maps / Cómo llegar.
- WhatsApp vigente detectado en `/links` al auditar el sitio.
- TikTok vigente detectado en `/links` al auditar el sitio.
- Correo electrónico.
- Instagram.
- Facebook.

`QR_Raices_hoja_completa.png` reúne todos en una sola imagen. `QR_MANIFIESTO.json` registra exactamente qué URL codifica cada QR. Los 15 QR individuales fueron decodificados durante la validación y coincidieron con sus destinos.

**Importante:** el WhatsApp publicado en `/links` no coincide con el fallback histórico del código. No se eligió silenciosamente un número nuevo para Sanity; la discrepancia queda documentada y debe confirmarse antes de imprimir ese QR en volumen.

No se generó YouTube porque no existe un enlace oficial de YouTube en los insumos ni en `/links` auditado. Generar uno sin URL confirmada sería inventar un destino.
