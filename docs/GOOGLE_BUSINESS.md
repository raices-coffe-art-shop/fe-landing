# Guía: Google Business Profile para Raíces

Esta guía explica cómo crear y vincular el perfil de Google Business (el recuadro que aparece en Google y Google Maps al buscar el negocio) con la página web de Raíces. Está pensada para Francisco y Lized, con los pasos que puede acompañar el equipo técnico.

## ¿Por qué importa?

Cuando alguien busca "café ayacuchano en Lima", "cafetería cerca de mí" o directamente "Raíces café", Google muestra primero los negocios con perfil verificado: ubicación en el mapa, horarios, fotos, reseñas y un botón directo al sitio web y al menú. Sin perfil, el local es invisible en esas búsquedas aunque la web exista.

## 1. Crear o reclamar el perfil

1. Entrar a [business.google.com](https://business.google.com) con la cuenta de Google del negocio (recomendado: `raicescoffeeartshop@gmail.com`, la misma del contacto público).
2. Buscar "Raíces Café y Cultura" por si Google ya generó una ficha automática del local; si existe, elegir **Reclamar este negocio**. Si no, **Agregar tu empresa**.
3. Datos principales:
   - **Nombre**: `Raíces — Café y Cultura` (exactamente igual que en la web).
   - **Categoría principal**: `Cafetería`.
   - **Categorías secundarias**: `Tienda de regalos` y `Galería de arte` (reflejan el catálogo de arte y artesanía).
4. Completar dirección, teléfono y horarios (ver tabla de pendientes abajo).
5. **Verificación**: Google pedirá confirmar que el negocio existe (postal con código, video del local o llamada). Sin este paso el perfil no se publica.

## 2. Mantener el NAP idéntico a la web

NAP = Nombre, Dirección (Address) y Teléfono. Google penaliza inconsistencias: el perfil, la web y las redes deben decir **exactamente lo mismo**. La fuente única en el código es `data/business.ts`; cualquier cambio de datos se hace ahí y en el perfil a la vez.

### Datos pendientes que debe entregar el cliente

| Dato | Estado | Dónde se usa |
|---|---|---|
| Dirección exacta (calle y número) | ❌ Pendiente — hoy solo "Lima, Perú" | Perfil GBP, `data/business.ts`, carta imprimible, datos estructurados |
| Horarios por día (incluidos feriados) | ❌ Pendiente | Perfil GBP, `data/business.ts` |
| Teléfono público confirmado | ⚠️ Se asume el WhatsApp +51 915 123 159 | Perfil GBP, datos estructurados |
| Razón social (opcional) | ❌ Pendiente | Perfil GBP (facturación), datos estructurados |
| URL del place de Google Maps | ❌ Se obtiene al crear el perfil (paso 5) | `data/business.ts` (`mapsPlaceUrl`) y `data/social.ts` (`maps`) |

## 3. Vincular el sitio web y el menú

En el panel del perfil → **Editar perfil**:

- **Sitio web**: la URL del dominio definitivo (la misma que se configure como `NEXT_PUBLIC_SITE_URL` en Vercel).
- **Enlace del menú**: `https://DOMINIO/catalogo` — siempre al dominio propio, nunca a un PDF ni a un tercero. El mismo QR de las mesas apunta ahí.
- **Importante**: los precios que se carguen en el perfil (si se usa el editor de menú de Google) deben coincidir con los de la web. Recomendación: no duplicar el menú en Google; usar solo el enlace, así hay una única fuente de precios que se administra desde Sanity Studio.

La web ya está preparada para esta vinculación: publica datos estructurados de cafetería (nombre, ubicación, teléfono, redes y enlace a la carta) que Google lee automáticamente.

## 4. Fotos recomendadas

Google prioriza perfiles con fotos reales y recientes (mínimo 720×720 px, formato JPG/PNG):

- **Portada**: la fachada/entrada del local (referencia: `public/media/raices/raices-local-entrada.webp`).
- **Interior**: mesas, barra, los cuadros de Lized en pared.
- **Productos**: café servido, pan chapla, miel, retablos — las mismas categorías del catálogo.
- **Equipo**: Francisco y Lized atendiendo (humaniza el perfil).

## 5. Obtener la URL del place

Una vez publicado el perfil:

1. Abrir la ficha del negocio en Google Maps.
2. Botón **Compartir** → copiar el enlace corto (formato `https://maps.app.goo.gl/...`).
3. Entregar ese enlace al equipo técnico para:
   - Rellenar `mapsPlaceUrl` en `data/business.ts` (activa el enlace del mapa en los datos estructurados).
   - Reemplazar el enlace actual de `contactChannels.maps` en `data/social.ts`, que hoy apunta a Street View y no a la ficha del negocio.

## 6. Mantenimiento continuo

- **Responder todas las reseñas**, buenas y malas, con el tono de la marca.
- **Actualizar horarios en feriados** (Google los pregunta antes de cada feriado).
- **Publicar novedades** (productos nuevos, actividades, feria de artesanos) desde el panel: aparecen en la ficha.
- Si cambia un precio en Sanity, la web y el QR se actualizan solos; revisar que el perfil no tenga precios duplicados desactualizados.
