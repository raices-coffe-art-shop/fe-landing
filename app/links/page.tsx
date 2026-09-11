import type { Metadata } from "next";
import { baseOpenGraph } from "@/lib/seo";
import { LinksHub } from "@/components/LinksHub";
import { getSiteSettings } from "@/sanity/lib/siteSettings";

export const metadata: Metadata = {
  title: "Enlaces",
  description: "Todos los enlaces de Raíces: Carta, Productos de Origen, Galería de Arte, historias, ubicación y redes sociales.",
  alternates: { canonical: "/links" },
  openGraph: { ...baseOpenGraph, url: "/links", title: "Enlaces de Raíces — Café y Cultura" },
};

export default async function LinksPage() {
  const settings = await getSiteSettings();

  return <LinksHub brandLogo={settings.brandLogo} socialLinks={settings.socialLinks} />;
}
