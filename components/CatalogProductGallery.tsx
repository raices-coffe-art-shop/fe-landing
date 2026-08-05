"use client";

import { useMemo, useRef, useState } from "react";
import type { CatalogImage } from "@/sanity/lib/catalogTypes";

type CatalogProductGalleryProps = {
  title: string;
  origin: string;
  mainImage: CatalogImage;
  gallery: CatalogImage[];
};

export function CatalogProductGallery({ title, origin, mainImage, gallery }: CatalogProductGalleryProps) {
  const images = useMemo(() => {
    const seen = new Set<string>();
    return [mainImage, ...gallery].filter((image) => {
      if (!image.src || seen.has(image.src)) return false;
      seen.add(image.src);
      return true;
    });
  }, [gallery, mainImage]);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const selectImage = (index: number) => {
    const total = images.length;
    if (total === 0) return;
    setActiveIndex((index + total) % total);
  };

  const activeImage = images[activeIndex] || mainImage;
  const hasMultipleImages = images.length > 1;

  return (
    <div
      className="catalog-product-gallery"
      tabIndex={hasMultipleImages ? 0 : -1}
      onKeyDown={(event) => {
        if (!hasMultipleImages) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          selectImage(activeIndex - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          selectImage(activeIndex + 1);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (startX == null || endX == null || Math.abs(endX - startX) < 45) return;
        selectImage(endX < startX ? activeIndex + 1 : activeIndex - 1);
      }}
      aria-label={`Galería de ${title}`}
    >
      <figure className="catalog-detail-main-image">
        <img src={activeImage.src} alt={activeImage.alt} />
        <figcaption>{origin}</figcaption>

        {hasMultipleImages && (
          <>
            <div className="catalog-gallery-count" aria-live="polite">
              Imagen {activeIndex + 1} de {images.length}
            </div>
            <div className="catalog-gallery-controls">
              <button type="button" onClick={() => selectImage(activeIndex - 1)} aria-label="Ver imagen anterior">
                <span aria-hidden="true">←</span>
                Anterior
              </button>
              <button type="button" onClick={() => selectImage(activeIndex + 1)} aria-label="Ver imagen siguiente">
                Siguiente
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </>
        )}
      </figure>

      {hasMultipleImages && (
        <div className="catalog-gallery-thumbnails" role="list" aria-label="Seleccionar imagen del producto">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              role="listitem"
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => selectImage(index)}
              aria-label={`Mostrar imagen ${index + 1} de ${images.length}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <img src={image.src} alt="" loading="lazy" />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
