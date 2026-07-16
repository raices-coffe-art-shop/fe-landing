"use client";

import { useEffect, useRef } from "react";

type Word = {
  label: string;
  translation?: string;
  x: number;
  y: number;
  start: number;
  tone: "clay" | "green" | "honey" | "ink";
  size: "sm" | "md" | "lg";
};

const words: Word[] = [
  { label: "Willakuy", translation: "relato", x: 9, y: 18, start: 0.08, tone: "clay", size: "md" },
  { label: "Memoria", x: 68, y: 13, start: 0.14, tone: "ink", size: "sm" },
  { label: "Kawsay", translation: "vida", x: 78, y: 32, start: 0.22, tone: "green", size: "lg" },
  { label: "Paqariy", translation: "origen", x: 13, y: 39, start: 0.29, tone: "honey", size: "lg" },
  { label: "Café", x: 72, y: 71, start: 0.36, tone: "clay", size: "md" },
  { label: "Saphi", translation: "raíz", x: 17, y: 76, start: 0.43, tone: "green", size: "lg" },
  { label: "Arte", x: 52, y: 84, start: 0.5, tone: "ink", size: "sm" },
  { label: "Familia", x: 42, y: 9, start: 0.57, tone: "honey", size: "md" },
  { label: "Ñawpa", translation: "lo antiguo", x: 5, y: 58, start: 0.64, tone: "clay", size: "md" },
  { label: "Territorio", x: 76, y: 54, start: 0.71, tone: "green", size: "sm" },
  { label: "Unay", translation: "tiempo atrás", x: 31, y: 68, start: 0.78, tone: "honey", size: "md" },
  { label: "Oficio", x: 58, y: 29, start: 0.85, tone: "clay", size: "sm" }
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function AyacuchoLexicon() {
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
      const progress = reduced ? 0.52 : clamp(-rect.top / distance);
      stage.style.setProperty("--lexicon-progress", progress.toFixed(4));

      stage.querySelectorAll<HTMLElement>("[data-lexicon-word]").forEach((element) => {
        const start = Number(element.dataset.start ?? 0.5);
        const spread = 0.19;
        const intensity = clamp(1 - Math.abs(progress - start) / spread);
        const direction = progress < start ? -1 : 1;
        const depth = (1 - intensity) * 620 * direction;
        const scale = 0.62 + intensity * 0.52;
        const blur = (1 - intensity) * 7;
        element.style.opacity = String(0.08 + intensity * 0.92);
        element.style.filter = `blur(${blur.toFixed(2)}px)`;
        element.style.transform = `translate3d(0, 0, ${depth.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      });
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
    <section ref={sectionRef} className="lexicon-section" aria-label="Palabras que representan Ayacucho">
      <div ref={stageRef} className="lexicon-sticky">
        <div className="lexicon-texture" aria-hidden="true" />
        <div className="lexicon-center">
          <p>Una región contada desde muchas voces</p>
          <strong>AYACUCHO</strong>
          <span>Palabras, productos y memorias que regresan al origen.</span>
        </div>

        {words.map((word) => (
          <div
            key={word.label}
            data-lexicon-word
            data-start={word.start}
            className={`lexicon-word tone-${word.tone} size-${word.size}`}
            style={{ left: `${word.x}%`, top: `${word.y}%` }}
          >
            <b>{word.label}</b>
            {word.translation && <small>{word.translation}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}
