# Raíces — Café y Cultura

Sitio de Raíces desarrollado con Next.js App Router, TypeScript y Sanity Studio.

## Requisitos

- Node.js 20.9 o superior
- npm
- Proyecto de Sanity configurado

## Variables de entorno

Copia `.env.example` como `.env.local` y completa los valores necesarios:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-08-02
SANITY_REVALIDATE_SECRET=
SANITY_API_WRITE_TOKEN=
```

`SANITY_API_WRITE_TOKEN` es privado. No debe llevar `NEXT_PUBLIC_` ni subirse a Git.

## Ejecutar en local

```bash
npm ci
npm run dev
```

Para usar un puerto específico:

```bash
npm run dev -- --port 3002
```

## Rutas públicas principales

- `/` — página principal
- `/carta` — Carta pública
- `/carta/tv` — visor vertical de la Carta para TV
- `/carta/imprimir` — herramienta interna de impresión/PDF
- `/productos-de-origen` — Productos de Origen
- `/productos-de-origen/[slug]` — ficha de un Producto de Origen
- `/galeria-de-arte` — Galería de Arte
- `/galeria-de-arte/[slug]` — ficha de una pieza de arte
- `/links` — hub de enlaces y QR
- `/studio` — Sanity Studio

Las URLs antiguas `/catalogo...` y `/arte...` se conservan únicamente como redirecciones de compatibilidad para enlaces o QR ya compartidos.

## Separación de contenido en Sanity

El Studio tiene tres apartados independientes:

1. **Carta** — `menuItem` y `menuCategory`.
2. **Productos de Origen** — `catalogItem` y `catalogCategory`.
3. **Galería de Arte** — `artItem` y `artCategory`.

No se debe volver a crear arte dentro de `catalogItem`, ni elementos de Carta dentro de Productos de Origen.

### Migración inicial obligatoria

El código mantiene una lectura de compatibilidad para que el sitio no quede vacío al desplegar. Sin embargo, antes de empezar a editar por separado los tres apartados, copia el contenido histórico a los nuevos tipos:

```bash
npm run content:split:dry
npm run content:split
```

El primer comando solo muestra lo que hará. El segundo crea o sincroniza los nuevos documentos **sin borrar los antiguos**. Los originales se conservan completos como respaldo y solo reciben campos internos de migración para dejar de aparecer en la sección equivocada. La migración es idempotente y puede repetirse si una ejecución se interrumpe.

**Orden recomendado:** desplegar el código → ejecutar el dry run → ejecutar la migración real → revisar `/studio` → recién después editar Carta, Productos de Origen y Galería de Arte como contenidos independientes.

Los scripts antiguos `catalog:migrate`, `carta:migrate` y `cartas:migrate` quedan como herramientas históricas. No deben usarse para la administración normal después de esta separación.

## Validación antes de desplegar

```bash
npm run typecheck
npm run build
```

Luego revisar también el webhook indicado en `sanity/WEBHOOKS.md`.

## Estructura principal

- `app/` — rutas y páginas
- `components/` — componentes del sitio
- `data/` — contenido editorial local y respaldos
- `public/` — imágenes, SVG y QR
- `sanity/` — cliente, consultas, schemas y configuración editorial
- `scripts/` — migraciones y utilidades

## Ayuda editorial de Sanity

Los campos del Studio incluyen descripciones en lenguaje no técnico. La configuración del webhook está documentada en `sanity/WEBHOOKS.md` y el checklist de esta reorganización en `CAMBIO_ARQUITECTURA_FINAL.md`.

## Separación final de contenido (Carta / Productos de Origen / Galería de Arte)

Después de actualizar a esta versión, ejecutar una sola vez la migración de contenido existente de Sanity:

```bash
npm run content:split:dry
npm run content:split
npm run content:split:verify
```

En Windows también se puede usar `MIGRAR_CONTENIDO_SANITY.bat`.

La migración **no borra** los documentos antiguos: crea los documentos nuevos, conserva una referencia al original y marca el original para que deje de aparecer en Productos de Origen. Ver `CORRECCIONES_GALERIA_SANITY.md` para el checklist completo.
