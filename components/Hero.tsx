"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const heroImages = [
  {
    src: "/hero-principal.png",
    alt: "Francisco Arica y Lized en una zona de cultivo vinculada con Raíces",
  },
  {
    src: "/ayacucho-sacsamarca.jpg",
    alt: "Paisaje de Sacsamarca en Ayacucho",
  },
  {
    src: "/ayacucho-hero-1.jpg",
    alt: "Vista aérea de la plaza principal de Ayacucho",
  },
  {
    src: "/ayacucho-hero-2.jpeg",
    alt: "Piscinas naturales turquesas entre formaciones rocosas",
  },
  {
    src: "/ayacucho-hero-3.jpg",
    alt: "Valle ayacuchano rodeado de montañas",
  },
  {
    src: "/ayacucho-hero-4.webp",
    alt: "Cañón rocoso con pozas de agua turquesa",
  },
  {
    src: "/ayacucho-hero-5.jpg",
    alt: "Campos andinos bajo un cielo nublado",
  },
  {
    src: "/ayacucho-hero-6.png",
    alt: "Persona observando terrazas agrícolas en los Andes",
  },
];

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
      const probe = document.createElement("div");
      probe.textContent = "AYACUCHO";
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
        "-webkit-text-fill-color:initial",
        'font-family:"Anton", Arial, sans-serif',
        "font-weight:400",
        "line-height:.92",
        "letter-spacing:-.032em",
        "text-transform:uppercase"
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
      const wordX = mobile ? sceneX : progress * 362;
      const wordY = mobile ? sceneY : progress * -146;
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

  useEffect(() => {
    setImages(shuffleImages());
    setActiveImage(0);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, 6200);

    return () => window.clearInterval(interval);
  }, [images.length]);

  return (
    <section ref={sectionRef} className={styles.hero} id="inicio">
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.scene} aria-hidden="true">
          {images.map((image, index) => (
            <div
              key={image.src}
              className={`${styles.sceneImage} ${activeImage === index ? styles.isActive : ""}`}
              style={{ backgroundImage: `url("${image.src}")` }}
            />
          ))}
        </div>
        <div className={styles.ambient} aria-hidden="true" />

        <div className={`${styles.copy} page-shell`}>
          <p className="eyebrow light">Ayacucho y cultura</p>
          <h1>Raíces</h1>
          <p className={styles.lead}>
            Un espacio en Lima donde Ayacucho se comparte a través de sus sabores, sus personas, su arte y sus historias.
          </p>
          <p className={styles.lead}>
            Raíces reúne productos, alimentos, obras y relatos vinculados con Ayacucho. Cada elemento del espacio busca conservar su procedencia y reconocer a las personas que lo producen, elaboran o crean.
          </p>
          <div className={styles.actions}>
            <a className="button button-light" href="/catalogo">Ver catálogo</a>
            <a className="text-link light-link" href="#historia">Conocer nuestra historia <span>↘</span></a>
            <a className="text-link light-link" href="#visita">Cómo llegar <span>↘</span></a>
          </div>
        </div>

        <div
          ref={wordRef}
          className={styles.word}
          aria-hidden="true"
        >
          {images.map((image, index) => (
            <span
              key={image.src}
              className={`${styles.wordImage} ${activeImage === index ? styles.isActive : ""}`}
              data-word="AYACUCHO"
              style={{ backgroundImage: `url("${image.src}")` }}
            >
              AYACUCHO
            </span>
          ))}
        </div>

        <p className={styles.scrollIndicator}><span>↓</span> Desliza para descubrir</p>
        <p className={styles.wordMeta}><i /> origen · sierra sur · ayacucho</p>
        <p className={styles.credit}>Marca, Ayacucho · fotografía editorial</p>
      </div>
    </section>
  );
}
