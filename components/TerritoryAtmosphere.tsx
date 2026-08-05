"use client";

import { useEffect, useRef } from "react";

const territoryModules = [
  {
    id: "procedencia",
    title: "Procedencia",
    description: "Cada producto debe mostrar el lugar del que viene, la persona o familia vinculada y la forma en que fue elaborado.",
    note: "Lugar + proceso",
    icon: "seed",
  },
  {
    id: "relacion-directa",
    title: "Relación directa",
    description: "Las visitas y conversaciones permiten comprender los procesos sin reducirlos a una relación puramente comercial.",
    note: "Confianza real",
    icon: "hands",
  },
  {
    id: "ayacucho-en-lima",
    title: "Ayacucho en Lima",
    description: "El local reúne sabores, obras e historias de Ayacucho para compartirlos sin separarlos de su origen.",
    note: "Origen compartido",
    icon: "mountain",
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
    const section = root.closest<HTMLElement>(".territory-section") ?? root;
    let frame = 0;
    let active = false;
    let lastProgress = -1;

    const update = () => {
      frame = 0;
      if (!active && !reduced) return;
      const rect = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
      if (!reduced && Math.abs(progress - lastProgress) < 0.0015) return;
      lastProgress = progress;
      root.style.setProperty("--territory-progress", reduced ? "0.45" : progress.toFixed(4));
      section.style.setProperty("--territory-parallax", reduced ? "0.5" : progress.toFixed(4));
      section.style.setProperty("--territory-photo-y", reduced ? "0px" : `${((progress - 0.5) * -34).toFixed(2)}px`);
    };

    const requestUpdate = () => {
      if (!active && !reduced) return;
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) requestUpdate();
      },
      { rootMargin: "60% 0px 60% 0px" },
    );
    observer.observe(section);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="territory-atmosphere">
      <svg className="territory-contours" viewBox="0 0 180 640" preserveAspectRatio="none" aria-hidden="true">
        <path className="territory-route-line" d="M 118 -18 C 120 132, 108 238, 113 356 C 117 470, 104 552, 91 664" />
      </svg>
      <div className="territory-coordinate" aria-hidden="true">
        <span>ORIGEN</span>
        <i />
        <span>ENCUENTRO</span>
      </div>
      <div className="territory-modules" aria-label="Capas editables del territorio">
        {territoryModules.map((item, index) => (
          <article key={item.id} className="territory-module">
            <div className="territory-module-top">
              <span>0{index + 1}</span>
              <i />
            </div>
            <div className="territory-module-icon">
              <TerritoryIcon icon={item.icon} />
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>{item.note}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
