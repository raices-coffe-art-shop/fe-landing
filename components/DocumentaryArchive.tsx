"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { archiveCategories } from "@/data/documentary";

type ArchiveMode = "closed" | "open" | "canvas" | "focus";

const tones = ["#b56a4f", "#4f6b50", "#c49449", "#7b5042", "#364b3d", "#8b463f"];
const tileLayout = [
  [-4, 8, 16, 29],
  [28, 3, 17, 27],
  [67, 7, 15, 30],
  [7, 51, 13, 26],
  [34, 39, 15, 31],
  [58, 43, 14, 25],
  [88, 48, 13, 28],
  [47, 76, 15, 28],
];

function relativeIndex(index: number, active: number) {
  let delta = (index - active + archiveCategories.length) % archiveCategories.length;
  return delta > 2 ? delta - archiveCategories.length : delta;
}

export function DocumentaryArchive() {
  const [mode, setMode] = useState<ArchiveMode>("closed");
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(0);
  const [sweeping, setSweeping] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const viewportRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const positionRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number; startX: number; startY: number; moved: boolean } | null>(null);
  const lastDragEndRef = useRef(0);
  const current = archiveCategories[active] ?? archiveCategories[0];
  const media = current.media;
  const selectedMedia = media[selected % media.length] ?? media[0];
  const mobileCurrent = archiveCategories[0];

  const cells = useMemo(() => {
    return Array.from({ length: 9 }, (_, cellIndex) => ({
      id: cellIndex,
      row: Math.floor(cellIndex / 3),
      column: cellIndex % 3,
    }));
  }, []);

  const applyWorld = (x: number, y: number, targetX = positionRef.current.targetX, targetY = positionRef.current.targetY) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const width = viewport.clientWidth || 1;
    const height = viewport.clientHeight || 1;

    while (x <= -width * 2) {
      x += width;
      targetX += width;
    }
    while (x >= 0) {
      x -= width;
      targetX -= width;
    }
    while (y <= -height * 2) {
      y += height;
      targetY += height;
    }
    while (y >= 0) {
      y -= height;
      targetY -= height;
    }

    positionRef.current = { x, y, targetX, targetY };
    viewport.style.setProperty("--archive-x", `${x}px`);
    viewport.style.setProperty("--archive-y", `${y}px`);
  };

  const resetWorld = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const x = -(viewport.clientWidth || 1);
    const y = -(viewport.clientHeight || 1);
    applyWorld(x, y, x, y);
  };

  const animateWorld = () => {
    cancelAnimationFrame(frameRef.current);
    const tick = () => {
      const position = positionRef.current;
      const dx = position.targetX - position.x;
      const dy = position.targetY - position.y;
      const nextX = position.x + dx * 0.16;
      const nextY = position.y + dy * 0.16;
      applyWorld(nextX, nextY);
      if (Math.abs(dx) > 0.12 || Math.abs(dy) > 0.12) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        applyWorld(positionRef.current.targetX, positionRef.current.targetY);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const openCanvas = (index = active) => {
    if (index !== active) {
      setSlideDirection(relativeIndex(index, active) < 0 ? "prev" : "next");
      setActive(index);
    }
    setSelected(0);
    setMode("canvas");
    requestAnimationFrame(() => requestAnimationFrame(resetWorld));
  };

  const changeActive = (index: number) => {
    if (index === active) return;
    setSlideDirection(relativeIndex(index, active) < 0 ? "prev" : "next");
    setActive(index);
  };

  const openCategory = (index: number) => {
    changeActive(index);
    setMode("open");
  };

  const returnToInitialCards = () => {
    setMode("closed");
    setSelected(0);
  };

  const openFocus = (index: number) => {
    const drag = dragRef.current;
    if (drag?.moved || Date.now() - lastDragEndRef.current < 180) return;
    setSelected(index % media.length);
    setSweeping(true);
    window.setTimeout(() => {
      setMode("focus");
      setSweeping(false);
    }, 760);
  };

  const goBack = () => {
    if (mode === "focus") {
      setMode("canvas");
      return;
    }
    if (mode === "canvas") setMode("open");
    if (mode === "open") setMode("closed");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") goBack();
      if (mode === "open" && event.key === "ArrowRight") changeActive((active + 1) % archiveCategories.length);
      if (mode === "open" && event.key === "ArrowLeft") changeActive((active - 1 + archiveCategories.length) % archiveCategories.length);
      if (mode === "open" && event.key === "Enter") openCanvas();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    if (mode === "closed" || mode === "open") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "canvas") resetWorld();
  }, [mode, active]);

  useEffect(() => {
    if (mode !== "canvas") return;
    const onResize = () => resetWorld();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mode]);

  return (
    <section className="documentary-archive-section" id="archivo">
      <div className="page-shell documentary-archive-heading">
        <p className="eyebrow">Archivo de origen</p>
        <h2>Personas, lugares y procesos registrados en el camino.</h2>
        <p>Una colección visual de visitas, productos, paisajes, conversaciones y procesos vinculados con Raíces.</p>
      </div>

      <div
        className="archive-carousel page-shell"
        data-mode={mode}
        data-slide={slideDirection}
        style={{ "--section-tone": tones[active % tones.length] } as CSSProperties}
      >
        <div className="archive-carousel-bar">
          <span>Categorías</span>
          <span>{mode === "closed" ? "Hover · memoria de color" : "Las cartas laterales cambian la categoría"}</span>
          <button type="button" onClick={goBack} aria-hidden={mode === "closed"} tabIndex={mode === "closed" ? -1 : 0}>Volver</button>
        </div>

        <div className="archive-card-stage" aria-label="Carrusel del archivo documental">
          <div key={current.id} className="archive-active-title" aria-hidden="true">{current.title}</div>
          {archiveCategories.map((category, index) => {
            const delta = relativeIndex(index, active);
            const positionClass = delta === 0 ? "is-active" : delta === -1 ? "is-prev" : delta === 1 ? "is-next" : delta === -2 ? "is-far-left" : "is-far-right";
            const closedOffset = (index - (archiveCategories.length - 1) / 2) * 132;
            return (
              <button
                key={category.id}
                type="button"
                className={`archive-carousel-card ${positionClass}`}
                style={{
                  "--tone": tones[index % tones.length],
                  "--x": `${closedOffset}px`,
                  "--z": String(10 - Math.abs(delta)),
                } as CSSProperties}
                onClick={() => openCanvas(index)}
              >
                <span className="archive-card-picture">
                  {category.media[0]?.src ? <img src={category.media[0].src} alt={category.media[0].alt ?? category.title} /> : <i>{category.title}</i>}
                  <em className="archive-tint" />
                  <em className="archive-color-wipe" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="archive-carousel-caption">
          <button type="button" onClick={() => changeActive((active - 1 + archiveCategories.length) % archiveCategories.length)}>Anterior</button>
          <p>{current.summary} <button type="button" onClick={() => openCanvas(active)}>Entrar al lienzo ↗</button></p>
          <button type="button" onClick={() => changeActive((active + 1) % archiveCategories.length)}>Siguiente</button>
        </div>
      </div>

      <div className="archive-mobile-story">
        <div className="archive-mobile-sticky">
          <div className="archive-mobile-visual">
            {archiveCategories.map((category, index) => {
              const item = category.media[0];
              return item?.src ? (
                <img
                  key={category.id}
                  className={index === 0 ? "is-active" : ""}
                  src={item.src}
                  alt={item.alt ?? category.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                <span key={category.id} className={index === 0 ? "is-active" : ""}>{category.title}</span>
              );
            })}
            <div className="archive-mobile-visual-shade" aria-hidden="true" />
            <div className="archive-mobile-counter" aria-hidden="true">
              <b>01</b>
              <span>/ {String(archiveCategories.length).padStart(2, "0")}</span>
            </div>
          </div>

          <div key={mobileCurrent.id} className="archive-mobile-copy">
            <span>Archivo de origen</span>
            <h3>{mobileCurrent.title}</h3>
            <p>{mobileCurrent.summary}</p>
            <Link href={`/archivo/${mobileCurrent.id}`}>Ver archivo ↗</Link>
          </div>

          <div className="archive-mobile-progress" aria-hidden="true">
            <span>Recorrido documental</span>
            <i><b /></i>
          </div>
        </div>

        <div className="archive-mobile-steps" aria-hidden="true">
          {archiveCategories.map((category) => <div key={category.id} />)}
        </div>

        <div className="archive-mobile-reduced-list" aria-label="Categorías del archivo documental">
          {archiveCategories.map((category) => {
            const item = category.media[0];
            return (
              <Link key={category.id} className="archive-mobile-card" href={`/archivo/${category.id}`}>
                {item?.src && <img src={item.src} alt={item.alt ?? category.title} loading="lazy" decoding="async" />}
                <span>Archivo de origen</span>
                <h3>{category.title}</h3>
                <p>{category.summary}</p>
                <strong>Ver archivo ↗</strong>
              </Link>
            );
          })}
        </div>
      </div>

      {mode !== "closed" && mode !== "open" && (
        <div className="archive-overlay" data-mode={mode} role="dialog" aria-modal="true" aria-label="Lienzo infinito del archivo documental">
          <div className="archive-band archive-band-top">
            <span>{current.title}</span>
            <span>{mode === "focus" ? "Vista ampliada" : "Lienzo infinito"}</span>
            <div className="archive-band-actions">
              <button type="button" onClick={goBack}>Volver</button>
              <button type="button" onClick={returnToInitialCards}>Vista inicial</button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className={`archive-canvas ${sweeping ? "is-sweeping" : ""}`}
            onWheel={(event) => {
              if (mode !== "canvas") return;
              event.preventDefault();
              const position = positionRef.current;
              positionRef.current = {
                ...position,
                targetX: position.targetX - event.deltaX,
                targetY: position.targetY - event.deltaY,
              };
              animateWorld();
            }}
            onPointerDown={(event) => {
              if (mode !== "canvas") return;
              cancelAnimationFrame(frameRef.current);
              const position = positionRef.current;
              dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, startX: position.x, startY: position.y, moved: false };
              event.currentTarget.classList.add("is-dragging");
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const cursor = cursorRef.current;
              const viewport = viewportRef.current;
              if (cursor && viewport) {
                const bounds = viewport.getBoundingClientRect();
                cursor.style.left = `${event.clientX - bounds.left}px`;
                cursor.style.top = `${event.clientY - bounds.top}px`;
                cursor.classList.toggle("is-visible", mode === "canvas" && Boolean((event.target as HTMLElement).closest(".archive-tile")) && !dragRef.current);
              }

              const drag = dragRef.current;
              if (!drag || drag.pointerId !== event.pointerId) return;
              const dx = event.clientX - drag.x;
              const dy = event.clientY - drag.y;
              if (Math.hypot(dx, dy) > 5) drag.moved = true;
              applyWorld(drag.startX + dx, drag.startY + dy, drag.startX + dx, drag.startY + dy);
            }}
            onPointerLeave={() => cursorRef.current?.classList.remove("is-visible")}
            onPointerUp={(event) => {
              const drag = dragRef.current;
              if (drag?.moved) lastDragEndRef.current = Date.now();
              dragRef.current = null;
              cursorRef.current?.classList.remove("is-visible");
              event.currentTarget.classList.remove("is-dragging");
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={(event) => {
              dragRef.current = null;
              cursorRef.current?.classList.remove("is-visible");
              event.currentTarget.classList.remove("is-dragging");
            }}
          >
            <div className="archive-world">
              {cells.map((cell) => (
                <div
                  key={cell.id}
                  className="archive-world-cell"
                  style={{
                    left: `${cell.column * 33.3333}%`,
                    top: `${cell.row * 33.3333}%`,
                  }}
                >
                  {tileLayout.map(([left, top, width, height], index) => {
                    const item = media[index % media.length];
                    return (
                      <button
                        key={`${cell.id}-${item.id}-${index}`}
                        type="button"
                        className="archive-tile"
                        style={{
                          "--left": `${left}%`,
                          "--top": `${top}%`,
                          "--width": `${width}%`,
                          "--height": `${height}%`,
                          "--tone": tones[active % tones.length],
                          "--delay": `${index * 46}ms`,
                        } as CSSProperties}
                        onClick={() => openFocus(index)}
                      >
                        <img src={item.src} alt={item.alt ?? item.caption} />
                        <em className="archive-color-wipe" />
                        <span className="archive-corners" aria-hidden="true">
                          <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div ref={cursorRef} className="archive-cursor-ring" aria-hidden="true" />
          </div>

          <div className="archive-focus-viewer">
            <div className="archive-focus-wrap">
              {selectedMedia && <img src={selectedMedia.src} alt={selectedMedia.alt ?? selectedMedia.caption} />}
              <em className="archive-color-wipe" />
              <div className="archive-focus-caption">
                <span>{current.title}</span>
                <span>{String((selected % media.length) + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span>
              </div>
            </div>
            <div className="archive-preview-rail">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === selected ? "is-active" : ""}
                  onClick={() => setSelected(index)}
                >
                  <img src={item.src} alt={item.alt ?? item.caption} />
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="archive-return-initial" onClick={returnToInitialCards}>
            Volver a categorías
          </button>

          <div className="archive-band archive-band-bottom">
            <span>{current.summary}</span>
            <span>Rueda, arrastra o abre una imagen</span>
          </div>
        </div>
      )}
    </section>
  );
}
