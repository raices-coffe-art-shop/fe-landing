"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Segment = {
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  x2: number;
  y2: number;
  start: number;
  end: number;
  width: number;
  depth: number;
};

const chapters = [
  { label: "Lengua", text: "Hablar la misma lengua permitió escuchar antes de ofrecer." },
  { label: "Confianza", text: "Las relaciones comenzaron con conversaciones, no con catálogos." },
  { label: "Territorio", text: "Cada producto pertenece a un paisaje y a una forma de trabajar." },
  { label: "Relación directa", text: "Raíces busca conocer quién produce, cómo produce y qué historia acompaña el proceso." },
  { label: "Comunidad", text: "Una raíz crece cuando puede sostener algo más que a sí misma." },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function buildRootSegments(width: number, height: number) {
  const result: Segment[] = [];
  let cursor = 0;
  const surfaceY = Math.max(118, height * 0.18);
  const baseLength = Math.max(82, height * 0.14);

  const branch = (x: number, y: number, angle: number, length: number, depth: number, start: number, seed: number) => {
    if (depth > 8 || length < 11 || y > height + 90) return;
    const angleNoise = (seeded(seed + depth * 4.13) - 0.5) * 0.34;
    const nextAngle = angle + angleNoise;
    const x2 = x + Math.cos(nextAngle) * length;
    const y2 = y + Math.sin(nextAngle) * length;
    const bend = (seeded(seed + 91.2) - 0.5) * length * 0.46;
    const cx = (x + x2) / 2 + bend;
    const cy = (y + y2) / 2 + length * 0.04;
    const travel = Math.max(0.025, length / Math.max(height, 1) * 0.2);
    const end = Math.min(1, start + travel);

    result.push({ x1: x, y1: y, cx, cy, x2, y2, start, end, width: Math.max(0.55, 10 - depth * 1.05), depth });
    cursor += 1;

    branch(x2, y2, nextAngle + (seeded(seed + 7.4) - 0.5) * 0.28, length * (0.72 + seeded(seed + 21.7) * 0.09), depth + 1, end - 0.008, seed + 19.3);

    if (seeded(seed + 39.1) < 0.86 - depth * 0.06) {
      const side = seeded(seed + 49.8) > 0.5 ? 1 : -1;
      branch(x2, y2, nextAngle + side * (0.5 + seeded(seed + 52.2) * 0.54), length * (0.48 + seeded(seed + 57.6) * 0.16), depth + 1, end + 0.012, seed + 71.5 + cursor);
    }
  };

  branch(width / 2, surfaceY, Math.PI / 2, baseLength, 0, 0.02, 12.1);
  branch(width / 2 - 9, surfaceY + 7, Math.PI / 2 + 0.23, baseLength * 0.95, 0, 0.05, 43.7);
  branch(width / 2 + 9, surfaceY + 7, Math.PI / 2 - 0.23, baseLength * 0.92, 0, 0.08, 74.2);

  return result;
}

function RootsCanvas({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmentsRef = useRef<Segment[]>([]);
  const sizeRef = useRef({ width: 1, height: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height };
      segmentsRef.current = buildRootSegments(rect.width, rect.height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { width, height } = sizeRef.current;
    context.clearRect(0, 0, width, height);

    context.save();
    context.globalCompositeOperation = "lighter";
    for (const segment of segmentsRef.current) {
      if (progress <= segment.start) continue;
      const local = clamp((progress - segment.start) / Math.max(0.001, segment.end - segment.start));
      const t = 1 - Math.pow(1 - local, 3);
      const inv = 1 - t;
      const x = inv * inv * segment.x1 + 2 * inv * t * segment.cx + t * t * segment.x2;
      const y = inv * inv * segment.y1 + 2 * inv * t * segment.cy + t * t * segment.y2;

      const gradient = context.createLinearGradient(segment.x1, segment.y1, x, y);
      gradient.addColorStop(0, segment.depth < 2 ? "rgba(226, 166, 93, .94)" : "rgba(180, 204, 119, .78)");
      gradient.addColorStop(1, segment.depth < 3 ? "rgba(250, 214, 140, .8)" : "rgba(140, 166, 90, .68)");
      context.beginPath();
      context.moveTo(segment.x1, segment.y1);
      context.quadraticCurveTo(segment.cx, segment.cy, x, y);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = segment.width;
      context.strokeStyle = gradient;
      context.shadowColor = segment.depth < 3 ? "rgba(228, 187, 114, .34)" : "rgba(155, 184, 103, .22)";
      context.shadowBlur = segment.depth < 2 ? 12 : 5;
      context.stroke();

      if (local > 0.72) {
        context.beginPath();
        context.arc(x, y, Math.max(0.75, 2.3 - segment.depth * 0.18), 0, Math.PI * 2);
        context.fillStyle = segment.depth < 4 ? "rgba(255, 229, 150, .82)" : "rgba(207, 234, 139, .55)";
        context.fill();
      }
    }
    context.restore();
  }, [progress]);

  return <canvas ref={canvasRef} className="roots-canvas" aria-hidden="true" />;
}

export function RootsNetworkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      setProgress(reduced ? 1 : clamp(-rect.top / distance));
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

  const active = useMemo(() => Math.min(chapters.length - 1, Math.floor(progress * chapters.length * 1.45)), [progress]);
  const introProgress = clamp(progress * 2.6);
  const chapterProgress = clamp((progress - 0.04) * 3.4);

  return (
    <section ref={sectionRef} className="roots-network-section" id="raices-vivas">
      <div className="roots-network-sticky" style={{ "--roots-progress": progress } as CSSProperties}>
        <div className="roots-texture" aria-hidden="true" />
        <RootsCanvas progress={progress} />
        <div className="roots-bean-large" aria-hidden="true"><i /></div>
        <div
          className="roots-network-copy"
          style={{
            opacity: 1 - introProgress,
            transform: `translate3d(0, ${progress * -28}px, 0)`,
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
