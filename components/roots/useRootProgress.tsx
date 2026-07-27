"use client";

import { createContext, useContext } from "react";
import { clamp, smoothstep, type RootStage } from "./rootGeometry";

export type RootProgressContextValue = {
  globalProgress: number;
  stageProgress: (stage: RootStage) => number;
  reducedMotion: boolean;
};

const stageRanges: Record<RootStage, [number, number]> = {
  origin: [0, 0.15],
  lexicon: [0.15, 0.3],
  network: [0.3, 0.7],
  people: [0.7, 0.9],
  territory: [0.9, 1],
};

const RootProgressContext = createContext<RootProgressContextValue>({
  globalProgress: 0,
  stageProgress: () => 0,
  reducedMotion: false,
});

export function makeStageProgress(globalProgress: number, stage: RootStage) {
  const [start, end] = stageRanges[stage];
  return smoothstep(clamp((globalProgress - start) / Math.max(0.001, end - start)));
}

export function useRootProgress() {
  return useContext(RootProgressContext);
}

export const RootProgressProvider = RootProgressContext.Provider;
