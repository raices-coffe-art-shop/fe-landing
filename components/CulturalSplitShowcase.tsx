"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { EditorialImage } from "@/components/EditorialImage";
import { artShopSlides as slides } from "@/data/art";

export function CulturalSplitShowcase() {
  const [active, setActive] = useState(0);
  const [mobileActive, setMobileActive] = useState(0);
  const mobileStoryRef = useRef<HTMLDivElement | null>(null);
  const slide = slides[active];
  const mobileSlide = slides[mobileActive] ?? slides[0];

  useEffect(() => {
    const story = mobileStoryRef.current;
    if (!story) return;

    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let loopFrame = 0;

    const update = () => {
      frame = 0;
      if (!mobileQuery.matches || reducedQuery.matches) return;

      const rect = story.getBoundingClientRect();
      const distance = Math.max(1, story.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      const nextActive = Math.min(slides.length - 1, Math.floor(progress * slides.length));

      story.style.setProperty("--art-mobile-progress", progress.toFixed(4));
      setMobileActive((current) => (current === nextActive ? current : nextActive));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const startLoop = () => {
      window.cancelAnimationFrame(loopFrame);
      const tick = () => {
        update();
        loopFrame = window.requestAnimationFrame(tick);
      };
      loopFrame = window.requestAnimationFrame(tick);
    };

    const sync = () => {
      window.cancelAnimationFrame(loopFrame);
      if (mobileQuery.matches && !reducedQuery.matches) {
        startLoop();
      } else {
        story.style.setProperty("--art-mobile-progress", "0");
        setMobileActive(0);
      }
      requestUpdate();
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    mobileQuery.addEventListener("change", sync);
    reducedQuery.addEventListener("change", sync);
    sync();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      mobileQuery.removeEventListener("change", sync);
      reducedQuery.removeEventListener("change", sync);
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(loopFrame);
    };
  }, []);

  return (
    <div className="cultural-split-showcase page-shell">
      <div className="split-stage" key={slide.number}>
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
            <Link href={`/catalogo/${slide.catalogSlug}`}>Ver en catálogo ↗</Link>
          </div>
        </div>
      </div>

      <div className="split-pagination" role="tablist" aria-label="Bloques de arte en Raíces">
        {slides.map((item, index) => (
          <button
            key={item.number}
            role="tab"
            aria-selected={active === index}
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
          >
            <span className="split-nav-number">{item.number}</span>
            <span className="split-nav-preview" aria-hidden="true">
              <img src={item.left} alt="" />
              <img src={item.right} alt="" />
            </span>
            <b>{item.eyebrow}</b>
          </button>
        ))}
      </div>

      <div
        ref={mobileStoryRef}
        className="art-mobile-story"
        style={{ "--art-mobile-scroll": `${slides.length * 64}svh` } as CSSProperties}
      >
        <div className="art-mobile-sticky">
          <div className="art-mobile-visual" aria-label={`Obra ${mobileSlide.number}: ${mobileSlide.eyebrow}`}>
            {slides.map((item, index) => (
              <img
                key={item.number}
                src={item.left}
                alt={item.leftAlt}
                className={mobileActive === index ? "is-active" : ""}
              />
            ))}
            <div className="art-mobile-counter" aria-hidden="true">
              <b>{mobileSlide.number}</b>
              <span>/ {slides.length.toString().padStart(2, "0")}</span>
            </div>
          </div>

          <div key={mobileSlide.number} className="art-mobile-copy" aria-live="polite">
            <span>{mobileSlide.eyebrow}</span>
            <h3>{mobileSlide.title}</h3>
            <p>{mobileSlide.text}</p>
            <Link href={`/catalogo/${mobileSlide.catalogSlug}`}>Ver en catálogo ↗</Link>
          </div>

          <div className="art-mobile-progress" aria-hidden="true">
            <span>Arte en Raíces</span>
            <i><b /></i>
          </div>
        </div>
        <div className="art-mobile-steps" aria-hidden="true">
          {slides.map((item) => <div key={item.number} />)}
        </div>
        <div className="art-mobile-reduced-list" aria-label="Bloques de arte en Raíces">
          {slides.map((item) => (
            <article key={item.number}>
              <img src={item.left} alt={item.leftAlt} />
              <span>{item.number} · {item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link href={`/catalogo/${item.catalogSlug}`}>Ver en catálogo ↗</Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
