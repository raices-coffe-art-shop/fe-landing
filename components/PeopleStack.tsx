"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { people } from "@/data/site";

function Portrait({ initials, tone }: { initials: string; tone: string }) {
  return (
    <div className={`stack-portrait portrait-placeholder tone-${tone}`}>
      <span className="portrait-sun" />
      <span className="portrait-mountain one" />
      <span className="portrait-mountain two" />
      <span className="portrait-body" />
      <strong>{initials}</strong>
      <small>Retrato por incorporar</small>
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
      if (sectionRef.current) sectionRef.current.dataset.activeTone = people[activeCard.index]?.portraitTone ?? "green";
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
          <h2>El origen tiene rostro,<br />nombre y memoria.</h2>
        </div>
        <p>
          Cada tarjeta abre una historia propia. Las fichas pendientes no se rellenan con frases genéricas: esperan la voz y las fotografías reales de sus protagonistas.
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
                  <span>{person.status === "documentada" ? "Historia base documentada" : "Entrevista pendiente"}</span>
                  <Link href={`/personas/${person.slug}`}>Abrir su historia <b>↗</b></Link>
                </div>
              </div>
              <div className="stack-person-visual">
                <Portrait initials={person.initials} tone={person.portraitTone} />
                <blockquote>“{person.quote}”</blockquote>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
