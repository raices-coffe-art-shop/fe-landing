"use client";

import { useState } from "react";
import { EditorialImage } from "@/components/EditorialImage";

const slides = [
  {
    number: "01",
    eyebrow: "Pintura y creación",
    title: "La mirada de quien crea dentro del espacio.",
    text: "La artista de Raíces tendrá una ficha propia con nombre, técnica, proceso y obra disponible. La imagen actual es editorial y deberá sustituirse por una sesión real.",
    left: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=86",
    right: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=86"
  },
  {
    number: "02",
    eyebrow: "Retablo y memoria",
    title: "Una historia que se abre en capas.",
    text: "El retablo no debe aparecer como un souvenir aislado. La página final mostrará autoría, escenas, técnica, procedencia y el relato que guarda cada pieza.",
    left: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=86",
    right: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=1600&q=86"
  },
  {
    number: "03",
    eyebrow: "Oficio y procedencia",
    title: "Los objetos también pueden decir quién los hizo.",
    text: "Nacimientos, pequeñas esculturas y piezas regionales se presentarán como una colección curada, no como un catálogo anónimo.",
    left: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1600&q=86",
    right: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=86"
  }
];

export function CulturalSplitShowcase() {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  return (
    <div className="cultural-split-showcase page-shell">
      <div className="split-stage" key={slide.number}>
        <div className="split-panel split-panel-left">
          <EditorialImage src={slide.left} alt={`Imagen editorial temporal para ${slide.eyebrow}`} />
          <div className="split-panel-copy">
            <span>{slide.number}</span>
            <p>{slide.eyebrow}</p>
            <h3>{slide.title}</h3>
          </div>
        </div>
        <div className="split-panel split-panel-right">
          <EditorialImage src={slide.right} alt={`Detalle editorial temporal para ${slide.eyebrow}`} />
          <div className="split-panel-text">
            <p>{slide.text}</p>
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
            <span>{item.number}</span>
            <b>{item.eyebrow}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
