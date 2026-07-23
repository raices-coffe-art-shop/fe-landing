"use client";

import { useEffect, useRef } from "react";
import { quechuaTerms } from "@/data/documentary";

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
  ...quechuaTerms.map((term, index) => ({
    label: term.term,
    translation: term.translationEs,
    x: [9, 78, 13, 17, 5, 31][index] ?? 50,
    y: [18, 32, 39, 76, 58, 68][index] ?? 50,
    start: [0.08, 0.22, 0.29, 0.43, 0.64, 0.78][index] ?? 0.5,
    tone: ["clay", "green", "honey", "green", "clay", "honey"][index] as Word["tone"],
    size: ["md", "lg", "lg", "lg", "md", "md"][index] as Word["size"],
  })),
  { label: "Memoria", x: 68, y: 13, start: 0.14, tone: "ink", size: "sm" },
  { label: "Café", x: 72, y: 71, start: 0.36, tone: "clay", size: "md" },
  { label: "Arte", x: 52, y: 84, start: 0.5, tone: "ink", size: "sm" },
  { label: "Familia", x: 42, y: 9, start: 0.57, tone: "honey", size: "md" },
  { label: "Territorio", x: 76, y: 54, start: 0.71, tone: "green", size: "sm" },
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

      // Keep the handoff concise: Huamanga remains fully present first, then
      // Ayacucho takes over without a long interval where both look faint.
      const huamangaOut = reduced ? 1 : clamp((progress - 0.37) / 0.2);
      const ayacuchoIn = reduced ? 1 : clamp((progress - 0.34) / 0.21);
      stage.style.setProperty("--lexicon-huamanga-opacity", (1 - huamangaOut).toFixed(4));
      stage.style.setProperty("--lexicon-huamanga-blur", `${(huamangaOut * 6).toFixed(2)}px`);
      stage.style.setProperty("--lexicon-huamanga-y", `${(-10 * huamangaOut).toFixed(2)}px`);
      stage.style.setProperty("--lexicon-ayacucho-opacity", ayacuchoIn.toFixed(4));
      stage.style.setProperty("--lexicon-ayacucho-blur", `${((1 - ayacuchoIn) * 5).toFixed(2)}px`);
      stage.style.setProperty("--lexicon-ayacucho-y", `${(12 * (1 - ayacuchoIn)).toFixed(2)}px`);

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
          <p>Una lengua no solo nombra el territorio</p>
          <strong className="lexicon-title-stack">
            <span className="lexicon-title-word lexicon-title-huamanga">HUAMANGA</span>
            <span className="lexicon-title-word lexicon-title-ayacucho">AYACUCHO</span>
          </strong>
          <span>El quechua fue el puente que permitió a Raíces escuchar historias, comprender procesos y construir relaciones directas.</span>
          <small className="lexicon-validation-note">Términos quechua pendientes de revisión por Lized o hablante competente.</small>
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
