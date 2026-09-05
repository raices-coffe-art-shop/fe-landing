"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BrandLogo } from "@/sanity/lib/siteSettings";
import type { TvV2Slide } from "./slidesV2";
import { SectionMark } from "./SectionMark";
import styles from "./tv-v2.module.css";

const CURSOR_HIDE_DELAY_MS = 3000;
const RELOAD_AFTER_MS = 4 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

type CatalogTvV2Props = {
  slides: TvV2Slide[];
  intervalMs: number;
  logo: BrandLogo;
  qrDataUrl: string;
  catalogDisplayUrl: string;
};

export function CatalogTvV2({ slides, intervalMs, logo, qrDataUrl, catalogDisplayUrl }: CatalogTvV2Props) {
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
    // La página que estrena el relato de una sección necesita más tiempo que las
    // siguientes, que solo cambian productos.
    const current = slides[activeIndex];
    const dwell = current && "dwell" in current ? current.dwell : 1;
    const start = () => {
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        setActiveIndex((index) => (index + 1) % slideCount);
      }, intervalMs * dwell);
    };
    const stop = () => {
      window.clearTimeout(timer);
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
  }, [slideCount, intervalMs, rotationEpoch, slides, activeIndex]);

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

  // Una TV encendida durante días: recargar recoge contenido nuevo de Sanity
  // y evita la deriva de memoria del navegador del televisor.
  useEffect(() => {
    const timer = window.setTimeout(() => window.location.reload(), RELOAD_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className={`${styles.stage} ${cursorHidden ? styles.cursorHidden : ""}`}>
      <div className={styles.column}>
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const slideClass = `${styles.slide} ${isActive ? styles.active : ""}`;

          if (slide.kind === "brand") {
            return (
              <section key="brand" className={slideClass} aria-hidden={!isActive}>
                <div className={styles.brandSlide}>
                  <img className={styles.brandSlideLogo} src={logo.src} alt={logo.alt} />
                  <p className={styles.brandSlideWordmark}>Raíces</p>
                  <p className={styles.brandSlideTagline}>Café y Cultura — Ayacucho · Lima</p>
                  <div className={styles.qrCard}>
                    <img
                      className={styles.qrImage}
                      src={qrDataUrl}
                      alt={`Código QR de la carta: ${catalogDisplayUrl}`}
                    />
                    <p className={styles.qrLead}>Escanea la carta desde tu mesa</p>
                    <p className={styles.qrUrl}>{catalogDisplayUrl}</p>
                  </div>
                </div>
              </section>
            );
          }

          const { section } = slide;
          return (
            <section
              key={slide.key}
              className={`${slideClass} ${styles[section.density]}`}
              aria-hidden={!isActive}
            >
              <div className={styles.brandBar}>
                <img className={styles.brandBarLogo} src={logo.src} alt={logo.alt} />
                <div className={styles.brandBarCopy}>
                  <p className={styles.brandBarName}>Raíces</p>
                  <p className={styles.brandBarKicker}>Café &amp; Cultura</p>
                </div>
                <p className={styles.pageCounter}>
                  {pad(slide.page)} / {pad(slide.pageCount)}
                </p>
              </div>

              <div className={styles.heroCard}>
                <div className={styles.heroCopy}>
                  {section.tagline && <p className={styles.heroTagline}>{section.tagline}</p>}
                  <h2 className={styles.heroTitle}>{section.title}</h2>
                </div>
                <SectionMark slug={section.slug} className={styles.heroMark} />
              </div>

              {section.story && (
                <div className={styles.storyBox}>
                  <p className={styles.storyTitle}>Nuestra historia</p>
                  <p className={styles.storyText}>{section.story}</p>
                  {section.quote && <p className={styles.storyQuote}>{section.quote}</p>}
                </div>
              )}

              {section.facts.length > 0 && (
                <div className={styles.factsBox}>
                  <p className={styles.factsTitle}>Origen y productores</p>
                  <dl className={styles.factsGrid}>
                    {section.facts.map((fact, factIndex) => (
                      <div key={`${fact.label}-${factIndex}`} className={styles.fact}>
                        <dt className={styles.factLabel}>{fact.label}</dt>
                        <dd className={styles.factValue}>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <ul className={styles.items}>
                {slide.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <span className={styles.itemName}>{item.title}</span>
                    <span className={styles.leader} aria-hidden="true" />
                    {item.priceLabel ? (
                      <span className={styles.itemPrice}>{item.priceLabel}</span>
                    ) : (
                      <span className={styles.itemInquiry}>Consultar</span>
                    )}
                  </li>
                ))}
              </ul>
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
                    style={{
                      animationDuration: `${
                        intervalMs * (slide && "dwell" in slide ? slide.dwell : 1)
                      }ms`,
                    }}
                  />
                </span>
              ) : (
                <span key={key} className={styles.progressDot} />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
