import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { OriginCategoryGrid } from "@/components/OriginCategoryGrid";
import { OriginOfficialList } from "@/components/OriginOfficialList";
import { contactChannels } from "@/data/social";
import { getCatalogCategories, getCatalogItems } from "@/sanity/lib/catalog";
import { getPrimarySocialHref, getSiteSettings } from "@/sanity/lib/siteSettings";
import { JsonLd } from "@/components/JsonLd";
import { productCatalogJsonLd } from "@/lib/structuredData";
import { baseOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Productos de Origen",
  description:
    "Productos de Origen de Raíces: café ayacuchano, cacao, alimentos y productos seleccionados con procedencia e historia. Consulta y pide por WhatsApp en Lima.",
  alternates: { canonical: "/productos-de-origen" },
  openGraph: { ...baseOpenGraph, url: "/productos-de-origen", title: "Productos de Origen de Raíces — Café y Cultura" },
};

type ProductosDeOrigenPageProps = {
  searchParams: Promise<{ categoria?: string | string[] }>;
};

export default async function ProductosDeOrigenPage({ searchParams }: ProductosDeOrigenPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedCategory = Array.isArray(resolvedSearchParams.categoria)
    ? resolvedSearchParams.categoria[0]
    : resolvedSearchParams.categoria;
  const [items, categories, settings] = await Promise.all([
    getCatalogItems(),
    getCatalogCategories(),
    getSiteSettings(),
  ]);
  const contactHref = getPrimarySocialHref(settings, "whatsapp", contactChannels.whatsappHref);

  return (
    <>
      <JsonLd data={productCatalogJsonLd(items, settings.showCatalogPrices)} />
      <SiteHeader />
      <main>
        <section className="catalogo-hero">
          <div className="catalogo-hero-pattern" aria-hidden="true" />
          <div className="page-shell catalogo-hero-grid">
            <div>
              <p className="eyebrow light">Productos de Origen</p>
              <h1>Productos con nombre, procedencia y una historia detrás.</h1>
            </div>
            <div className="catalogo-hero-aside">
              <p className="catalogo-hero-note">
                Explora cafés, alimentos y productos seleccionados. Cada ficha registra lo que se conoce con claridad sobre su origen y proceso.
              </p>
              <dl>
                <div><dt>Artículos publicados</dt><dd>{items.length}</dd></div>
                <div><dt>Categorías visibles</dt><dd>{Math.min(categories.length, 6)}</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="catalogo-public-section">
          <OriginOfficialList
            items={items}
            categories={categories}
            showCatalogPrices={settings.showCatalogPrices}
          />

          <div className="page-shell catalogo-public-intro origin-boxes-intro">
            <div>
              <p className="eyebrow">Productos disponibles</p>
              <h2>Explora cada categoría y consulta por WhatsApp.</h2>
            </div>
          </div>

          <OriginCategoryGrid
            items={items}
            categories={categories}
            contactHref={contactHref}
            showCatalogPrices={settings.showCatalogPrices}
            initialCategory={requestedCategory}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
