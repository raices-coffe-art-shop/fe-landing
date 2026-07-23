import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { CatalogEditor } from "@/components/CatalogEditor";

export const metadata: Metadata = {
  title: "Catálogo — Raíces Café y Cultura",
  description:
    "Catálogo editable de Raíces: productos con procedencia, precios referenciales y consulta directa por WhatsApp."
};

export default function CatalogoPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <CatalogEditor />
      </main>
      <Footer />
    </>
  );
}
