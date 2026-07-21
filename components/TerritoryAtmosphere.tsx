"use client";

import { useEffect, useRef } from "react";

const territoryModules = [
  {
    id: "origen",
    title: "Origen",
    description: "Ayacucho aparece en el idioma, la memoria y las relaciones que sostienen cada producto.",
    icon: "seed",
  },
  {
    id: "paisaje",
    title: "Paisaje",
    description: "El territorio se registra con cuidado, sin convertirlo en fondo decorativo ni postal turística.",
    icon: "mountain",
  },
  {
    id: "productores",
    title: "Trabajo con productores",
    description: "Las historias crecerán con entrevistas, autorización y material documental propio.",
    icon: "hands",
  },
];

function TerritoryIcon({ icon }: { icon: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icon === "seed" && <><path d="M12 20V9" /><path d="M12 11c-3.8 0-6.5-2.5-6.5-6.5C9.5 4.5 12 7.1 12 11Z" /><path d="M12 13c3.9 0 6.7-2.7 6.7-6.8C14.6 6.2 12 8.9 12 13Z" /></>}
      {icon === "mountain" && <><path d="m3 18 5.4-9.3 4 6.2 2.4-3.5L21 18" /><path d="m8.4 8.7 2.4-4.2 4 6.9" /></>}
      {icon === "hands" && <><path d="M7.4 12.2 4.7 15a2.2 2.2 0 0 0 3.1 3.1l2.8-2.8" /><path d="m16.6 12.2 2.7 2.8a2.2 2.2 0 0 1-3.1 3.1l-2.8-2.8" /><path d="M8.5 11.2 12 7.8l3.5 3.4" /><path d="M12 7.8v8" /></>}
    </svg>
  );
}

export function TerritoryAtmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, 1 - rect.bottom / (rect.height + window.innerHeight)));
      root.style.setProperty("--territory-progress", reduced ? "0.45" : progress.toFixed(4));
      const section = root.closest<HTMLElement>(".territory-section");
      section?.style.setProperty("--territory-parallax", reduced ? "0" : progress.toFixed(4));
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="territory-atmosphere">
      <svg className="territory-contours" viewBox="0 0 960 360" aria-hidden="true">
        <path d="M-30 252C126 184 186 314 322 238c124-70 156-166 320-126 132 32 196 3 348-84" />
        <path d="M-18 298C116 236 206 332 342 270c142-64 167-158 310-120 133 35 202 15 332-48" />
        <path d="M18 174C154 112 247 225 374 166c132-61 164-130 284-102 142 33 202-4 284-43" />
        <path d="M54 105c122-47 214 42 327-6 111-48 168-88 270-62 109 28 178 8 247-24" />
        <path d="M-10 66C94 24 194 68 288 38c97-31 181-42 278-14 118 34 226 10 348-42" />
      </svg>
      <div className="territory-coordinate" aria-hidden="true">
        <span>ORIGEN</span>
        <i />
        <span>ENCUENTRO</span>
      </div>
      <div className="territory-modules" aria-label="Capas editables del territorio">
        {territoryModules.map((item) => (
          <article key={item.id} className="territory-module">
            <TerritoryIcon icon={item.icon} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
