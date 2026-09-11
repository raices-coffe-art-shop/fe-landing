"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Sanity administra sus propios paneles de scroll. El sitio público usa Lenis,
 * pero /studio debe quedar completamente fuera de ese sistema: un contenedor
 * exterior con overflow:auto puede capturar la rueda antes de que la reciba el
 * panel activo de Sanity. Por eso aquí solo bloqueamos el viewport exterior y
 * dejamos que Studio gestione todos sus scrolls internos.
 */
export function StudioScrollGuard({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlScrollBehavior: html.style.scrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    window.__raicesLenis?.destroy?.();
    window.__raicesLenis = undefined;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.scrollBehavior = "auto";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.scrollBehavior = previous.htmlScrollBehavior;
      body.style.overscrollBehavior = previous.bodyOverscroll;
    };
  }, []);

  return (
    <div
      data-lenis-prevent
      data-studio-root
      style={{ width: "100vw", height: "100dvh", overflow: "hidden", overscrollBehavior: "none" }}
    >
      {children}
    </div>
  );
}
