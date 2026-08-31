"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, type RootStage } from "./rootGeometry";

export function useStageScrollProgress(stage: RootStage) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(`[data-roots-stage="${stage}"]`);
    if (!element) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let active = false;
    let frozenAtLexiconExit = false;

    const update = () => {
      frame = 0;
      if (!active && !reducedQuery.matches) return;

      const rect = element.getBoundingClientRect();
      const scrollableDistance = Math.max(
        1,
        rect.height - window.innerHeight * (stage === "lexicon" ? 0.18 : 0.72),
      );
      const viewportReference = window.innerHeight * (
        stage === "origin" ? 0.58
          : stage === "territory" ? 0.54
            : stage === "lexicon" ? 0.12
              : 0.5
      );
      const rawNext = reducedQuery.matches
        ? 1
        : clamp((viewportReference - rect.top) / scrollableDistance);

      // Do not send a final `1` to the hidden Lexicon canvas. That value caused
      // RootsCanvas to rebuild every completed segment into a full-viewport
      // bitmap exactly when the sticky stage was released. Freeze before the
      // exit and resume only after reverse scrolling well inside the chapter.
      if (stage === "lexicon") {
        if (!frozenAtLexiconExit && rawNext >= 0.86) frozenAtLexiconExit = true;
        if (frozenAtLexiconExit) {
          if (rawNext > 0.78) return;
          frozenAtLexiconExit = false;
        }
      }

      const next = rawNext;

      if (Math.abs(progressRef.current - next) < 0.0015) return;
      progressRef.current = next;
      setProgress(next);
    };

    const requestUpdate = () => {
      if (!active && !reducedQuery.matches) return;
      if (!frame) frame = requestAnimationFrame(update);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) requestUpdate();
      },
      { rootMargin: "70% 0px 70% 0px" },
    );
    intersectionObserver.observe(element);

    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(element);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("orientationchange", requestUpdate, { passive: true });
    window.visualViewport?.addEventListener("resize", requestUpdate, { passive: true });
    reducedQuery.addEventListener("change", requestUpdate);

    active = element.getBoundingClientRect().bottom > -window.innerHeight * 0.7
      && element.getBoundingClientRect().top < window.innerHeight * 1.7;
    requestUpdate();

    return () => {
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);
      window.visualViewport?.removeEventListener("resize", requestUpdate);
      reducedQuery.removeEventListener("change", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stage]);

  return progress;
}
