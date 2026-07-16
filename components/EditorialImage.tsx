"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  position?: string;
  priority?: boolean;
};

export function EditorialImage({ src, alt, className = "", position = "center", priority = false }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`editorial-image ${failed ? "is-fallback" : ""} ${className}`}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailed(true)}
          style={{ objectPosition: position }}
        />
      )}
      <span className="image-grain" aria-hidden="true" />
      {failed && <span className="fallback-label">Fotografía por incorporar</span>}
    </div>
  );
}
