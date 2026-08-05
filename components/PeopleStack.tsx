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
  const [previousPhoto, setPreviousPhoto] = useState<number | null>(null);
  const [nearViewport, setNearViewport] = useState(priority);
  const figureRef = useRef<HTMLElement>(null);
  const clearPreviousTimerRef = useRef(0);

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
    setPreviousPhoto(null);
  }, [gallery]);

  const showPhoto = (next: number) => {
    setActivePhoto((current) => {
      if (current === next) return current;
      setPreviousPhoto(current);
      window.clearTimeout(clearPreviousTimerRef.current);
      clearPreviousTimerRef.current = window.setTimeout(() => setPreviousPhoto(null), 760);
      return next;
    });
  };

  useEffect(() => {
    if (!nearViewport || gallery.length < 2) return;
    const nextIndex = (activePhoto + 1) % gallery.length;
    const preload = new window.Image();
    preload.src = gallery[nextIndex].src;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      showPhoto((activePhoto + 1) % gallery.length);
    }, PERSON_CARD_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [activePhoto, gallery, nearViewport]);

  useEffect(() => () => window.clearTimeout(clearPreviousTimerRef.current), []);

  if (gallery.length) {
    const visibleIndexes = previousPhoto === null || previousPhoto === activePhoto
      ? [activePhoto]
      : [previousPhoto, activePhoto];

    return (
      <figure ref={figureRef} className={`stack-portrait stack-photo tone-${tone}`}>
        <div className="stack-photo-frame">
          {visibleIndexes.map((index) => {
            const photo = gallery[index];
            return (
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
            );
          })}
        </div>
        {gallery.length > 1 && (
          <div className="stack-photo-dots" aria-label={`Fotografía ${activePhoto + 1} de ${gallery.length}`}>
            {gallery.map((photo, index) => (
              <button
                key={`${photo.src}-dot`}
                type="button"
                className={index === activePhoto ? "is-active" : ""}
                aria-label={`Mostrar fotografía ${index + 1}`}
                onClick={() => showPhoto(index)}
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
  const lastValuesRef = useRef<Array<{ scale: number; dim: number }>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    let frame = 0;
    let active = false;

    const resetCards = () => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        card.style.setProperty("--stack-scale", "1");
        card.style.setProperty("--stack-dim", "0");
        lastValuesRef.current[index] = { scale: 1, dim: 0 };
      });
    };

    const update = () => {
      frame = 0;
      if (!active) return;
      if (reducedQuery.matches || mobileQuery.matches) {
        resetCards();
        return;
      }

      const cardRects = cardsRef.current.map((card) => card?.getBoundingClientRect() ?? null);
      const wrapperRects = wrappersRef.current.map((wrapper) => wrapper?.getBoundingClientRect() ?? null);

      cardsRef.current.forEach((card, index) => {
        const rect = cardRects[index];
        if (!card || !rect) return;
        const nextTop = wrapperRects[index + 1]?.top;
        let scale = 1;
        let dim = 0;
        if (typeof nextTop === "number") {
          const threshold = 116 + index * 14 + rect.height * 0.52;
          const influence = clamp((threshold - nextTop) / Math.max(1, rect.height * 0.62));
          scale = 1 - influence * 0.055;
          dim = influence * 0.18;
        }
        const previous = lastValuesRef.current[index];
        if (!previous || Math.abs(previous.scale - scale) > 0.0008) {
          card.style.setProperty("--stack-scale", scale.toFixed(4));
        }
        if (!previous || Math.abs(previous.dim - dim) > 0.0008) {
          card.style.setProperty("--stack-dim", dim.toFixed(4));
        }
        lastValuesRef.current[index] = { scale, dim };
      });

      const focusLine = window.innerHeight * 0.22;
      const activeCard = cardRects.reduce(
        (best, rect, index) => {
          if (!rect) return best;
          const containsFocus = rect.top <= focusLine && rect.bottom >= focusLine;
          if (containsFocus) return !best.containsFocus || index > best.index ? { index, score: 0, containsFocus } : best;
          const focusDistance = Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
          const centerDistance = Math.abs(rect.top + rect.height * 0.35 - focusLine);
          const score = focusDistance * 1.8 + centerDistance * 0.2;
          return !best.containsFocus && score < best.score ? { index, score, containsFocus } : best;
        },
        { index: 0, score: Number.POSITIVE_INFINITY, containsFocus: false },
      );
      section.dataset.activeTone = people[activeCard.index]?.portraitTone ?? "green";
    };

    const requestUpdate = () => {
      if (!active) return;
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) requestUpdate();
      },
      { rootMargin: "45% 0px 45% 0px" },
    );
    observer.observe(section);

    const onModeChange = () => {
      resetCards();
      requestUpdate();
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    mobileQuery.addEventListener("change", onModeChange);
    reducedQuery.addEventListener("change", onModeChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      mobileQuery.removeEventListener("change", onModeChange);
      reducedQuery.removeEventListener("change", onModeChange);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="people-stack-section" id="personas" data-active-tone="green">
      <div className="page-shell people-stack-intro">
        <div><p className="eyebrow">Personas antes que productos</p><h2>Las personas detrás de Raíces</h2></div>
        <p>Detrás de cada producto hay una persona, una familia y una forma de trabajo. Esta sección reúne a quienes cultivan, producen, transforman o hacen posible lo que llega a Raíces.</p>
      </div>

      <div className="people-stack page-shell">
        {people.map((person, index) => (
          <div className="stack-card-slot" key={person.slug} ref={(element) => { wrappersRef.current[index] = element; }}>
            <article
              ref={(element) => { cardsRef.current[index] = element; }}
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
