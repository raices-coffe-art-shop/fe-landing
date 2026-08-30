import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { people } from "@/data/site";
import { baseOpenGraph } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { NextPersonStory } from "@/components/NextPersonStory";

export function generateStaticParams() {
  return people.map((person) => ({ slug: person.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const person = people.find((item) => item.slug === slug);
  if (!person) {
    return { title: "Persona no encontrada", robots: { index: false } };
  }

  const portrait = person.portraitGallery?.[0];
  return {
    title: `${person.name} — ${person.role}`,
    description: person.summary,
    alternates: { canonical: `/personas/${person.slug}` },
    openGraph: {
      ...baseOpenGraph,
      url: `/personas/${person.slug}`,
      title: `${person.name} — ${person.role}`,
      description: person.summary,
      ...(portrait?.src ? { images: [{ url: portrait.src, alt: portrait.alt }] } : {}),
    },
  };
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
              {person.portraitGallery?.[0]?.src ? (
                <img src={person.portraitGallery[0].src} alt={person.portraitGallery[0].alt} />
              ) : (
                <>
                  <span className="portrait-sun" />
                  <span className="portrait-mountain one" />
                  <span className="portrait-mountain two" />
                  <span className="portrait-body" />
                  <strong>{person.initials}</strong>
                </>
              )}
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
          </aside>

          <article>
            <p className="lead-story">{person.summary}</p>
            {person.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="story-principle">
              <span>Relación con Raíces</span>
              <p>Esta historia se publica con información reconocida por el proyecto y puede ampliarse con nuevos registros autorizados.</p>
            </div>
          </article>
        </section>

        <section className="person-gallery page-shell">
          {(person.portraitGallery ?? []).map((photo, index) => (
            <figure key={photo.src} className={index === 0 ? "gallery-placeholder wide" : "gallery-placeholder"}>
              <img src={photo.src} alt={photo.alt} />
              <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
            </figure>
          ))}
        </section>

        <NextPersonStory
          person={{
            slug: nextPerson.slug,
            name: nextPerson.name,
            category: nextPerson.category,
            image: nextPerson.portraitGallery?.[0],
          }}
        />
      </main>
      <Footer />
    </>
  );
}
