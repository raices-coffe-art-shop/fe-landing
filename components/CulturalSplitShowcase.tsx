"use client";

import Link from "next/link";
import { useState } from "react";
import { EditorialImage } from "@/components/EditorialImage";
import { artShopSlides as slides } from "@/data/art";

export function CulturalSplitShowcase() {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  return (
    <div className="cultural-split-showcase page-shell">
      <div className="split-stage" key={slide.number}>
        <div className="split-panel split-panel-left">
          <EditorialImage src={slide.left} alt={slide.leftAlt} />
          <div className="split-panel-copy">
            <span>{slide.number}</span>
            <p>{slide.eyebrow}</p>
            <h3>{slide.title}</h3>
          </div>
        </div>
        <div className="split-panel split-panel-right">
          <EditorialImage src={slide.right} alt={slide.rightAlt} />
          <div className="split-panel-text">
            <p>{slide.text}</p>
            <Link href={`/catalogo/${slide.catalogSlug}`}>Ver en catálogo ↗</Link>
          </div>
        </div>
      </div>

      <div className="split-pagination" role="tablist" aria-label="Bloques de arte en Raíces">
        {slides.map((item, index) => (
          <button
            key={item.number}
            role="tab"
            aria-selected={active === index}
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
          >
            <span className="split-nav-number">{item.number}</span>
            <span className="split-nav-preview" aria-hidden="true">
              <img src={item.left} alt="" loading="lazy" decoding="async" />
              <img src={item.right} alt="" loading="lazy" decoding="async" />
            </span>
            <b>{item.eyebrow}</b>
          </button>
        ))}
      </div>

      <div className="art-mobile-story">
        <div className="art-mobile-sticky">
          <div className="art-mobile-visual" aria-label={`Obra ${slides[0].number}: ${slides[0].eyebrow}`}>
            {slides.map((item, index) => (
              <img
                key={item.number}
                src={item.left}
                alt={item.leftAlt}
                loading="lazy"
                decoding="async"
                className={index === 0 ? "is-active" : ""}
              />
            ))}
            <div className="art-mobile-counter" aria-hidden="true">
              <b>{slides[0].number}</b>
              <span>/ {slides.length.toString().padStart(2, "0")}</span>
            </div>
          </div>

          <div key={slides[0].number} className="art-mobile-copy" aria-live="polite">
            <span>{slides[0].eyebrow}</span>
            <h3>{slides[0].title}</h3>
            <p>{slides[0].text}</p>
            <Link href={`/catalogo/${slides[0].catalogSlug}`}>Ver en catálogo ↗</Link>
          </div>

          <div className="art-mobile-progress" aria-hidden="true">
            <span>Arte en Raíces</span>
            <i><b /></i>
          </div>
        </div>
        <div className="art-mobile-steps" aria-hidden="true">
          {slides.map((item) => <div key={item.number} />)}
        </div>
        <div className="art-mobile-reduced-list" aria-label="Bloques de arte en Raíces">
          {slides.map((item) => (
            <Link key={item.number} className="art-mobile-piece" href={`/catalogo/${item.catalogSlug}`}>
              <img src={item.left} alt={item.leftAlt} loading="lazy" decoding="async" />
              <span>{item.number} · {item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <strong>Ver en catálogo ↗</strong>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
