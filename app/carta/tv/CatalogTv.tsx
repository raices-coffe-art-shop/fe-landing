"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BrandLogo } from "@/sanity/lib/siteSettings";
import type { TvScreenSlide } from "./extraSlides";
import styles from "./tv.module.css";

const CURSOR_HIDE_DELAY_MS = 3000;
const RELOAD_AFTER_MS = 4 * 60 * 60 * 1000;

type CatalogTvProps = {
  slides: TvScreenSlide[];
  intervalMs: number;
  logo: BrandLogo;
  qrDataUrl: string;
  catalogDisplayUrl: string;
};

export function CatalogTv({ slides, intervalMs, logo, qrDataUrl, catalogDisplayUrl }: CatalogTvProps) {
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
    // Todas las pantallas duran lo mismo. El temporizador se rearma en cada
    // avance, por eso el efecto depende de activeIndex.
    const start = () => {
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        setActiveIndex((index) => (index + 1) % slideCount);
      }, intervalMs);
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
  }, [slideCount, intervalMs, rotationEpoch, activeIndex]);

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
                  <img className={styles.brandLogo} src={logo.src} alt={logo.alt} />
                  <p className={styles.brandWordmark}>Raíces</p>
                  <p className={styles.brandTagline}>Café y Cultura — Ayacucho · Lima</p>
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

          if (slide.kind === "collage") {
            return (
              <section key={slide.key} className={slideClass} aria-hidden={!isActive}>
                <header className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{slide.title}</h2>
                  <p className={styles.sectionTagline}>{slide.tagline}</p>
                  <div className={styles.sectionRule} />
                </header>
                <div className={`${styles.collage} ${styles[slide.animation]}`}>
                  {slide.photos.map((photo) => (
                    <figure
                      key={photo.id}
                      className={styles.collageItem}
                      style={
                        {
                          "--angle": `${photo.angle}deg`,
                          "--delay": `${photo.delayMs}ms`,
                        } as React.CSSProperties
                      }
                    >
                      <img src={photo.src} alt={photo.alt} loading="eager" decoding="async" />
                    </figure>
                  ))}
                </div>
              </section>
            );
          }

          if (slide.kind === "origin") {
            return (
              <section key={slide.key} className={slideClass} aria-hidden={!isActive}>
                <header className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{slide.title}</h2>
                  <p className={styles.sectionTagline}>{slide.tagline}</p>
                  <div className={styles.sectionRule} />
                </header>
                <div className={styles.originBody}>
                  <p className={styles.originHeadline}>{slide.headline}</p>
                  <figure className={styles.originFigure}>
                    <img src={slide.photo.src} alt={slide.photo.alt} />
                  </figure>
                  <div className={styles.originCopy}>
                    {slide.paragraphs.map((paragraph) => (
                      <p key={paragraph} className={styles.originParagraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <p className={styles.originNote}>
                    <span className={styles.originNoteLabel}>{slide.note.label}</span>
                    {slide.note.text}
                  </p>
                </div>
              </section>
            );
          }

          if (slide.kind === "people") {
            return (
              <section key={slide.key} className={slideClass} aria-hidden={!isActive}>
                <header className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{slide.title}</h2>
                  <p className={styles.sectionTagline}>{slide.tagline}</p>
                  <div className={styles.sectionRule} />
                </header>
                <div className={styles.peopleBody}>
                  {slide.cards.map((card) => (
                    <article key={card.slug} className={styles.personCard}>
                      {card.photo ? (
                        <img
                          className={styles.personPhoto}
                          src={card.photo.src}
                          alt={card.photo.alt}
                          style={{ objectPosition: card.photo.position }}
                        />
                      ) : (
                        <div className={styles.personPhotoEmpty} aria-hidden="true" />
                      )}
                      <div className={styles.personCopy}>
                        <p className={styles.personName}>{card.name}</p>
                        <p className={styles.personRole}>
                          {card.role} · {card.region}
                        </p>
                        <p className={styles.personSummary}>{card.summary}</p>
                      </div>
                    </article>
                  ))}
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
              {/* Encabezado de la primera versión: título centrado, subtítulo y
                  regla dorada. Sin barra de logo ni ilustración. */}
              <header className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                {section.tagline && <p className={styles.sectionTagline}>{section.tagline}</p>}
                <div className={styles.sectionRule} />
              </header>

              <div className={styles.body}>
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

                <div className={`${styles.groups} ${slide.twoColumns ? styles.twoColumns : ""}`}>
                  {slide.groups.map((group, groupIndex) => (
                    <section
                      key={group.title ?? `sin-subseccion-${groupIndex}`}
                      className={styles.group}
                    >
                      {group.title && <h3 className={styles.groupTitle}>{group.title}</h3>}
                      <ul className={styles.items}>
                        {group.items.map((item) => (
                          <li key={item.id} className={styles.item}>
                            <span className={styles.itemName}>{item.title}</span>
                            {item.priceLabel ? (
                              <span className={styles.itemPrice}>{item.priceLabel}</span>
                            ) : (
                              <span className={styles.itemInquiry}>Consultar</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
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
      </div>
    </main>
  );
}
