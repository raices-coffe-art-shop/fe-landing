import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { SimplePortableText } from "@/components/SimplePortableText";
import { CatalogProductGallery } from "@/components/CatalogProductGallery";
import { ArtRelatedItems } from "@/components/ArtRelatedItems";
import { contactChannels } from "@/data/social";
import { getArtItemBySlug, getRelatedArtItems } from "@/sanity/lib/art";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { buildCatalogInquiryHref } from "@/sanity/lib/inquiry";
import { getPrimarySocialHref, getSiteSettings } from "@/sanity/lib/siteSettings";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/structuredData";
import { absoluteUrl } from "@/lib/siteUrl";
import { baseOpenGraph } from "@/lib/seo";

type ArtPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArtPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getArtItemBySlug(slug);
  if (!item) return { title: "Pieza no encontrada", robots: { index: false } };

  return {
    title: `${item.title} — Galería de Arte`,
    description: item.shortDescription,
    alternates: { canonical: `/galeria-de-arte/${item.slug}` },
    openGraph: {
      ...baseOpenGraph,
      url: `/galeria-de-arte/${item.slug}`,
      title: `${item.title} — Galería de Arte`,
      description: item.shortDescription,
      images: [{ url: item.mainImage.src, alt: item.mainImage.alt }],
    },
  };
}

export default async function ArtItemPage({ params }: ArtPageProps) {
  const { slug } = await params;
  const item = await getArtItemBySlug(slug);
  if (!item) notFound();

  const [related, settings] = await Promise.all([
    getRelatedArtItems(item.category.id, item.slug),
    getSiteSettings(),
  ]);
  const contactHref = getPrimarySocialHref(settings, "whatsapp", contactChannels.whatsappHref);
  const inquiryHref = buildCatalogInquiryHref(contactHref, item);
  const formattedPrice = formatCatalogPrice(item);
  const displayPrice = formattedPrice && shouldDisplayCatalogPrice(item, settings.showCatalogPrices);

  return (
    <>
      <JsonLd data={productJsonLd(item, settings.showCatalogPrices, "/galeria-de-arte")} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Inicio", url: absoluteUrl("/") },
        { name: "Galería de Arte", url: absoluteUrl("/galeria-de-arte") },
        { name: item.title, url: absoluteUrl(`/galeria-de-arte/${item.slug}`) },
      ])} />
      <SiteHeader />
      <main className="detail-page catalog-detail-page art-item-detail-page">
        <section className="detail-hero catalog-detail-hero">
          <div className="detail-hero-pattern" aria-hidden="true" />
          <div className="page-shell detail-hero-grid catalog-detail-grid">
            <div className="catalog-detail-copy">
              <Link href="/galeria-de-arte" className="back-link">← Volver a Galería de Arte</Link>
              <p className="eyebrow light">{item.category.title}{item.subcategory ? ` · ${item.subcategory}` : ""}</p>
              <h1>{item.title}</h1>
              <p className="detail-lead">{item.shortDescription}</p>
              {displayPrice && <p className="catalog-detail-price"><span>Precio</span><strong>{formattedPrice}</strong></p>}
              <div className="catalog-detail-actions">
                <a className="button button-light" href={inquiryHref} target="_blank" rel="noreferrer">Consultar</a>
                <span>{item.origin}</span>
              </div>
            </div>
            <CatalogProductGallery title={item.title} origin={item.origin} mainImage={item.mainImage} gallery={item.gallery} />
          </div>
        </section>

        <section className="page-shell detail-body catalog-detail-body">
          <aside>
            <p className="eyebrow">Ficha de pieza</p>
            <dl>
              <div><dt>Categoría</dt><dd>{item.category.title}</dd></div>
              {item.subcategory && <div><dt>Subcategoría</dt><dd>{item.subcategory}</dd></div>}
              <div><dt>Procedencia</dt><dd>{item.origin}</dd></div>
              {displayPrice && <div><dt>Precio</dt><dd><strong>{formattedPrice}</strong></dd></div>}
              {typeof item.availability === "boolean" && <div><dt>Disponible para comprar</dt><dd>{item.availability ? "Sí" : "No"}</dd></div>}
              {item.producerOrCreator && <div><dt>Artista o creador</dt><dd>{item.producerOrCreator}</dd></div>}
            </dl>
          </aside>
          <article>
            {item.description.length > 0 ? <SimplePortableText value={item.description} /> : <p>{item.shortDescription}</p>}
          </article>
        </section>

        <ArtRelatedItems items={related} />
      </main>
      <Footer />
    </>
  );
}
