import Link from "next/link";
import { contactChannels } from "@/data/social";
import { getCatalogCategories, getCatalogItems, getFeaturedCatalogItems } from "@/sanity/lib/catalog";
import { getPrimarySocialHref, getSiteSettings } from "@/sanity/lib/siteSettings";
import { CatalogCollection } from "./CatalogCollection";

export async function CatalogPreview() {
  const [featuredItems, allItems, categories, settings] = await Promise.all([
    getFeaturedCatalogItems(),
    getCatalogItems(),
    getCatalogCategories(),
    getSiteSettings(),
  ]);
  const contactHref = getPrimarySocialHref(settings, "whatsapp", contactChannels.whatsappHref);

  // La portada debe mostrar dos filas completas en escritorio. Primero se
  // respetan los productos destacados en Sanity y, si hay menos de seis, se
  // completa la selección con los siguientes productos activos del catálogo.
  const featuredIds = new Set(featuredItems.map((item) => item.id));
  const items = [
    ...featuredItems,
    ...allItems.filter((item) => !featuredIds.has(item.id)),
  ].slice(0, 6);

  const featuredCategorySlugs = new Set(items.map((item) => item.category.slug));
  const featuredCategories = categories.filter((category) => featuredCategorySlugs.has(category.slug));

  return (
    <section className="catalog-section" id="catalogo">
      <div className="catalog-title page-shell">
        <div>
          <p className="eyebrow">Catálogo visual</p>
          <h2>Productos con nombre, procedencia y una historia detrás.</h2>
        </div>
        <div className="catalog-title-side">
          <p>Explora cafés, alimentos, postres, pinturas y piezas seleccionadas. Cada ficha explica qué es, de dónde viene y cómo consultarlo.</p>
          <Link className="catalog-title-cta" href="/catalogo">Ver catálogo completo <span aria-hidden="true">↗</span></Link>
        </div>
      </div>

      <CatalogCollection
        items={items}
        categories={featuredCategories}
        contactHref={contactHref}
        showCatalogPrices={settings.showCatalogPrices}
        variant="preview"
      />

      <div className="catalog-closing page-shell">
        <p>El catálogo cambia con las cosechas, las piezas disponibles y las historias que pueden documentarse con claridad.</p>
        <Link href="/catalogo">Explorar el catálogo completo <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
