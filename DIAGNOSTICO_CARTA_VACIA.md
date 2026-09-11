# Carta vacía en Sanity Studio — corrección del migrador

## Qué estaba pasando

El inicio de sesión de Sanity CLI sí funcionaba, pero el comando fallaba después con:

`No CLI config found .../sanity.cli.(ts|js)`

El proyecto usa Sanity Studio embebido dentro de Next.js, por lo que hasta ahora solo tenía `sanity.config.ts`. Sin embargo, `sanity exec --with-user-token` y `getCliClient()` necesitan además un archivo `sanity.cli.ts` para conocer el `projectId` y el `dataset`.

## Corrección

Se agregó `sanity.cli.ts` en la raíz con:

- proyecto: `otz8srw5`
- dataset: `production`

El archivo primero intenta usar las variables `NEXT_PUBLIC_SANITY_PROJECT_ID` y `NEXT_PUBLIC_SANITY_DATASET`; los valores anteriores quedan como respaldo para que el comando funcione incluso si Sanity CLI no carga `.env.local`.

## Qué ejecutar

Doble clic en:

`MIGRAR_CARTA_CON_MI_USUARIO_SANITY.bat`

Como ya hiciste `sanity login`, normalmente no debería volver a pedir autenticación.

El proceso hace primero un dry-run. Antes de confirmar deben aparecer las categorías y elementos reales de la Carta. Luego crea `menuCategory` y `menuItem` usando tu sesión autenticada y finalmente vuelve a contar los documentos escritos.

## Resultado esperado

Al final deben mostrarse cantidades mayores que cero:

- `Categorías de la Carta creadas: ...`
- `Elementos de la Carta creados: ...`
- `Referencias de categoría rotas: 0`

Después abre `/studio`, entra a Carta y haz `Ctrl + F5`.

## Seguridad

La migración usa IDs determinísticos y `createOrReplace`, por lo que puede volver a ejecutarse sin duplicar documentos. Los documentos antiguos `catalogItem` y `catalogCategory` no se eliminan.
