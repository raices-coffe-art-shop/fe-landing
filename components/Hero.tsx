"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const word = wordRef.current;
    if (!section || !stage || !word) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const fitWord = () => {
      const probe = word.cloneNode(true) as HTMLDivElement;
      probe.removeAttribute("aria-hidden");
      probe.style.cssText = [
        "position:fixed",
        "left:-200vw",
        "top:0",
        "width:max-content",
        "height:auto",
        "font-size:100px",
        "visibility:hidden",
        "white-space:nowrap",
        "pointer-events:none",
        "opacity:1",
        "background:none",
        "filter:none",
        "-webkit-text-fill-color:initial"
      ].join(";");
      document.body.appendChild(probe);
      const measured = probe.getBoundingClientRect().width;
      probe.remove();

      if (measured <= 0) return;
      const sidePadding = window.innerWidth <= 760 ? 8 : Math.max(14, window.innerWidth * 0.012);
      const available = stage.clientWidth - sidePadding * 2;
      const fontSize = Math.min((available * 100 * 0.998) / measured, 440);
      stage.style.setProperty("--ay-word-size", `${fontSize.toFixed(2)}px`);
    };

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = reducedMotion.matches ? 0.62 : clamp(-rect.top / distance);
      const mobile = window.innerWidth <= 760;

      const sceneX = progress * (mobile ? -28 : -88);
      const sceneY = progress * (mobile ? 28 : 70);
      const wordX = progress * (mobile ? 148 : 362);
      const wordY = progress * (mobile ? -66 : -146);
      const copyFade = clamp(1 - progress * 3.1);
      const wordOpacity = clamp((progress - 0.05) / 0.16);
      const wordStrength = clamp((progress - 0.16) / 0.22);
      const detailStrength = clamp((progress - 0.18) / 0.24);

      stage.style.setProperty("--ay-scene-x", `calc(50% + ${sceneX}px)`);
      stage.style.setProperty("--ay-scene-y", `calc(50% + ${sceneY}px)`);
      stage.style.setProperty("--ay-word-x", `calc(50% + ${wordX}px)`);
      stage.style.setProperty("--ay-word-y", `calc(50% + ${wordY}px)`);
      stage.style.setProperty("--ay-copy-opacity", copyFade.toFixed(4));
      stage.style.setProperty("--ay-copy-shift", `${progress * -44}px`);
      stage.style.setProperty("--ay-word-opacity", wordOpacity.toFixed(4));
      stage.style.setProperty("--ay-word-stroke", (wordStrength * 0.42).toFixed(4));
      stage.style.setProperty("--ay-meta-opacity", detailStrength.toFixed(4));
      stage.style.setProperty("--ay-indicator-opacity", clamp(1 - progress * 8).toFixed(4));
      stage.style.setProperty("--ay-photo-scale", (1 + progress * 0.055).toFixed(4));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const onResize = () => {
      fitWord();
      requestUpdate();
    };

    fitWord();
    update();
    document.fonts?.ready.then(() => {
      fitWord();
      update();
    });

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize);
    reducedMotion.addEventListener("change", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero} id="inicio">
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.scene} aria-hidden="true" />
        <div className={styles.ambient} aria-hidden="true" />

        <div className={`${styles.copy} page-shell`}>
          <p className="eyebrow light">Raíces · Café y Cultura</p>
          <h1>Todos volvemos a nuestras raíces.</h1>
          <p className={styles.lead}>
            Un espacio en Lima donde el café, la miel, el cacao y el arte cuentan quiénes los hicieron posibles.
          </p>
          <div className={styles.actions}>
            <a className="button button-light" href="#historia">Conocer la historia</a>
            <a className="text-link light-link" href="#catalogo">Explorar productos <span>↘</span></a>
          </div>
        </div>

        <div
          ref={wordRef}
          className={styles.word}
          data-word="AYACUCHO"
          aria-hidden="true"
        >
          AYACUCHO
        </div>

        <p className={styles.scrollIndicator}><span>↓</span> Desliza para descubrir</p>
        <p className={styles.wordMeta}><i /> origen · sierra sur · ayacucho</p>
        <p className={styles.credit}>Marca, Ayacucho · fotografía editorial</p>
      </div>
    </section>
  );
}
