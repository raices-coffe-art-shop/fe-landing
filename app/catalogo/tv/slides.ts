import type { CatalogCategory, CatalogItem } from "@/sanity/lib/catalogTypes";
import { resolveCategoryImage } from "@/lib/categoryImage";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";

// Con la foto lateral la lista dispone de menos ancho y alto útil: 5 productos
// por slide entran completos en 1080p sin recortar el último ni encoger los nombres.
export const TV_MAX_ITEMS_PER_SLIDE = 5;

export type TvMenuItem = {
  id: string;
  title: string;
  shortDescription: string;
  priceLabel: string | null;
};

export type TvSlide =
  | {
      kind: "category";
      key: string;
      categoryTitle: string;
      page: number;
      pageCount: number;
      image: { src: string; alt: string } | null;
      items: TvMenuItem[];
    }
  | { kind: "brand" };

// Precomputa todo server-side: el cliente recibe props serializables y no
// arrastra la lógica de precios. priceLabel null ⇒ se muestra "Consultar".
export function buildTvSlides(
  items: CatalogItem[],
  showCatalogPrices: boolean,
  categories: CatalogCategory[] = [],
): TvSlide[] {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const groups = new Map<string, { title: string; order: number; items: CatalogItem[] }>();
  for (const item of items) {
    const existing = groups.get(item.category.id);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(item.category.id, {
        title: item.category.title,
        order: item.category.order,
        items: [item],
      });
    }
  }

  const slides: TvSlide[] = [];
  const sortedGroups = [...groups.entries()].sort(
    (a, b) => a[1].order - b[1].order || a[1].title.localeCompare(b[1].title, "es"),
  );

  for (const [categoryId, group] of sortedGroups) {
    const sortedItems = [...group.items].sort((a, b) => a.order - b.order);
    // La misma foto acompaña a todas las páginas de la categoría: así el layout
    // no cambia de forma entre una página y la siguiente.
    const image = resolveCategoryImage(categoriesById.get(categoryId), sortedItems);
    const pageCount = Math.ceil(sortedItems.length / TV_MAX_ITEMS_PER_SLIDE);
    for (let page = 0; page < pageCount; page += 1) {
      const pageItems = sortedItems.slice(
        page * TV_MAX_ITEMS_PER_SLIDE,
        (page + 1) * TV_MAX_ITEMS_PER_SLIDE,
      );
      slides.push({
        kind: "category",
        key: `${categoryId}-${page + 1}`,
        categoryTitle: group.title,
        page: page + 1,
        pageCount,
        image: image ? { src: image.src, alt: image.alt } : null,
        items: pageItems.map((item) => ({
          id: item.id,
          title: item.title,
          shortDescription: item.shortDescription,
          priceLabel: shouldDisplayCatalogPrice(item, showCatalogPrices)
            ? formatCatalogPrice(item)
            : null,
        })),
      });
    }
  }

  slides.push({ kind: "brand" });
  return slides;
}
