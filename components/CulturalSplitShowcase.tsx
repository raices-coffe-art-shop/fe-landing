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
          {slide.status === "pending" ? <div className="art-photo-placeholder">Fotografía por incorporar</div> : <EditorialImage src={slide.left} alt={slide.leftAlt} />}
          <div className="split-panel-copy">
            <span>{slide.number}</span>
            <p>{slide.eyebrow}</p>
            <h3>{slide.title}</h3>
          </div>
        </div>
        <div className="split-panel split-panel-right">
          {slide.status === "pending" ? <div className="art-photo-placeholder">Fotografía por incorporar</div> : <EditorialImage src={slide.right} alt={slide.rightAlt} />}
          <div className="split-panel-text">
            <p>{slide.text}</p>
            <Link href={`/arte/${slide.slug}`}>Ver capítulo ↗</Link>
            <small>Fotografías referenciales · reemplazar por material de Raíces</small>
          </div>
        </div>
      </div>

      <div className="split-pagination" role="tablist" aria-label="Capítulos del Art Shop">
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
              <img src={item.left} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              <img src={item.right} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            </span>
            <b>{item.eyebrow}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
