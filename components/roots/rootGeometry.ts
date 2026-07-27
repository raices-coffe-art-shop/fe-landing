export type RootStage = "origin" | "lexicon" | "network" | "people" | "territory";

export type Segment = {
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

export type RootLayout = {
  width: number;
  height: number;
  compact: boolean;
  stage: RootStage;
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

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const clampPixels = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function smoothstep(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export function getRootLayout(width: number, height: number, stage: RootStage): RootLayout {
  const compact = width <= 760;
  const seedWidth = compact ? clampPixels(width * 0.15, 48, 62) : 76;
  const seedHeight = compact ? clampPixels(width * 0.21, 70, 88) : 106;
  const stageSeedTop = {
    origin: compact ? height * 0.68 : height * 0.55,
    lexicon: -seedHeight * 0.16,
    network: -seedHeight * 0.58,
    people: -seedHeight * 0.35,
    territory: -seedHeight * 0.3,
  } satisfies Record<RootStage, number>;
  const stageOriginX = {
    origin: compact ? width * 0.74 : width * 0.78,
    lexicon: compact ? width * 0.48 : width * 0.66,
    network: width * 0.5,
    people: compact ? width * 0.52 : width * 0.46,
    territory: compact ? width * 0.48 : width * 0.42,
  } satisfies Record<RootStage, number>;
  const seedTop = clampPixels(stageSeedTop[stage], -seedHeight, height - seedHeight);
  const originX = clampPixels(stageOriginX[stage], 18, width - 18);
  const originY = seedTop + seedHeight * 0.98;
  const minX = compact ? 10 : -width * 0.08;
  const maxX = compact ? width - 10 : width * 1.08;
  const maxY = stage === "origin" ? height + 84 : height - (compact ? 34 : 48);
  const availableHeight = Math.max(260, maxY - originY);
  const availableWidth = compact ? Math.max(280, width - 20) : width * 1.16;
  const stageLength = {
    origin: compact ? availableHeight * 0.22 : availableHeight * 0.2,
    lexicon: compact ? availableHeight * 0.22 : availableHeight * 0.24,
    network: compact ? availableHeight * 0.36 : Math.max(180, height * 0.24),
    people: compact ? availableHeight * 0.3 : availableHeight * 0.27,
    territory: compact ? availableHeight * 0.23 : availableHeight * 0.22,
  } satisfies Record<RootStage, number>;

  return {
    width,
    height,
    compact,
    stage,
    originX,
    originY,
    seedTop,
    seedWidth,
    seedHeight,
    minX,
    maxX,
    maxY,
    baseLength: stageLength[stage],
    lateralAmplitude: compact ? availableWidth * 0.48 : width * 0.42,
  };
}

export function buildRootSegments(layout: RootLayout) {
  const result: Segment[] = [];
  let cursor = 0;
  const { compact, originX, originY, minX, maxX, maxY, lateralAmplitude, baseLength, stage } = layout;
  const dense = stage === "network";
  const spare = stage === "origin" || stage === "territory";
  const depthLimit = stage === "origin" ? 2 : stage === "territory" ? 3 : 4;
  const depthDurations = compact ? [0.18, 0.15, 0.13, 0.11, 0.09] : [0.17, 0.14, 0.12, 0.1, 0.08];
  const widthScale = stage === "people" || stage === "territory" ? 0.58 : stage === "origin" || stage === "lexicon" ? 0.7 : 1;
  const depthWidths = (compact ? [8.4, 5.9, 3.8, 2.05, 0.95] : [10.6, 7.3, 4.8, 2.65, 1.1]).map((value) => value * widthScale);

  const branch = (x: number, y: number, angle: number, length: number, depth: number, parentEnd: number, seed: number) => {
    if (depth > depthLimit || length < (compact ? 13 : 10) || y > maxY) return;
    const delay = depth === 0 ? seeded(seed) * 0.018 : 0.035 + depth * 0.035 + seeded(seed + 13.7) * 0.018;
    const start = depth === 0 ? parentEnd + delay : parentEnd - 0.012 + delay;
    const angleNoise = (seeded(seed + depth * 4.13) - 0.5) * (compact ? 0.22 : 0.32);
    const nextAngle = angle + angleNoise;
    const rawX2 = x + Math.cos(nextAngle) * length;
    const rawY2 = y + Math.sin(nextAngle) * length;
    const x2 = clampPixels(rawX2, minX, maxX);
    const y2 = clampPixels(rawY2, originY + 18, maxY);
    const sidePull = clamp((x2 - originX) / Math.max(1, lateralAmplitude), -1, 1);
    const bend = ((seeded(seed + 91.2) - 0.5) * length * (compact ? 0.28 : 0.44)) - sidePull * length * 0.12;
    const cx = clampPixels((x + x2) / 2 + bend, minX, maxX);
    const cy = clampPixels((y + y2) / 2 + length * 0.05, originY - 20, maxY);
    const duration = depthDurations[depth] * (0.84 + seeded(seed + 27.2) * 0.28);
    const end = start + duration;
    const pulse = end + 0.012;

    result.push({ x1: x, y1: y, cx, cy, x2, y2, start, end, pulse, width: depthWidths[depth], depth });
    cursor += 1;

    const childLength = length * (compact ? 0.72 + seeded(seed + 21.7) * 0.08 : 0.78 + seeded(seed + 21.7) * 0.11);
    branch(x2, y2, nextAngle + (seeded(seed + 7.4) - 0.5) * (compact ? 0.22 : 0.28), childLength, depth + 1, end, seed + 19.3);

    const branchChance = spare ? 0.58 - depth * 0.13 : dense ? 0.98 - depth * 0.05 : 0.86 - depth * 0.07;
    if (depth < depthLimit && seeded(seed + 39.1) < branchChance) {
      const side = seeded(seed + 49.8) > 0.5 ? 1 : -1;
      const spread = compact ? 0.42 + seeded(seed + 52.2) * 0.34 : 0.46 + seeded(seed + 52.2) * 0.54;
      branch(x2, y2, nextAngle + side * spread, length * (0.45 + seeded(seed + 57.6) * 0.17), depth + 1, end, seed + 71.5 + cursor);
    }

    if (!spare && depth > 0 && depth < depthLimit && seeded(seed + 86.4) < (dense ? 0.76 : 0.58)) {
      const side = seeded(seed + 93.1) > 0.5 ? 1 : -1;
      branch(x2, y2, nextAngle - side * (0.52 + seeded(seed + 101.2) * 0.34), length * (0.34 + seeded(seed + 112.6) * 0.16), depth + 1, end + 0.018, seed + 131.5 + cursor);
    }
  };

  const primarySeeds = stage === "origin"
    ? [[Math.PI / 2, 1, 12.1], [Math.PI / 2 + 0.16, 0.74, 43.7]]
    : stage === "lexicon"
      ? [[Math.PI / 2, 1, 12.1], [Math.PI / 2 + 0.28, 0.78, 43.7], [Math.PI / 2 - 0.22, 0.76, 74.2]]
      : stage === "territory"
        ? [[Math.PI / 2 + 0.1, 1, 12.1], [Math.PI / 2 - 0.34, 0.66, 74.2]]
        : [[Math.PI / 2, 1, 12.1], [Math.PI / 2 + (compact ? 0.13 : 0.19), 0.97, 43.7], [Math.PI / 2 - (compact ? 0.13 : 0.19), 0.95, 74.2], [Math.PI / 2 + (compact ? 0.31 : 0.34), 0.72, 95.4], [Math.PI / 2 - (compact ? 0.31 : 0.34), 0.7, 118.8]];

  primarySeeds.forEach(([angle, scale, seed], index) => {
    branch(originX, originY, angle, baseLength * scale, index > 2 ? 1 : 0, 0.01 + index * 0.025, seed);
  });

  const maxEnd = Math.max(...result.map((segment) => segment.end), 1);
  for (const segment of result) {
    segment.start = clamp(segment.start / maxEnd);
    segment.end = clamp(segment.end / maxEnd);
    segment.pulse = clamp(segment.pulse / maxEnd);
  }

  return result;
}

export function drawRootSegment(target: CanvasRenderingContext2D, segment: Segment, local: number, endpoint: boolean, stage: RootStage) {
  const t = 1 - Math.pow(1 - local, 3);
  const inv = 1 - t;
  const x = inv * inv * segment.x1 + 2 * inv * t * segment.cx + t * t * segment.x2;
  const y = inv * inv * segment.y1 + 2 * inv * t * segment.cy + t * t * segment.y2;
  const topographic = stage === "territory";
  const quiet = stage === "origin" || stage === "people" || stage === "territory";
  const gradient = target.createLinearGradient(segment.x1, segment.y1, x, y);
  gradient.addColorStop(0, topographic ? "rgba(206, 190, 156, .42)" : segment.depth < 2 ? "rgba(226, 166, 93, .86)" : "rgba(180, 204, 119, .7)");
  gradient.addColorStop(1, topographic ? "rgba(134, 157, 124, .35)" : segment.depth < 3 ? "rgba(250, 214, 140, .74)" : "rgba(140, 166, 90, .62)");
  target.beginPath();
  target.moveTo(segment.x1, segment.y1);
  target.quadraticCurveTo(segment.cx, segment.cy, x, y);
  target.lineCap = "round";
  target.lineJoin = "round";
  target.lineWidth = topographic ? Math.max(0.65, segment.width * 0.55) : segment.width;
  target.strokeStyle = gradient;
  target.shadowColor = quiet ? "rgba(228, 187, 114, .13)" : segment.depth < 3 ? "rgba(228, 187, 114, .32)" : "rgba(155, 184, 103, .2)";
  target.shadowBlur = quiet ? 3 : segment.depth < 2 ? 11 : 5;
  target.stroke();

  if (endpoint && local > 0.74 && !topographic) {
    target.beginPath();
    target.arc(x, y, Math.max(0.7, 2.2 - segment.depth * 0.18), 0, Math.PI * 2);
    target.fillStyle = segment.depth < 4 ? "rgba(255, 229, 150, .78)" : "rgba(207, 234, 139, .52)";
    target.fill();
  }
}
