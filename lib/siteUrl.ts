const FALLBACK_SITE_URL = "http://localhost:3000";

function normalize(candidate: string | undefined): string | null {
  if (!candidate) return null;
  const value = candidate.startsWith("http") ? candidate : `https://${candidate}`;
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
}

// URL pública canónica del sitio. Prioridad: NEXT_PUBLIC_SITE_URL (producción),
// luego la URL que expone Vercel, y localhost como último recurso en local.
export function getSiteUrl(): string {
  return (
    normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalize(process.env.VERCEL_URL) ??
    FALLBACK_SITE_URL
  );
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
