import type { Metadata } from "next";
import QRCode from "qrcode";
import { getCatalogCategories, getCatalogItems } from "@/sanity/lib/catalog";
import { getSiteSettings } from "@/sanity/lib/siteSettings";
import { getSiteUrl } from "@/lib/siteUrl";
import { filterPrintedMenuItems } from "@/lib/printedMenu";
import { buildMenuScreenSlides } from "@/lib/menuScreenSlides";
import {
  buildCollageSlide,
  buildOriginSlide,
  buildPeopleSlides,
  resolveCollageAnimation,
} from "./extraSlides";
import { CatalogTv } from "./CatalogTv";

// La pantalla del local: televisor girado en vertical. Primero la carta, una
// pantalla por sección; después el QR, el muro de fotos de producto, cómo nació
// Raíces y quiénes están detrás.
export const metadata: Metadata = {
  title: "Carta para pantalla",
  robots: { index: false, follow: false },
};

const DEFAULT_INTERVAL_SECONDS = 10;
const MIN_INTERVAL_SECONDS = 5;
const MAX_INTERVAL_SECONDS = 120;

type TvPageProps = {
  searchParams: Promise<{ s?: string | string[]; animation?: string | string[] }>;
};

function resolveIntervalMs(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) return DEFAULT_INTERVAL_SECONDS * 1000;
  return Math.min(MAX_INTERVAL_SECONDS, Math.max(MIN_INTERVAL_SECONDS, parsed)) * 1000;
}

export default async function CartaTvPage({ searchParams }: TvPageProps) {
  const resolvedSearchParams = await searchParams;
  const intervalMs = resolveIntervalMs(resolvedSearchParams.s);
  // La entrada del muro se prueba desde la URL del televisor, sin desplegar:
  // ?animation=caida | zoom | giro | revelado. Cualquier otro valor cae a caida.
  const collageAnimation = resolveCollageAnimation(resolvedSearchParams.animation);

  const [items, categories, settings] = await Promise.all([
    getCatalogItems(),
    getCatalogCategories(),
    getSiteSettings(),
  ]);
  // El QR cierra la carta; después vienen las pantallas narrativas: el muro de
  // fotos de producto, cómo nació Raíces y quiénes están detrás.
  const menuItems = filterPrintedMenuItems(items);
  const collage = buildCollageSlide(menuItems, settings.collagePhotos, collageAnimation);
  const slides = [
    ...buildMenuScreenSlides(menuItems, settings.showCatalogPrices, categories),
    ...(collage ? [collage] : []),
    buildOriginSlide(),
    ...buildPeopleSlides(),
  ];

  const catalogUrl = `${getSiteUrl()}/catalogo`;
  const qrDataUrl = await QRCode.toDataURL(catalogUrl, {
    width: 480,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#2b211c", light: "#fff8ed" },
  });

  return (
    <CatalogTv
      slides={slides}
      intervalMs={intervalMs}
      logo={settings.brandLogo}
      qrDataUrl={qrDataUrl}
      catalogDisplayUrl={catalogUrl.replace(/^https?:\/\//, "")}
    />
  );
}
