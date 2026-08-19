"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isChromelessRoute } from "@/lib/chromelessRoutes";

export const RAICES_PRELOADER_ENABLED = true;
export const RAICES_PRELOADER_TIMING = {
  minimumVisibleMs: 1550,
  maximumVisibleMs: 2800,
  exitMs: 560,
};

type LoaderState = "visible" | "exiting" | "hidden";

export function RaicesPreloader() {
  const pathname = usePathname();
  const isChromeless = isChromelessRoute(pathname);
  const [state, setState] = useState<LoaderState>(
    RAICES_PRELOADER_ENABLED && !isChromeless ? "visible" : "hidden",
  );

  useEffect(() => {
    if (isChromeless) {
      setState("hidden");
      return;
    }
    if (!RAICES_PRELOADER_ENABLED || state === "hidden") return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const startedAt = performance.now();
    let closed = false;
    let exitTimer = 0;
    let readyTimer = 0;
    let maxTimer = 0;

    const waitForDocument = new Promise<void>((resolve) => {
      if (document.readyState === "complete" || document.readyState === "interactive") {
        resolve();
        return;
      }

      window.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
    });

    const waitForFonts = document.fonts?.ready.then(() => undefined).catch(() => undefined) ?? Promise.resolve();

    const close = () => {
      if (closed) return;
      closed = true;
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, RAICES_PRELOADER_TIMING.minimumVisibleMs - elapsed);

      readyTimer = window.setTimeout(() => {
        setState("exiting");
        window.dispatchEvent(new Event("resize"));
        exitTimer = window.setTimeout(() => {
          document.body.style.overflow = previousBodyOverflow;
          document.documentElement.style.overflow = previousHtmlOverflow;
          setState("hidden");
        }, RAICES_PRELOADER_TIMING.exitMs);
      }, remaining);
    };

    Promise.all([waitForDocument, waitForFonts]).then(close);
    maxTimer = window.setTimeout(close, RAICES_PRELOADER_TIMING.maximumVisibleMs);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(readyTimer);
      window.clearTimeout(maxTimer);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isChromeless]);

  if (isChromeless || state === "hidden") return null;

  return (
    <div
      className={`raices-preloader ${state === "exiting" ? "is-exiting" : ""}`}
      aria-hidden="true"
    >
      <svg
        className="raices-preloader-bean"
        viewBox="0 0 64 82"
        fill="none"
        role="presentation"
        focusable="false"
      >
        <path
          className="raices-preloader-bean-outline"
          d="M42.6 5.8C55.7 12.1 62 27.8 59.2 43.6C56.1 61.2 44.2 76.1 29.4 75.9C15.8 75.7 5.5 62.8 5.2 46.6C4.9 28.6 17.1 10.8 32.9 5.2C36.4 4 39.7 4.4 42.6 5.8Z"
          pathLength="1"
        />
        <path
          className="raices-preloader-bean-cleft"
          d="M34.4 13.7C25.7 23.5 24.8 32.8 31.5 42.8C38.4 53.1 35.9 63.4 25.8 72.2"
          pathLength="1"
        />
        <path
          className="raices-preloader-root"
          d="M29.4 75.9C29.1 78.4 28.1 80.2 25.9 81.3"
          pathLength="1"
        />
      </svg>
    </div>
  );
}
