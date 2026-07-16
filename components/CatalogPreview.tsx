"use client";

import { useMemo, useState } from "react";
import { products } from "@/data/site";
import { EditorialImage } from "./EditorialImage";

const filters = ["Todo", "Café", "Miel", "Cacao", "Quesos", "Arte", "Regalos"];

export function CatalogPreview() {
  const [filter, setFilter] = useState("Todo");
  const filtered = useMemo(() => filter === "Todo" ? products : products.filter((p) => p.category === filter), [filter]);

  return (
    <section className="catalog-section" id="catalogo">
      <div className="catalog-title page-shell">
        <div>
          <p className="eyebrow">Catálogo visual</p>
          <h2>Productos con procedencia.</h2>
        </div>
        <p>No es un e-commerce todavía. Es una selección que permite descubrir el origen y luego consultar por WhatsApp.</p>
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
              <div><span>{product.category}</span><span>{product.region}</span></div>
              <h3>{product.name}</h3>
              <p>{product.note}</p>
              <a href={`https://wa.me/51999999999?text=${encodeURIComponent(`Hola, quisiera consultar por ${product.name}.`)}`} target="_blank" rel="noreferrer">
                Consultar <span>↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
