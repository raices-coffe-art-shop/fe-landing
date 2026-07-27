"use client";

import { RootsCanvas } from "./RootsCanvas";
import { useRootProgress } from "./useRootProgress";
import { useStageScrollProgress } from "./useStageScrollProgress";
import type { RootStage } from "./rootGeometry";

type RootsStageCanvasProps = {
  stage: RootStage;
  className?: string;
  showSeed?: boolean;
};

export function RootsStageCanvas({ stage, className, showSeed }: RootsStageCanvasProps) {
  const { stageProgress } = useRootProgress();
  const localProgress = useStageScrollProgress(stage);
  const contextProgress = stageProgress(stage);
  const progress = stage === "lexicon" ? localProgress : Math.max(localProgress, contextProgress);
  return <RootsCanvas stage={stage} progress={progress} className={className} showSeed={showSeed} />;
}
