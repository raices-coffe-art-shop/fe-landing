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
}: {
  initials: string;
  tone: string;
  photos?: PersonCardPhoto[];
}) {
  const gallery = useMemo(() => photos?.filter((photo) => photo.src) ?? [], [photos]);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    setActivePhoto(0);
    if (gallery.length < 2) return;

    const timer = window.setInterval(() => {
      setActivePhoto((current) => (current + 1) % gallery.length);
    }, PERSON_CARD_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [gallery]);

  if (gallery.length) {
    return (
      <figure className={`stack-portrait stack-photo tone-${tone}`}>
        <div className="stack-photo-frame">
          {gallery.map((photo, index) => (
            <img
              key={`${photo.src}-${index}`}
              className={`stack-photo-media ${index === activePhoto ? "is-active" : ""}`}
              src={photo.src}
              alt={photo.alt}
              style={{ objectPosition: photo.position ?? "center" }}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>
        {gallery.length > 1 && (
          <div className="stack-photo-dots" aria-label={`Fotografía ${activePhoto + 1} de ${gallery.length}`}>
            {gallery.map((photo, index) => (
              <button
                key={`${photo.src}-dot`}
                type="button"
                className={index === activePhoto ? "is-active" : ""}
                aria-label={`Mostrar fotografía ${index + 1}`}
                onClick={() => setActivePhoto(index)}
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

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function PeopleStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrappersRef = useRef<Array<HTMLDivElement | null>>([]);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      const nearViewport = sectionRect.bottom > -window.innerHeight * 0.25 && sectionRect.top < window.innerHeight * 1.35;
      if (!nearViewport) return;

      const mobile = window.innerWidth <= 760;
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        if (reduced || mobile) {
          card.style.setProperty("--stack-scale", "1");
          card.style.setProperty("--stack-dim", "0");
          return;
        }

        const nextWrapper = wrappersRef.current[index + 1];
        if (!nextWrapper) {
          card.style.setProperty("--stack-scale", "1");
          card.style.setProperty("--stack-dim", "0");
          return;
        }

        const nextTop = nextWrapper.getBoundingClientRect().top;
        const cardHeight = card.getBoundingClientRect().height;
        const threshold = 116 + index * 14 + cardHeight * 0.52;
        const influence = clamp((threshold - nextTop) / Math.max(1, cardHeight * 0.62));
        card.style.setProperty("--stack-scale", String(1 - influence * 0.055));
        card.style.setProperty("--stack-dim", String(influence * 0.18));
      });

      const focusLine = window.innerHeight * 0.22;
      const activeCard = cardsRef.current.reduce(
        (best, card, index) => {
          if (!card) return best;
          const rect = card.getBoundingClientRect();
          const containsFocus = rect.top <= focusLine && rect.bottom >= focusLine;
          if (containsFocus) {
            return !best.containsFocus || index > best.index ? { index, score: 0, containsFocus } : best;
          }

          const focusDistance = Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
          const centerDistance = Math.abs(rect.top + rect.height * 0.35 - focusLine);
          const score = focusDistance * 1.8 + centerDistance * 0.2;
          return !best.containsFocus && score < best.score ? { index, score, containsFocus } : best;
        },
        { index: 0, score: Number.POSITIVE_INFINITY, containsFocus: false },
      );
      section.dataset.activeTone = people[activeCard.index]?.portraitTone ?? "green";
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="people-stack-section" id="personas" data-active-tone="green">
      <div className="page-shell people-stack-intro">
        <div>
          <p className="eyebrow">Personas antes que productos</p>
          <h2>Las personas detrás de Raíces</h2>
        </div>
        <p>
          Detrás de cada producto hay una persona, una familia y una forma de trabajo. Esta sección reúne a quienes cultivan, producen, transforman o hacen posible lo que llega a Raíces.
        </p>
      </div>

      <div className="people-stack page-shell">
        {people.map((person, index) => (
          <div
            className="stack-card-slot"
            key={person.slug}
            ref={(element) => { wrappersRef.current[index] = element; }}
          >
            <article
              ref={(element) => { cardsRef.current[index] = element; }}
              className={`stack-person-card stack-tone-${person.portraitTone} ${index % 2 ? "is-reversed" : ""}`}
              style={{ "--stack-top": `${92 + index * 14}px`, zIndex: index + 1 } as CSSProperties}
            >
              <div className="stack-card-shade" aria-hidden="true" />
              <div className="stack-person-copy">
                <div className="stack-card-topline">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{person.category} · {person.region}</span>
                </div>
                <div>
                  <p className="stack-person-role">{person.role}</p>
                  <h3>{person.name}</h3>
                  <p className="stack-person-summary">{person.summary}</p>
                </div>
                <div className="stack-card-footer">
                  <span>{person.product}</span>
                  <Link href={`/personas/${person.slug}`}>Abrir su historia <b>↗</b></Link>
                </div>
              </div>
              <div className="stack-person-visual">
                <Portrait initials={person.initials} tone={person.portraitTone} photos={person.portraitGallery} />
                <blockquote>{person.quote ? `“${person.quote}”` : person.product}</blockquote>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
