"use client";

import { useEffect, useRef } from "react";

export function StoryPath() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const path = pathRef.current;
      if (!path) return;
      if (reduced) {
        path.style.strokeDashoffset = "0";
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      path.style.strokeDashoffset = String(1 - progress * 1.15);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <svg className="story-path" viewBox="0 0 120 1000" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="storyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b76a4d" />
          <stop offset="28%" stopColor="#4d674f" />
          <stop offset="56%" stopColor="#c4984d" />
          <stop offset="78%" stopColor="#8c4c43" />
          <stop offset="100%" stopColor="#29211c" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        pathLength="1"
        d="M64 0 C52 45 22 73 30 126 C38 181 88 193 86 250 C84 307 27 323 26 382 C25 441 88 460 82 526 C76 591 23 612 32 675 C41 739 91 749 78 812 C68 861 38 910 62 1000"
      />
    </svg>
  );
}
