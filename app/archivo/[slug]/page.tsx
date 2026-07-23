import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { archiveCategories } from "@/data/documentary";

export function generateStaticParams() {
  return archiveCategories.map((category) => ({ slug: category.id }));
}

export default async function ArchiveCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = archiveCategories.findIndex((item) => item.id === slug);
  const category = archiveCategories[index];
  if (!category) notFound();

  const nextCategory = archiveCategories[(index + 1) % archiveCategories.length];
  const statusLabel = category.status === "confirmed" ? "Material disponible" : "Material por completar";

  return (
    <>
      <SiteHeader />
      <main className="detail-page archive-detail-page">
        <section className="detail-hero">
          <div className="detail-hero-pattern" aria-hidden="true" />
          <div className="page-shell detail-hero-grid">
            <div>
              <Link href="/#archivo" className="back-link">← Volver al archivo</Link>
              <p className="eyebrow light">{statusLabel}</p>
              <h1>{category.title}</h1>
              <p className="detail-lead">{category.summary}</p>
            </div>
            <div className="detail-media-stack">
              {category.media[0]?.src ? (
                <img src={category.media[0].src} alt={category.media[0].alt ?? category.title} />
              ) : (
                <span>Material en edición</span>
              )}
            </div>
          </div>
        </section>

        <section className="page-shell detail-body">
          <aside>
            <p className="eyebrow">Ficha documental</p>
            <dl>
              <div><dt>Categoría</dt><dd>{category.title}</dd></div>
              <div><dt>Estado</dt><dd>{statusLabel}</dd></div>
              <div><dt>Fotografías</dt><dd>{category.media.length ? `${category.media.length} registradas` : "Pendientes"}</dd></div>
            </dl>
          </aside>
          <article>
            <p>Esta página reúne el material documental asociado a {category.title.toLowerCase()} y deja claro qué está disponible y qué todavía debe completarse con fotografías, entrevistas o autorización.</p>
            <p>Cuando el archivo crezca, este espacio podrá alojar notas de campo, pies de foto, rutas de procedencia y vínculos con personas o productos relacionados.</p>
          </article>
        </section>

        <section className="page-shell detail-gallery">
          {category.media.length ? category.media.map((media, mediaIndex) => (
            <figure key={media.id}>
              <img src={media.src} alt={media.alt ?? media.caption} />
              <figcaption><span>{String(mediaIndex + 1).padStart(2, "0")}</span>{media.caption}</figcaption>
            </figure>
          )) : (
            <div className="detail-placeholder">Fotografías por incorporar</div>
          )}
        </section>

        <section className="next-story">
          <div className="page-shell">
            <p>Siguiente archivo</p>
            <Link href={`/archivo/${nextCategory.id}`}>
              <span>Archivo documental</span>
              <h2>{nextCategory.title}</h2>
              <i>↗</i>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
