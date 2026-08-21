# Entrega final: Hero corregido

Base utilizada: la versión más reciente suministrada, conservando su catálogo y el resto de sus funcionalidades.

Se restauró desde la versión donde funcionaba correctamente:

- `components/Hero.tsx`
- `components/Hero.module.css`
- `data/heroImages.ts`
- Las imágenes optimizadas WebP y las fotografías requeridas por el Hero.

El resto del proyecto, incluyendo catálogo, Sanity, páginas y componentes, permanece tomado de la versión más reciente.

También se retiró `tsconfig.tsbuildinfo` del paquete y se añadió `*.tsbuildinfo` al `.gitignore` para evitar que una caché vieja de TypeScript interfiera al copiar la entrega sobre un clon limpio.
