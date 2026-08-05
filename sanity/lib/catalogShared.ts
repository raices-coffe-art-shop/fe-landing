import type { CatalogItem } from "./catalogTypes";

/**
 * Utilidad segura para Server y Client Components.
 * Este archivo no importa el cliente de Sanity ni variables privadas.
 */
export function formatCatalogPrice(
  item: Pick<CatalogItem, "price" | "currency">,
): string | null {
  if (typeof item.price !== "number") return null;

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: item.currency,
    minimumFractionDigits: item.price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(item.price);
}


export function shouldDisplayCatalogPrice(
  item: Pick<CatalogItem, "price" | "showPrice">,
  showCatalogPrices: boolean,
): boolean {
  return showCatalogPrices && item.showPrice !== false && typeof item.price === "number";
}
