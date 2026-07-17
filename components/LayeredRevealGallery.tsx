"use client";

import { useEffect, useRef } from "react";
import styles from "./LayeredRevealGallery.module.css";

const satellites = [
  { src: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=84", alt: "Objetos editoriales", className: "one", x: -420, y: -190, start: .18 },
  { src: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=84", alt: "Productos curados", className: "two", x: 420, y: -190, start: .24 },
  { src: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=84", alt: "Producto artesanal", className: "three", x: -420, y: 185, start: .3 },
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=84", alt: "Café servido", className: "four", x: 420, y: 185, start: .36 },
  { src: "https://images.unsplash.com/photo-1523293836438-95e49e340b11?auto=format&fit=crop&w=900&q=84", alt: "Quesos regionales", className: "five", x: -500, y: 30, start: .26 },
  { src: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=900&q=84", alt: "Cacao", className: "six", x: 500, y: 25, start: .32 }
] as const;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);

export function LayeredRevealGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const center = centerRef.current;
    if (!section || !stage || !center) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      const eased = easeOut(progress);
      const mobile = window.innerWidth <= 760;
      const stageRect = stage.getBoundingClientRect();
      const gutter = mobile ? 12 : 32;

      const startW = stageRect.width - gutter * 2;
      const startH = stageRect.height - gutter * 2;
      const endW = mobile ? Math.min(stageRect.width * .42, 260) : Math.min(stageRect.width * .25, 360);
      const endH = endW * 1.24;
      const radius = 24 - eased * 8;

      center.style.width = `${startW + (endW - startW) * eased}px`;
      center.style.height = `${startH + (endH - startH) * eased}px`;
      center.style.borderRadius = `${radius}px`;
      center.style.transform = `translate(-50%, -50%) scale(${1 - eased * 0.02})`;
      center.style.boxShadow = `0 ${38 - eased * 14}px ${100 - eased * 36}px rgba(0,0,0,${0.42 - eased * 0.12})`;

      const titleOpacity = clamp(1 - progress * 2.8);
      const copyOpacity = clamp((progress - .58) / .2);
      stage.style.setProperty("--layer-title-opacity", titleOpacity.toFixed(3));
      stage.style.setProperty("--layer-title-y", `${progress * -36}px`);
      stage.style.setProperty("--layer-copy-opacity", copyOpacity.toFixed(3));
      stage.style.setProperty("--layer-copy-y", `${(1 - copyOpacity) * 26}px`);
      stage.style.setProperty("--layer-overlay", (.34 - eased * .16).toFixed(3));
      stage.style.setProperty("--layer-grid-opacity", (0.08 + eased * 0.16).toFixed(3));

      stage.querySelectorAll<HTMLElement>("[data-satellite]").forEach((item) => {
        const start = Number(item.dataset.start ?? 0);
        const local = easeOut(clamp((progress - start) / .32));
        const baseX = Number(item.dataset.x ?? 0) * (mobile ? .34 : 1);
        const baseY = Number(item.dataset.y ?? 0) * (mobile ? .46 : 1);
        const hidden = 1 - local;
        item.style.opacity = String(clamp(local * 1.08));
        item.style.transform = `translate3d(${baseX * hidden}px, ${baseY * hidden}px, 0) scale(${0.72 + local * 0.28}) rotate(${hidden * (baseX > 0 ? 3 : -3)}deg)`;
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="layered-title">
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.openingTitle}>
          <p className="eyebrow light">Una colección con origen</p>
          <h2 id="layered-title">Muchas formas.<br />Una misma raíz.</h2>
        </div>

        <div className={styles.grid} aria-hidden="true">
          {satellites.map((item) => (
            <div
              key={item.className}
              className={`${styles.satellite} ${styles[item.className]}`}
              data-satellite
              data-x={item.x}
              data-y={item.y}
              data-start={item.start}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt="" loading="lazy" />
            </div>
          ))}

          <div ref={centerRef} className={styles.centerImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1800&q=88"
              alt="Selección de objetos y productos presentada como colección"
              loading="lazy"
            />
            <div className={styles.centerShade} />
          </div>
        </div>

        <div className={styles.finalCopy}>
          <span>Selección Raíces</span>
          <h3>La imagen se recoge. La colección aparece.</h3>
          <p>Así el catálogo se siente curado: una pieza central que se repliega para abrir espacio a más oficios, productos y procedencias.</p>
          <a href="#catalogo">Ver la selección <b>↘</b></a>
        </div>

        <p className={styles.scrollNote}>Desciende para reunir la colección</p>
      </div>
    </section>
  );
}
