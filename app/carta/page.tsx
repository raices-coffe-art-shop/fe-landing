import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { menuJsonLd } from "@/lib/structuredData";
import { getMenuCategories, getMenuItems } from "@/sanity/lib/menu";
import { getSiteSettings } from "@/sanity/lib/siteSettings";
import { CartaSheet } from "./_carta/CartaSheet";

// La Carta vive en /carta. Las antiguas rutas /catalogo/carta, /catalogo/imprimir
// y /catalogo/tv solo existen como redirecciones de compatibilidad.
export const metadata: Metadata = {
  title: "Carta",
  description: "La carta vigente de Raíces: bebidas, alimentos y precios administrados desde Sanity Studio.",
  alternates: { canonical: "/carta" },
};

export default async function CartaPage() {
  const [items, categories, settings] = await Promise.all([
    getMenuItems(),
    getMenuCategories(),
    getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd data={menuJsonLd(items, categories, settings.showCatalogPrices)} />
      <CartaSheet withPhotos={false} showActions={false} />
    </>
  );
}
