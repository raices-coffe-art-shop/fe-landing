import type { CatalogCategory, CatalogItem, SourcingFact } from "@/sanity/lib/catalogTypes";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { buildMenuSubGroups } from "@/lib/menuSubGroups";
import { splitStoryQuote } from "@/lib/storyQuote";

// Modelo de pantallas de la carta del local, compartido por las maquetas que lo
// usan (tv-v3 y tv-v4). El producto se reduce a nombre y precio, las
// subsecciones conservan su título y, cuando hay productos de sobra, la lista
// pasa a dos columnas. Con eso cada sección entra completa en una pantalla.

// Un tope alto a propósito: con dos columnas caben de sobra los 15 productos de
// Café o de Sándwiches. Sigue existiendo por si una sección crece mucho, para
// que se parta en vez de desbordar.
export const MAX_ITEMS_PER_SCREEN = 18;

// A partir de aquí la lista pasa a dos columnas. Debajo de este número una sola
// columna se lee mejor y no deja media pantalla vacía: es lo que hacen los
// conceptos con Chocolatería y con Bebidas Andinas.
export const TWO_COLUMN_THRESHOLD = 8;

// La primera página de cada sección estrena su relato: se queda más tiempo para
// que alcance a leerse. Con una pantalla por sección esto aplica a casi todas.
export const SECTION_OPENING_DWELL = 1.4;

export type MenuScreenItem = {
  id: string;
  title: string;
  priceLabel: string | null;
};

export type MenuScreenGroup = {
  title: string | null;
  items: MenuScreenItem[];
};

// La pantalla no tiene scroll: el relato y la ficha se ajustan a cuánto texto
// trae la sección para no empujar los productos fuera de cuadro.
export type MenuScreenDensity = "holgada" | "media" | "compacta";

export function resolveScreenDensity(
  story: string,
  quote: string | null,
  facts: SourcingFact[],
): MenuScreenDensity {
  const total =
    story.length +
    (quote?.length ?? 0) +
    facts.reduce((sum, fact) => sum + fact.label.length + fact.value.length, 0);
  if (total <= 800) return "holgada";
  if (total <= 1400) return "media";
  return "compacta";
}

export type MenuScreenSection = {
  title: string;
  tagline: string | null;
  story: string | null;
  quote: string | null;
  facts: SourcingFact[];
  density: MenuScreenDensity;
};

export type MenuScreenSlide =
  | {
      kind: "category";
      key: string;
      section: MenuScreenSection;
      groups: MenuScreenGroup[];
      twoColumns: boolean;
      dwell: number;
    }
  | { kind: "brand" };

// Una pantalla de la carta antes de paginarse: puede venir de una sección con
// relato o de la fusión de las secciones de servicio.
type ScreenEntry = { groupTitle: string | null; item: CatalogItem };

type ScreenSource = {
  key: string;
  order: number;
  title: string;
  tagline: string | null;
  story: string | null;
  quote: string | null;
  facts: SourcingFact[];
  entries: ScreenEntry[];
};

export function buildMenuScreenSlides(
  items: CatalogItem[],
  showCatalogPrices: boolean,
  categories: CatalogCategory[] = [],
): MenuScreenSlide[] {
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

  const sortedGroups = [...groups.entries()].sort(
    (a, b) => a[1].order - b[1].order || a[1].title.localeCompare(b[1].title, "es"),
  );

  const toEntries = (categoryItems: CatalogItem[]): ScreenEntry[] =>
    buildMenuSubGroups(categoryItems).flatMap((subGroup) =>
      subGroup.items.map((item) => ({ groupTitle: subGroup.title, item })),
    );

  const sources: ScreenSource[] = [];
  // Secciones de servicio: las que no tienen relato ni ficha de origen
  // (Alimentos, Para llevar). Cada una ocupando su propia pantalla gasta una
  // vuelta del carrusel para mostrar cuatro productos, así que se juntan.
  const plain: Array<{ id: string; title: string; order: number; items: CatalogItem[] }> = [];

  for (const [categoryId, group] of sortedGroups) {
    const sortedItems = [...group.items].sort((a, b) => a.order - b.order);
    const category = categoriesById.get(categoryId);
    const { story, quote } = splitStoryQuote(category?.story);
    const facts = category?.sourcingFacts ?? [];

    if (!story && facts.length === 0) {
      plain.push({ id: categoryId, title: group.title, order: group.order, items: sortedItems });
      continue;
    }

    sources.push({
      key: categoryId,
      order: group.order,
      title: group.title,
      tagline: category?.tagline?.trim() || null,
      story: story || null,
      quote,
      facts,
      entries: toEntries(sortedItems),
    });
  }

  if (plain.length === 1) {
    // Una sola sección de servicio no se fusiona con nada: se muestra como
    // cualquier otra, con su nombre en el encabezado.
    const only = plain[0];
    sources.push({
      key: only.id,
      order: only.order,
      title: only.title,
      tagline: categoriesById.get(only.id)?.tagline?.trim() || null,
      story: null,
      quote: null,
      facts: [],
      entries: toEntries(only.items),
    });
  } else if (plain.length > 1) {
    // Fusionadas: el nombre de cada sección pasa a ser el título de su
    // subsección dentro de la pantalla compartida.
    sources.push({
      key: plain.map((section) => section.id).join("+"),
      order: Math.min(...plain.map((section) => section.order)),
      title: plain.map((section) => section.title).join(" · "),
      tagline: null,
      story: null,
      quote: null,
      facts: [],
      entries: plain.flatMap((section) =>
        section.items.map((item) => ({ groupTitle: section.title, item })),
      ),
    });
  }

  sources.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));

  const toMenuItem = (item: CatalogItem): MenuScreenItem => ({
    id: item.id,
    title: item.title,
    priceLabel: shouldDisplayCatalogPrice(item, showCatalogPrices) ? formatCatalogPrice(item) : null,
  });

  const slides: MenuScreenSlide[] = [];

  for (const source of sources) {
    const section: MenuScreenSection = {
      title: source.title,
      tagline: source.tagline,
      story: source.story,
      quote: source.quote,
      facts: source.facts,
      density: resolveScreenDensity(source.story ?? "", source.quote, source.facts),
    };

    const pageCount = Math.max(1, Math.ceil(source.entries.length / MAX_ITEMS_PER_SCREEN));
    for (let page = 0; page < pageCount; page += 1) {
      const slice = source.entries.slice(
        page * MAX_ITEMS_PER_SCREEN,
        (page + 1) * MAX_ITEMS_PER_SCREEN,
      );
      // Se reagrupa después del corte: una sección que no entre en una pantalla
      // se parte por producto sin perder los títulos en la página siguiente.
      const pageGroups: MenuScreenGroup[] = [];
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
        key: `${source.key}-${page + 1}`,
        section,
        groups: pageGroups,
        twoColumns: slice.length > TWO_COLUMN_THRESHOLD,
        dwell: page === 0 ? SECTION_OPENING_DWELL : 1,
      });
    }
  }

  slides.push({ kind: "brand" });
  return slides;
}
