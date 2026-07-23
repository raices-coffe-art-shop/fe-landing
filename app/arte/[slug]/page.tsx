import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { artShopSlides } from "@/data/art";

export function generateStaticParams() {
  return artShopSlides.map((item) => ({ slug: item.slug }));
}

export default async function ArtShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = artShopSlides.findIndex((item) => item.slug === slug);
  const item = artShopSlides[index];
  if (!item) notFound();

  const nextItem = artShopSlides[(index + 1) % artShopSlides.length];
  const statusLabel = item.status === "pending" ? "Piezas por fotografiar" : "Referencia editorial";

  return (
    <>
      <SiteHeader />
      <main className="detail-page art-detail-page">
        <section className="detail-hero">
          <div className="detail-hero-pattern" aria-hidden="true" />
          <div className="page-shell detail-hero-grid">
            <div>
              <Link href="/#arte" className="back-link">← Volver al Art Shop</Link>
              <p className="eyebrow light">{item.eyebrow}</p>
              <h1>{item.title}</h1>
              <p className="detail-lead">{item.text}</p>
            </div>
            <div className="detail-media-duo">
              {item.status === "pending" ? <span>Fotografía por incorporar</span> : <img src={item.left} alt={item.leftAlt} />}
              {item.status === "pending" ? <span>Fotografía por incorporar</span> : <img src={item.right} alt={item.rightAlt} />}
            </div>
          </div>
        </section>

        <section className="page-shell detail-body">
          <aside>
            <p className="eyebrow">Ficha de pieza</p>
            <dl>
              <div><dt>Capítulo</dt><dd>{item.number}</dd></div>
              <div><dt>Estado</dt><dd>{statusLabel}</dd></div>
              <div><dt>Registro</dt><dd>Autoría, técnica y procedencia por completar</dd></div>
            </dl>
          </aside>
          <article>
            <p>Esta página reserva un espacio propio para que cada capítulo del Art Shop pueda crecer con obra real, fotografía, técnica, procedencia y relato de autoría.</p>
            <p>La información pendiente queda marcada como tal para evitar presentar piezas anónimas o datos inventados antes de la documentación final.</p>
          </article>
        </section>

        <section className="page-shell detail-gallery detail-gallery-two">
          <figure>
            {item.status === "pending" ? <div className="detail-placeholder">Fotografía por incorporar</div> : <img src={item.left} alt={item.leftAlt} />}
            <figcaption><span>01</span>{item.leftAlt}</figcaption>
          </figure>
          <figure>
            {item.status === "pending" ? <div className="detail-placeholder">Fotografía por incorporar</div> : <img src={item.right} alt={item.rightAlt} />}
            <figcaption><span>02</span>{item.rightAlt}</figcaption>
          </figure>
        </section>

        <section className="next-story">
          <div className="page-shell">
            <p>Siguiente capítulo</p>
            <Link href={`/arte/${nextItem.slug}`}>
              <span>Art Shop</span>
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
