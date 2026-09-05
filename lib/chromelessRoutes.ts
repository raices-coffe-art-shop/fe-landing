// Rutas que se renderizan sin el "chrome" del sitio: sin preloader y con
// scroll nativo (sin Lenis). Studio administra sus propios paneles; imprimir
// y tv son superficies de kiosco/papel donde ese chrome estorba.
export const CHROMELESS_ROUTE_PREFIXES = [
  "/studio",
  "/catalogo/imprimir",
  "/catalogo/carta",
  "/catalogo/tv",
  // El prefijo de arriba no cubre esta ruta: la comprobacion exige igualdad o
  // "/catalogo/tv/", y "/catalogo/tv-v2" no cumple ninguna de las dos.
  "/catalogo/tv-v2",
  "/catalogo/tv-v3",
  "/catalogo/tv-v4",
] as const;

export function isChromelessRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return CHROMELESS_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
