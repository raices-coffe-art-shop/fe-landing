"use client";

import { useEffect, useRef } from "react";

export function FooterRoot() {
  const pathRef = useRef<SVGPathElement>(null);
  const branchRefs = useRef<Array<SVGPathElement | null>>([]);
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let active = false;
    let lastProgress = -1;

    const update = () => {
      frame = 0;
      if (!active && !reduced) return;
      const rect = root.getBoundingClientRect();
      const progress = reduced
        ? 1
        : Math.min(1, Math.max(0, (window.innerHeight - rect.top) / Math.max(1, rect.height * 0.9)));
      if (Math.abs(progress - lastProgress) < 0.0015) return;
      lastProgress = progress;
      if (pathRef.current) pathRef.current.style.strokeDashoffset = String(1 - progress);
      branchRefs.current.forEach((path, index) => {
        if (!path) return;
        const local = Math.min(1, Math.max(0, (progress - (0.28 + index * 0.12)) / 0.34));
        path.style.strokeDashoffset = String(1 - local);
      });
    };

    const requestUpdate = () => {
      if (!active && !reduced) return;
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) requestUpdate();
      },
      { rootMargin: "60% 0px 60% 0px" },
    );
    observer.observe(root);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg ref={rootRef} className="footer-root-trail" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="footerRootGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d704b" />
          <stop offset="52%" stopColor="#70815b" />
          <stop offset="100%" stopColor="#435a45" />
        </linearGradient>
      </defs>
      <path ref={pathRef} pathLength="1" className="footer-root-main" d="M820 -20 C814 78 748 126 760 214 C773 307 824 346 758 428 C704 496 626 535 620 665" />
      {[
        "M760 214 C686 238 626 282 584 348",
        "M758 428 C827 447 876 492 914 558",
        "M646 530 C575 548 510 588 466 646",
      ].map((d, index) => (
        <path key={d} ref={(node) => { branchRefs.current[index] = node; }} pathLength="1" className="footer-root-branch" d={d} />
      ))}
    </svg>
  );
}
