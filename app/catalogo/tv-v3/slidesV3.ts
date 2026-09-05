import type { CatalogCategory, CatalogItem, SourcingFact } from "@/sanity/lib/catalogTypes";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { buildMenuSubGroups } from "@/lib/menuSubGroups";
import { splitStoryQuote } from "@/lib/storyQuote";

// Tercera versión de la pantalla del local. Frente a la v2: vuelven las
// subsecciones con su título y su regla, se van la ilustración del encabezado y
// el contador de páginas, y el producto sigue reducido a nombre y precio.
//
// Sin descripciones y con dos columnas cuando hay productos de sobra, cada
// sección entra completa en una sola pantalla: la carta pasa a ser una pantalla
// por sección, como en los conceptos.

// Un tope alto a propósito: con dos columnas caben de sobra los 15 productos de
// Café o de Sándwiches. Sigue existiendo por si una sección crece mucho, para
// que se parta en vez de desbordar.
export const TV3_MAX_ITEMS_PER_SLIDE = 18;

// A partir de aquí la lista pasa a dos columnas. Debajo de este número una sola
// columna se lee mejor y no deja media pantalla vacía: es lo que hacen los
// conceptos con Chocolatería y con Bebidas Andinas.
export const TV3_TWO_COLUMN_THRESHOLD = 8;

// La primera página de cada sección estrena su relato: se queda más tiempo para
// que alcance a leerse. Con una pantalla por sección esto aplica a casi todas.
export const SECTION_OPENING_DWELL = 1.4;

export type TvV3MenuItem = {
  id: string;
  title: string;
  priceLabel: string | null;
};

export type TvV3Group = {
  title: string | null;
  items: TvV3MenuItem[];
};

// La pantalla no tiene scroll: el relato y la ficha se ajustan a cuánto texto
// trae la sección para no empujar los productos fuera de cuadro.
export type TvV3Density = "holgada" | "media" | "compacta";

export function resolveV3Density(
  story: string,
  quote: string | null,
  facts: SourcingFact[],
): TvV3Density {
  const total =
    story.length +
    (quote?.length ?? 0) +
    facts.reduce((sum, fact) => sum + fact.label.length + fact.value.length, 0);
  if (total <= 800) return "holgada";
  if (total <= 1400) return "media";
  return "compacta";
}

export type TvV3Section = {
  title: string;
  tagline: string | null;
  story: string | null;
  quote: string | null;
  facts: SourcingFact[];
  density: TvV3Density;
};

export type TvV3Slide =
  | {
      kind: "category";
      key: string;
      section: TvV3Section;
      groups: TvV3Group[];
      twoColumns: boolean;
      dwell: number;
    }
  | { kind: "brand" };

export function buildTvV3Slides(
  items: CatalogItem[],
  showCatalogPrices: boolean,
  categories: CatalogCategory[] = [],
): TvV3Slide[] {
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

  const slides: TvV3Slide[] = [];
  const sortedGroups = [...groups.entries()].sort(
    (a, b) => a[1].order - b[1].order || a[1].title.localeCompare(b[1].title, "es"),
  );

  const toMenuItem = (item: CatalogItem): TvV3MenuItem => ({
    id: item.id,
    title: item.title,
    priceLabel: shouldDisplayCatalogPrice(item, showCatalogPrices) ? formatCatalogPrice(item) : null,
  });

  for (const [categoryId, group] of sortedGroups) {
    const sortedItems = [...group.items].sort((a, b) => a.order - b.order);
    const subGroups = buildMenuSubGroups(sortedItems);

    const category = categoriesById.get(categoryId);
    const { story, quote } = splitStoryQuote(category?.story);
    const facts = category?.sourcingFacts ?? [];
    const section: TvV3Section = {
      title: group.title,
      tagline: category?.tagline?.trim() || null,
      story: story || null,
      quote,
      facts,
      density: resolveV3Density(story, quote, facts),
    };

    // Se aplana con la subsección pegada a cada producto y se reagrupa después
    // del corte: así una sección que no entre en una pantalla se parte por
    // producto sin perder los títulos de subsección en la página siguiente.
    const flat = subGroups.flatMap((subGroup) =>
      subGroup.items.map((item) => ({ groupTitle: subGroup.title, item })),
    );
    const pageCount = Math.max(1, Math.ceil(flat.length / TV3_MAX_ITEMS_PER_SLIDE));

    for (let page = 0; page < pageCount; page += 1) {
      const slice = flat.slice(
        page * TV3_MAX_ITEMS_PER_SLIDE,
        (page + 1) * TV3_MAX_ITEMS_PER_SLIDE,
      );
      const pageGroups: TvV3Group[] = [];
      for (const entry of slice) {
        const current = pageGroups[pageGroups.length - 1];
        if (current && current.title === entry.groupTitle) {
          current.items.push(toMenuItem(entry.item));
        } else {
          pageGroups.push({ title: entry.groupTitle, items: [toMenuItem(entry.item)] });
        }
      }

      slides.push({
        kind: "category",
        key: `${categoryId}-${page + 1}`,
        section,
        groups: pageGroups,
        twoColumns: slice.length > TV3_TWO_COLUMN_THRESHOLD,
        dwell: page === 0 ? SECTION_OPENING_DWELL : 1,
      });
    }
  }

  slides.push({ kind: "brand" });
  return slides;
}
