"use client";

import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { RootsStageCanvas } from "@/components/roots/RootsStageCanvas";
import { quechuaTerms } from "@/data/documentary";

type Tone = "clay" | "green" | "honey" | "neutral";
type Size = "small" | "medium" | "large";

type LexiconWordAppearance = {
  id: string;
  label: string;
  translation?: string;
  row: 1 | 2 | 3 | 4;
  column: 1 | 2 | 3 | 4;
  start: number;
  end: number;
  size: Size;
  tone: Tone;
};

type LexiconSpecial = {
  id: "raices" | "huamanga" | "ayacucho";
  label: string;
  start: number;
  end: number;
};

type AnimatedLexiconElement = {
  element: HTMLElement;
  animation: Animation;
  start: number;
  end: number;
};

const cellSequence: Array<[LexiconWordAppearance["row"], LexiconWordAppearance["column"]]> = [
  [1, 1], [1, 2], [1, 3], [1, 4],
  [2, 1], [2, 2], [2, 3], [2, 4],
  [3, 1], [3, 2], [3, 3], [3, 4],
  [4, 1], [4, 2], [4, 3], [4, 4],
  [2, 1], [2, 2], [2, 3], [2, 4],
  [3, 1], [3, 2], [3, 3], [3, 4],
  [1, 1], [1, 2], [1, 3], [1, 4],
  [4, 1], [4, 2], [4, 3], [4, 4],
  [2, 1], [2, 2], [2, 3], [2, 4],
  [3, 1], [3, 2], [3, 3], [3, 4],
  [1, 1], [1, 2], [1, 3], [1, 4],
  [4, 1], [4, 2], [4, 3], [4, 4],
  [3, 1], [3, 2],
];

const rangeSequence: Array<[number, number]> = [
  [0.40, 0.50], [0.20, 0.30], [0.52, 0.62], [0.50, 0.60],
  [0.45, 0.55], [0.10, 0.20], [0.90, 1.00], [0.30, 0.40],
  [0.80, 0.90], [0.70, 0.80], [0.00, 0.50], [0.52, 0.62],
  [0.15, 0.25], [0.07, 0.17], [0.75, 0.85], [0.03, 0.13],
  [0.87, 0.97], [0.42, 0.52], [0.57, 0.67], [0.37, 0.47],
  [0.12, 0.22], [0.08, 0.18], [0.84, 0.94], [0.33, 0.43],
  [0.48, 0.58], [0.13, 0.23], [0.78, 0.88], [0.62, 0.72],
  [0.31, 0.41], [0.08, 0.18], [0.04, 0.14], [0.74, 0.84],
  [0.61, 0.71], [0.26, 0.36], [0.63, 0.73], [0.11, 0.21],
  [0.89, 0.99], [0.33, 0.43], [0.88, 0.98], [0.22, 0.32],
  [0.16, 0.26], [0.26, 0.36], [0.66, 0.76], [0.03, 0.13],
  [0.44, 0.54], [0.11, 0.21], [0.23, 0.33], [0.39, 0.49],
  [0.59, 0.69], [0.06, 0.16],
];

const specialWords: LexiconSpecial[] = [
  { id: "raices", label: "RAÍCES", start: 0.06, end: 0.29 },
  { id: "huamanga", label: "HUAMANGA", start: 0.36, end: 0.61 },
  { id: "ayacucho", label: "AYACUCHO", start: 0.68, end: 0.93 },
];

const editorialTerms: Array<Pick<LexiconWordAppearance, "label" | "tone" | "size"> & { translation?: string }> = [
  { label: "Ayni", tone: "honey", size: "large" },
  { label: "Yachay", tone: "green", size: "large" },
  { label: "Tinkuy", tone: "clay", size: "large" },
  { label: "Memoria", tone: "neutral", size: "small" },
  { label: "Territorio", tone: "green", size: "small" },
  { label: "Familia", tone: "honey", size: "medium" },
  { label: "Encuentro", tone: "honey", size: "small" },
  { label: "Café", tone: "clay", size: "medium" },
  { label: "Cacao", tone: "clay", size: "small" },
  { label: "Semilla", tone: "green", size: "medium" },
  { label: "Pan chapla", tone: "honey", size: "medium" },
  { label: "Miel", tone: "honey", size: "small" },
  { label: "Cosecha", tone: "green", size: "medium" },
  { label: "Origen", tone: "honey", size: "medium" },
  { label: "Comunidad", tone: "neutral", size: "medium" },
  { label: "Arte", tone: "neutral", size: "small" },
  { label: "Quechua", tone: "honey", size: "medium" },
  { label: "Chacra", tone: "green", size: "small" },
  { label: "Oficio", tone: "clay", size: "small" },
  { label: "Historia", tone: "clay", size: "small" },
  { label: "Montaña", tone: "neutral", size: "medium" },
  { label: "Siembra", tone: "green", size: "medium" },
  { label: "Retablo", tone: "honey", size: "small" },
  { label: "Taller", tone: "green", size: "small" },
];

const quechuaToneCycle: Array<Pick<LexiconWordAppearance, "tone" | "size">> = [
  { tone: "clay", size: "large" },
  { tone: "green", size: "large" },
  { tone: "honey", size: "large" },
  { tone: "green", size: "large" },
  { tone: "honey", size: "large" },
  { tone: "neutral", size: "large" },
];

const baseTerms: Array<Pick<LexiconWordAppearance, "label" | "tone" | "size" | "translation">> = [
  ...quechuaTerms.map((term, index) => ({
    label: term.term,
    ...quechuaToneCycle[index % quechuaToneCycle.length],
  })),
  ...editorialTerms,
];

const wordAppearances: LexiconWordAppearance[] = Array.from({ length: 50 }, (_, index) => {
  const term = baseTerms[index % baseTerms.length];
  const [row, column] = cellSequence[index];
  const [start, end] = rangeSequence[index];

  return {
    id: `${term.label.toLowerCase().replace(/\s+/g, "-")}-${index + 1}`,
    label: term.label,
    translation: term.translation,
    tone: term.tone,
    size: term.size,
    row,
    column,
    start,
    end,
  };
});

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function depthForWidth(width: number) {
  if (width < 768) return 650;
  if (width < 1180) return 850;
  return 1000;
}

function blurForWidth(width: number) {
  return width < 768 ? 3.6 : 5;
}

function createDepthAnimation(element: HTMLElement, depth: number, blur: number) {
  const animation = element.animate(
    [
      { transform: `translate3d(0, 0, ${-depth}px)`, opacity: 0, filter: `blur(${blur}px)` },
      { transform: "translate3d(0, 0, 0)", opacity: 1, filter: "blur(0px)", offset: 0.5 },
      { transform: `translate3d(0, 0, ${depth}px)`, opacity: 0, filter: `blur(${blur}px)` },
    ],
    { duration: 1000, fill: "both", easing: "linear" }
  );

  animation.pause();
  animation.currentTime = 0;
  return animation;
}

export function AyacuchoLexicon() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef<AnimatedLexiconElement[]>([]);
  const rafRef = useRef(0);
  const activeRef = useRef(false);
  const metricsRef = useRef({ distance: 1, stageHeight: 1 });
  const depthRef = useRef(1000);
  const blurRef = useRef(5);

  const secondaryWords = useMemo(() => wordAppearances, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const buildAnimations = () => {
      animatedRef.current.forEach(({ animation }) => animation.cancel());
      depthRef.current = depthForWidth(window.innerWidth);
      blurRef.current = blurForWidth(window.innerWidth);
      animatedRef.current = Array.from(stage.querySelectorAll<HTMLElement>("[data-lexicon-appearance]")).map((element) => ({
        element,
        animation: createDepthAnimation(element, depthRef.current, blurRef.current),
        start: Number(element.dataset.start ?? 0),
        end: Number(element.dataset.end ?? 1),
      }));
    };

    const measure = () => {
      metricsRef.current = {
        stageHeight: stage.offsetHeight,
        distance: Math.max(1, section.offsetHeight - stage.offsetHeight),
      };
    };

    const update = () => {
      rafRef.current = 0;
      const rect = section.getBoundingClientRect();
      const active = rect.bottom > -window.innerHeight && rect.top < window.innerHeight * 2;
      activeRef.current = active;
      stage.classList.toggle("is-active", active);
      if (!active) return;

      const progress = reducedQuery.matches
        ? 0.5
        : clamp(-rect.top / Math.max(1, metricsRef.current.distance));

      stage.style.setProperty("--lexicon-progress", progress.toFixed(4));

      animatedRef.current.forEach(({ animation, start, end }) => {
        const phase = clamp((progress - start) / Math.max(0.001, end - start));
        animation.currentTime = phase * 1000;
      });
    };

    const requestUpdate = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      buildAnimations();
      requestUpdate();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting;
        stage.classList.toggle("is-active", entry.isIntersecting);
        requestUpdate();
      },
      { rootMargin: "100% 0px 100% 0px" }
    );

    measure();
    buildAnimations();
    observer.observe(section);
    activeRef.current = true;
    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    reducedQuery.addEventListener("change", requestUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      reducedQuery.removeEventListener("change", requestUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      animatedRef.current.forEach(({ animation }) => animation.cancel());
    };
  }, []);

  return (
    <section ref={sectionRef} className="lexicon-section" id="lengua" data-roots-stage="lexicon" aria-label="Palabras que representan Ayacucho">
      <div ref={stageRef} className="lexicon-sticky-stage">
        <div className="lexicon-texture" aria-hidden="true" />
        <div className="lexicon-root-layer" aria-hidden="true">
          <RootsStageCanvas stage="lexicon" className="lexicon-roots" />
        </div>

        <div className="lexicon-stuck-grid">
          {secondaryWords.map((word) => {
            const style = {
              gridRow: word.row,
              gridColumn: word.column,
            } as CSSProperties;

            return (
              <div
                key={word.id}
                data-lexicon-appearance
                data-start={word.start}
                data-end={word.end}
                className={`lexicon-grid-item tone-${word.tone} size-${word.size}`}
                style={style}
              >
                <b>{word.label}</b>
                {word.translation && <small>{word.translation}</small>}
              </div>
            );
          })}

          {specialWords.map((word) => (
            <div
              key={word.id}
              data-lexicon-appearance
              data-start={word.start}
              data-end={word.end}
              className={`lexicon-special lexicon-special-${word.id}`}
            >
              {word.label}
            </div>
          ))}
        </div>

        <div className="lexicon-editorial-copy">
          <p>Lengua, memoria e identidad</p>
          <span>Raíces es el nombre del proyecto. Huamanga y Ayacucho son nombres que guardan distintas etapas de una misma tierra.</span>
          <small className="lexicon-validation-note">En Raíces, el quechua ha sido una herramienta real para conversar, generar confianza y construir relaciones con productores y proveedores originarios de Ayacucho.</small>
        </div>
      </div>
    </section>
  );
}
