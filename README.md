# Raíces — Café y Cultura

Sitio narrativo y catálogo editorial desarrollado con Next.js App Router, TypeScript y Sanity Studio.

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
npm install
npm run dev
```

Para usar un puerto específico:

```bash
npm run dev -- --port 3002
```

Rutas principales:

- `/` — landing narrativa
- `/catalogo` — catálogo completo
- `/links` — hub de enlaces
- `/studio` — Sanity Studio

## Validación

```bash
npm run typecheck
npm run build
```

## Sanity y catálogo

```bash
npm run sanity:verify-read
npm run catalog:migrate:dry
npm run catalog:migrate
npm run sanity:backfill-price-visibility
```

La migración y el backfill no deben ejecutarse repetidamente si el contenido ya existe en Sanity.

## Estructura principal

- `app/` — rutas, layouts, favicon y estilos globales
- `components/` — componentes narrativos y del catálogo
- `data/` — contenido editorial local no administrado por Sanity
- `public/` — fotografías, SVG y recursos públicos
- `sanity/` — cliente, queries, schemas y documentación del webhook
- `scripts/` — migración y utilidades de Sanity

## Favicon

El favicon oficial se encuentra en:

- `app/icon.svg`
- `app/apple-icon.png`

Ambos usan el grano de cacao de Raíces. El navegador puede conservar el favicon anterior en caché; tras cambiarlo, usa una recarga forzada o una ventana privada.
