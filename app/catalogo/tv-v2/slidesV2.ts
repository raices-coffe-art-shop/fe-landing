import type { CatalogCategory, CatalogItem, SourcingFact } from "@/sanity/lib/catalogTypes";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { splitStoryQuote } from "@/lib/storyQuote";

// Segunda versión de la pantalla del local, para comparar contra /catalogo/tv.
// Dos diferencias de fondo con la primera: el producto se reduce a nombre y
// precio, y la sección deja de paginarse por subcategoría. Con eso la carta
// completa baja de 16 pantallas a 9.

// Sin descripción bajo el nombre, cada fila mide unos 80 px en 1080×1920: ocho
// entran con holgura incluso bajo el encabezado más cargado, que es el de
// Chocolatería (relato, cita y ficha de cinco datos). Es la constante a mover
// si al verlo quieres más o menos densidad.
export const TV2_MAX_ITEMS_PER_SLIDE = 8;

// La primera página de cada sección estrena su relato: se queda más tiempo para
// que alcance a leerse antes de que roten los productos.
export const SECTION_OPENING_DWELL = 1.4;

export type TvV2MenuItem = {
  id: string;
  title: string;
  priceLabel: string | null;
};

// La pantalla no tiene scroll y el encabezado creció con la tarjeta de portada:
// el cuerpo del relato, la cita y la ficha se ajustan a cuánto texto trae la
// sección para que nunca empujen los productos fuera de cuadro.
export type TvV2Density = "holgada" | "media" | "compacta";

export function resolveV2Density(
  story: string,
  quote: string | null,
  facts: SourcingFact[],
): TvV2Density {
  const total =
    story.length +
    (quote?.length ?? 0) +
    facts.reduce((sum, fact) => sum + fact.label.length + fact.value.length, 0);
  if (total <= 800) return "holgada";
  if (total <= 1400) return "media";
  return "compacta";
}

// El encabezado que comparten todas las páginas de una sección: se repite en
// cada slide para que el relato esté visible mire cuando mire el comensal.
export type TvV2Section = {
  slug: string;
  title: string;
  tagline: string | null;
  story: string | null;
  quote: string | null;
  facts: SourcingFact[];
  density: TvV2Density;
};

export type TvV2Slide =
  | {
      kind: "category";
      key: string;
      section: TvV2Section;
      page: number;
      pageCount: number;
      items: TvV2MenuItem[];
      dwell: number;
    }
  | { kind: "brand" };

export function buildTvV2Slides(
  items: CatalogItem[],
  showCatalogPrices: boolean,
  categories: CatalogCategory[] = [],
): TvV2Slide[] {
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

  const slides: TvV2Slide[] = [];
  const sortedGroups = [...groups.entries()].sort(
    (a, b) => a[1].order - b[1].order || a[1].title.localeCompare(b[1].title, "es"),
  );

  for (const [categoryId, group] of sortedGroups) {
    // Lista continua: sin subsecciones, el orden manual del Studio ya agrupa los
    // productos afines y la pantalla no se fragmenta en páginas de dos ítems.
    const sortedItems = [...group.items].sort((a, b) => a.order - b.order);

    const category = categoriesById.get(categoryId);
    const { story, quote } = splitStoryQuote(category?.story);
    const facts = category?.sourcingFacts ?? [];
    const section: TvV2Section = {
      slug: category?.slug ?? categoryId,
      title: group.title,
      tagline: category?.tagline?.trim() || null,
      story: story || null,
      quote,
      facts,
      density: resolveV2Density(story, quote, facts),
    };

    const pageCount = Math.max(1, Math.ceil(sortedItems.length / TV2_MAX_ITEMS_PER_SLIDE));
    for (let page = 0; page < pageCount; page += 1) {
      const pageItems = sortedItems.slice(
        page * TV2_MAX_ITEMS_PER_SLIDE,
        (page + 1) * TV2_MAX_ITEMS_PER_SLIDE,
      );
      slides.push({
        kind: "category",
        key: `${categoryId}-${page + 1}`,
        section,
        page: page + 1,
        pageCount,
        items: pageItems.map((item) => ({
          id: item.id,
          title: item.title,
          priceLabel: shouldDisplayCatalogPrice(item, showCatalogPrices)
            ? formatCatalogPrice(item)
            : null,
        })),
        dwell: page === 0 ? SECTION_OPENING_DWELL : 1,
      });
    }
  }

  slides.push({ kind: "brand" });
  return slides;
}
