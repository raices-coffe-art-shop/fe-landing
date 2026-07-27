"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "./roots/rootGeometry";
import { makeStageProgress, RootProgressProvider } from "./roots/useRootProgress";
import type { RootStage } from "./roots/rootGeometry";

export function RootsNarrative({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rawProgressRef = useRef(0);
  const visualProgressRef = useRef(0);
  const activeRef = useRef(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let start = 0;
    let end = 1;

    const measure = () => {
      const origin = wrapper.querySelector<HTMLElement>('[data-roots-stage="origin"]');
      const territory = wrapper.querySelector<HTMLElement>('[data-roots-stage="territory"]');
      if (!origin || !territory) return;
      const scrollY = window.scrollY;
      const originRect = origin.getBoundingClientRect();
      const territoryRect = territory.getBoundingClientRect();
      start = scrollY + originRect.top - window.innerHeight * 0.62;
      end = scrollY + territoryRect.top + territoryRect.height - window.innerHeight * 0.34;
      if (end <= start) end = start + 1;
    };

    const updateRaw = () => {
      rawProgressRef.current = reducedQuery.matches
        ? 1
        : clamp((window.scrollY - start) / Math.max(1, end - start));
    };

    const tick = () => {
      frame = 0;
      updateRaw();
      const delta = rawProgressRef.current - visualProgressRef.current;
      visualProgressRef.current += delta * (reducedQuery.matches ? 1 : 0.18);
      if (Math.abs(delta) < 0.0006) visualProgressRef.current = rawProgressRef.current;
      setGlobalProgress((current) => (
        Math.abs(current - visualProgressRef.current) < 0.0008 ? current : visualProgressRef.current
      ));
      if (activeRef.current || Math.abs(rawProgressRef.current - visualProgressRef.current) > 0.0007) {
        frame = requestAnimationFrame(tick);
      }
    };

    const requestTick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      measure();
      updateRaw();
      requestTick();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = Boolean(entry?.isIntersecting);
        if (activeRef.current) requestTick();
      },
      { rootMargin: "90% 0px" },
    );
    observer.observe(wrapper);

    const resizeObserver = new ResizeObserver(onResize);
    wrapper.querySelectorAll<HTMLElement>("[data-roots-stage]").forEach((stage) => resizeObserver.observe(stage));

    const onReducedChange = () => {
      setReducedMotion(reducedQuery.matches);
      measure();
      updateRaw();
      visualProgressRef.current = rawProgressRef.current;
      setGlobalProgress((current) => (
        Math.abs(current - visualProgressRef.current) < 0.0008 ? current : visualProgressRef.current
      ));
    };

    measure();
    onReducedChange();
    const poll = window.setInterval(requestTick, 160);
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    reducedQuery.addEventListener("change", onReducedChange);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      reducedQuery.removeEventListener("change", onReducedChange);
      window.clearInterval(poll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const value = useMemo(
    () => ({
      globalProgress,
      reducedMotion,
      stageProgress: (stage: RootStage) => reducedMotion ? 1 : makeStageProgress(globalProgress, stage),
    }),
    [globalProgress, reducedMotion],
  );

  return (
    <RootProgressProvider value={value}>
      <div ref={wrapperRef} className="roots-narrative-wrap" style={{ "--roots-global-progress": globalProgress } as React.CSSProperties}>
        {children}
      </div>
    </RootProgressProvider>
  );
}
