// Next.js reemplaza (no fusiona) el objeto openGraph completo cuando una
// página define el suyo, así que los campos comunes se comparten desde aquí.
export const defaultOgImage = {
  url: "/media/raices/raices-local-entrada.webp",
  alt: "Local de Raíces Café y Cultura en Lima",
};

export const baseOpenGraph = {
  siteName: "Raíces — Café y Cultura",
  locale: "es_PE",
  type: "website" as const,
  images: [defaultOgImage],
};
