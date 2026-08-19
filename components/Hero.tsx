"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { heroImages } from "@/data/heroImages";
import styles from "./Hero.module.css";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));


function shuffleImages() {
  const next = [...heroImages];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function Hero() {
  const [images, setImages] = useState(heroImages);
  const [activeImage, setActiveImage] = useState(0);
  const [previousImage, setPreviousImage] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const nearViewportRef = useRef(true);
  const clearPreviousTimerRef = useRef(0);

  const visibleImageIndexes = useMemo(() => {
    if (previousImage === null || previousImage === activeImage) return [activeImage];
    return [previousImage, activeImage];
  }, [activeImage, previousImage]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const word = wordRef.current;
    if (!section || !stage || !word) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastProgress = -1;
    let lastMeasuredWidth = -1;

    const fitWord = () => {
      const stageWidth = stage.clientWidth;
      if (Math.abs(stageWidth - lastMeasuredWidth) < 0.5) return;
      lastMeasuredWidth = stageWidth;

      const probe = document.createElement("div");
      probe.textContent = "AYACUCHO";
      probe.style.cssText = [
        "position:fixed", "left:-200vw", "top:0", "width:max-content", "height:auto",
        "font-size:100px", "visibility:hidden", "white-space:nowrap", "pointer-events:none",
        "opacity:1", "background:none", "filter:none", "-webkit-text-fill-color:initial",
        'font-family:"Anton", Arial, sans-serif', "font-weight:400", "line-height:.92",
        "letter-spacing:-.032em", "text-transform:uppercase",
      ].join(";");
      document.body.appendChild(probe);
      const measured = probe.getBoundingClientRect().width;
      probe.remove();

      if (measured <= 0) return;
      const sidePadding = window.innerWidth <= 760 ? 8 : Math.max(14, window.innerWidth * 0.012);
      const available = stageWidth - sidePadding * 2;
      const fontSize = Math.min((available * 100 * 0.998) / measured, 440);
      stage.style.setProperty("--ay-word-size", `${fontSize.toFixed(2)}px`);
    };

    const update = () => {
      frame = 0;
      if (!nearViewportRef.current && !reducedMotion.matches) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = reducedMotion.matches ? 0.62 : clamp(-rect.top / distance);
      if (Math.abs(progress - lastProgress) < 0.001) return;
      lastProgress = progress;

      const mobile = window.innerWidth <= 760;
      const sceneX = progress * (mobile ? -24 : -72);
      const sceneY = progress * (mobile ? 22 : 54);
      const wordDriftProgress = clamp((progress - 0.11) / 0.5);
      const wordDriftX = wordDriftProgress * (mobile ? 38 : 108);
      const wordDriftY = wordDriftProgress * (mobile ? -16 : -42);
      const copyFade = clamp(1 - progress * 3.1);
      const wordOpacity = clamp((progress - 0.08) / 0.2);
      const wordStrength = clamp((progress - 0.15) / 0.24);
      const detailStrength = clamp((progress - 0.18) / 0.24);

      stage.style.setProperty("--ay-scene-shift-x", `${sceneX.toFixed(2)}px`);
      stage.style.setProperty("--ay-scene-shift-y", `${sceneY.toFixed(2)}px`);
      stage.style.setProperty("--ay-word-drift-x", `${wordDriftX.toFixed(2)}px`);
      stage.style.setProperty("--ay-word-drift-y", `${wordDriftY.toFixed(2)}px`);
      stage.style.setProperty("--ay-copy-opacity", copyFade.toFixed(4));
      stage.style.setProperty("--ay-copy-shift", `${progress * -44}px`);
      stage.style.setProperty("--ay-word-opacity", wordOpacity.toFixed(4));
      stage.style.setProperty("--ay-word-stroke", (wordStrength * 0.42).toFixed(4));
      stage.style.setProperty("--ay-meta-opacity", detailStrength.toFixed(4));
      stage.style.setProperty("--ay-indicator-opacity", clamp(1 - progress * 8).toFixed(4));
    };

    const requestUpdate = () => {
      if (!nearViewportRef.current && !reducedMotion.matches) return;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const onResize = () => {
      lastMeasuredWidth = -1;
      fitWord();
      requestUpdate();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        nearViewportRef.current = entry.isIntersecting;
        stage.classList.toggle(styles.isMotionActive, entry.isIntersecting);
        if (entry.isIntersecting) requestUpdate();
      },
      { rootMargin: "35% 0px 35% 0px" },
    );
    observer.observe(section);

    fitWord();
    update();
    document.fonts?.ready.then(() => {
      lastMeasuredWidth = -1;
      fitWord();
      update();
    }).catch(() => undefined);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reducedMotion.addEventListener("change", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setImages(shuffleImages());
    setActiveImage(0);
    setPreviousImage(null);
  }, []);

  useEffect(() => {
    if (!images.length || document.hidden) return;
    const preload = new window.Image();
    preload.src = images[(activeImage + 1) % images.length].src;
  }, [activeImage, images]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const interval = window.setInterval(() => {
      if (!nearViewportRef.current || document.hidden) return;
      setActiveImage((current) => {
        const next = (current + 1) % images.length;
        setPreviousImage(current);
        window.clearTimeout(clearPreviousTimerRef.current);
        clearPreviousTimerRef.current = window.setTimeout(() => setPreviousImage(null), 1450);
        const following = new window.Image();
        following.src = images[(next + 1) % images.length].src;
        return next;
      });
    }, 6200);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(clearPreviousTimerRef.current);
    };
  }, [images]);

  return (
    <section ref={sectionRef} className={styles.hero} id="inicio">
      <div ref={stageRef} className={`${styles.stage} ${styles.isMotionActive}`}>
        <div className={styles.scene} aria-hidden="true">
          {visibleImageIndexes.map((index) => {
            const image = images[index];
            return (
              <div
                key={image.src}
                className={`${styles.sceneImage} ${activeImage === index ? styles.isActive : ""}`}
                style={{ backgroundImage: `url("${image.src}")` }}
              />
            );
          })}
        </div>
        <div className={styles.ambient} aria-hidden="true" />

        <div className={`${styles.copy} page-shell`}>
          <p className="eyebrow light">Ayacucho y cultura</p>
          <h1>
            Raíces
            <span className="sr-only"> — Café y Cultura: café ayacuchano, alimentos y arte de Ayacucho en Lima</span>
          </h1>
          <p className={styles.lead}>Un espacio en Lima donde Ayacucho se comparte a través de sus sabores, sus personas, su arte y sus historias.</p>
          <p className={styles.lead}>Raíces reúne productos, alimentos, obras y relatos vinculados con Ayacucho. Cada elemento del espacio busca conservar su procedencia y reconocer a las personas que lo producen, elaboran o crean.</p>
          <div className={styles.actions}>
            <a className="button button-light" href="/catalogo">Ver catálogo</a>
            <a className="text-link light-link" href="#historia">Conocer nuestra historia <span>↘</span></a>
            <a className="text-link light-link" href="#visita">Cómo llegar <span>↘</span></a>
          </div>
        </div>

        <div ref={wordRef} className={styles.word} aria-hidden="true">
          {visibleImageIndexes.map((index) => {
            const image = images[index];
            return (
              <span
                key={image.src}
                className={`${styles.wordImage} ${activeImage === index ? styles.isActive : ""}`}
                data-word="AYACUCHO"
                style={{ backgroundImage: `url("${image.src}")` }}
              >
                AYACUCHO
              </span>
            );
          })}
        </div>

        <p className={styles.scrollIndicator}><span>↓</span> Desliza para descubrir</p>
        <p className={styles.wordMeta}><i /> origen · sierra sur · ayacucho</p>
        <p className={styles.credit}>Marca, Ayacucho · fotografía editorial</p>
      </div>
    </section>
  );
}
