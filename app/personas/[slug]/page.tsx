import Link from "next/link";
import { notFound } from "next/navigation";
import { people } from "@/data/site";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";

export function generateStaticParams() {
  return people.map((person) => ({ slug: person.slug }));
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = people.find((item) => item.slug === slug);
  if (!person) notFound();

  const nextPerson = people[(people.findIndex((item) => item.slug === slug) + 1) % people.length];

  return (
    <>
      <SiteHeader />
      <main className="person-page">
        <section className={`person-hero tone-${person.portraitTone}`}>
          <div className="person-hero-pattern" aria-hidden="true" />
          <div className="page-shell person-hero-grid">
            <div className="person-page-copy">
              <Link href="/#personas" className="back-link">← Volver a las personas</Link>
              <p className="eyebrow light">{person.eyebrow}</p>
              <h1>{person.name}</h1>
              <p className="person-role">{person.role} · {person.region}</p>
              <blockquote>{person.quote}</blockquote>
            </div>
            <div className="large-portrait">
              <span className="portrait-sun" />
              <span className="portrait-mountain one" />
              <span className="portrait-mountain two" />
              <span className="portrait-body" />
              <strong>{person.initials}</strong>
              <small>Retrato documental pendiente</small>
            </div>
          </div>
        </section>

        <section className="person-story page-shell">
          <aside>
            <p className="eyebrow">Ficha de origen</p>
            <dl>
              {person.facts.map((fact) => (
                <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
              ))}
            </dl>
            <div className={`editorial-status ${person.status}`}>
              {person.status === "documentada" ? "Base verificada; entrevista y material visual pendientes." : "Contenido reservado hasta completar entrevista y autorización."}
            </div>
            <div className="editorial-status">
              Entrevista: {person.interviewStatus === "published" ? "publicada" : person.interviewStatus === "edited" ? "en edición" : person.interviewStatus === "recorded" ? "registrada" : "pendiente"}.
              Audio, video, transcripción y galería se añadirán solo con autorización.
            </div>
          </aside>

          <article>
            <p className="lead-story">{person.summary}</p>
            {person.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="story-principle">
              <span>Principio editorial</span>
              <p>No inventamos detalles para completar una página. La historia crecerá con la voz y autorización de su protagonista.</p>
            </div>
          </article>
        </section>

        <section className="person-gallery page-shell">
          <div className="gallery-placeholder wide"><span>01</span><p>Retrato en su entorno</p></div>
          <div className="gallery-placeholder"><span>02</span><p>Manos y proceso</p></div>
          <div className="gallery-placeholder"><span>03</span><p>Territorio de origen</p></div>
        </section>

        <section className="next-story">
          <div className="page-shell">
            <p>Siguiente historia</p>
            <Link href={`/personas/${nextPerson.slug}`}>
              <span>{nextPerson.category}</span>
              <h2>{nextPerson.name}</h2>
              <i>↗</i>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
