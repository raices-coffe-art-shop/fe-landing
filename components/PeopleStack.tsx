"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { people } from "@/data/site";
import { PERSON_CARD_ROTATION_MS, type PersonCardPhoto } from "@/data/peopleMedia";

function Portrait({
  initials,
  tone,
  photos,
  priority = false,
}: {
  initials: string;
  tone: string;
  photos?: PersonCardPhoto[];
  priority?: boolean;
}) {
  const gallery = useMemo(() => photos?.filter((photo) => photo.src) ?? [], [photos]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [readySources, setReadySources] = useState<Set<string>>(() => new Set(gallery[0]?.src ? [gallery[0].src] : []));
  const [nearViewport, setNearViewport] = useState(priority);
  const figureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "45% 0px 45% 0px" },
    );
    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActivePhoto(0);
    setReadySources(new Set(gallery[0]?.src ? [gallery[0].src] : []));
  }, [gallery]);

  const preparePhoto = async (index: number) => {
    const photo = gallery[index];
    if (!photo || readySources.has(photo.src)) return;
    const image = new window.Image();
    image.src = photo.src;
    try { await image.decode(); } catch { /* the mounted img can retry normally */ }
    setReadySources((current) => {
      if (current.has(photo.src)) return current;
      const next = new Set(current);
      next.add(photo.src);
      return next;
    });
  };

  const showPhoto = async (next: number) => {
    await preparePhoto(next);
    setActivePhoto((current) => current === next ? current : next);
  };

  useEffect(() => {
    if (!nearViewport || gallery.length < 2) return;
    const nextIndex = (activePhoto + 1) % gallery.length;
    void preparePhoto(nextIndex);

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      void showPhoto((activePhoto + 1) % gallery.length);
    }, PERSON_CARD_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [activePhoto, gallery, nearViewport]);

  if (gallery.length) {
    return (
      <figure ref={figureRef} className={`stack-portrait stack-photo tone-${tone}`}>
        <div className="stack-photo-frame">
          {gallery.map((photo, index) => readySources.has(photo.src) ? (
            <img
              key={photo.src}
              className={`stack-photo-media ${index === activePhoto ? "is-active" : ""}`}
              src={photo.src}
              alt={photo.alt}
              style={{ objectPosition: photo.position ?? "center" }}
              loading={priority && index === 0 ? "eager" : "lazy"}
              fetchPriority={priority && index === 0 ? "high" : "auto"}
              decoding="async"
            />
          ) : null)}
        </div>
        {gallery.length > 1 && (
          <div className="stack-photo-dots" aria-label={`Fotografía ${activePhoto + 1} de ${gallery.length}`}>
            {gallery.map((photo, index) => (
              <button
                key={`${photo.src}-dot`}
                type="button"
                className={index === activePhoto ? "is-active" : ""}
                aria-label={`Mostrar fotografía ${index + 1}`}
                onClick={() => { void showPhoto(index); }}
              />
            ))}
          </div>
        )}
        <span className="stack-photo-grain" aria-hidden="true" />
      </figure>
    );
  }

  return (
    <div className={`stack-portrait portrait-placeholder tone-${tone}`}>
      <span className="portrait-sun" />
      <span className="portrait-mountain one" />
      <span className="portrait-mountain two" />
      <span className="portrait-body" />
      <strong>{initials}</strong>
    </div>
  );
}

export function PeopleStack() {
  return (
    <section className="people-stack-section" id="personas" data-active-tone="green">
      <div className="page-shell people-stack-intro">
        <div><p className="eyebrow">Personas antes que productos</p><h2>Las personas detrás de Raíces</h2></div>
        <p>Detrás de cada producto hay una persona, una familia y una forma de trabajo. Esta sección reúne a quienes cultivan, producen, transforman o hacen posible lo que llega a Raíces.</p>
      </div>

      <div className="people-stack page-shell">
        {people.map((person, index) => (
          <div className="stack-card-slot" key={person.slug}>
            <article
              className={`stack-person-card stack-tone-${person.portraitTone} ${index % 2 ? "is-reversed" : ""}`}
              style={{ "--stack-top": `${92 + index * 14}px`, zIndex: index + 1 } as CSSProperties}
            >
              <div className="stack-card-shade" aria-hidden="true" />
              <div className="stack-person-copy">
                <div className="stack-card-topline"><span>{String(index + 1).padStart(2, "0")}</span><span>{person.category} · {person.region}</span></div>
                <div><p className="stack-person-role">{person.role}</p><h3>{person.name}</h3><p className="stack-person-summary">{person.summary}</p></div>
                <div className="stack-card-footer"><span>{person.product}</span><Link href={`/personas/${person.slug}`}>Abrir su historia <b>↗</b></Link></div>
              </div>
              <div className="stack-person-visual">
                <Portrait initials={person.initials} tone={person.portraitTone} photos={person.portraitGallery} priority={index === 0} />
                <blockquote>{person.quote ? `“${person.quote}”` : person.product}</blockquote>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
