"use client";

import { useEffect, useRef, useState } from "react";
import { EditorialImage } from "./EditorialImage";

const stages = [
  {
    number: "01",
    name: "Café",
    title: "Una cosecha que conserva el nombre de quien la trabaja.",
    text: "El café ayacuchano abre la conversación sobre territorio, familias productoras y una cadena de valor que debe ser visible.",
    meta: "VRAEM · Pedro Ñahui Atao",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=86"
  },
  {
    number: "02",
    name: "Miel",
    title: "Las colmenas se mueven. El origen también cambia con la floración.",
    text: "La historia del apicultor será documentada desde su práctica: trasladar panales hacia lugares donde las abejas puedan volver a polinizar.",
    meta: "Ayacucho · nombre por confirmar",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1600&q=86"
  },
  {
    number: "03",
    name: "Cacao",
    title: "Aroma, textura y procedencia antes que una descripción genérica.",
    text: "La ficha se completará junto al productor: región, variedad, proceso y relación con Raíces.",
    meta: "Procedencia por documentar",
    image: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=1600&q=86"
  },
  {
    number: "04",
    name: "Arte",
    title: "Una pieza cultural no termina donde empieza la decoración.",
    text: "Cada obra debe mostrar autora o autor, técnica, procedencia y la historia que la convierte en algo más que un objeto.",
    meta: "Art Shop · Ayacucho en Lima",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=86"
  }
];

export function OriginJourney() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.index));
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: "-18% 0px -28% 0px" }
    );
    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="journey section-dark" id="origen">
      <div className="page-shell journey-heading">
        <p className="eyebrow light">Del territorio a la mesa</p>
        <h2>Cuatro productos.<br />Cuatro maneras de contar de dónde venimos.</h2>
      </div>

      <div className="journey-layout page-shell">
        <div className="journey-visual" aria-live="polite">
          {stages.map((stage, index) => (
            <div key={stage.name} className={`journey-image ${active === index ? "is-active" : ""}`}>
              <EditorialImage src={stage.image} alt={`${stage.name}: imagen editorial del producto y su origen`} />
            </div>
          ))}
          <div className="journey-counter"><span>0{active + 1}</span><i /><span>04</span></div>
        </div>

        <div className="journey-stages">
          {stages.map((stage, index) => (
            <article
              key={stage.name}
              ref={(node) => { refs.current[index] = node; }}
              data-index={index}
              className={`journey-stage ${active === index ? "is-active" : ""}`}
            >
              <div className="stage-top"><span>{stage.number}</span><span>{stage.name}</span></div>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
              <small>{stage.meta}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
