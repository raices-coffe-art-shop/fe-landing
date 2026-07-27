import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { products } from "@/data/site";
import { contactChannels } from "@/data/social";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return {
    title: product ? `${product.name} — Catálogo Raíces` : "Producto — Raíces",
    description: product?.note
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const related = products
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="detail-page catalog-detail-page">
        <section className="detail-hero">
          <div className="detail-hero-pattern" aria-hidden="true" />
          <div className="page-shell detail-hero-grid">
            <div>
              <Link href="/catalogo" className="back-link">← Volver al catálogo</Link>
              <p className="eyebrow light">{product.category} · {product.subcategory}</p>
              <h1>{product.name}</h1>
              <p className="detail-lead">{product.note}</p>
              <a
                className="button button-light"
                href={`${contactChannels.whatsappHref}?text=${encodeURIComponent(`Hola, quisiera consultar por ${product.name}.`)}`}
                target="_blank"
                rel="noreferrer"
              >
                Consultar por WhatsApp
              </a>
            </div>
            <div className="detail-media-duo">
              <img src={product.image} alt={product.name} />
            </div>
          </div>
        </section>

        <section className="page-shell detail-body">
          <aside>
            <p className="eyebrow">Ficha de producto</p>
            <dl>
              <div><dt>Categoría</dt><dd>{product.category}</dd></div>
              <div><dt>Subcategoría</dt><dd>{product.subcategory}</dd></div>
              <div><dt>Procedencia</dt><dd>{product.procedencia}</dd></div>
              {product.price && <div><dt>Precio</dt><dd>S/ {product.price}</dd></div>}
              {product.availability && <div><dt>Disponibilidad</dt><dd>{product.availability}</dd></div>}
              {product.producerOrCreator && <div><dt>Productor o creador</dt><dd>{product.producerOrCreator}</dd></div>}
            </dl>
          </aside>
          <article>
            {product.story && <p>{product.story}</p>}
            {product.process && <p>{product.process}</p>}
            {product.presentations?.length && <p>Presentaciones: {product.presentations.join(", ")}.</p>}
            {product.ingredients?.length && <p>Ingredientes: {product.ingredients.join(", ")}.</p>}
            {product.allergens?.length && <p>Alérgenos: {product.allergens.join(", ")}.</p>}
            {!product.story && <p>Cada ficha del catálogo conserva una procedencia obligatoria y puede ampliarse con historia, proceso, presentaciones, ingredientes y disponibilidad cuando esa información esté confirmada.</p>}
          </article>
        </section>

        {related.length > 0 && (
          <section className="next-story">
            <div className="page-shell">
              <p>Productos relacionados</p>
              {related.map((item) => (
                <Link key={item.slug} href={`/catalogo/${item.slug}`}>
                  <span>{item.subcategory}</span>
                  <h2>{item.name}</h2>
                  <i>↗</i>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
