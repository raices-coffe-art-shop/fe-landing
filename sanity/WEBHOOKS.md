# Webhook de revalidación

La aplicación expone `POST /api/revalidate` y valida la firma de Sanity con `SANITY_REVALIDATE_SECRET`.

## Variables necesarias

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_REVALIDATE_SECRET=...
```

`SANITY_REVALIDATE_SECRET` debe tener el mismo valor en Vercel y en el webhook de Sanity. Nunca debe llevar el prefijo `NEXT_PUBLIC_`.

## Configuración en Sanity Manage

- URL: `https://DOMINIO/api/revalidate`
- Dataset: `production`
- Método: `POST`
- Filtro:

```groq
_type in ["siteSettings", "menuCategory", "menuItem", "catalogCategory", "catalogItem", "artCategory", "artItem", "post"]
```

- Proyección:

```groq
{
  "_type": coalesce(after()._type, before()._type),
  "slug": coalesce(after().slug.current, before().slug.current),
  "previousSlug": before().slug.current
}
```

- Triggers: Create, Update y Delete
- Drafts: desactivado
- Versions: desactivado
- Secret: el mismo valor de `SANITY_REVALIDATE_SECRET`

## Qué revalida cada apartado

- `menuItem` / `menuCategory`: `/carta`, `/carta/imprimir` y `/carta/tv`.
- `catalogItem` / `catalogCategory`: `/productos-de-origen` y sus fichas.
- `artItem` / `artCategory`: `/galeria-de-arte` y sus fichas.
- `post`: `/publicaciones` y la publicación correspondiente.
- `siteSettings`: superficies generales del sitio.

## Respuestas esperadas

- Petición firmada válida: `200`
- Petición manual sin firma: `401`
- Secreto ausente en el servidor: `500`
- Tipo de documento no administrado: `200` con `revalidated: false`
