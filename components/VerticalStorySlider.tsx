"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./VerticalStorySlider.module.css";

const stories = [
  {
    number: "I",
    kicker: "El territorio",
    title: <>Una <em>distancia</em><br />que revela el origen.</>,
    note: "Capítulo I · Ayacucho",
    body: "Raíces nace de mirar Ayacucho desde lejos y entender que el origen no desaparece: se vuelve más nítido, más necesario y más fácil de reconocer.",
    left: "/ayacucho-sacsamarca.webp",
    right: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1600&q=86"
  },
  {
    number: "II",
    kicker: "Las manos",
    title: <>Cada <em>oficio</em><br />tiene una voz.</>,
    note: "Capítulo II · Personas",
    body: "Detrás del café, la miel, el queso o una pieza de arte hay una persona, una comunidad y un proceso. La web reserva espacio para nombrarlos sin convertirlos en decoración.",
    left: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=86",
    right: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1600&q=86"
  },
  {
    number: "III",
    kicker: "El encuentro",
    title: <>Una <em>mesa</em><br />entre dos lugares.</>,
    note: "Capítulo III · Lima",
    body: "El local es el punto donde las historias llegan a Lima, se comparten alrededor de una mesa y encuentran nuevas formas de seguir viajando.",
    left: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1800&q=86",
    right: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=86"
  }
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function VerticalStorySlider() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      const nextIndex = Math.round(progress * (stories.length - 1));
      section.style.setProperty("--story-progress", progress.toFixed(4));
      setActive((current) => (current === nextIndex ? current : nextIndex));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const section = sectionRef.current;
    if (!section) return;

    const top = window.scrollY + section.getBoundingClientRect().top;
    const distance = Math.max(1, section.offsetHeight - window.innerHeight);
    const target = top + (distance / (stories.length - 1)) * index;
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  const move = useCallback((direction: number) => {
    const next = clamp(active + direction, 0, stories.length - 1);
    scrollToIndex(next);
  }, [active, scrollToIndex]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Capítulos de Raíces"
      id="capitulos"
    >
      <div className={styles.viewport}>
        <div className={styles.heading}>
          <p className="eyebrow light">Tres capítulos para entender Raíces</p>
          <span>Desliza hacia abajo y la historia avanzará capítulo por capítulo</span>
        </div>

        <div className={styles.slider}>
          {stories.map((story, index) => {
            const state = index === active ? "active" : index < active ? "before" : "after";
            return (
              <article
                key={story.number}
                className={`${styles.slide} ${styles[state]}`}
                aria-hidden={index !== active}
              >
                <div className={styles.leftPanel} style={{ backgroundImage: `url(${story.left})` }}>
                  <div className={styles.leftShade} />
                  <div className={styles.titleBlock}>
                    <span>{story.kicker}</span>
                    <h2>{story.title}</h2>
                    <small>{story.note}</small>
                  </div>
                </div>

                <div className={styles.rightPanel} style={{ backgroundImage: `url(${story.right})` }}>
                  <div className={styles.rightShade} />
                  <p>{story.body}</p>
                </div>
              </article>
            );
          })}

          <div className={styles.controls}>
            <button type="button" onClick={() => move(-1)} aria-label="Capítulo anterior">↑</button>
            <div className={styles.pagination} aria-label="Seleccionar capítulo">
              {stories.map((story, index) => (
                <button
                  type="button"
                  key={story.number}
                  onClick={() => scrollToIndex(index)}
                  className={index === active ? styles.current : ""}
                  aria-label={`Ir al capítulo ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => move(1)} aria-label="Capítulo siguiente">↓</button>
          </div>
        </div>
      </div>
    </section>
  );
}
