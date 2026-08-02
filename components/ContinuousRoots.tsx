"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type RootPath = {
  id: string;
  d: string;
  start: number;
  end: number;
  kind: "origin" | "handoff" | "continuation";
};
type Branch = RootPath & { width: number; opacity: number };
type RootLayout = {
  width: number;
  height: number;
  seed: Point;
  paths: RootPath[];
  branches: Branch[];
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ACTIVE_TIP_VIEWPORT_RATIO = 0.52;

function smoothstep(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function catmullRomPath(points: Point[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    const c1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function branchPath(from: Point, to: Point, direction: -1 | 1) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const c1 = { x: from.x + dx * 0.22 + direction * Math.min(32, Math.abs(dx) * 0.08), y: from.y + dy * 0.27 };
  const c2 = { x: to.x - dx * 0.14, y: to.y - dy * 0.2 };
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

function progressFor(progress: number, start: number, end: number) {
  return smoothstep((progress - start) / Math.max(0.001, end - start));
}

function linearProgressFor(progress: number, start: number, end: number) {
  return clamp((progress - start) / Math.max(0.001, end - start));
}

export function ContinuousRoots() {
  const holderRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<Array<{ main: SVGPathElement | null; shadow: SVGPathElement | null }>>([]);
  const branchRefs = useRef<Array<SVGPathElement | null>>([]);
  const layoutRef = useRef<RootLayout | null>(null);
  const rawProgressRef = useRef(0);
  const visualProgressRef = useRef(0);
  const frameRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrollSettleFramesRef = useRef(0);
  const [layout, setLayout] = useState<RootLayout | null>(null);

  const syncRootProgress = (nextProgress: number, nextLayout = layoutRef.current) => {
    if (!nextLayout) return;

    nextLayout.paths.forEach((path, index) => {
      const local = path.kind === "continuation"
        ? linearProgressFor(nextProgress, path.start, path.end)
        : progressFor(nextProgress, path.start, path.end);
      const dashOffset = String(1 - local);
      const refs = pathRefs.current[index];
      if (refs?.shadow) refs.shadow.style.strokeDashoffset = dashOffset;
      if (refs?.main) refs.main.style.strokeDashoffset = dashOffset;
    });

    nextLayout.branches.forEach((branch, index) => {
      const local = progressFor(nextProgress, branch.start, branch.end);
      const ref = branchRefs.current[index];
      if (ref) ref.style.strokeDashoffset = String(1 - local);
    });
  };

  useEffect(() => {
    const holder = holderRef.current;
    const parent = holder?.parentElement;
    if (!holder || !parent) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let start = 0;
    let end = 1;
    let resizeFrame = 0;

    const relativeBox = (selector: string) => {
      const element = parent.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const parentRect = parent.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - parentRect.left,
        top: rect.top - parentRect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right - parentRect.left,
        bottom: rect.bottom - parentRect.top,
      };
    };

    const measure = () => {
      resizeFrame = 0;
      const parentRect = parent.getBoundingClientRect();
      const width = parent.clientWidth;
      const height = parent.scrollHeight;
      if (width < 1 || height < 1) return;

      const compact = width <= 760;
      const origin = relativeBox("#historia");
      const photo = relativeBox(".history-photo, .human-origin-photo");
      const lexicon = relativeBox("#lengua");
      const people = relativeBox("#personas");
      const territory = relativeBox("#territorio");
      const journey = relativeBox("#origen");
      const archive = relativeBox("#archivo");
      const art = relativeBox("#arte");
      const catalog = relativeBox("#catalogo");
      const purpose = relativeBox("#comunidad");
      const visit = relativeBox("#visita");

      if (!origin || !lexicon || !people || !territory || !archive || !art || !visit) return;

      const seed = photo
        ? {
            x: compact ? 26 : clamp(photo.left - 58, width * 0.075, width * 0.22),
            y: photo.top + Math.min(compact ? 62 : 74, photo.height * 0.18),
          }
        : { x: width * (compact ? 0.12 : 0.16), y: origin.top + origin.height * 0.62 };

      const revealEndY = Math.max(seed.y + 1, Math.min(visit.top + visit.height * 0.28, height - 16));
      const ratioAt = (y: number) => clamp((y - seed.y) / Math.max(1, revealEndY - seed.y));

      const originPathPoints: Point[] = [
        seed,
        { x: seed.x - (compact ? 3 : 7), y: seed.y + (compact ? 82 : 104) },
        { x: width * (compact ? 0.095 : 0.145), y: origin.bottom - (compact ? 205 : 225) },
        { x: width * (compact ? 0.085 : 0.13), y: origin.bottom - (compact ? 96 : 112) },
        { x: width * (compact ? 0.1 : 0.145), y: origin.bottom - 32 },
      ];

      const handoffPathPoints: Point[] = [
        originPathPoints[originPathPoints.length - 1],
        { x: width * (compact ? 0.31 : 0.35), y: origin.bottom - 12 },
        { x: width * (compact ? 0.6 : 0.67), y: lexicon.top + 6 },
      ];
      const continuationX = compact ? 0.885 : 0.905;
      const continuationInnerX = continuationX;
      const territoryHandoffY = territory.top + 2;
      const beforeArchiveAnchors: Point[] = [
        { x: width * (compact ? 0.75 : 0.79), y: lexicon.bottom - 10 },
        { x: width * continuationX, y: people.top + 18 },
        { x: width * (compact ? 0.892 : 0.916), y: people.top + people.height * 0.24 },
        { x: width * continuationInnerX, y: people.bottom - 68 },
        { x: width * continuationX, y: territoryHandoffY },
        { x: width * (compact ? 0.902 : 0.918), y: territory.top + territory.height * 0.13 },
        { x: width * continuationInnerX, y: territory.bottom - 62 },
      ];

      const journeyBridgeStart = journey
        ? {
            x: width * (compact ? 0.89 : 0.91),
            y: journey.top + journey.height * 0.4,
          }
        : { x: width * continuationInnerX, y: territory.bottom - 62 };

      if (journey) {
        beforeArchiveAnchors.push(
          { x: width * continuationX, y: journey.top + 24 },
          journeyBridgeStart,
        );
      }

      const journeyArchiveArtPoints: Point[] = [
        journeyBridgeStart,
        { x: width * continuationInnerX, y: journey ? journey.bottom - 74 : archive.top + 28 },
        { x: width * continuationX, y: archive.top + 28 },
        { x: width * (compact ? 0.89 : 0.912), y: archive.top + archive.height * 0.28 },
        { x: width * continuationInnerX, y: archive.top + archive.height * 0.56 },
        { x: width * continuationX, y: archive.bottom - (compact ? 48 : 76) },
        { x: width * continuationInnerX, y: art.top + (compact ? 34 : 54) },
        { x: width * continuationX, y: art.top + art.height * 0.24 },
      ];

      const journeyArchiveArtPath: RootPath = {
        id: "journey-archive-art",
        d: catmullRomPath(journeyArchiveArtPoints),
        start: ratioAt(journeyArchiveArtPoints[0].y),
        end: ratioAt(journeyArchiveArtPoints[journeyArchiveArtPoints.length - 1].y),
        kind: "continuation",
      };

      const afterArchiveAnchors: Point[] = [
        journeyArchiveArtPoints[journeyArchiveArtPoints.length - 1],
        { x: width * continuationInnerX, y: art.top + art.height * 0.44 },
      ];
      if (catalog) afterArchiveAnchors.push({ x: width * continuationInnerX, y: catalog.top + catalog.height * 0.48 });
      if (purpose) afterArchiveAnchors.push({ x: width * continuationX, y: purpose.top + purpose.height * 0.52 });

      afterArchiveAnchors.push(
        { x: width * continuationInnerX, y: visit.top + visit.height * 0.54 },
        { x: width * (compact ? 0.8 : 0.82), y: visit.bottom - 8 },
      );

      const buildContinuationSegments = (anchors: Point[], idPrefix: string) => {
        const segments: RootPath[] = [];
        for (let index = 0; index < anchors.length - 1; index += 2) {
          const a = anchors[Math.max(0, index)];
          const b = anchors[index + 1];
          const c = anchors[Math.min(anchors.length - 1, index + 2)] ?? b;
          if (a.y < territory.top && c.y > territory.top) {
            const startRatio = ratioAt(a.y);
            const endRatio = ratioAt(b.y);
            segments.push({
              id: `${idPrefix}-${segments.length + 1}`,
              d: catmullRomPath([a, b]),
              start: startRatio,
              end: Math.max(startRatio + 0.025, endRatio),
              kind: "continuation",
            });
            continue;
          }
          const startRatio = ratioAt(a.y);
          const endRatio = ratioAt(c.y);
          segments.push({
            id: `${idPrefix}-${segments.length + 1}`,
            d: catmullRomPath([a, b, c]),
            start: startRatio,
            end: Math.max(startRatio + 0.025, endRatio),
            kind: "continuation",
          });
        }
        return segments;
      };

      const continuationSegments = [
        ...buildContinuationSegments(beforeArchiveAnchors, "before-archive"),
        journeyArchiveArtPath,
        ...buildContinuationSegments(afterArchiveAnchors, "after-archive"),
      ];

      const originEnd = ratioAt(origin.bottom - 32);
      const paths: RootPath[] = [
        { id: "origin-seed", d: catmullRomPath(originPathPoints), start: 0, end: originEnd, kind: "origin" },
        { id: "history-to-lexicon", d: catmullRomPath(handoffPathPoints), start: Math.max(0, originEnd - 0.004), end: ratioAt(lexicon.top + 6), kind: "handoff" },
        ...continuationSegments,
      ];

      const branches: Branch[] = [];
      const addBranch = (id: string, from: Point, toXRatio: number, yOffset: number, widthPx: number, opacity: number, kind: RootPath["kind"]) => {
        const direction: -1 | 1 = toXRatio < from.x / width ? -1 : 1;
        const to = {
          x: clamp(width * toXRatio, compact ? 12 : 16, width - (compact ? 12 : 16)),
          y: clamp(from.y + yOffset, from.y + 58, height - 8),
        };
        const startRatio = ratioAt(from.y);
        branches.push({
          id,
          d: branchPath(from, to, direction),
          start: Math.max(0, startRatio - 0.006),
          end: Math.min(1, startRatio + (kind === "origin" ? 0.055 : 0.04)),
          width: compact ? widthPx * 0.78 : widthPx,
          opacity,
          kind,
        });
      };

      addBranch("origin-branch-one", originPathPoints[1], compact ? 0.035 : 0.075, compact ? 92 : 126, 1.9, 0.62, "origin");
      addBranch("origin-branch-two", originPathPoints[2], compact ? 0.18 : 0.225, compact ? 84 : 118, 1.55, 0.48, "origin");
      if (journey) {
        addBranch("journey-branch", { x: width * continuationX, y: journey.top + 24 }, compact ? 0.79 : 0.85, compact ? 124 : 188, 1.45, 0.32, "continuation");
      }
      if (archive) {
        addBranch("archive-branch", { x: width * continuationX, y: archive.top + 28 }, compact ? 0.8 : 0.86, compact ? 132 : 190, 1.38, 0.26, "continuation");
      }
      if (catalog) {
        addBranch("catalog-branch", { x: width * continuationInnerX, y: catalog.top + catalog.height * 0.48 }, compact ? 0.77 : 0.83, compact ? 142 : 205, 1.3, 0.22, "continuation");
      }

      const nextLayout = { width, height, seed, paths, branches };
      pathRefs.current.length = nextLayout.paths.length;
      branchRefs.current.length = nextLayout.branches.length;
      layoutRef.current = nextLayout;
      setLayout(nextLayout);
      syncRootProgress(visualProgressRef.current, nextLayout);

      const absoluteTop = window.scrollY + parentRect.top;
      start = absoluteTop + seed.y - window.innerHeight * ACTIVE_TIP_VIEWPORT_RATIO;
      end = absoluteTop + revealEndY - window.innerHeight * ACTIVE_TIP_VIEWPORT_RATIO;
      if (end <= start) end = start + 1;
    };

    const updateRaw = () => {
      const linear = clamp((window.scrollY - start) / Math.max(1, end - start));
      rawProgressRef.current = reducedQuery.matches ? 1 : linear;
    };

    const tick = () => {
      frameRef.current = 0;
      updateRaw();
      const scrollDelta = Math.abs(window.scrollY - lastScrollYRef.current);
      lastScrollYRef.current = window.scrollY;
      if (scrollDelta > 0.05) {
        scrollSettleFramesRef.current = 8;
      } else if (scrollSettleFramesRef.current > 0) {
        scrollSettleFramesRef.current -= 1;
      }

      const delta = rawProgressRef.current - visualProgressRef.current;
      visualProgressRef.current += delta * (reducedQuery.matches ? 1 : 0.42);
      if (Math.abs(delta) < 0.0006) visualProgressRef.current = rawProgressRef.current;
      syncRootProgress(visualProgressRef.current);
      parent.style.setProperty("--narrative-root-progress", visualProgressRef.current.toFixed(4));
      if (Math.abs(rawProgressRef.current - visualProgressRef.current) > 0.0007 || scrollSettleFramesRef.current > 0) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    const requestTick = () => {
      scrollSettleFramesRef.current = 8;
      if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
    };

    const requestMeasure = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        measure();
        updateRaw();
        requestTick();
      });
    };

    const resizeObserver = new ResizeObserver(requestMeasure);
    resizeObserver.observe(parent);
    parent.querySelectorAll<HTMLElement>("section, .history-photo, .human-origin-photo").forEach((element) => resizeObserver.observe(element));

    measure();
    updateRaw();
    lastScrollYRef.current = window.scrollY;
    visualProgressRef.current = rawProgressRef.current;
    syncRootProgress(rawProgressRef.current);

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("raices:smooth-scroll", requestTick);
    window.addEventListener("resize", requestMeasure);
    window.addEventListener("orientationchange", requestMeasure);
    window.visualViewport?.addEventListener("resize", requestMeasure);
    reducedQuery.addEventListener("change", requestMeasure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestTick);
      window.removeEventListener("raices:smooth-scroll", requestTick);
      window.removeEventListener("resize", requestMeasure);
      window.removeEventListener("orientationchange", requestMeasure);
      window.visualViewport?.removeEventListener("resize", requestMeasure);
      reducedQuery.removeEventListener("change", requestMeasure);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
    };
  }, []);

  useEffect(() => {
    syncRootProgress(visualProgressRef.current, layout);
  }, [layout]);

  return (
    <div ref={holderRef} className="continuous-root-trail" aria-hidden="true">
      {layout && (
        <svg viewBox={`0 0 ${layout.width} ${layout.height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="continuousRootGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d9a35c" />
              <stop offset="20%" stopColor="#e2b96f" />
              <stop offset="52%" stopColor="#a2764f" />
              <stop offset="76%" stopColor="#71805a" />
              <stop offset="100%" stopColor="#465a43" />
            </linearGradient>
            <linearGradient id="continuousRootQuietGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c59a61" />
              <stop offset="52%" stopColor="#887850" />
              <stop offset="100%" stopColor="#596a4a" />
            </linearGradient>
            <radialGradient id="continuousSeedGradient" cx="30%" cy="22%" r="82%">
              <stop offset="0%" stopColor="#b67a50" />
              <stop offset="55%" stopColor="#74482f" />
              <stop offset="100%" stopColor="#382218" />
            </radialGradient>
            <filter id="continuousRootShadow" x="-60%" y="-30%" width="220%" height="170%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
          </defs>

          {layout.paths.map((path, index) => {
            return (
              <g key={path.id} data-root-path-id={path.id} className={`continuous-root-segment is-${path.kind}`}>
                <path
                  ref={(node) => {
                    pathRefs.current[index] = { ...pathRefs.current[index], shadow: node };
                  }}
                  className="continuous-root-shadow"
                  d={path.d}
                  pathLength="1"
                  style={{ strokeDashoffset: 1 }}
                />
                <path
                  ref={(node) => {
                    pathRefs.current[index] = { ...pathRefs.current[index], main: node };
                  }}
                  className="continuous-root-main"
                  d={path.d}
                  pathLength="1"
                  data-root-handoff-connector={path.kind === "handoff" ? "previous-root-end" : undefined}
                  style={{ strokeDashoffset: 1 }}
                />
              </g>
            );
          })}

          {layout.branches.map((branch, index) => {
            return (
              <path
                key={branch.id}
                ref={(node) => {
                  branchRefs.current[index] = node;
                }}
                className={`continuous-root-branch is-${branch.kind}`}
                d={branch.d}
                pathLength="1"
                style={{ strokeDashoffset: 1, strokeWidth: branch.width, opacity: branch.opacity }}
              />
            );
          })}

          <g className="continuous-root-seed" transform={`translate(${layout.seed.x} ${layout.seed.y - (layout.width <= 760 ? 35 : 43)}) scale(${layout.width <= 760 ? 0.82 : 1})`}>
            <path className="continuous-seed-body" d="M 1 -39 C 19 -37 29 -20 27 1 C 25 24 12 40 -5 39 C -23 37 -31 17 -26 -7 C -22 -28 -10 -40 1 -39 Z" fill="url(#continuousSeedGradient)" />
            <path d="M 2 -31 C -8 -17 -7 6 -3 29" className="continuous-seed-crease" />
            <path d="M -13 -24 C -8 -31 -2 -34 4 -34" className="continuous-seed-highlight" />
          </g>
        </svg>
      )}
    </div>
  );
}
