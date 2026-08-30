"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NextPersonStoryProps = {
  person: {
    slug: string;
    name: string;
    category: string;
    image?: { src: string; alt: string };
  };
};

export function NextPersonStory({ person }: NextPersonStoryProps) {
  const [visible, setVisible] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
  }, []);

  const movePreview = (clientX: number, clientY: number) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const preview = previewRef.current;
      if (!preview) return;
      const rect = preview.getBoundingClientRect();
      const width = rect.width || 300;
      const height = rect.height || 360;
      const left = Math.min(Math.max(clientX + 18, 14), window.innerWidth - width - 14);
      const top = Math.min(Math.max(clientY - height * .55, 14), window.innerHeight - height - 14);
      preview.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    });
  };

  return (
    <section className="next-story person-next-story">
      <div className="page-shell">
        <p>Siguiente historia</p>
        <Link
          href={`/personas/${person.slug}`}
          onPointerEnter={(event) => { setVisible(true); movePreview(event.clientX, event.clientY); }}
          onPointerMove={(event) => movePreview(event.clientX, event.clientY)}
          onPointerLeave={() => setVisible(false)}
          onFocus={(event) => {
            setVisible(true);
            const rect = event.currentTarget.getBoundingClientRect();
            movePreview(rect.right * .72, rect.top + rect.height * .6);
          }}
          onBlur={() => setVisible(false)}
        >
          {person.image && <span className="person-next-mobile-image" aria-hidden="true"><img src={person.image.src} alt="" loading="lazy" /></span>}
          <span>{person.category}</span>
          <h2>{person.name}</h2>
          <i aria-hidden="true">↗</i>
        </Link>
      </div>
      {person.image && (
        <div ref={previewRef} className={`person-next-preview${visible ? " is-visible" : ""}`} aria-hidden="true">
          <img src={person.image.src} alt="" />
          <span>{person.name}</span>
        </div>
      )}
    </section>
  );
}
