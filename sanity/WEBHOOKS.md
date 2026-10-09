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
_type in ["siteSettings", "screenSettings", "menuCategory", "menuItem", "catalogCategory", "catalogItem", "artCategory", "artItem", "post"]
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
- `screenSettings`: pantalla del local (`/carta/tv`), incluidas las fotos de «Nuestros productos» y «Nuestra historia».

## Respuestas esperadas

- Petición firmada válida: `200`
- Petición manual sin firma: `401`
- Secreto ausente en el servidor: `500`
- Tipo de documento no administrado: `200` con `revalidated: false`

Una petición firmada válida devuelve tambien los `tags` y `paths` que el
endpoint intento invalidar. Esa respuesta sirve para cruzar el historial del
webhook de Sanity con los logs de Vercel sin exponer secretos.

## Diagnostico cold cache vs warm cache

Un primer cambio visible rapidamente despues de un deploy no demuestra por si
solo que el webhook este funcionando. Puede ocurrir porque la pagina todavia no
tenia una entrada cacheada y la primera lectura fue fresca contra Sanity. Desde
esa primera lectura, los fetches con `next.revalidate: 300` pueden dejar la
entrada cacheada durante cinco minutos si la revalidacion on-demand no la rompe.

Para distinguir los casos, revisar cada evento de Sanity por separado:

```text
Publish en Sanity
POST /api/revalidate enviado si/no
HTTP status
response body
_type recibido
tags devueltos
paths devueltos
tiempo hasta que el cambio aparece en produccion
```

Interpretacion:

- Si un cambio aparece rapido y ese mismo evento tiene `200`, `revalidated: true`
  y los tags esperados, el webhook probablemente funciono para ese evento.
- Si un cambio aparece rapido pero no hay POST valido, probablemente fue lectura
  fresca por cache fria.
- Si los cambios posteriores tardan cerca de `300 s` y no tienen POST valido, la
  cache quedo poblada y la revalidacion on-demand no esta llegando o esta
  fallando.
- Si hay POST valido con `revalidated: true`, pero los cambios tardan `300 s`,
  comparar los `tags`/`paths` devueltos con los tags de los fetches.

## Prueba controlada despues de deploy

### Variante A: calentar cache antes de publicar

1. Desplegar y esperar a que produccion este lista.
2. Abrir una vez la pagina afectada para poblar la cache.
3. Publicar CAMBIO A en Sanity y registrar la hora.
4. Revisar el evento del webhook: status, body, `tags`, `paths`.
5. Medir segundos hasta verlo en `https://raicescoffeeart.com`.
6. Publicar CAMBIO B inmediatamente y repetir la medicion.
7. Publicar CAMBIO C y repetir la medicion.

### Variante B: publicar antes de visitar

1. Desplegar y esperar a que produccion este lista.
2. No abrir la pagina afectada.
3. Publicar CAMBIO A en Sanity y registrar la hora.
4. Abrir produccion y medir si el cambio aparece en la primera lectura.
5. Revisar si existio POST valido para ese evento.
6. Publicar CAMBIO B y CAMBIO C con la pagina ya visitada.

Si CAMBIO A aparece rapido sin POST valido, pero CAMBIO B/C tardan cerca de
`300 s`, hay evidencia fuerte de cache fria seguida de cache caliente sin
revalidacion on-demand efectiva.
