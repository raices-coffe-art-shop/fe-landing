import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { ArtCollection } from "@/components/ArtCollection";
import { contactChannels } from "@/data/social";
import { getArtCategories, getArtItems } from "@/sanity/lib/art";
import { getPrimarySocialHref, getSiteSettings } from "@/sanity/lib/siteSettings";
import { baseOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Galería de Arte",
  description: "Galería de Arte de Raíces: cerámica tradicional de Quinua y piezas ayacuchanas con procedencia, autoría e historia.",
  alternates: { canonical: "/galeria-de-arte" },
  openGraph: { ...baseOpenGraph, url: "/galeria-de-arte", title: "Galería de Arte — Raíces Café y Cultura" },
};

export default async function GaleriaDeArtePage() {
  const [items, categories, settings] = await Promise.all([
    getArtItems(),
    getArtCategories(),
    getSiteSettings(),
  ]);
  const contactHref = getPrimarySocialHref(settings, "whatsapp", contactChannels.whatsappHref);
  const primaryCategory = categories.find((category) => category.slug === "ceramica-tradicional-de-quinua") || categories[0];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="art-section standalone-art-page" id="galeria-de-arte">
          <div className="art-intro page-shell">
            <div>
              <p className="eyebrow light">Galería de Arte</p>
              <h1>{primaryCategory?.title || "Cerámica Tradicional de Quinua"}</h1>
            </div>
            <div>
              <p>{primaryCategory?.description || "Piezas modeladas en arcilla y cocidas a leña por los maestros del Taller Cerámica Paccha en Quinua, Ayacucho. Arte tutelar que resguarda la memoria, el hogar y las tradiciones andinas."}</p>
              <p>Esta entrega reúne el Torito de Quinua, la Iglesia de Quinua y el Retablo Tradicional, cada uno con su ficha de procedencia, creador, historia y disponibilidad.</p>
            </div>
          </div>
        </section>

        <section className="catalogo-public-section art-catalog-section">
          <div className="page-shell catalogo-public-intro">
            <div>
              <p className="eyebrow">Piezas de la galería</p>
              <h2>Piezas entregadas para esta galería, separadas de Productos de Origen.</h2>
            </div>
            <p>{items.length} {items.length === 1 ? "pieza publicada" : "piezas publicadas"}.</p>
          </div>
          <ArtCollection items={items} categories={categories} contactHref={contactHref} showPrices={settings.showCatalogPrices} />
        </section>
      </main>
      <Footer />
    </>
  );
}
