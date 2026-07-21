"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { archiveCategories } from "@/data/documentary";

type ArchiveMode = "open" | "canvas";

const tones = ["#b56a4f", "#4f6b50", "#c49449", "#7b5042", "#364b3d", "#8b463f"];

export function DocumentaryArchive() {
  const [mode, setMode] = useState<ArchiveMode>("open");
  const [active, setActive] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const current = archiveCategories[active] ?? archiveCategories[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode("open");
      if (event.key === "ArrowRight") setActive((value) => (value + 1) % archiveCategories.length);
      if (event.key === "ArrowLeft") setActive((value) => (value - 1 + archiveCategories.length) % archiveCategories.length);
      if (event.key === "Enter" && mode === "open") setMode("canvas");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode]);

  useEffect(() => {
    if (mode !== "canvas") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);

  const setCanvasOffset = (next: { x: number; y: number }) => {
    offsetRef.current = next;
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.style.setProperty("--archive-x", `${next.x}px`);
    viewport.style.setProperty("--archive-y", `${next.y}px`);
  };

  useEffect(() => {
    if (mode !== "canvas") return;
    setCanvasOffset({ x: 0, y: 0 });
  }, [mode, active]);

  const canvasItems = useMemo(() => {
    const media = current.media.length
      ? current.media
      : Array.from({ length: 8 }, (_, index) => ({
          id: `${current.id}-pending-${index}`,
          type: "image" as const,
          src: "",
          alt: "",
          caption: "Material en edición",
          status: current.status,
        }));

    return Array.from({ length: 30 }, (_, index) => {
      const item = media[index % media.length];
      const column = index % 6;
      const row = Math.floor(index / 6);
      const stagger = row % 2 ? 145 : 0;

      return {
        id: `${current.id}-${item.id}-${index}`,
        src: item.src,
        alt: item.alt ?? current.title,
        caption: item.caption,
        left: column * 330 + stagger + ((index * 47) % 64),
        top: row * 290 + ((index * 73) % 96),
        width: 190 + (index % 4) * 34,
      };
    });
  }, [current]);

  const moveCanvas = (deltaX: number, deltaY: number) => {
    if (mode !== "canvas") return;
    setCanvasOffset({
      x: offsetRef.current.x + deltaX,
      y: offsetRef.current.y + deltaY,
    });
  };

  return (
    <section className="documentary-archive-section" id="archivo">
      <div className="page-shell documentary-archive-heading">
        <p className="eyebrow">Archivo de campo</p>
        <h2>Fotografías, conversaciones y procesos registrados donde cada historia comienza.</h2>
      </div>

      <div className="archive-carousel page-shell" data-mode={mode}>
        <div className="archive-carousel-bar">
          <span>Categorías documentales</span>
        </div>

        <div className="archive-card-stage" aria-label="Carrusel del archivo documental">
          <div className="archive-active-title" aria-hidden="true">{current.title}</div>
          {archiveCategories.map((category, index) => {
            const offset = index - active;
            const normalized = offset < -2 ? offset + archiveCategories.length : offset > 2 ? offset - archiveCategories.length : offset;
            return (
              <button
                key={category.id}
                type="button"
                className={`archive-carousel-card ${index === active ? "is-active" : ""}`}
                style={{
                  "--tone": tones[index % tones.length],
                  "--x": `${normalized * 126}px`,
                  "--z": String(10 - Math.abs(normalized)),
                } as CSSProperties}
                onClick={() => {
                  if (index === active) {
                    setMode("canvas");
                    return;
                  }
                  setActive(index);
                }}
              >
                <span className="archive-card-picture">
                  {category.media[0]?.src ? <img src={category.media[0].src} alt={category.media[0].alt ?? category.title} /> : <i>Material en edición</i>}
                  <em className="archive-color-wipe" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="archive-carousel-caption">
          <button type="button" onClick={() => setActive((active - 1 + archiveCategories.length) % archiveCategories.length)}>Anterior</button>
          <p>{current.summary}</p>
          <button type="button" onClick={() => setActive((active + 1) % archiveCategories.length)}>Siguiente</button>
        </div>
      </div>

      <div className="page-shell archive-mobile-grid" aria-label="Categorías del archivo documental">
        {archiveCategories.map((category) => (
          <article key={category.id}>
            <span>{category.status === "confirmed" ? "Material disponible" : "Material en edición"}</span>
            <h3>{category.title}</h3>
            <p>{category.summary}</p>
          </article>
        ))}
      </div>

      {mode === "canvas" && (
        <div className="archive-overlay" role="dialog" aria-modal="true" aria-label="Lienzo infinito del archivo documental">
          <div className="archive-topbar">
            <span>{current.title}</span>
            <button type="button" onClick={() => setMode("open")}>Volver</button>
          </div>
          <div
            ref={viewportRef}
            className="archive-canvas"
            onWheel={(event) => {
              event.preventDefault();
              moveCanvas(-event.deltaX * 1.1, -event.deltaY * 1.1);
            }}
            onPointerDown={(event) => {
              dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              if (!drag || drag.pointerId !== event.pointerId) return;
              moveCanvas(event.clientX - drag.x, event.clientY - drag.y);
              dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
            }}
            onPointerUp={(event) => {
              dragRef.current = null;
              event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
          >
            <div className="archive-world">
              {canvasItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className="archive-tile"
                  style={{
                    left: `${item.left}px`,
                    top: `${item.top}px`,
                    width: `${item.width}px`,
                    "--tone": tones[index % tones.length],
                    "--delay": `${(index % 6) * 90}ms`,
                  } as CSSProperties}
                >
                  {item.src ? <img src={item.src} alt={item.alt} /> : <span>Material en edición</span>}
                  <em className="archive-color-wipe" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
