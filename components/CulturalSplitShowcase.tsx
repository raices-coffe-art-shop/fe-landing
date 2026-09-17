"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EditorialImage } from "@/components/EditorialImage";
import { artShopSlides as fallbackSlides } from "@/data/art";
import type { CatalogItem } from "@/sanity/lib/catalogTypes";

type CulturalSplitShowcaseProps = {
  items?: CatalogItem[];
};

export function CulturalSplitShowcase({ items = [] }: CulturalSplitShowcaseProps) {
  const slides = useMemo(() => {
    const visibleItems = items.filter((item) => item.isActive !== false).slice(0, 4);
    if (!visibleItems.length) return fallbackSlides;

    return visibleItems.map((item, index) => ({
      slug: item.slug,
      number: String(index + 1).padStart(2, "0"),
      eyebrow: item.subcategory || item.category.title,
      title: item.title,
      text: item.shortDescription,
      left: item.mainImage.src,
      leftAlt: item.mainImage.alt,
      right: item.gallery[0]?.src || item.mainImage.src,
      rightAlt: item.gallery[0]?.alt || item.mainImage.alt,
      status: "sanity",
    }));
  }, [items]);

  const [active, setActive] = useState(0);
  const safeActive = Math.min(active, Math.max(0, slides.length - 1));
  const slide = slides[safeActive];

  if (!slide) return null;

  return (
    <div className="cultural-split-showcase page-shell">
      <div className="split-stage" key={slide.slug}>
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
            <Link href={`/galeria-de-arte/${slide.slug}`}>Ver pieza ↗</Link>
          </div>
        </div>
      </div>

      <div className="split-pagination" role="tablist" aria-label="Piezas de la Galería de Arte de Raíces">
        {slides.map((item, index) => (
          <button
            key={item.slug}
            role="tab"
            aria-selected={safeActive === index}
            className={safeActive === index ? "is-active" : ""}
            onClick={() => setActive(index)}
          >
            <span className="split-nav-number">{item.number}</span>
            <span className="split-nav-preview" aria-hidden="true">
              <img src={item.left} alt="" loading="lazy" decoding="async" />
              <img src={item.right} alt="" loading="lazy" decoding="async" />
            </span>
            <b>{item.title}</b>
          </button>
        ))}
      </div>

      <div className="art-mobile-story">
        <div className="art-mobile-reduced-list" aria-label="Piezas de la Galería de Arte de Raíces">
          {slides.map((item) => (
            <Link key={item.slug} className="art-mobile-piece" href={`/galeria-de-arte/${item.slug}`}>
              <img src={item.left} alt={item.leftAlt} loading="lazy" decoding="async" />
              <span>{item.number} · {item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <strong>Ver pieza ↗</strong>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
