"use client";

import { useEffect, useRef, useState } from "react";
import { EditorialImage } from "./EditorialImage";
import { documentaryStops } from "@/data/documentary";

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
        <p className="eyebrow light">Cuaderno de campo</p>
        <h2>Antes de contar una historia, Raíces va, pregunta y escucha.</h2>
        <p>Las visitas permiten conocer cultivos, talleres, alimentos, familias y formas de trabajo. Este cuaderno reúne imágenes y apuntes de esos encuentros antes de convertirlos en una historia pública.</p>
      </div>

      <div className="journey-layout page-shell">
        <div className="journey-visual" aria-live="polite">
          {documentaryStops.map((stage, index) => (
            <div key={stage.id} className={`journey-image ${active === index ? "is-active" : ""}`}>
              {stage.coverImage ? (
                <EditorialImage src={stage.coverImage} alt={`${stage.title}: paisaje documental de referencia`} />
              ) : (
                <div className="journey-image-placeholder"><span>{stage.title}</span></div>
              )}
            </div>
          ))}
          <div className="journey-photo-strip" aria-hidden="true">
            {documentaryStops.map((stage, index) => (
              <span key={stage.id} className={active === index ? "is-active" : ""}>
                {stage.coverImage ? <img src={stage.coverImage} alt="" loading="lazy" decoding="async" /> : <i />}
              </span>
            ))}
          </div>
          <div className="journey-counter"><span>0{active + 1}</span><i /><span>0{documentaryStops.length}</span></div>
        </div>

        <div className="journey-stages">
          {documentaryStops.map((stage, index) => (
            <article
              key={stage.id}
              ref={(node) => { refs.current[index] = node; }}
              data-index={index}
              className={`journey-stage ${active === index ? "is-active" : ""}`}
            >
              <div className="stage-top"><span>{String(stage.order).padStart(2, "0")}</span><span>{stage.productOrCraft}</span></div>
              <h3>{stage.title}</h3>
              <p>{stage.summary}</p>
              <small>{stage.location ?? "Ayacucho"} · registro de campo</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
