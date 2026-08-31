"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isChromelessRoute } from "@/lib/chromelessRoutes";


export function SmoothScroll() {
  const pathname = usePathname();
  const isChromeless = isChromelessRoute(pathname);

  useEffect(() => {
    // Studio, la carta imprimible y la vista TV usan scroll nativo. En pantallas
    // táctiles el scroll nativo también es más fluido y consume menos trabajo del hilo principal.
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (isChromeless || coarsePointer.matches || reducedMotion.matches) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1,
      syncTouch: false,
      allowNestedScroll: false,
      prevent: (node: HTMLElement) => Boolean(
        node.closest?.("[data-lenis-prevent], [role='dialog'], .mobile-menu, iframe"),
      ),
      anchors: {
        offset: -76,
        duration: 0.86,
      },
      stopInertiaOnNavigate: true,
      infinite: false,
    });

    window.__raicesLenis = lenis;

    let frame = 0;
    let running = true;
    const raf = (time: number) => {
      if (!running) return;
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(raf);
    };

    const stopLoop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    frame = requestAnimationFrame(raf);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopLoop();
      lenis.destroy();
      if (window.__raicesLenis === lenis) {
        window.__raicesLenis = undefined;
      }
    };
  }, [isChromeless, pathname]);

  return null;
}
