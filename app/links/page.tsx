import type { Metadata } from "next";
import { LinksHub } from "@/components/LinksHub";
import { getSiteSettings } from "@/sanity/lib/siteSettings";

export const metadata: Metadata = {
  title: "Enlaces — Raíces Café y Cultura",
  description: "Todos los enlaces de Raíces: WhatsApp, catálogo, historias, ubicación e Instagram.",
};

export default async function LinksPage() {
  const settings = await getSiteSettings();

  return <LinksHub brandLogo={settings.brandLogo} socialLinks={settings.socialLinks} />;
}
