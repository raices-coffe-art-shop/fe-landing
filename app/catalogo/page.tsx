import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { CatalogCollection } from "@/components/CatalogCollection";
import { contactChannels } from "@/data/social";
import { getCatalogCategories, getCatalogItems } from "@/sanity/lib/catalog";
import { getPrimarySocialHref, getSiteSettings } from "@/sanity/lib/siteSettings";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "La carta de Raíces: café ayacuchano, cacao, alimentos y arte con nombre, procedencia e historia. Consulta y pide por WhatsApp en Lima.",
  alternates: { canonical: "/catalogo" },
  openGraph: { url: "/catalogo", title: "Catálogo de Raíces — Café y Cultura" },
};

type CatalogoPageProps = {
  searchParams: Promise<{ categoria?: string | string[] }>;
};

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
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
      <SiteHeader />
      <main>
        <section className="catalogo-hero">
          <div className="catalogo-hero-pattern" aria-hidden="true" />
          <div className="page-shell catalogo-hero-grid">
            <div>
              <p className="eyebrow light">Catálogo</p>
              <h1>Productos con nombre, procedencia y una historia detrás.</h1>
            </div>
            <div className="catalogo-hero-aside">
              <p className="catalogo-hero-note">
                Explora cafés, alimentos, postres, pinturas y piezas seleccionadas. Cada ficha registra lo que se conoce con claridad sobre su origen y proceso.
              </p>
              <dl>
                <div><dt>Artículos publicados</dt><dd>{items.length}</dd></div>
                <div><dt>Categorías visibles</dt><dd>{categories.length}</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="catalogo-public-section">
          <div className="page-shell catalogo-public-intro">
            <div>
              <p className="eyebrow">Archivo disponible</p>
              <h2>Filtra por categoría o recorre el catálogo completo.</h2>
            </div>
            <p>La disponibilidad puede variar. El botón Consultar abre el canal oficial configurado en Sanity.</p>
          </div>

          <CatalogCollection
            items={items}
            categories={categories}
            contactHref={contactHref}
            showCatalogPrices={settings.showCatalogPrices}
            variant="full"
            initialCategory={requestedCategory || "todos"}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
