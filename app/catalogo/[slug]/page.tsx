import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { SimplePortableText } from "@/components/SimplePortableText";
import { CatalogProductGallery } from "@/components/CatalogProductGallery";
import { CatalogRelatedProducts } from "@/components/CatalogRelatedProducts";
import { contactChannels } from "@/data/social";
import { getCatalogItemBySlug, getRelatedCatalogItems } from "@/sanity/lib/catalog";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { buildCatalogInquiryHref } from "@/sanity/lib/inquiry";
import { getPrimarySocialHref, getSiteSettings } from "@/sanity/lib/siteSettings";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/siteUrl";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogItemBySlug(slug);
  if (!product) {
    return { title: "Producto no encontrado", robots: { index: false } };
  }

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.shortDescription,
    alternates: { canonical: `/catalogo/${product.slug}` },
    openGraph: {
      url: `/catalogo/${product.slug}`,
      title: product.seo?.title || product.title,
      description: product.seo?.description || product.shortDescription,
      images: [{ url: product.mainImage.src, alt: product.mainImage.alt }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogItemBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedCatalogItems(product.category.id, product.slug),
    getSiteSettings(),
  ]);
  const contactHref = getPrimarySocialHref(settings, "whatsapp", contactChannels.whatsappHref);
  const inquiryHref = buildCatalogInquiryHref(contactHref, product);
  const formattedPrice = formatCatalogPrice(product);
  const displayPrice = formattedPrice && shouldDisplayCatalogPrice(product, settings.showCatalogPrices);

  return (
    <>
      <JsonLd data={productJsonLd(product, settings.showCatalogPrices)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Catálogo", url: absoluteUrl("/catalogo") },
          { name: product.title, url: absoluteUrl(`/catalogo/${product.slug}`) },
        ])}
      />
      <SiteHeader />
      <main className="detail-page catalog-detail-page">
        <section className="detail-hero catalog-detail-hero">
          <div className="detail-hero-pattern" aria-hidden="true" />
          <div className="page-shell detail-hero-grid catalog-detail-grid">
            <div className="catalog-detail-copy">
              <Link href="/catalogo" className="back-link">← Volver al catálogo</Link>
              <p className="eyebrow light">{product.category.title}{product.subcategory ? ` · ${product.subcategory}` : ""}</p>
              <h1>{product.title}</h1>
              <p className="detail-lead">{product.shortDescription}</p>
              {displayPrice && (
                <p className="catalog-detail-price">
                  <span>Precio</span>
                  <strong>{formattedPrice}</strong>
                </p>
              )}
              <div className="catalog-detail-actions">
                <a className="button button-light" href={inquiryHref} target="_blank" rel="noreferrer">
                  Consultar
                </a>
                <span>{product.origin}</span>
              </div>
            </div>
            <CatalogProductGallery
              title={product.title}
              origin={product.origin}
              mainImage={product.mainImage}
              gallery={product.gallery}
            />
          </div>
        </section>

        <section className="page-shell detail-body catalog-detail-body">
          <aside>
            <p className="eyebrow">Ficha de producto</p>
            <dl>
              <div><dt>Categoría</dt><dd>{product.category.title}</dd></div>
              {product.subcategory && <div><dt>Subcategoría</dt><dd>{product.subcategory}</dd></div>}
              <div><dt>Procedencia</dt><dd>{product.origin}</dd></div>
              {product.region && <div><dt>Territorio</dt><dd>{product.region}</dd></div>}
              {displayPrice && <div><dt>Precio</dt><dd><strong>{formattedPrice}</strong></dd></div>}
              {product.availability && <div><dt>Disponibilidad</dt><dd>{product.availability}</dd></div>}
              {product.producerOrCreator && <div><dt>Productor o creador</dt><dd>{product.producerOrCreator}</dd></div>}
            </dl>
          </aside>
          <article>
            {product.description.length > 0 ? (
              <SimplePortableText value={product.description} />
            ) : (
              <p>{product.shortDescription}</p>
            )}
            {product.process && <section><h2>Proceso</h2><p>{product.process}</p></section>}
            {product.presentations.length > 0 && <p><strong>Presentaciones:</strong> {product.presentations.join(", ")}.</p>}
            {product.ingredients.length > 0 && <p><strong>Ingredientes:</strong> {product.ingredients.join(", ")}.</p>}
            {product.allergens.length > 0 && <p><strong>Alérgenos:</strong> {product.allergens.join(", ")}.</p>}
            {product.verifiedClaims.length > 0 && <p><strong>Información verificada:</strong> {product.verifiedClaims.join(", ")}.</p>}
          </article>
        </section>

        <CatalogRelatedProducts items={related} />
      </main>
      <Footer />
    </>
  );
}
