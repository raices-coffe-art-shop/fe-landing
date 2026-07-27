"use client";

import { useEffect, useState } from "react";
import { RootsCanvas } from "@/components/roots/RootsCanvas";
import { clamp } from "@/components/roots/rootGeometry";
import { useRootProgress } from "@/components/roots/useRootProgress";
import { useStageScrollProgress } from "@/components/roots/useStageScrollProgress";

const chapters = [
  { label: "Lengua", text: "Hablar la misma lengua permitió escuchar antes de ofrecer." },
  { label: "Confianza", text: "Las relaciones comenzaron con conversaciones, no con catálogos." },
  { label: "Territorio", text: "Cada producto pertenece a un paisaje y a una forma de trabajar." },
  { label: "Relación directa", text: "Raíces busca conocer quién produce, cómo produce y qué historia acompaña el proceso." },
  { label: "Comunidad", text: "Una raíz crece cuando puede sostener algo más que a sí misma." },
];

export function RootsNetworkSection() {
  const { stageProgress } = useRootProgress();
  const progress = Math.max(stageProgress("network"), useStageScrollProgress("network"));
  const [active, setActive] = useState(0);

  useEffect(() => {
    const targetActive = Math.min(chapters.length - 1, Math.floor(clamp(progress * 0.98) * chapters.length));
    setActive((current) => {
      if (targetActive === current) return current;
      return current + Math.sign(targetActive - current);
    });
  }, [progress]);

  const introProgress = clamp(progress * 2.25);
  const chapterProgress = clamp((progress - 0.08) * 2.8);

  return (
    <section className="roots-network-section" id="raices-vivas" data-roots-stage="network">
      <div className="roots-network-sticky">
        <div className="roots-texture" aria-hidden="true" />
        <RootsCanvas stage="network" progress={progress} />
        <div className="roots-node-secondary" aria-hidden="true"><i /></div>
        <div
          className="roots-network-copy"
          style={{
            opacity: 1 - introProgress,
            transform: `translate3d(0, ${progress * -24}px, 0)`,
          }}
        >
          <p className="eyebrow light">Las relaciones que echaron raíces</p>
          <h2>Lo que crece debajo sostiene todo lo que florece.</h2>
          <p>Desplázate hacia abajo. Las raíces se extienden y revelan una historia construida entre lengua, confianza, territorio y comunidad.</p>
        </div>
        <div
          className="roots-chapter"
          style={{
            opacity: chapterProgress,
            transform: `translate3d(0, ${(1 - chapterProgress) * 18}px, 0)`,
          }}
        >
          <p>{chapters[active].label}</p>
          <h3>{chapters[active].text}</h3>
        </div>
        <div className="roots-progress" aria-hidden="true">
          <span>Crecimiento</span><b>{Math.round(progress * 100)}%</b><i><em style={{ transform: `scaleX(${progress})` }} /></i>
        </div>
      </div>
    </section>
  );
}
