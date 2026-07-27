"use client";

import { useEffect, useState } from "react";
import { clamp, type RootStage } from "./rootGeometry";

export function useStageScrollProgress(stage: RootStage) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let interval = 0;

    const update = () => {
      frame = 0;
      const element = document.querySelector<HTMLElement>(`[data-roots-stage="${stage}"]`);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const scrollableDistance = Math.max(1, rect.height - window.innerHeight * (stage === "lexicon" ? 0.18 : 0.72));
      const viewportReference = window.innerHeight * (stage === "origin" ? 0.58 : stage === "territory" ? 0.54 : stage === "lexicon" ? 0.12 : 0.5);
      const next = reducedQuery.matches ? 1 : clamp((viewportReference - rect.top) / scrollableDistance);
      setProgress((current) => (Math.abs(current - next) < 0.001 ? current : next));
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(requestUpdate);
    const element = document.querySelector<HTMLElement>(`[data-roots-stage="${stage}"]`);
    if (element) observer.observe(element);
    update();
    interval = window.setInterval(update, 180);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("orientationchange", requestUpdate);
    window.visualViewport?.addEventListener("resize", requestUpdate);
    reducedQuery.addEventListener("change", requestUpdate);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);
      window.visualViewport?.removeEventListener("resize", requestUpdate);
      reducedQuery.removeEventListener("change", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stage]);

  return progress;
}
