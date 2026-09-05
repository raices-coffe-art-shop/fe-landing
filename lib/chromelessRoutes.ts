// Rutas que se renderizan sin el "chrome" del sitio: sin preloader y con
// scroll nativo (sin Lenis). Studio administra sus propios paneles; imprimir
// y tv son superficies de kiosco/papel donde ese chrome estorba.
export const CHROMELESS_ROUTE_PREFIXES = ["/studio", "/catalogo/imprimir", "/catalogo/carta", "/catalogo/tv"] as const;

export function isChromelessRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return CHROMELESS_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
