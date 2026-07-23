"use client";

import { useEffect, useRef } from "react";
import styles from "./HorizontalParallaxGallery.module.css";

const postcards = [
  {
    title: "Sacsamarca",
    subtitle: "Territorio",
    src: "/ayacucho-sacsamarca.jpg",
    size: "large",
    offset: -54,
    speed: .42
  },
  {
    title: "Café de altura",
    subtitle: "Producto",
    src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=86",
    size: "small",
    offset: 58,
    speed: .76
  },
  {
    title: "Oficio",
    subtitle: "Manos",
    src: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=86",
    size: "portrait",
    offset: -32,
    speed: .58
  },
  {
    title: "Miel de floración",
    subtitle: "Temporada",
    src: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=86",
    size: "medium",
    offset: 70,
    speed: .86
  },
  {
    title: "Pintura",
    subtitle: "Arte",
    src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=86",
    size: "large",
    offset: -42,
    speed: .48
  },
  {
    title: "Retablo",
    subtitle: "Memoria",
    src: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=86",
    size: "small",
    offset: 42,
    speed: .95
  },
  {
    title: "Cacao",
    subtitle: "Origen",
    src: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=1200&q=86",
    size: "portrait",
    offset: -64,
    speed: .62
  },
  {
    title: "La mesa",
    subtitle: "Encuentro",
    src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=86",
    size: "medium",
    offset: 54,
    speed: .8
  },
  {
    title: "Selección Raíces",
    subtitle: "Lima",
    src: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=86",
    size: "large",
    offset: -36,
    speed: .54
  }
] as const;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function HorizontalParallaxGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let frame = 0;
    let travel = 0;
    let mobile = false;
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const measure = () => {
      mobile = window.innerWidth <= 760;
      if (mobile || reducedQuery.matches) {
        section.style.removeProperty("height");
        track.style.removeProperty("transform");
        track.querySelectorAll<HTMLElement>("[data-parallax-card]").forEach((card) => {
          card.style.removeProperty("transform");
        });
        return;
      }

      travel = Math.max(0, track.scrollWidth - window.innerWidth + Math.max(80, window.innerWidth * .08));
      section.style.height = `${Math.max(window.innerHeight * 2.05, window.innerHeight + travel * .88)}px`;
    };

    const update = () => {
      frame = 0;
      if (mobile || reducedQuery.matches) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      track.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;

      track.querySelectorAll<HTMLElement>("[data-parallax-card]").forEach((card) => {
        const offset = Number(card.dataset.offset ?? 0);
        const speed = Number(card.dataset.speed ?? .6);
        const y = offset * (0.5 - progress) * speed;
        const rotate = (progress - .5) * (speed - .65) * 2.2;
        card.style.transform = `translate3d(0, ${y}px, 0) rotate(${rotate}deg)`;
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      requestUpdate();
    };

    measure();
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize);
    reducedQuery.addEventListener("change", onResize);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      reducedQuery.removeEventListener("change", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="postales-title">
      <div className={styles.sticky}>
        <div className={styles.intro}>
          <p className="eyebrow">Postales del origen</p>
          <h2 id="postales-title">Un recorrido que se mueve como una memoria.</h2>
          <div className={styles.introBottom}>
            <span>Desciende para recorrer</span>
            <i />
            <span className={styles.mobileHint}>Desliza horizontalmente</span>
          </div>
        </div>

        <div ref={trackRef} className={styles.track}>
          <div className={styles.spacer} aria-hidden="true" />
          {postcards.map((card, index) => (
            <figure
              key={`${card.title}-${index}`}
              className={`${styles.card} ${styles[card.size]}`}
              data-parallax-card
              data-offset={card.offset}
              data-speed={card.speed}
            >
              <div className={styles.frame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.src} alt={`${card.title}, ${card.subtitle.toLowerCase()}`} loading="lazy" />
              </div>
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{card.title}</b><small>{card.subtitle}</small></div>
              </figcaption>
            </figure>
          ))}
          <div className={styles.endCard}>
            <span>Raíces</span>
            <p>Cada imagen debe terminar contando quién, dónde y cómo.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
