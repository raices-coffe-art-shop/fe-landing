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
type BranchLevel = "primary" | "secondary";
type RenderBranch = Branch & { level: BranchLevel; parentBranchId?: string };
type RootLayout = {
  width: number;
  height: number;
  seed: Point;
  paths: RootPath[];
  branches: RenderBranch[];
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

function stableUnit(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function organicBranchPath(from: Point, to: Point, direction: -1 | 1, seed: number, scale = 1) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absDx = Math.max(12, Math.abs(dx));
  const absDy = Math.max(24, Math.abs(dy));
  const sway = (10 + seed * 18) * scale;
  const counterSway = (6 + (1 - seed) * 13) * scale;
  const mid = {
    x: from.x + dx * (0.44 + (seed - 0.5) * 0.16) + direction * sway,
    y: from.y + dy * (0.42 + (0.5 - seed) * 0.08),
  };
  const c1 = {
    x: from.x + dx * 0.12 - direction * Math.min(18, absDx * 0.2) * scale,
    y: from.y + dy * (0.2 + seed * 0.08),
  };
  const c2 = {
    x: mid.x - dx * (0.16 + seed * 0.08) + direction * counterSway,
    y: mid.y - absDy * (0.14 + seed * 0.06),
  };
  const c3 = {
    x: mid.x + dx * (0.12 + seed * 0.08) + direction * Math.min(20, absDx * 0.22) * scale,
    y: mid.y + absDy * (0.1 + (1 - seed) * 0.08),
  };
  const c4 = {
    x: to.x - dx * (0.16 + (1 - seed) * 0.06) - direction * Math.min(14, absDx * 0.16) * scale,
    y: to.y - absDy * (0.16 + seed * 0.06),
  };

  return [
    `M ${from.x.toFixed(1)} ${from.y.toFixed(1)}`,
    `C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${mid.x.toFixed(1)} ${mid.y.toFixed(1)}`,
    `C ${c3.x.toFixed(1)} ${c3.y.toFixed(1)}, ${c4.x.toFixed(1)} ${c4.y.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
  ].join(" ");
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
      const dashOffset = (1 - local).toFixed(6);
      const refs = pathRefs.current[index];
      if (refs?.shadow) refs.shadow.style.strokeDashoffset = dashOffset;
      if (refs?.main) refs.main.style.strokeDashoffset = dashOffset;
    });

    nextLayout.branches.forEach((branch, index) => {
      const local = progressFor(nextProgress, branch.start, branch.end);
      const ref = branchRefs.current[index];
      if (ref) ref.style.strokeDashoffset = (1 - local).toFixed(6);
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

      if (!origin || !lexicon || !people || !territory || !archive || !art || !catalog || !purpose || !visit) return;

      const seed = photo
        ? {
            x: compact ? 26 : clamp(photo.left - 58, width * 0.075, width * 0.22),
            y: photo.top + Math.min(compact ? 62 : 74, photo.height * 0.18),
          }
        : { x: width * (compact ? 0.12 : 0.16), y: origin.top + origin.height * 0.62 };

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

      const artEntryPoint = journeyArchiveArtPoints[journeyArchiveArtPoints.length - 1];
      const finalOffset = compact ? 26 : 46;
      const artToEndPoints: Point[] = [
        artEntryPoint,
        { x: width * continuationInnerX, y: art.top + art.height * 0.38 },
        { x: width * continuationX, y: art.top + art.height * 0.68 },
        { x: width * continuationInnerX, y: art.bottom - (compact ? 44 : 72) },
        { x: width * continuationX, y: catalog.top + (compact ? 34 : 54) },
        { x: width * continuationInnerX, y: catalog.top + catalog.height * 0.48 },
        { x: width * continuationX, y: catalog.bottom - (compact ? 46 : 74) },
        { x: width * continuationInnerX, y: purpose.top + (compact ? 34 : 54) },
        { x: width * continuationX, y: purpose.top + purpose.height * 0.5 },
        { x: width * continuationInnerX, y: purpose.bottom - (compact ? 46 : 74) },
        { x: width * continuationX, y: visit.top + (compact ? 32 : 52) },
        { x: width * continuationInnerX, y: visit.top + visit.height * 0.5 },
        { x: width * (compact ? 0.84 : 0.87), y: visit.bottom - finalOffset },
      ];

      const finalContinuationY = artToEndPoints[artToEndPoints.length - 1].y;
      const revealEndY = Math.min(Math.max(finalContinuationY, visit.bottom - finalOffset), height - 16);
      const ratioAt = (y: number) => clamp((y - seed.y) / Math.max(1, revealEndY - seed.y));

      const journeyArchiveArtPath: RootPath = {
        id: "journey-archive-art",
        d: catmullRomPath(journeyArchiveArtPoints),
        start: ratioAt(journeyArchiveArtPoints[0].y),
        end: ratioAt(journeyArchiveArtPoints[journeyArchiveArtPoints.length - 1].y),
        kind: "continuation",
      };

      const artToEndPath: RootPath = {
        id: "art-to-end",
        d: catmullRomPath(artToEndPoints),
        start: ratioAt(Math.min(artToEndPoints[0].y, art.top + art.height * 0.08)),
        end: ratioAt(artToEndPoints[artToEndPoints.length - 1].y),
        kind: "continuation",
      };

      if (process.env.NODE_ENV !== "production" && artToEndPath.end <= artToEndPath.start) {
        console.error("Invalid art-to-end root range", artToEndPath);
      }

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
        artToEndPath,
      ];

      const originEnd = ratioAt(origin.bottom - 32);
      const paths: RootPath[] = [
        { id: "origin-seed", d: catmullRomPath(originPathPoints), start: 0, end: originEnd, kind: "origin" },
        { id: "history-to-lexicon", d: catmullRomPath(handoffPathPoints), start: Math.max(0, originEnd - 0.004), end: ratioAt(lexicon.top + 6), kind: "handoff" },
        ...continuationSegments,
      ];

      const branches: RenderBranch[] = [];
      const addBranch = (id: string, from: Point, toXRatio: number, yOffset: number, widthPx: number, opacity: number, kind: RootPath["kind"]) => {
        const direction: -1 | 1 = toXRatio < from.x / width ? -1 : 1;
        const variant = stableUnit(id);
        const to = {
          x: clamp(width * toXRatio, compact ? 12 : 16, width - (compact ? 12 : 16)),
          y: clamp(from.y + yOffset, from.y + 58, height - 8),
        };
        const startRatio = ratioAt(from.y);
        const branchStart = Math.min(1, startRatio + (kind === "origin" ? 0.002 : 0.004 + variant * 0.004));
        const branch: RenderBranch = {
          id,
          d: organicBranchPath(from, to, direction, variant, compact ? 0.74 : 1),
          start: branchStart,
          end: Math.min(1, branchStart + (kind === "origin" ? 0.056 : 0.04 + variant * 0.008)),
          width: compact ? widthPx * 0.78 : widthPx,
          opacity,
          kind,
          level: "primary",
        };
        branches.push(branch);
        return branch;
      };
      const addMiniBranch = (id: string, from: Point, xOffset: number, yOffset: number, widthPx: number, opacity: number, kind: RootPath["kind"]) => {
        const direction: -1 | 1 = xOffset < 0 ? -1 : 1;
        const variant = stableUnit(id);
        const to = {
          x: clamp(from.x + xOffset, compact ? 12 : 16, width - (compact ? 12 : 16)),
          y: clamp(from.y + yOffset, from.y + 24, height - 8),
        };
        const startRatio = ratioAt(from.y);
        const branchStart = Math.min(1, startRatio + (compact ? 0.005 : 0.004) + variant * (compact ? 0.008 : 0.007));
        const branch: RenderBranch = {
          id,
          d: organicBranchPath(from, to, direction, variant, compact ? 0.7 : 1),
          start: branchStart,
          end: Math.min(1, branchStart + (compact ? 0.032 : 0.028) + variant * 0.01),
          width: compact ? Math.max(1.24, widthPx * 0.9) : Math.min(1.8, Math.max(1.45, widthPx * 1.1)),
          opacity: compact ? Math.min(0.8, opacity + 0.2) : Math.min(0.9, opacity + 0.34),
          kind,
          level: "primary",
        };
        branches.push(branch);
        return branch;
      };
      const addChildBranch = (
        id: string,
        parentBranch: RenderBranch,
        anchorFraction: number,
        side: -1 | 1,
        lengthPx: number,
        curvature: number,
        startDelay: number,
      ) => {
        const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
        probe.setAttribute("d", parentBranch.d);
        const parentLength = probe.getTotalLength();
        if (parentLength < 1) return;

        const variant = stableUnit(id);
        const anchorLength = parentLength * clamp(anchorFraction, 0.48, 0.72);
        const origin = probe.getPointAtLength(anchorLength);
        const before = probe.getPointAtLength(Math.max(0, anchorLength - 1.5));
        const after = probe.getPointAtLength(Math.min(parentLength, anchorLength + 1.5));
        const tangentX = after.x - before.x;
        const tangentY = after.y - before.y;
        const tangentLength = Math.hypot(tangentX, tangentY) || 1;
        const normal = { x: (-tangentY / tangentLength) * side, y: (tangentX / tangentLength) * side };
        const forward = { x: tangentX / tangentLength, y: tangentY / tangentLength };
        const scaledLength = compact ? lengthPx * 0.72 : lengthPx;
        const to = {
          x: clamp(
            origin.x + normal.x * scaledLength * (0.82 + variant * 0.28) + forward.x * scaledLength * (0.22 + curvature * 0.24),
            compact ? 12 : 16,
            width - (compact ? 12 : 16),
          ),
          y: clamp(
            origin.y + normal.y * scaledLength * (0.62 + variant * 0.18) + forward.y * scaledLength * 0.28 + scaledLength * (0.16 + variant * 0.12),
            origin.y + 8,
            height - 8,
          ),
        };
        const childStart = parentBranch.start + (parentBranch.end - parentBranch.start) * anchorFraction + startDelay;
        branches.push({
          id,
          parentBranchId: parentBranch.id,
          d: organicBranchPath({ x: origin.x, y: origin.y }, to, side, variant, compact ? 0.45 : 0.62),
          start: Math.min(1, Math.max(parentBranch.start, childStart)),
          end: Math.min(1, childStart + (compact ? 0.028 : 0.024) + variant * 0.006),
          width: compact ? 1.08 : 1.24,
          opacity: compact ? 0.68 : 0.76,
          kind: parentBranch.kind,
          level: "secondary",
        });
      };

      addBranch("origin-branch-one", originPathPoints[1], compact ? 0.035 : 0.075, compact ? 92 : 126, 1.9, 0.62, "origin");
      addBranch("origin-branch-two", originPathPoints[2], compact ? 0.18 : 0.225, compact ? 84 : 118, 1.55, 0.48, "origin");
      const peopleMini = addMiniBranch("people-mini-one", beforeArchiveAnchors[2], compact ? 34 : 54, compact ? 54 : 84, 1.5, 0.5, "continuation");
      addMiniBranch("people-mini-two", beforeArchiveAnchors[3], compact ? 26 : 46, compact ? 40 : 68, 1.42, 0.48, "continuation");
      addMiniBranch("territory-mini-one", beforeArchiveAnchors[5], compact ? -38 : -64, compact ? 62 : 96, 1.55, 0.54, "continuation");
      if (!compact) addMiniBranch("territory-mini-two", beforeArchiveAnchors[6], -48, 72, 1.42, 0.48, "continuation");
      if (journey) {
        addBranch("journey-branch", { x: width * continuationX, y: journey.top + 24 }, compact ? 0.79 : 0.85, compact ? 124 : 188, 1.45, 0.32, "continuation");
        const journeyMini = addMiniBranch("journey-mini-one", journeyArchiveArtPoints[1], compact ? 38 : 62, compact ? 62 : 96, 1.48, 0.5, "continuation");
        if (!compact) {
          addMiniBranch("journey-mini-two", journeyArchiveArtPoints[2], -52, 76, 1.4, 0.46, "continuation");
          addMiniBranch("journey-mini-three", journeyArchiveArtPoints[4], -58, 86, 1.46, 0.48, "continuation");
        }
        if (journeyMini) addChildBranch("journey-mini-one-child", journeyMini, 0.62, -1, compact ? 18 : 28, 0.34, 0.004);
      }
      if (archive) {
        addBranch("archive-branch", { x: width * continuationX, y: archive.top + 28 }, compact ? 0.8 : 0.86, compact ? 132 : 190, 1.38, 0.26, "continuation");
        const archiveMiniOne = addMiniBranch("archive-mini-one", journeyArchiveArtPoints[3], compact ? -34 : -56, compact ? 52 : 82, 1.42, 0.46, "continuation");
        addMiniBranch("archive-mini-two", journeyArchiveArtPoints[4], compact ? 26 : 44, compact ? 38 : 62, 1.36, 0.44, "continuation");
        const archiveMiniThree = !compact
          ? addMiniBranch("archive-mini-three", journeyArchiveArtPoints[5], 66, 96, 1.52, 0.5, "continuation")
          : undefined;
        if (!compact) addMiniBranch("archive-mini-four", journeyArchiveArtPoints[6], -46, 68, 1.36, 0.44, "continuation");
        if (archiveMiniOne) addChildBranch("archive-mini-one-child", archiveMiniOne, 0.58, 1, compact ? 16 : 24, 0.32, 0.003);
        if (!compact && archiveMiniThree) addChildBranch("archive-mini-three-child", archiveMiniThree, 0.66, -1, 30, 0.38, 0.004);
      }
      if (catalog) {
        addBranch("catalog-branch", { x: width * continuationInnerX, y: catalog.top + catalog.height * 0.48 }, compact ? 0.77 : 0.83, compact ? 142 : 205, 1.3, 0.22, "continuation");
      }
      const artMiniOne = addMiniBranch("art-mini-one", artToEndPoints[1], compact ? -34 : -58, compact ? 52 : 86, 1.44, 0.48, "continuation");
      addMiniBranch("art-mini-two", artToEndPoints[2], compact ? 38 : 66, compact ? 58 : 92, 1.5, 0.5, "continuation");
      if (!compact) addMiniBranch("art-mini-three", artToEndPoints[3], -42, 64, 1.34, 0.44, "continuation");
      const catalogMiniOne = addMiniBranch("catalog-mini-one", artToEndPoints[4], compact ? 30 : 52, compact ? 48 : 78, 1.38, 0.46, "continuation");
      if (!compact) addMiniBranch("catalog-mini-two", artToEndPoints[5], -72, 102, 1.48, 0.5, "continuation");
      if (!compact) addMiniBranch("catalog-mini-three", artToEndPoints[6], 58, 82, 1.38, 0.46, "continuation");
      const communityMiniOne = addMiniBranch("community-mini-one", artToEndPoints[7], compact ? -28 : -48, compact ? 42 : 68, 1.34, 0.44, "continuation");
      if (!compact) addMiniBranch("community-mini-two", artToEndPoints[8], 58, 84, 1.42, 0.48, "continuation");
      const visitMiniOne = !compact
        ? addMiniBranch("visit-mini-one", artToEndPoints[10], -46, 68, 1.32, 0.44, "continuation")
        : undefined;
      addMiniBranch("visit-mini-two", artToEndPoints[11], compact ? -36 : -62, compact ? 54 : 86, 1.42, 0.48, "continuation");
      if (peopleMini) addChildBranch("people-mini-one-child", peopleMini, 0.68, -1, compact ? 14 : 22, 0.3, 0.004);
      if (artMiniOne) addChildBranch("art-mini-one-child", artMiniOne, 0.64, 1, compact ? 16 : 26, 0.36, 0.004);
      if (!compact && catalogMiniOne) addChildBranch("catalog-mini-one-child", catalogMiniOne, 0.7, -1, 26, 0.34, 0.004);
      if (communityMiniOne && !compact) addChildBranch("community-mini-one-child", communityMiniOne, 0.64, 1, 24, 0.32, 0.004);
      if (visitMiniOne && compact) addChildBranch("visit-mini-one-child", visitMiniOne, 0.62, 1, 14, 0.28, 0.003);

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
                data-root-branch-id={branch.id}
                data-root-parent-branch-id={branch.parentBranchId}
                ref={(node) => {
                  branchRefs.current[index] = node;
                }}
                className={`${branch.level === "secondary" ? "continuous-root-child-branch" : "continuous-root-branch"} is-${branch.kind}`}
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
