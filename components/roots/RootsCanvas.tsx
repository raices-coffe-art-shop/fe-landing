"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildRootSegments,
  clamp,
  drawRootSegment,
  getRootLayout,
  type RootLayout,
  type RootStage,
  type Segment,
} from "./rootGeometry";

type SegmentRaster = {
  canvas: HTMLCanvasElement;
  left: number;
  top: number;
  width: number;
  height: number;
};

type RootsCanvasProps = {
  stage: RootStage;
  progress: number;
  className?: string;
  showSeed?: boolean;
};

function cssPixel(element: HTMLElement, name: string) {
  const value = Number.parseFloat(getComputedStyle(element).getPropertyValue(name));
  return Number.isFinite(value) ? value : undefined;
}

export function RootsCanvas({ stage, progress, className = "", showSeed = false }: RootsCanvasProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmentsRef = useRef<Segment[]>([]);
  const rastersRef = useRef<SegmentRaster[]>([]);
  const staticLayerRef = useRef<{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    completed: Set<number>;
    progress: number;
    dpr: number;
  } | null>(null);
  const [layout, setLayout] = useState<RootLayout | null>(null);
  const lastDrawProgressRef = useRef(-1);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;
    let frame = 0;

    const resize = () => {
      frame = 0;
      const rect = holder.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const nextLayout = getRootLayout(
        rect.width,
        rect.height,
        stage,
        stage === "lexicon" ? cssPixel(holder, "--root-handoff-x") : undefined,
        stage === "lexicon" ? cssPixel(holder, "--root-handoff-y") : undefined,
      );
      setLayout((current) => {
        if (
          current &&
          Math.abs(current.width - nextLayout.width) < 0.5 &&
          Math.abs(current.height - nextLayout.height) < 0.5 &&
          Math.abs(current.originX - nextLayout.originX) < 0.5 &&
          Math.abs(current.originY - nextLayout.originY) < 0.5
        ) return current;
        return nextLayout;
      });
    };

    const requestResize = () => {
      if (!frame) frame = requestAnimationFrame(resize);
    };

    const observer = new ResizeObserver(requestResize);
    observer.observe(holder);
    resize();
    holder.addEventListener("root-handoff:change", requestResize);
    window.addEventListener("orientationchange", requestResize);
    window.visualViewport?.addEventListener("resize", requestResize);
    return () => {
      observer.disconnect();
      holder.removeEventListener("root-handoff:change", requestResize);
      window.removeEventListener("orientationchange", requestResize);
      window.visualViewport?.removeEventListener("resize", requestResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.55);

    canvas.width = Math.max(1, Math.round(layout.width * dpr));
    canvas.height = Math.max(1, Math.round(layout.height * dpr));
    canvas.style.width = `${layout.width}px`;
    canvas.style.height = `${layout.height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const segments = buildRootSegments(layout);
    segmentsRef.current = segments;
    rastersRef.current = segments.map((segment) => {
      const padding = segment.depth < 2 ? 20 : 12;
      const left = Math.floor(Math.min(segment.x1, segment.cx, segment.x2) - segment.width - padding);
      const top = Math.floor(Math.min(segment.y1, segment.cy, segment.y2) - segment.width - padding);
      const right = Math.ceil(Math.max(segment.x1, segment.cx, segment.x2) + segment.width + padding);
      const bottom = Math.ceil(Math.max(segment.y1, segment.cy, segment.y2) + segment.width + padding);
      const width = Math.max(1, right - left);
      const height = Math.max(1, bottom - top);
      const rasterCanvas = document.createElement("canvas");
      rasterCanvas.width = Math.ceil(width * dpr);
      rasterCanvas.height = Math.ceil(height * dpr);
      const rasterContext = rasterCanvas.getContext("2d");
      if (rasterContext) {
        rasterContext.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
        rasterContext.globalCompositeOperation = "lighter";
        drawRootSegment(rasterContext, segment, 1, true, stage);
      }
      return { canvas: rasterCanvas, left, top, width, height };
    });

    const staticCanvas = document.createElement("canvas");
    staticCanvas.width = canvas.width;
    staticCanvas.height = canvas.height;
    const staticContext = staticCanvas.getContext("2d");
    if (!staticContext) return;
    staticContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastDrawProgressRef.current = -1;
    staticLayerRef.current = {
      canvas: staticCanvas,
      context: staticContext,
      completed: new Set(),
      progress: 0,
      dpr,
    };
  }, [layout, stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !layout) return;
    const staticLayer = staticLayerRef.current;
    if (!staticLayer) return;
    const safeProgress = clamp(progress);
    if (Math.abs(lastDrawProgressRef.current - safeProgress) < 0.0012) return;
    lastDrawProgressRef.current = safeProgress;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.55);

    const drawRaster = (target: CanvasRenderingContext2D, index: number) => {
      const raster = rastersRef.current[index];
      if (!raster) return;
      target.drawImage(raster.canvas, raster.left, raster.top, raster.width, raster.height);
    };

    const rebuildStaticLayer = () => {
      staticLayer.context.setTransform(1, 0, 0, 1, 0, 0);
      staticLayer.context.clearRect(0, 0, staticLayer.canvas.width, staticLayer.canvas.height);
      staticLayer.context.setTransform(staticLayer.dpr, 0, 0, staticLayer.dpr, 0, 0);
      staticLayer.context.globalCompositeOperation = "lighter";
      staticLayer.completed.clear();
      segmentsRef.current.forEach((segment, index) => {
        if (safeProgress < segment.end) return;
        drawRaster(staticLayer.context, index);
        staticLayer.completed.add(index);
      });
    };

    if (safeProgress < staticLayer.progress) {
      const hasFuture = Array.from(staticLayer.completed).some((index) => segmentsRef.current[index].end > safeProgress);
      if (hasFuture) rebuildStaticLayer();
    } else {
      staticLayer.context.globalCompositeOperation = "lighter";
      segmentsRef.current.forEach((segment, index) => {
        if (segment.end > safeProgress || staticLayer.completed.has(index)) return;
        drawRaster(staticLayer.context, index);
        staticLayer.completed.add(index);
      });
    }
    staticLayer.progress = safeProgress;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(staticLayer.canvas, 0, 0);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.save();
    context.globalCompositeOperation = "lighter";

    for (const segment of segmentsRef.current) {
      if (safeProgress <= segment.start) continue;
      const local = clamp((safeProgress - segment.start) / Math.max(0.001, segment.end - segment.start));
      if (local < 1) drawRootSegment(context, segment, local, true, stage);

      const pulseLocal = 1 - Math.abs(safeProgress - segment.pulse) / 0.035;
      if (pulseLocal > 0 && stage !== "territory") {
        const pulse = Math.pow(pulseLocal, 2);
        const radius = (segment.depth < 2 ? 10 : 6) * (1 + (1 - pulseLocal) * 0.55);
        const nodeGlow = context.createRadialGradient(segment.x2, segment.y2, 0, segment.x2, segment.y2, radius);
        nodeGlow.addColorStop(0, `rgba(255, 232, 148, ${0.28 * pulse})`);
        nodeGlow.addColorStop(0.38, `rgba(211, 235, 145, ${0.16 * pulse})`);
        nodeGlow.addColorStop(1, "rgba(211, 235, 145, 0)");
        context.beginPath();
        context.arc(segment.x2, segment.y2, radius, 0, Math.PI * 2);
        context.fillStyle = nodeGlow;
        context.fill();
      }
    }
    context.restore();
  }, [progress, layout, stage]);

  return (
    <div
      ref={holderRef}
      className={`roots-canvas-layer roots-canvas-layer-${stage} ${className}`}
      style={layout ? {
        "--roots-seed-x": `${layout.originX}px`,
        "--roots-seed-top": `${layout.seedTop}px`,
        "--roots-seed-width": `${layout.seedWidth}px`,
        "--roots-seed-height": `${layout.seedHeight}px`,
      } as React.CSSProperties : undefined}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="roots-canvas" />
      {showSeed && <span className="roots-seed"><i /></span>}
    </div>
  );
}
