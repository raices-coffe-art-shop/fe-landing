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
  description: "Galería de Arte de Raíces: piezas, artesanía, pinturas y obras vinculadas con Ayacucho, con su procedencia y autoría.",
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

  return (
    <>
      <SiteHeader />
      <main>
        <section className="art-section standalone-art-page" id="galeria-de-arte">
          <div className="art-intro page-shell">
            <div>
              <p className="eyebrow light">Galería de Arte</p>
              <h1>La mirada de Lized también forma parte de la historia de Raíces.</h1>
            </div>
            <div>
              <p>Los cuadros de Lized ocupan un lugar central dentro del espacio. En ellos aparecen ideas, memorias y una forma personal de acercarse a Ayacucho.</p>
              <p>La Galería de Arte reúne también toritos, retablos, nacimientos y otras piezas. Cada elemento puede tener su propia ficha con procedencia, autoría, historia y disponibilidad.</p>
            </div>
          </div>
        </section>

        <section className="catalogo-public-section art-catalog-section">
          <div className="page-shell catalogo-public-intro">
            <div>
              <p className="eyebrow">Piezas de la galería</p>
              <h2>Obras y piezas con una ficha propia, separadas de Productos de Origen.</h2>
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
