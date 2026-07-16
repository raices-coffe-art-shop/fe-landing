import type { Metadata } from "next";
import { LinksHub } from "@/components/LinksHub";

export const metadata: Metadata = {
  title: "Enlaces — Raíces Café y Cultura",
  description: "Todos los enlaces de Raíces: WhatsApp, catálogo, historias, ubicación e Instagram.",
};

export default function LinksPage() {
  return <LinksHub />;
}
