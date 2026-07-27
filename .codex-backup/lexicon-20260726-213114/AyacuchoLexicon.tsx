"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { RootsStageCanvas } from "@/components/roots/RootsStageCanvas";
import { quechuaTerms } from "@/data/documentary";

type Tone = "clay" | "green" | "honey" | "ink";
type Size = "sm" | "md" | "lg";

type LexiconWord = {
  term: string;
  translation?: string;
  context?: string;
  validationStatus?: "validated" | "pending-review" | "internal";
  tone: Tone;
  size: Size;
  row: number;
  col: number;
  start: number;
  end: number;
};

const ranges: Array<[number, number]> = [
  [40, 50], [20, 30], [52, 62], [50, 60], [45, 55], [10, 20], [90, 100], [30, 40],
  [80, 90], [70, 80], [-10, 50], [52, 62], [15, 25], [7, 17], [75, 85], [3, 13],
  [87, 97], [42, 52], [57, 67], [37, 47], [12, 22], [8, 18], [84, 94], [33, 43],
  [48, 58], [13, 23], [78, 88], [62, 72], [31, 41], [8, 18], [4, 14], [74, 84],
  [61, 71], [26, 36], [63, 73], [11, 21], [89, 99], [33, 43], [88, 98], [22, 32],
  [16, 26], [26, 36], [66, 76], [3, 13], [44, 54], [11, 21], [23, 33], [39, 49],
  [59, 69], [6, 16], [72, 82], [28, 38],
];

const areas: Array<[number, number]> = [
  [1,1], [1,2], [1,3], [1,4], [2,1], [2,2], [2,3], [2,4],
  [3,1], [3,2], [3,3], [3,4], [4,1], [4,2], [4,3], [4,4],
  [2,1], [2,2], [2,3], [2,4], [3,1], [3,2], [3,3], [3,4],
  [1,1], [1,2], [1,3], [1,4], [4,1], [4,2], [4,3], [4,4],
  [2,1], [2,2], [2,3], [2,4], [3,1], [3,2], [3,3], [3,4],
  [1,1], [1,2], [1,3], [1,4], [4,1], [4,2], [4,3], [4,4],
  [3,1], [3,2], [3,3], [3,4],
];

const editorialWords: Array<Omit<LexiconWord, "row" | "col" | "start" | "end">> = [
  { term: "Memoria", tone: "ink", size: "sm", validationStatus: "internal" },
  { term: "Oficio", tone: "clay", size: "sm", validationStatus: "internal" },
  { term: "Territorio", tone: "green", size: "sm", validationStatus: "internal" },
  { term: "Familia", tone: "honey", size: "md", validationStatus: "internal" },
  { term: "Semilla", tone: "green", size: "md", validationStatus: "internal" },
  { term: "Encuentro", tone: "honey", size: "sm", validationStatus: "internal" },
  { term: "Café", tone: "clay", size: "md", validationStatus: "internal" },
  { term: "Arte", tone: "ink", size: "sm", validationStatus: "internal" },
  { term: "Quechua", tone: "honey", size: "md", validationStatus: "internal" },
  { term: "Fogón", tone: "clay", size: "sm", validationStatus: "internal" },
  { term: "Grano", tone: "honey", size: "sm", validationStatus: "internal" },
  { term: "Camino", tone: "clay", size: "sm", validationStatus: "internal" },
  { term: "Montaña", tone: "ink", size: "md", validationStatus: "internal" },
  { term: "Siembra", tone: "green", size: "md", validationStatus: "internal" },
  { term: "Cosecha", tone: "green", size: "md", validationStatus: "internal" },
  { term: "Maíz", tone: "honey", size: "sm", validationStatus: "internal" },
  { term: "Retablo", tone: "honey", size: "sm", validationStatus: "internal" },
  { term: "Taller", tone: "green", size: "sm", validationStatus: "internal" },
  { term: "Comunidad", tone: "ink", size: "md", validationStatus: "internal" },
  { term: "Historia", tone: "clay", size: "sm", validationStatus: "internal" },
  { term: "Origen", tone: "honey", size: "md", validationStatus: "internal" },
  { term: "Chacra", tone: "green", size: "sm", validationStatus: "internal" },
  { term: "Floración", tone: "clay", size: "md", validationStatus: "internal" },
  { term: "Pan Chapla", tone: "honey", size: "md", validationStatus: "internal" },
  { term: "Cacao", tone: "clay", size: "sm", validationStatus: "internal" },
  { term: "Miel", tone: "honey", size: "sm", validationStatus: "internal" },
  { term: "Ayacucho", tone: "green", size: "sm", validationStatus: "internal" },
  { term: "Huamanga", tone: "clay", size: "sm", validationStatus: "internal" },
  { term: "Raíces", tone: "honey", size: "md", validationStatus: "internal" },
];

const quechuaWordStyles: Array<Pick<LexiconWord, "tone" | "size">> = [
  { tone: "clay", size: "lg" },
  { tone: "green", size: "lg" },
  { tone: "honey", size: "lg" },
  { tone: "green", size: "lg" },
  { tone: "honey", size: "lg" },
  { tone: "ink", size: "lg" },
];

const sourceWords: Array<Omit<LexiconWord, "row" | "col" | "start" | "end">> = [
  ...quechuaTerms.map((item, index) => ({
    ...item,
    ...quechuaWordStyles[index % quechuaWordStyles.length],
  })),
  ...editorialWords,
];

const words: LexiconWord[] = sourceWords.map((word, index) => ({
  ...word,
  row: areas[index][0],
  col: areas[index][1],
  start: ranges[index][0],
  end: ranges[index][1],
}));

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function applyZoomFrame(element: HTMLElement, phase: number) {
  if (phase <= 0) {
    element.style.opacity = "0";
    element.style.filter = "blur(5px)";
    element.style.transform = "translate3d(0, 0, -1000px)";
    return;
  }

  if (phase >= 1) {
    element.style.opacity = "0";
    element.style.filter = "blur(5px)";
    element.style.transform = "translate3d(0, 0, 1000px)";
    return;
  }

  if (phase <= 0.5) {
    const local = phase / 0.5;
    element.style.opacity = local.toFixed(4);
    element.style.filter = `blur(${(5 * (1 - local)).toFixed(2)}px)`;
    element.style.transform = `translate3d(0, 0, ${(-1000 + 1000 * local).toFixed(1)}px)`;
    return;
  }

  const local = (phase - 0.5) / 0.5;
  element.style.opacity = (1 - local).toFixed(4);
  element.style.filter = `blur(${(5 * local).toFixed(2)}px)`;
  element.style.transform = `translate3d(0, 0, ${(1000 * local).toFixed(1)}px)`;
}

export function AyacuchoLexicon() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nativeScrollTimeline = typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()") === true;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight * 0.72);
      const reduced = reducedQuery.matches;
      const progress = reduced ? 0.5 : clamp((-rect.top - window.innerHeight * 0.08) / distance);
      stage.style.setProperty("--lexicon-progress", progress.toFixed(4));

      const raicesOut = reduced ? 1 : smoothstep((progress - 0.2) / 0.16);
      const huamangaIn = reduced ? 0 : smoothstep((progress - 0.2) / 0.14);
      const huamangaOut = reduced ? 1 : smoothstep((progress - 0.55) / 0.16);
      const ayacuchoIn = reduced ? 1 : smoothstep((progress - 0.56) / 0.18);
      stage.style.setProperty("--lexicon-raices-opacity", (1 - raicesOut).toFixed(4));
      stage.style.setProperty("--lexicon-raices-blur", `${(raicesOut * 5.4).toFixed(2)}px`);
      stage.style.setProperty("--lexicon-raices-y", `${(-8 * raicesOut).toFixed(2)}px`);
      stage.style.setProperty("--lexicon-huamanga-opacity", (huamangaIn * (1 - huamangaOut)).toFixed(4));
      stage.style.setProperty("--lexicon-huamanga-blur", `${((1 - huamangaIn + huamangaOut) * 5).toFixed(2)}px`);
      stage.style.setProperty("--lexicon-huamanga-y", `${(12 * (1 - huamangaIn) - 8 * huamangaOut).toFixed(2)}px`);
      stage.style.setProperty("--lexicon-ayacucho-opacity", ayacuchoIn.toFixed(4));
      stage.style.setProperty("--lexicon-ayacucho-blur", `${((1 - ayacuchoIn) * 5).toFixed(2)}px`);
      stage.style.setProperty("--lexicon-ayacucho-y", `${(12 * (1 - ayacuchoIn)).toFixed(2)}px`);

      stage.querySelectorAll<HTMLElement>("[data-lexicon-word]").forEach((element) => {
        const start = Number(element.dataset.start ?? 0);
        const end = Number(element.dataset.end ?? 100);

        if (reduced) {
          element.style.opacity = "0.74";
          element.style.filter = "none";
          element.style.transform = "translate3d(0,0,0)";
          return;
        }

        if (nativeScrollTimeline) {
          element.style.removeProperty("opacity");
          element.style.removeProperty("filter");
          element.style.removeProperty("transform");
          return;
        }

        const phase = (progress * 100 - start) / Math.max(1, end - start);
        applyZoomFrame(element, phase);
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("orientationchange", onScroll);
    reducedQuery.addEventListener("change", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("orientationchange", onScroll);
      reducedQuery.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} className="lexicon-section" id="lengua" data-roots-stage="lexicon" aria-label="Palabras que representan Ayacucho">
      <div ref={stageRef} className="lexicon-sticky lexicon-stuck-grid">
        <div className="lexicon-texture" aria-hidden="true" />
        <RootsStageCanvas stage="lexicon" className="lexicon-roots" />

        {words.map((word, index) => {
          const style = {
            gridRow: `${word.row}`,
            gridColumn: `${word.col}`,
            ["--range-start" as string]: `${word.start}%`,
            ["--range-end" as string]: `${word.end}%`,
          } as CSSProperties;

          return (
            <div
              key={`${word.term}-${index}`}
              data-lexicon-word
              data-start={word.start}
              data-end={word.end}
              className={`lexicon-grid-item tone-${word.tone} size-${word.size}`}
              style={style}
            >
              <b>{word.term}</b>
              {word.translation && word.validationStatus === "validated" && <small>{word.translation}</small>}
            </div>
          );
        })}

        <div className="lexicon-center lexicon-special-copy">
          <p>Lengua, memoria e identidad</p>
          <strong className="lexicon-title-stack">
            <span className="lexicon-title-word lexicon-title-raices">RAÍCES</span>
            <span className="lexicon-title-word lexicon-title-huamanga">HUAMANGA</span>
            <span className="lexicon-title-word lexicon-title-ayacucho">AYACUCHO</span>
          </strong>
          <span>Raíces es el nombre del proyecto. Huamanga y Ayacucho son nombres que guardan distintas etapas de una misma tierra.</span>
          <small className="lexicon-validation-note">En Raíces, el quechua ha sido una herramienta real para conversar, generar confianza y construir relaciones con productores y proveedores originarios de Ayacucho.</small>
        </div>
      </div>
    </section>
  );
}
