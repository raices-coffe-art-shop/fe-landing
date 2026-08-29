import type { CatalogItem } from "@/sanity/lib/catalogTypes";

export type MenuSubGroup<T> = {
  title: string | null;
  items: T[];
};

// Un promedio de dos productos por subsección distingue una carta con secciones
// reales (Café: Clásicos, Con Leche…) de una categoría donde la subcategoría es
// solo una etiqueta suelta por producto (Alimentos: Postres, Lácteos, Panes…).
// Sin este umbral, Alimentos mostraría seis subtítulos para siete productos.
const MIN_ITEMS_PER_SUBGROUP = 2;

// Agrupa los productos de una sección por su subcategoría, respetando el orden
// en que vienen. Devuelve un único grupo sin título cuando la sección no tiene
// una estructura real de subsecciones, así esas categorías se ven como siempre.
export function buildMenuSubGroups<T extends Pick<CatalogItem, "subcategory">>(
  items: T[],
): MenuSubGroup<T>[] {
  const groups: MenuSubGroup<T>[] = [];
  for (const item of items) {
    const title = item.subcategory?.trim() || null;
    const current = groups.find((group) => group.title === title);
    if (current) current.items.push(item);
    else groups.push({ title, items: [item] });
  }

  const titled = groups.filter((group) => group.title !== null);
  const worthGrouping =
    titled.length >= 2 && items.length / titled.length >= MIN_ITEMS_PER_SUBGROUP;

  return worthGrouping ? groups : [{ title: null, items }];
}
