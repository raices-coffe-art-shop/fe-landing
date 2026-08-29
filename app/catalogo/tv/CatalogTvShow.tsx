"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BrandLogo } from "@/sanity/lib/siteSettings";
import type { TvSlide } from "./slides";
import styles from "./tv.module.css";

const CURSOR_HIDE_DELAY_MS = 3000;
const RELOAD_AFTER_MS = 4 * 60 * 60 * 1000;

type CatalogTvShowProps = {
  slides: TvSlide[];
  intervalMs: number;
  logo: BrandLogo;
  qrDataUrl: string;
  catalogDisplayUrl: string;
};

export function CatalogTvShow({ slides, intervalMs, logo, qrDataUrl, catalogDisplayUrl }: CatalogTvShowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Cada navegación manual cambia el epoch para reiniciar el temporizador.
  const [rotationEpoch, setRotationEpoch] = useState(0);
  const [cursorHidden, setCursorHidden] = useState(false);
  const cursorTimerRef = useRef<number>(0);
  const slideCount = slides.length;

  const goTo = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) => (current + direction + slideCount) % slideCount);
      setRotationEpoch((epoch) => epoch + 1);
    },
    [slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1) return;

    let timer = 0;
    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => {
        setActiveIndex((current) => (current + 1) % slideCount);
      }, intervalMs);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [slideCount, intervalMs, rotationEpoch]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goTo(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slideCount, goTo]);

  useEffect(() => {
    const onMouseMove = () => {
      setCursorHidden(false);
      window.clearTimeout(cursorTimerRef.current);
      cursorTimerRef.current = window.setTimeout(() => setCursorHidden(true), CURSOR_HIDE_DELAY_MS);
    };
    onMouseMove();
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.clearTimeout(cursorTimerRef.current);
    };
  }, []);

  // Las fotos de categoría son pocas (una por categoría): precargarlas evita
  // que la primera vuelta del carrusel muestre huecos durante el crossfade.
  useEffect(() => {
    for (const slide of slides) {
      if (slide.kind === "category" && slide.image) {
        const preload = new window.Image();
        preload.src = slide.image.src;
      }
    }
  }, [slides]);

  // Una TV encendida durante días: recargar recoge contenido nuevo de Sanity
  // y evita la deriva de memoria del navegador del televisor.
  useEffect(() => {
    const timer = window.setTimeout(() => window.location.reload(), RELOAD_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className={`${styles.stage} ${cursorHidden ? styles.cursorHidden : ""}`}>
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const slideClass = `${styles.slide} ${isActive ? styles.active : ""}`;

        if (slide.kind === "brand") {
          return (
            <section key="brand" className={slideClass} aria-hidden={!isActive}>
              <div className={styles.brandSlide}>
                <div className={styles.brandIdentity}>
                  <img className={styles.brandLogo} src={logo.src} alt={logo.alt} />
                  <p className={styles.brandWordmark}>Raíces</p>
                  <p className={styles.brandTagline}>Café y Cultura — Ayacucho en Lima</p>
                </div>
                <div className={styles.qrCard}>
                  <img className={styles.qrImage} src={qrDataUrl} alt={`Código QR de la carta: ${catalogDisplayUrl}`} />
                  <p className={styles.qrLead}>Escanea la carta desde tu mesa</p>
                  <p className={styles.qrUrl}>{catalogDisplayUrl}</p>
                </div>
              </div>
            </section>
          );
        }

        return (
          <section key={slide.key} className={slideClass} aria-hidden={!isActive}>
            <header className={styles.slideHeader}>
              <div>
                <p className={styles.eyebrow}>La carta · Raíces</p>
                <h2 className={styles.categoryTitle}>
                  {slide.categoryTitle}
                  {slide.subCategoryTitle && (
                    <span className={styles.subCategoryTitle}> · {slide.subCategoryTitle}</span>
                  )}
                  {slide.pageCount > 1 && (
                    <span className={styles.categoryPage}> · {slide.page} de {slide.pageCount}</span>
                  )}
                </h2>
              </div>
              <p className={styles.origin}>Ayacucho · Lima</p>
            </header>
            <div className={`${styles.slideBody} ${slide.image ? "" : styles.slideBodyNoPhoto}`}>
              {slide.image && (
                <figure className={styles.slidePhoto}>
                  <img src={slide.image.src} alt={slide.image.alt} />
                </figure>
              )}
              <ul
                className={`${styles.items} ${
                  !slide.image && slide.items.length > 4 ? styles.itemsTwoColumns : ""
                }`}
              >
                {slide.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <div className={styles.itemCopy}>
                      <p className={styles.itemName}>{item.title}</p>
                      {item.shortDescription && (
                        <p className={styles.itemDescription}>{item.shortDescription}</p>
                      )}
                    </div>
                    {item.priceLabel ? (
                      <p className={styles.itemPrice}>{item.priceLabel}</p>
                    ) : (
                      <p className={styles.itemInquiry}>Consultar</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {slideCount > 1 && (
        <div className={styles.progress} aria-hidden="true">
          {slides.map((slide, index) => {
            const key = slide.kind === "brand" ? "brand" : slide.key;
            return index === activeIndex ? (
              <span key={key} className={styles.progressActive}>
                <span
                  key={`${key}-${rotationEpoch}-${activeIndex}`}
                  className={styles.progressFill}
                  style={{ animationDuration: `${intervalMs}ms` }}
                />
              </span>
            ) : (
              <span key={key} className={styles.progressDot} />
            );
          })}
        </div>
      )}
    </main>
  );
}
