# Cambio rápido: CON Lized / SIN Lized

Este proyecto está preparado para que el cliente pueda cambiar de opinión sin volver a editar el sitio a mano.

## Estado entregado

**La versión que viene activa en este ZIP es CON Lized.**

Incluye:
- Lized en el Hero junto a Francisco.
- Las fotos de People de Pedro y Dina en sus versiones donde aparece Lized.
- El relato de origen con Francisco Arica y Lized.
- La sección de Arte con los títulos y textos dedicados a Lized.
- La ficha/semilla `Cuadros de Lized`.
- La referencia a Lized como puente/traductora en la historia del café y la revisión de contenido quechua.

Los cambios nuevos de Personas se mantienen en ambos modos: Pedro Ñahui Atao, Fortunato Melgar Rojas, Dina Torres y Karen Córdova/Panadería Kullany.

---

## Cambiar TODO a SIN Lized

Desde la raíz del proyecto:

```cmd
npm run lized:sin
npm run dev
```

Si `npm run dev` ya estaba abierto, detenlo con `Ctrl+C` y vuelve a iniciarlo después de ejecutar el cambio.

El comando cambia de una sola vez textos, metadatos, catálogo/seed y las tres imágenes afectadas. También borra `.next` automáticamente.

## Volver TODO a CON Lized

```cmd
npm run lized:con
npm run dev
```

Igualmente, reinicia el servidor si ya estaba ejecutándose.

---

## Imágenes conservadas

Las seis variantes están guardadas permanentemente en:

`public/media/lized-variants/`

### Hero
- CON Lized: `/media/lized-variants/hero-con-lized.webp`
- SIN Lized: `/media/lized-variants/hero-sin-lized.webp`
- Ruta que usa el sitio: `/hero-principal.webp`

### People — Pedro, foto de campo
- CON Lized: `/media/lized-variants/pedro-campo-con-lized.webp`
- SIN Lized: `/media/lized-variants/pedro-campo-sin-lized.webp`
- Ruta activa: `/media/people/pedro-03.webp`

### People — Dina, visita
- CON Lized: `/media/lized-variants/dina-visita-con-lized.webp`
- SIN Lized: `/media/lized-variants/dina-visita-sin-lized.webp`
- Ruta activa: `/media/people/dina-02.webp`

No borres `public/media/lized-variants/`: es la copia maestra que permite alternar los dos estados.

---

## Textos principales de cada estado

### CON Lized

**Home / Arte**
- Título: `La mirada de Lized también forma parte de la historia de Raíces.`
- Texto: `Los cuadros de Lized ocupan un lugar central dentro del espacio. En ellos aparecen ideas, memorias y una forma personal de acercarse a Ayacucho.`

**/arte**
- Metadata: `La obra de Lized y el lugar del arte dentro de Raíces.`
- Mantiene el texto que explica que la sección comienza con su trabajo.

**Historia / origen humano**
- `Raíces fue creado por Francisco Arica y Lized.`
- Fundadores: `Francisco Arica y Lized`.

**Catálogo**
- Incluye `Cuadros de Lized` / slug `cuadros-lized`.

### SIN Lized

**Home / Arte**
- Título: `El arte también forma parte de la historia de Raíces.`
- El contenido pasa a hablar de pintura, artesanía, memoria, oficios y territorio ayacuchano sin atribuir la sección a Lized.

**/arte**
- Metadata: `Pintura, artesanía y piezas vinculadas con Ayacucho dentro de Raíces.`

**Historia / origen humano**
- El relato queda centrado en Francisco Arica como impulsor de Raíces.

**Catálogo**
- Se elimina `Cuadros de Lized` del fallback y del seed local.

---

## Archivos que cambia automáticamente el script

No es necesario tocarlos manualmente, pero son estos:

- `app/page.tsx`
- `app/arte/page.tsx`
- `app/arte/[slug]/page.tsx`
- `data/art.ts`
- `data/social.ts`
- `data/heroImages.ts`
- `data/peopleMedia.ts`
- `data/catalogFallback.ts`
- `components/CatalogEditor.tsx`
- `messages/qu.json`
- `scripts/catalog-seed.json`
- `scripts/carta-2026-seed.json`
- sus copias duplicadas dentro de `app/` cuando existen
- `public/hero-principal.webp`
- `public/media/people/pedro-03.webp`
- `public/media/people/dina-02.webp`

Los archivos maestros de ambos estados están en `config/lized-states/`. No editarlos salvo que se quiera cambiar permanentemente qué significa cada modo.

---

## Comprobación rápida

Para saber qué estado visual está activo, abre `/arte`:

- Si ves `La mirada de Lized...` → **CON Lized**.
- Si ves `El arte también forma parte...` → **SIN Lized**.

La configuración actual del ZIP es **CON Lized**.
