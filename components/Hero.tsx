"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = reduced ? 0 : clamp(-rect.top / distance);

      stage.style.setProperty("--hero-progress", progress.toFixed(4));
      const travelled = clamp(-rect.top, 0, distance);
      const wordReveal = clamp((progress - 0.015) / 0.27);

      stage.style.setProperty("--hero-bg-x", `${50 + progress * 8}%`);
      stage.style.setProperty("--hero-bg-y", `${48 + progress * 5}%`);
      stage.style.setProperty("--hero-word-bg-x", `calc(50% + ${travelled * 0.62}px)`);
      stage.style.setProperty("--hero-word-bg-y", `calc(48% + ${travelled * 0.42}px)`);
      stage.style.setProperty("--hero-photo-scale", (1.035 + progress * 0.08).toFixed(4));
      stage.style.setProperty("--hero-copy-opacity", String(Math.max(0, 1 - progress * 1.8)));
      stage.style.setProperty("--hero-copy-y", `${progress * -64}px`);
      stage.style.setProperty("--hero-side-opacity", String(Math.max(0, 1 - progress * 2.1)));
      stage.style.setProperty("--hero-side-y", `${progress * -34}px`);
      stage.style.setProperty("--hero-word-y", `${progress * -54}px`);
      stage.style.setProperty("--hero-word-scale", (1 + progress * 0.012).toFixed(4));
      stage.style.setProperty("--hero-word-opacity", String(wordReveal));
      stage.style.setProperty("--hero-word-stroke-opacity", String(clamp((progress - 0.08) / 0.3) * 0.28));
      stage.style.setProperty("--hero-credit-opacity", String(Math.max(0, 1 - progress * 1.6)));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero" id="inicio">
      <div ref={stageRef} className="hero-sticky">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-content page-shell">
          <div className="hero-copy">
            <p className="eyebrow light">Raíces · Café y Cultura</p>
            <h1>Todos volvemos a nuestras raíces.</h1>
            <p className="hero-lead">
              Un espacio en Lima donde el café, la miel, el cacao y el arte cuentan quiénes los hicieron posibles.
            </p>
            <div className="hero-actions">
              <a className="button button-light" href="#territorio">Recorrer la historia</a>
              <a className="text-link light-link" href="#catalogo">Explorar productos <span>↘</span></a>
            </div>
          </div>

          <div className="hero-side-notes" aria-hidden="true">
            <div className="hero-vertical-note">Desciende para descubrir</div>
            <div className="hero-index">
              <span>Origen</span><span>Ayacucho</span>
              <span>Encuentro</span><span>Lima</span>
            </div>
          </div>
        </div>

        <div className="hero-word-wrap" aria-hidden="true">
          <div className="hero-word" data-word="AYACUCHO">AYACUCHO</div>
          <div className="hero-word-caption">
            <span>13°09′S · 74°13′O</span>
            <i />
            <span>Territorio, memoria y oficio</span>
          </div>
        </div>

        <p className="hero-photo-credit">Sacsamarca, Ayacucho · fotografía editorial</p>
      </div>
    </section>
  );
}
