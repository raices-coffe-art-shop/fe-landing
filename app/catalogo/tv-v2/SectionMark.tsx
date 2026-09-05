import type { ReactNode } from "react";

// Los conceptos llevan una ilustración de línea junto al título de cada sección.
// No tenemos ese set de ilustraciones, así que se dibujan aquí a trazo: son
// pocas figuras, pesan cero y heredan el color del contenedor.

const MARKS: Record<string, ReactNode> = {
  // Café: taza sobre plato con vapor.
  clasicos: (
    <>
      <path d="M28 50h46v20a23 23 0 0 1-46 0z" />
      <path d="M74 55h8a12 12 0 0 1 0 24h-4" />
      <path d="M18 96h74" />
      <path d="M42 38c0-6 6-7 6-13" />
      <path d="M56 38c0-6 6-7 6-13" />
    </>
  ),
  // Chocolatería: mazorca de cacao con sus nervaduras.
  "bebidas-de-chocolate": (
    <>
      <path d="M60 20c16 8 26 24 26 42s-10 34-26 42c-16-8-26-24-26-42s10-34 26-42z" />
      <path d="M60 22v76" />
      <path d="M45 33c-4 12-4 42 0 54" />
      <path d="M75 33c4 12 4 42 0 54" />
    </>
  ),
  // Sándwiches: el triángulo del pan chapla con su relleno.
  sandwiches: (
    <>
      <path d="M18 86 60 30l42 56z" />
      <path d="M33 68h54" />
      <path d="M44 55h32" />
    </>
  ),
  // Bebidas andinas: taza con canela, como en el concepto.
  "bebidas-andinas": (
    <>
      <path d="M28 50h44v24a22 22 0 0 1-44 0z" />
      <path d="M72 56h6a11 11 0 0 1 0 22h-3" />
      <path d="M62 44 92 20" />
      <path d="M84 22h9v9" />
      <path d="M100 68a30 30 0 0 0-14-22" />
      <circle cx="20" cy="88" r="3.5" stroke="none" fill="currentColor" />
      <circle cx="10" cy="76" r="2.5" stroke="none" fill="currentColor" />
    </>
  ),
  // Alimentos: pan sobre el plato.
  alimentos: (
    <>
      <path d="M24 74a36 24 0 0 1 72 0z" />
      <path d="M16 86h88" />
      <path d="m44 60 5-11M60 56l5-11M76 60l5-11" />
    </>
  ),
  // Para llevar: la bolsa del pedido.
  "para-llevar": (
    <>
      <path d="M30 44h60l-6 56H36z" />
      <path d="M46 44V33a14 14 0 0 1 28 0v11" />
    </>
  ),
  // Cualquier otra sección: el grano de café de la marca.
  default: (
    <>
      <path d="M60 22c19 0 33 17 33 38S79 98 60 98 27 81 27 60s14-38 33-38z" />
      <path d="M46 33c11 15 11 39 0 54" />
    </>
  ),
};

type SectionMarkProps = {
  slug: string;
  className?: string;
};

export function SectionMark({ slug, className }: SectionMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {MARKS[slug] ?? MARKS.default}
    </svg>
  );
}
