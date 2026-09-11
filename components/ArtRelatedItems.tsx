"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CatalogItem } from "@/sanity/lib/catalogTypes";

export function ArtRelatedItems({ items }: { items: CatalogItem[] }) {
  const [activeItem, setActiveItem] = useState<CatalogItem | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
  }, []);

  const movePreview = (clientX: number, clientY: number) => {
    if (typeof window === "undefined") return;
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      const preview = previewRef.current;
      if (!preview) return;
      const rect = preview.getBoundingClientRect();
      const width = rect.width || 300;
      const height = rect.height || 360;
      const left = Math.min(Math.max(clientX, 14), Math.max(14, window.innerWidth - width - 14));
      const bottom = Math.min(Math.max(clientY, height + 14), window.innerHeight - 14);
      preview.style.transform = `translate3d(${left}px, ${bottom}px, 0) translateY(-100%)`;
    });
  };

  const placePreviewByElement = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    movePreview(rect.right - 24, rect.top + rect.height * 0.72);
  };

  if (!items.length) return null;

  return (
    <section className="next-story catalog-related" aria-labelledby="art-related-title">
      <div className="page-shell">
        <p id="art-related-title">Más piezas de la galería</p>
        <div className="catalog-related-list">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/galeria-de-arte/${item.slug}`}
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                setActiveItem(item);
                movePreview(event.clientX, event.clientY);
              }}
              onPointerMove={(event) => {
                if (event.pointerType === "mouse") movePreview(event.clientX, event.clientY);
              }}
              onPointerLeave={() => setActiveItem(null)}
              onFocus={(event) => {
                setActiveItem(item);
                placePreviewByElement(event.currentTarget);
              }}
              onBlur={() => setActiveItem(null)}
            >
              <span className="catalog-related-mobile-media" aria-hidden="true">
                <img src={item.mainImage.src} alt="" loading="lazy" />
              </span>
              <span className="catalog-related-category">{item.subcategory || item.category.title}</span>
              <h2>{item.title}</h2>
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </div>
      </div>

      <div
        ref={previewRef}
        className={`catalog-related-floating-preview${activeItem ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        {activeItem && (
          <>
            <img src={activeItem.mainImage.src} alt="" />
            <span>{activeItem.title}</span>
          </>
        )}
      </div>
    </section>
  );
}
