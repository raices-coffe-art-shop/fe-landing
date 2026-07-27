"use client";

import { useMemo, useState } from "react";
import { products } from "@/data/site";
import { contactChannels } from "@/data/social";
import { EditorialImage } from "./EditorialImage";

const filters = ["Todo", "Café y cacao", "Alimentos", "Arte"];

export function CatalogPreview() {
  const [filter, setFilter] = useState("Todo");
  const filtered = useMemo(() => filter === "Todo" ? products : products.filter((p) => p.category === filter), [filter]);

  return (
    <section className="catalog-section" id="catalogo">
      <div className="catalog-title page-shell">
        <div>
          <p className="eyebrow">Catálogo visual</p>
          <h2>Productos con nombre, procedencia y una historia detrás.</h2>
        </div>
        <p>Explora cafés, alimentos, postres, pinturas y piezas seleccionadas. Cada ficha indica qué es, de dónde viene, quién está relacionado con su elaboración y cómo puedes conseguirlo.</p>
      </div>

      <div className="catalog-filters page-shell" role="group" aria-label="Filtrar productos">
        {filters.map((item) => (
          <button key={item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)} aria-pressed={filter === item}>
            {item}
          </button>
        ))}
      </div>

      <div className="catalog-rail page-shell">
        {filtered.map((product, index) => (
          <article key={product.name} className={`product-card tone-${product.tone}`}>
            <div className="product-image">
              <EditorialImage src={product.image} alt={product.name} position={index === 0 ? "center 62%" : "center"} />
              <span className="product-number">0{index + 1}</span>
            </div>
            <div className="product-copy">
              <div><span>{product.category}</span><span>{product.procedencia}</span></div>
              <h3>{product.name}</h3>
              <p>{product.note}</p>
              <a href={`${contactChannels.whatsappHref}?text=${encodeURIComponent(`Hola, quisiera consultar por ${product.name}.`)}`} target="_blank" rel="noreferrer">
                Consultar <span>↗</span>
              </a>
              <a href={`/catalogo/${product.slug}`}>
                Ver ficha <span>↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
