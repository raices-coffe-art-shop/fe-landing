import type { Metadata } from "next";
import QRCode from "qrcode";
import { getCatalogCategories, getCatalogItems } from "@/sanity/lib/catalog";
import { getSiteSettings } from "@/sanity/lib/siteSettings";
import { getSiteUrl } from "@/lib/siteUrl";
import { filterPrintedMenuItems } from "@/lib/printedMenu";
import { buildTvV3Slides } from "./slidesV3";
import { CatalogTvV3 } from "./CatalogTvV3";

// Tercera versión de la pantalla del local, para comparar contra /catalogo/tv y
// /catalogo/tv-v2 antes de quedarnos con una. Comparte datos y utilidades.
export const metadata: Metadata = {
  title: "Carta para pantalla (v3)",
  robots: { index: false, follow: false },
};

const DEFAULT_INTERVAL_SECONDS = 12;
const MIN_INTERVAL_SECONDS = 5;
const MAX_INTERVAL_SECONDS = 120;

type TvPageProps = {
  searchParams: Promise<{ s?: string | string[] }>;
};

function resolveIntervalMs(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return DEFAULT_INTERVAL_SECONDS * 1000;
  return Math.min(MAX_INTERVAL_SECONDS, Math.max(MIN_INTERVAL_SECONDS, parsed)) * 1000;
}

export default async function CartaTvV3Page({ searchParams }: TvPageProps) {
  const resolvedSearchParams = await searchParams;
  const intervalMs = resolveIntervalMs(resolvedSearchParams.s);

  const [items, categories, settings] = await Promise.all([
    getCatalogItems(),
    getCatalogCategories(),
    getSiteSettings(),
  ]);
  const slides = buildTvV3Slides(filterPrintedMenuItems(items), settings.showCatalogPrices, categories);

  const catalogUrl = `${getSiteUrl()}/catalogo`;
  const qrDataUrl = await QRCode.toDataURL(catalogUrl, {
    width: 480,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#2b211c", light: "#f5ead6" },
  });

  return (
    <CatalogTvV3
      slides={slides}
      intervalMs={intervalMs}
      logo={settings.brandLogo}
      qrDataUrl={qrDataUrl}
      catalogDisplayUrl={catalogUrl.replace(/^https?:\/\//, "")}
    />
  );
}
