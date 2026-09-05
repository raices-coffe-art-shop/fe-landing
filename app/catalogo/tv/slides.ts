import type { CatalogCategory, CatalogItem, SourcingFact } from "@/sanity/lib/catalogTypes";
import { buildMenuSubGroups } from "@/lib/menuSubGroups";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";

// El encabezado de sección —título, relato y ficha de origen— se queda fijo en
// la mitad superior de la pantalla vertical, así que abajo entran cuatro
// productos a cuerpo grande sin apretar nada.
export const TV_MAX_ITEMS_PER_SLIDE = 4;

// La primera página de cada sección estrena su relato: se queda más tiempo en
// pantalla para que alcance a leerse antes de que roten los productos.
export const SECTION_OPENING_DWELL = 1.4;

export type TvMenuItem = {
  id: string;
  title: string;
  shortDescription: string;
  priceLabel: string | null;
};

// La pantalla del local no tiene scroll: lo que no entra, se recorta. El
// encabezado ocupa lo que le pida su contenido, así que el cuerpo del relato y
// de la ficha se elige según cuánto texto hay que mostrar. Los cortes están
// calculados para que el máximo que admite el schema —700 caracteres de relato
// más ocho datos de ficha— siga entrando completo en 1080×1920.
export type TvStoryDensity = "holgada" | "media" | "compacta";

export function resolveStoryDensity(story: string, facts: SourcingFact[]): TvStoryDensity {
  const total =
    story.length + facts.reduce((sum, fact) => sum + fact.label.length + fact.value.length, 0);
  if (total <= 800) return "holgada";
  if (total <= 1400) return "media";
  return "compacta";
}

// El encabezado que comparten todas las páginas de una sección. Va repetido en
// cada slide en vez de vivir en una pantalla aparte: así quien mire en cualquier
// momento ve el relato, no solo quien llegue justo cuando le toca el turno.
export type TvSection = {
  title: string;
  tagline: string | null;
  storyTitle: string | null;
  story: string | null;
  facts: SourcingFact[];
  density: TvStoryDensity;
};

export type TvSlide =
  | {
      kind: "category";
      key: string;
      section: TvSection;
      subCategoryTitle: string | null;
      page: number;
      pageCount: number;
      items: TvMenuItem[];
      dwell: number;
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
    // Se pagina por subsección, no solo por categoría: una pantalla nunca mezcla
    // "Triples" con "Especiales", igual que en la carta de papel.
    const subGroups = buildMenuSubGroups(sortedItems);

    const category = categoriesById.get(categoryId);
    const story = category?.story?.trim() || null;
    const facts = category?.sourcingFacts ?? [];
    const section: TvSection = {
      title: group.title,
      tagline: category?.tagline?.trim() || null,
      storyTitle: category?.storyTitle?.trim() || null,
      story,
      facts,
      density: resolveStoryDensity(story ?? "", facts),
    };

    // El contador de páginas es por categoría para que la pantalla siga diciendo
    // "2 de 5" y no se reinicie en cada subsección.
    const pageCount = subGroups.reduce(
      (total, subGroup) => total + Math.ceil(subGroup.items.length / TV_MAX_ITEMS_PER_SLIDE),
      0,
    );
    let page = 0;

    for (const subGroup of subGroups) {
      const subPages = Math.ceil(subGroup.items.length / TV_MAX_ITEMS_PER_SLIDE);
      for (let subPage = 0; subPage < subPages; subPage += 1) {
        const pageItems = subGroup.items.slice(
          subPage * TV_MAX_ITEMS_PER_SLIDE,
          (subPage + 1) * TV_MAX_ITEMS_PER_SLIDE,
        );
        page += 1;
        slides.push({
          kind: "category",
          key: `${categoryId}-${page}`,
          section,
          subCategoryTitle: subGroup.title,
          page,
          pageCount,
          items: pageItems.map((item) => ({
            id: item.id,
            title: item.title,
            shortDescription: item.shortDescription,
            priceLabel: shouldDisplayCatalogPrice(item, showCatalogPrices)
              ? formatCatalogPrice(item)
              : null,
          })),
          dwell: page === 1 ? SECTION_OPENING_DWELL : 1,
        });
      }
    }
  }

  slides.push({ kind: "brand" });
  return slides;
}
