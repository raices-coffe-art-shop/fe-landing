"use client";

import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { RootsStageCanvas } from "@/components/roots/RootsStageCanvas";
import { culturalWords } from "@/data/culturalWords";

type Tone = "clay" | "green" | "honey" | "neutral";
type Size = "small" | "medium" | "large";

type LexiconWordAppearance = {
  id: string;
  label: string;
  translation?: string;
  language?: string;
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
  [2, 4], [2, 3], [2, 2], [2, 1],
  [3, 4], [3, 3], [3, 2], [3, 1],
  [1, 4], [1, 3], [1, 2], [1, 1],
  [4, 4], [4, 3], [4, 2], [4, 1],
];

const rangeSequence: Array<[number, number]> = [
  [0.04, 0.18], [0.11, 0.25], [0.18, 0.32], [0.25, 0.39],
  [0.07, 0.21], [0.14, 0.28], [0.21, 0.35], [0.28, 0.42],
  [0.35, 0.49], [0.42, 0.56], [0.49, 0.63], [0.56, 0.70],
  [0.63, 0.77], [0.70, 0.84], [0.77, 0.91], [0.84, 0.98],
  [0.32, 0.46], [0.39, 0.53], [0.46, 0.60], [0.53, 0.67],
  [0.60, 0.74], [0.67, 0.81], [0.74, 0.88], [0.81, 0.95],
  [0.16, 0.30], [0.23, 0.37], [0.30, 0.44], [0.37, 0.51],
  [0.58, 0.72], [0.65, 0.79], [0.72, 0.86], [0.79, 0.93],
];

const specialWords: LexiconSpecial[] = [
  { id: "raices", label: "RAÍCES", start: 0.07, end: 0.30 },
  { id: "huamanga", label: "HUAMANGA", start: 0.39, end: 0.63 },
  { id: "ayacucho", label: "AYACUCHO", start: 0.72, end: 0.98 },
];

const quechuaToneCycle: Array<Pick<LexiconWordAppearance, "tone" | "size">> = [
  { tone: "clay", size: "large" },
  { tone: "green", size: "large" },
  { tone: "honey", size: "large" },
  { tone: "green", size: "large" },
  { tone: "honey", size: "large" },
  { tone: "neutral", size: "large" },
];

const wordAppearances: LexiconWordAppearance[] = culturalWords.map((word, index) => {
  const tone = quechuaToneCycle[index % quechuaToneCycle.length];
  const [row, column] = cellSequence[index];
  const [start, end] = rangeSequence[index];

  return {
    id: word.id,
    label: word.word,
    translation: word.translation,
    language: word.language,
    tone: tone.tone,
    size: tone.size,
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
  const previousConnectorPathRef = useRef<SVGPathElement | null>(null);

  const secondaryWords = useMemo(() => wordAppearances, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let measureRafA = 0;
    let measureRafB = 0;

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

    const measureLexiconMetrics = () => {
      metricsRef.current = {
        stageHeight: stage.offsetHeight,
        distance: Math.max(1, section.offsetHeight - stage.offsetHeight),
      };
    };

    function measureRootHandoff() {
      const connectorPath =
        document.querySelector<SVGPathElement>('[data-root-handoff-connector="previous-root-end"]');
      previousConnectorPathRef.current = connectorPath;

      const stickyStage = stageRef.current;
      if (!connectorPath || !stickyStage) return;

      const svg = connectorPath.ownerSVGElement;
      const ctm = connectorPath.getScreenCTM();
      if (!svg || !ctm) return;

      const totalLength = connectorPath.getTotalLength();
      const localEndPoint = connectorPath.getPointAtLength(totalLength);
      const svgPoint = svg.createSVGPoint();
      svgPoint.x = localEndPoint.x;
      svgPoint.y = localEndPoint.y;

      const screenEndPoint = svgPoint.matrixTransform(ctm);
      const stageRect = stickyStage.getBoundingClientRect();
      const relativeX = screenEndPoint.x - stageRect.left;
      const rawRelativeY = screenEndPoint.y - stageRect.top;
      const relativeY = Math.min(8, Math.max(-4, rawRelativeY));
      const safeX = Math.min(stageRect.width - 18, Math.max(18, relativeX));

      stickyStage.style.setProperty("--root-handoff-x", `${safeX.toFixed(2)}px`);
      stickyStage.style.setProperty("--root-handoff-y", `${relativeY.toFixed(2)}px`);
      stickyStage.style.setProperty("--lexicon-root-x", `${safeX.toFixed(2)}px`);
      stickyStage.querySelector<HTMLElement>(".lexicon-roots")?.dispatchEvent(new Event("root-handoff:change"));
    }

    const scheduleRootHandoffMeasurement = () => {
      cancelAnimationFrame(measureRafA);
      cancelAnimationFrame(measureRafB);

      measureRafA = requestAnimationFrame(() => {
        measureRafB = requestAnimationFrame(() => {
          measureRootHandoff();
        });
      });
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
      measureLexiconMetrics();
      scheduleRootHandoffMeasurement();
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

    const connectorContainer = document.querySelector<HTMLElement>(".continuous-root-trail");
    const resizeObserver = new ResizeObserver(() => {
      scheduleRootHandoffMeasurement();
    });
    resizeObserver.observe(stage);
    if (connectorContainer) resizeObserver.observe(connectorContainer);

    const mutationObserver = new MutationObserver(() => {
      scheduleRootHandoffMeasurement();
      const connectorSvg = previousConnectorPathRef.current?.ownerSVGElement;
      if (connectorSvg) resizeObserver.observe(connectorSvg);
    });
    if (connectorContainer) mutationObserver.observe(connectorContainer, { childList: true, subtree: true });

    const imageLoadCleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      if (image.complete) return;
      const onImageLoad = () => scheduleRootHandoffMeasurement();
      image.addEventListener("load", onImageLoad, { once: true });
      imageLoadCleanups.push(() => image.removeEventListener("load", onImageLoad));
    });

    measureLexiconMetrics();
    buildAnimations();
    observer.observe(section);
    activeRef.current = true;
    scheduleRootHandoffMeasurement();
    document.fonts?.ready.then(scheduleRootHandoffMeasurement).catch(() => undefined);
    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    window.visualViewport?.addEventListener("resize", onResize, { passive: true });
    reducedQuery.addEventListener("change", requestUpdate);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      mutationObserver?.disconnect();
      imageLoadCleanups.forEach((cleanup) => cleanup());
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      reducedQuery.removeEventListener("change", requestUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(measureRafA);
      cancelAnimationFrame(measureRafB);
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
                {word.translation && <small>{word.translation} · {word.language}</small>}
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
