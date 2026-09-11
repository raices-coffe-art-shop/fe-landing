import { redirect } from "next/navigation";
import { getLegacyCatalogDestinationBySlug } from "@/sanity/lib/catalog";
import { getArtItemBySlug } from "@/sanity/lib/art";

type CatalogoLegacyProductPageProps = {
  params: Promise<{ slug: string }>;
};

// Conserva enlaces antiguos compartidos por WhatsApp, QR o buscadores. Después
// de separar el catálogo histórico, cada slug se manda a su sección real.
export default async function CatalogoLegacyProductPage({ params }: CatalogoLegacyProductPageProps) {
  const { slug } = await params;
  if (slug === "manualidades") redirect("/galeria-de-arte");

  const destination = await getLegacyCatalogDestinationBySlug(slug);
  if (destination === "carta") redirect("/carta");
  if (destination === "galeria-de-arte") {
    const artItem = await getArtItemBySlug(slug);
    redirect(artItem ? `/galeria-de-arte/${artItem.slug}` : "/galeria-de-arte");
  }

  redirect(`/productos-de-origen/${encodeURIComponent(slug)}`);
}
