"use client";

import { useEffect, useRef, useState } from "react";
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
  pulse: number;
};

type RootLayout = {
  width: number;
  height: number;
  compact: boolean;
  originX: number;
  originY: number;
  seedTop: number;
  seedWidth: number;
  seedHeight: number;
  minX: number;
  maxX: number;
  maxY: number;
  baseLength: number;
  lateralAmplitude: number;
};

const chapters = [
  { label: "Lengua", text: "Hablar la misma lengua permitió escuchar antes de ofrecer." },
  { label: "Confianza", text: "Las relaciones comenzaron con conversaciones, no con catálogos." },
  { label: "Territorio", text: "Cada producto pertenece a un paisaje y a una forma de trabajar." },
  { label: "Relación directa", text: "Raíces busca conocer quién produce, cómo produce y qué historia acompaña el proceso." },
  { label: "Comunidad", text: "Una raíz crece cuando puede sostener algo más que a sí misma." },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const clampPixels = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function getRootLayout(width: number, height: number): RootLayout {
  const compact = width <= 760;
  const seedWidth = compact ? clampPixels(width * 0.16, 54, 64) : 78;
  const seedHeight = compact ? clampPixels(width * 0.22, 76, 90) : 108;
  const seedTop = compact ? clampPixels(height * 0.09, 66, 92) : height * 0.13;
  const originX = width / 2;
  const originY = seedTop + seedHeight * 0.98;
  const minX = compact ? 12 : -width * 0.1;
  const maxX = compact ? width - 12 : width * 1.1;
  const maxY = compact ? height - 112 : height - 64;
  const availableHeight = Math.max(300, maxY - originY);
  const availableWidth = compact ? Math.max(290, width - 24) : width * 1.18;

  return {
    width,
    height,
    compact,
    originX,
    originY,
    seedTop,
    seedWidth,
    seedHeight,
    minX,
    maxX,
    maxY,
    baseLength: compact ? availableHeight * 0.34 : Math.max(160, height * 0.23),
    lateralAmplitude: compact ? availableWidth * 0.5 : width * 0.44,
  };
}

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function buildRootSegments(layout: RootLayout) {
  const result: Segment[] = [];
  let cursor = 0;
  const { compact, originX, originY, minX, maxX, maxY, lateralAmplitude, baseLength, height } = layout;
  const depthDurations = compact ? [0.18, 0.15, 0.13, 0.11, 0.09] : [0.17, 0.14, 0.12, 0.1, 0.08];
  const depthWidths = compact ? [9, 6.5, 4.35, 2.35, 1.05] : [11, 7.8, 5.25, 2.9, 1.15];

  const branch = (x: number, y: number, angle: number, length: number, depth: number, parentEnd: number, seed: number) => {
    if (depth > 4 || length < (compact ? 14 : 10) || y > maxY) return;
    const delay = depth === 0 ? seeded(seed) * 0.018 : 0.035 + depth * 0.035 + seeded(seed + 13.7) * 0.018;
    const start = depth === 0 ? parentEnd + delay : parentEnd - 0.012 + delay;
    const angleNoise = (seeded(seed + depth * 4.13) - 0.5) * (compact ? 0.24 : 0.34);
    const nextAngle = angle + angleNoise;
    const rawX2 = x + Math.cos(nextAngle) * length;
    const rawY2 = y + Math.sin(nextAngle) * length;
    const x2 = clampPixels(rawX2, minX, maxX);
    const y2 = clampPixels(rawY2, originY + 20, maxY);
    const sidePull = clamp((x2 - originX) / Math.max(1, lateralAmplitude), -1, 1);
    const bend = ((seeded(seed + 91.2) - 0.5) * length * (compact ? 0.28 : 0.46)) - sidePull * length * 0.12;
    const cx = clampPixels((x + x2) / 2 + bend, minX, maxX);
    const cy = clampPixels((y + y2) / 2 + length * 0.05, originY, maxY);
    const duration = depthDurations[depth] * (0.84 + seeded(seed + 27.2) * 0.28);
    const end = Math.min(0.96, start + duration);
    const pulse = Math.min(1, end + 0.012);

    result.push({ x1: x, y1: y, cx, cy, x2, y2, start, end, pulse, width: depthWidths[depth], depth });
    cursor += 1;

    const childLength = length * (compact ? 0.72 + seeded(seed + 21.7) * 0.08 : 0.78 + seeded(seed + 21.7) * 0.11);
    branch(x2, y2, nextAngle + (seeded(seed + 7.4) - 0.5) * (compact ? 0.22 : 0.28), childLength, depth + 1, end, seed + 19.3);

    if (depth < 4 && seeded(seed + 39.1) < (compact ? 0.98 - depth * 0.07 : 0.96 - depth * 0.065)) {
      const side = seeded(seed + 49.8) > 0.5 ? 1 : -1;
      const spread = compact ? 0.42 + seeded(seed + 52.2) * 0.36 : 0.46 + seeded(seed + 52.2) * 0.58;
      branch(x2, y2, nextAngle + side * spread, length * (0.46 + seeded(seed + 57.6) * 0.16), depth + 1, end, seed + 71.5 + cursor);
    }

    if (depth > 0 && depth < 4 && seeded(seed + 86.4) < (compact ? 0.72 : 0.62)) {
      const side = seeded(seed + 93.1) > 0.5 ? 1 : -1;
      branch(x2, y2, nextAngle - side * (0.54 + seeded(seed + 101.2) * 0.34), length * (0.36 + seeded(seed + 112.6) * 0.14), depth + 1, end + 0.018, seed + 131.5 + cursor);
    }
  };

  branch(originX, originY, Math.PI / 2, baseLength, 0, 0.01, 12.1);
  branch(originX, originY, Math.PI / 2 + (compact ? 0.13 : 0.19), baseLength * 0.97, 0, 0.035, 43.7);
  branch(originX, originY, Math.PI / 2 - (compact ? 0.13 : 0.19), baseLength * 0.95, 0, 0.06, 74.2);
  branch(originX, originY, Math.PI / 2 + (compact ? 0.31 : 0.34), baseLength * 0.72, 1, 0.11, 95.4);
  branch(originX, originY, Math.PI / 2 - (compact ? 0.31 : 0.34), baseLength * 0.7, 1, 0.12, 118.8);

  const maxEnd = Math.max(...result.map((segment) => segment.end), 1);
  for (const segment of result) {
    segment.start = clamp(segment.start / maxEnd);
    segment.end = clamp(segment.end / maxEnd);
    segment.pulse = clamp(segment.pulse / maxEnd);
  }

  return result;
}

function RootsCanvas({ progress, layout }: { progress: number; layout: RootLayout | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmentsRef = useRef<Segment[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    canvas.width = Math.max(1, Math.round(layout.width * dpr));
    canvas.height = Math.max(1, Math.round(layout.height * dpr));
    canvas.style.width = `${layout.width}px`;
    canvas.style.height = `${layout.height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    segmentsRef.current = buildRootSegments(layout);
  }, [layout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !layout) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const { width, height } = layout;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
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

      const pulseLocal = 1 - Math.abs(progress - segment.pulse) / 0.035;
      if (pulseLocal > 0) {
        const pulse = Math.pow(pulseLocal, 2);
        const radius = (segment.depth < 2 ? 10 : 6) * (1 + (1 - pulseLocal) * 0.55);
        const nodeGlow = context.createRadialGradient(segment.x2, segment.y2, 0, segment.x2, segment.y2, radius);
        nodeGlow.addColorStop(0, `rgba(255, 232, 148, ${0.34 * pulse})`);
        nodeGlow.addColorStop(0.38, `rgba(211, 235, 145, ${0.18 * pulse})`);
        nodeGlow.addColorStop(1, "rgba(211, 235, 145, 0)");
        context.beginPath();
        context.arc(segment.x2, segment.y2, radius, 0, Math.PI * 2);
        context.fillStyle = nodeGlow;
        context.fill();
      }
    }
    context.restore();
  }, [progress, layout]);

  return <canvas ref={canvasRef} className="roots-canvas" aria-hidden="true" />;
}

export function RootsNetworkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef({ width: 0, height: 0 });
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [layout, setLayout] = useState<RootLayout | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scrollFrame = 0;
    let trackingFrame = 0;
    let lastScrollY = window.scrollY;
    viewportRef.current = { width: window.innerWidth, height: window.innerHeight };

    const update = (force = false) => {
      const nextScrollY = window.scrollY;
      const viewportChanged =
        Math.abs(window.innerWidth - viewportRef.current.width) > 0.5 ||
        Math.abs(window.innerHeight - viewportRef.current.height) > 0.5;
      if (viewportChanged) {
        viewportRef.current = { width: window.innerWidth, height: window.innerHeight };
        lastScrollY = nextScrollY;
        if (!force) return;
      }
      if (!force && Math.abs(nextScrollY - lastScrollY) < 0.5) return;
      lastScrollY = nextScrollY;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const nextProgress = reduced ? 1 : clamp(-rect.top / distance);
      const targetActive = Math.min(chapters.length - 1, Math.floor(nextProgress * chapters.length));
      setProgress((current) => (Math.abs(current - nextProgress) < 0.001 ? current : nextProgress));
      setActive((current) => {
        if (targetActive === current) return current;
        return current + Math.sign(targetActive - current);
      });
    };

    const requestUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        update();
      });
    };

    const track = () => {
      update();
      trackingFrame = requestAnimationFrame(track);
    };

    const startTracking = () => {
      if (!trackingFrame) trackingFrame = requestAnimationFrame(track);
    };

    const stopTracking = () => {
      if (trackingFrame) cancelAnimationFrame(trackingFrame);
      trackingFrame = 0;
      update(false);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !reduced) startTracking();
        else stopTracking();
      },
      { rootMargin: "35% 0px" },
    );

    observer.observe(section);
    update(true);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (trackingFrame) cancelAnimationFrame(trackingFrame);
    };
  }, []);

  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;
    let frame = 0;

    const resize = () => {
      frame = 0;
      const rect = sticky.getBoundingClientRect();
      const nextLayout = getRootLayout(rect.width, rect.height);
      setLayout((current) => {
        if (
          current &&
          Math.abs(current.width - nextLayout.width) < 0.5 &&
          Math.abs(current.height - nextLayout.height) < 0.5 &&
          Math.abs(current.originX - nextLayout.originX) < 0.5 &&
          Math.abs(current.originY - nextLayout.originY) < 0.5
        ) {
          return current;
        }
        return nextLayout;
      });
    };

    const requestResize = () => {
      if (!frame) frame = requestAnimationFrame(resize);
    };

    const observer = new ResizeObserver(requestResize);
    observer.observe(sticky);
    resize();
    window.addEventListener("orientationchange", requestResize);
    window.visualViewport?.addEventListener("resize", requestResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", requestResize);
      window.visualViewport?.removeEventListener("resize", requestResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const introProgress = clamp(progress * 2.6);
  const chapterProgress = clamp((progress - 0.04) * 3.4);
  const rootStyle = {
    "--roots-progress": progress,
    ...(layout
      ? {
          "--roots-seed-x": `${layout.originX}px`,
          "--roots-seed-top": `${layout.seedTop}px`,
          "--roots-seed-width": `${layout.seedWidth}px`,
          "--roots-seed-height": `${layout.seedHeight}px`,
        }
      : {}),
  } as CSSProperties;

  return (
    <section ref={sectionRef} className="roots-network-section" id="raices-vivas">
      <div ref={stickyRef} className="roots-network-sticky" style={rootStyle}>
        <div className="roots-texture" aria-hidden="true" />
        <RootsCanvas progress={progress} layout={layout} />
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
