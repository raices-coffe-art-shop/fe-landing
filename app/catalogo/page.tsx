import { redirect } from "next/navigation";

type CatalogoLegacyPageProps = {
  searchParams: Promise<{ categoria?: string | string[] }>;
};

// Compatibilidad con enlaces y QR antiguos. La sección pública ahora vive en
// /productos-de-origen. Las antiguas rutas de Carta bajo /catalogo también
// permanecen solo como redirecciones hacia /carta, /carta/imprimir y /carta/tv.
export default async function CatalogoLegacyPage({ searchParams }: CatalogoLegacyPageProps) {
  const params = await searchParams;
  const category = Array.isArray(params.categoria) ? params.categoria[0] : params.categoria;
  redirect(category
    ? `/productos-de-origen?categoria=${encodeURIComponent(category)}`
    : "/productos-de-origen");
}
