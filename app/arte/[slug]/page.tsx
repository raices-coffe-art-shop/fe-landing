import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { artShopSlides } from "@/data/art";
import { baseOpenGraph } from "@/lib/seo";

export function generateStaticParams() {
  return artShopSlides.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = artShopSlides.find((entry) => entry.slug === slug);
  if (!item) {
    return { title: "Obra no encontrada", robots: { index: false } };
  }

  return {
    title: `${item.eyebrow} — Arte en Raíces`,
    description: item.text,
    alternates: { canonical: `/arte/${item.slug}` },
    openGraph: {
      ...baseOpenGraph,
      url: `/arte/${item.slug}`,
      title: `${item.eyebrow} — Arte en Raíces`,
      description: item.text,
      images: [{ url: item.left, alt: item.leftAlt }],
    },
  };
}

export default async function ArtShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = artShopSlides.findIndex((item) => item.slug === slug);
  const item = artShopSlides[index];
  if (!item) notFound();

  const nextItem = artShopSlides[(index + 1) % artShopSlides.length];
  const statusLabel = item.eyebrow;

  return (
    <>
      <SiteHeader />
      <main className="detail-page art-detail-page">
        <section className="detail-hero">
          <div className="detail-hero-pattern" aria-hidden="true" />
          <div className="page-shell detail-hero-grid">
            <div>
              <Link href="/arte" className="back-link">← Volver a Arte</Link>
              <p className="eyebrow light">{item.eyebrow}</p>
              <h1>{item.title}</h1>
              <p className="detail-lead">{item.text}</p>
            </div>
            <div className="detail-media-duo">
              <img src={item.left} alt={item.leftAlt} />
              <img src={item.right} alt={item.rightAlt} />
            </div>
          </div>
        </section>

        <section className="page-shell detail-body">
          <aside>
            <p className="eyebrow">Ficha de pieza</p>
            <dl>
              <div><dt>Capítulo</dt><dd>{item.number}</dd></div>
              <div><dt>Bloque</dt><dd>{statusLabel}</dd></div>
              <div><dt>Catálogo</dt><dd><Link href={`/catalogo/${item.catalogSlug}`}>Ver ficha vinculada</Link></dd></div>
            </dl>
          </aside>
          <article>
            <p>La sección de arte comienza con el trabajo de Lized y organiza cada obra alrededor de autoría, técnica, proceso, historia y disponibilidad.</p>
            <p>Las obras invitadas podrán aparecer dentro de las fichas de pieza, identificando siempre a su creador.</p>
          </article>
        </section>

        <section className="page-shell detail-gallery detail-gallery-two">
          <figure>
            <img src={item.left} alt={item.leftAlt} />
            <figcaption><span>01</span>{item.leftAlt}</figcaption>
          </figure>
          <figure>
            <img src={item.right} alt={item.rightAlt} />
            <figcaption><span>02</span>{item.rightAlt}</figcaption>
          </figure>
        </section>

        <section className="next-story">
          <div className="page-shell">
            <p>Siguiente capítulo</p>
            <Link href={`/arte/${nextItem.slug}`}>
              <span>Arte en Raíces</span>
              <h2>{nextItem.eyebrow}</h2>
              <i>↗</i>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
