# Raíces — Café y Cultura

Landing narrativa desarrollada con Next.js App Router y TypeScript.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Compilar

```bash
npm run build
npm start
```

## Contenido pendiente antes de publicar

- Reemplazar el número de WhatsApp `51999999999`.
- Confirmar dirección, horarios e Instagram.
- Incorporar fotografías reales del local, Ayacucho, productos y productores.
- Validar directamente con Pedro Ñahui la historia oral sobre sus inicios y las prácticas ambientales.
- Obtener nombre, entrevista y autorización de imagen del apicultor, productor de quesos y artista.
- Sustituir las fotografías editoriales de referencia de Unsplash por material propio cuando esté disponible.

## Estructura relevante

- `app/page.tsx`: landing principal.
- `app/personas/[slug]/page.tsx`: páginas individuales de cada protagonista.
- `data/site.ts`: historias y catálogo provisional.
- `components/PeopleMasonry.tsx`: grilla tipo masonry con inclinación suave.
- `components/OriginJourney.tsx`: recorrido sticky de café, miel, cacao y arte.
- `components/CulturalMap.tsx`: mapa narrativo Ayacucho–Lima.

## Decisiones de diseño

- El sitio no se organiza como diapositivas de pantalla completa.
- La línea orgánica conecta las secciones sin dominar la interfaz.
- El hero usa AYACUCHO como una ventana fotográfica, no como un título decorativo aislado.
- Las personas tienen páginas propias y los datos no confirmados permanecen claramente marcados.
- El catálogo es visual y conduce a WhatsApp; no incluye carrito en esta fase.

## Si npm intenta usar un registro interno o corporativo

Este proyecto incluye un archivo `.npmrc` que fuerza el registro público oficial:

```text
registry=https://registry.npmjs.org/
```

Si tu equipo conserva otra configuración global, ejecuta:

```bash
npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/
npm cache verify
npm install
npm run dev
```
