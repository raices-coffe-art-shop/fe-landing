import type { CatalogItem } from "@/sanity/lib/catalogTypes";

// La Carta ya tiene su propio modelo en Sanity. Esta función se conserva como
// una pequeña barrera de compatibilidad: los documentos nuevos siempre llevan
// showInPrintedMenu=true al normalizarse, mientras que durante la migración los
// documentos antiguos todavía pueden traer ese indicador.
export function filterPrintedMenuItems(items: CatalogItem[]): CatalogItem[] {
  return items.filter((item) => item.category.showInPrintedMenu !== false);
}
