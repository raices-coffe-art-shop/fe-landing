import type { Metadata } from "next";
import { LinksHub } from "@/components/LinksHub";
import { getSiteSettings } from "@/sanity/lib/siteSettings";

export const metadata: Metadata = {
  title: "Enlaces",
  description: "Todos los enlaces de Raíces: WhatsApp, catálogo, historias, ubicación e Instagram.",
  alternates: { canonical: "/links" },
  openGraph: { url: "/links", title: "Enlaces de Raíces — Café y Cultura" },
};

export default async function LinksPage() {
  const settings = await getSiteSettings();

  return <LinksHub brandLogo={settings.brandLogo} socialLinks={settings.socialLinks} />;
}
