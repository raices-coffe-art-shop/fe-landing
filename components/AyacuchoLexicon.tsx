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

type LexiconClosingStep =
  | {
      id: "closing-raices" | "closing-huamanga" | "closing-ayacucho";
      type: "text";
      value: string;
      start: number;
      end: number;
    }
  | {
      id: "closing-logo";
      type: "logo";
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
  [0.04, 0.16], [0.10, 0.22], [0.16, 0.28], [0.22, 0.34],
  [0.07, 0.19], [0.13, 0.25], [0.19, 0.31], [0.25, 0.37],
  [0.31, 0.43], [0.37, 0.49], [0.43, 0.55], [0.49, 0.61],
  [0.55, 0.67], [0.61, 0.73], [0.67, 0.79], [0.73, 0.85],
  [0.28, 0.40], [0.34, 0.46], [0.40, 0.52], [0.46, 0.58],
  [0.52, 0.64], [0.58, 0.70], [0.64, 0.76], [0.70, 0.82],
  [0.14, 0.26], [0.20, 0.32], [0.26, 0.38], [0.32, 0.44],
  [0.50, 0.62], [0.56, 0.68], [0.62, 0.74], [0.68, 0.80],
];

const closingSequence = [
  // RAÍCES empezaba demasiado pronto y llegaba ya ampliada por la perspectiva.
  // Se desplaza su ventana para que entre limpia después de las palabras sueltas.
  { id: "closing-raices", type: "text", value: "RAÍCES", start: 0.20, end: 0.42 },
  { id: "closing-huamanga", type: "text", value: "HUAMANGA", start: 0.44, end: 0.63 },
  { id: "closing-ayacucho", type: "text", value: "AYACUCHO", start: 0.65, end: 0.83 },
  { id: "closing-logo", type: "logo", start: 0.84, end: 1.00 },
] satisfies LexiconClosingStep[];

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
  // En pantallas pequeñas el blur aporta muy poco visualmente, pero obliga a
  // repintar una superficie grande. Se conserva una cantidad mínima.
  return width < 768 ? 1.4 : 4;
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

function createClosingRaicesAnimation(element: HTMLElement) {
  // La primera palabra de cierre no usa translateZ. Al acercarse a la cámara,
  // la perspectiva podía recortar letras y dejar visible solo el centro.
  const animation = element.animate(
    [
      { transform: "translate3d(0, 18px, 0) scale(.84)", opacity: 0, filter: "blur(7px)" },
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1, filter: "blur(0px)", offset: 0.5 },
      { transform: "translate3d(0, -10px, 0) scale(1.12)", opacity: 0, filter: "blur(5px)" },
    ],
    { duration: 1000, fill: "both", easing: "linear" }
  );

  animation.pause();
  animation.currentTime = 0;
  return animation;
}

function createLogoAnimation(element: HTMLElement) {
  const animation = element.animate(
    [
      { transform: "translate3d(0, 14px, 0) scale(.94)", opacity: 0, filter: "blur(4px)" },
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1, filter: "blur(0px)", offset: 0.5 },
      { transform: "translate3d(0, -10px, 0) scale(.96)", opacity: 0, filter: "blur(5px)" },
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
    let lastProgress = -1;
    let mutationObserver: MutationObserver | null = null;

    const buildAnimations = () => {
      animatedRef.current.forEach(({ animation }) => animation.cancel());
      depthRef.current = depthForWidth(window.innerWidth);
      blurRef.current = blurForWidth(window.innerWidth);
      animatedRef.current = Array.from(stage.querySelectorAll<HTMLElement>("[data-lexicon-appearance]")).map((element) => ({
        element,
        animation: element.dataset.lexiconAppearance === "logo"
          ? createLogoAnimation(element)
          : element.dataset.lexiconAppearance === "closing-raices"
            ? createClosingRaicesAnimation(element)
            : createDepthAnimation(element, depthRef.current, blurRef.current),
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
      if (connectorPath) mutationObserver?.disconnect();

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
      if (!reducedQuery.matches && Math.abs(progress - lastProgress) < 0.0014) return;
      lastProgress = progress;

      stage.style.setProperty("--lexicon-progress", progress.toFixed(4));

      animatedRef.current.forEach(({ animation, start, end }) => {
        const phase = clamp((progress - start) / Math.max(0.001, end - start));
        animation.currentTime = phase * 1000;
      });
    };

    const requestUpdate = () => {
      if (!activeRef.current && !reducedQuery.matches) return;
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
      { rootMargin: "65% 0px 65% 0px" }
    );

    const connectorContainer = document.querySelector<HTMLElement>(".continuous-root-trail");
    const resizeObserver = new ResizeObserver(() => {
      scheduleRootHandoffMeasurement();
    });
    resizeObserver.observe(stage);
    if (connectorContainer) resizeObserver.observe(connectorContainer);

    mutationObserver = new MutationObserver(() => {
      scheduleRootHandoffMeasurement();
      const connectorSvg = previousConnectorPathRef.current?.ownerSVGElement;
      if (connectorSvg) resizeObserver.observe(connectorSvg);
    });
    if (connectorContainer) mutationObserver.observe(connectorContainer, { childList: true, subtree: true });

    const imageLoadCleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLImageElement>("#historia img, #lengua img").forEach((image) => {
      if (image.complete) return;
      const onImageLoad = () => scheduleRootHandoffMeasurement();
      image.addEventListener("load", onImageLoad, { once: true });
      imageLoadCleanups.push(() => image.removeEventListener("load", onImageLoad));
    });

    measureLexiconMetrics();
    buildAnimations();
    observer.observe(section);
    const initialRect = section.getBoundingClientRect();
    activeRef.current = initialRect.bottom > -window.innerHeight * 0.65
      && initialRect.top < window.innerHeight * 1.65;
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
                data-lexicon-appearance="word"
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

          {closingSequence.map((step) => (
            <div
              key={step.id}
              data-lexicon-appearance={step.type === "logo" ? "logo" : step.id}
              data-start={step.start}
              data-end={step.end}
              className={step.type === "logo" ? "lexicon-closing-logo" : `lexicon-special lexicon-special-${step.id}`}
            >
              {step.type === "logo" ? (
                <img src="/raices-logo.png" alt="Raíces" width={168} height={168} />
              ) : (
                step.value
              )}
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
