import type { CatalogItem } from "@/sanity/lib/catalogTypes";

// La carta impresa y la pantalla del local muestran lo que se consume en la
// mesa; el catálogo web muestra todo lo que Raíces vende. Qué categorías entran
// en la carta lo decide el equipo desde el Studio, no el código.
//
// Se filtran los productos (no las categorías) porque ambas vistas derivan sus
// grupos de los items. Y se hace aquí, en la vista: filtrar dentro de
// getCatalogItems haría que una lista vacía reactivara el catálogo de respaldo
// completo, devolviendo justo lo que se quería excluir.
export function filterPrintedMenuItems(items: CatalogItem[]): CatalogItem[] {
  return items.filter((item) => item.category.showInPrintedMenu !== false);
}
