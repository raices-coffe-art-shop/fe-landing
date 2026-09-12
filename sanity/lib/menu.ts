import "server-only";

import { cache } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import type { CatalogCategory, CatalogImage, CatalogItem, SourcingFact } from "./catalogTypes";
import { getCatalogItems } from "./catalog";
import { sanityClient } from "./client";
import { urlForImage } from "./image";
import { menuCategoriesQuery, menuItemsQuery } from "./queries";

export const MENU_TAG = "menu";
export const MENU_CATEGORIES_TAG = "menuCategories";

const fallbackImage: CatalogImage = {
  src: "/ayacucho-sacsamarca.webp",
  alt: "Raíces Café y Cultura",
  width: 1200,
  height: 1400,
};

type SanityMenuCategory = {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  tagline?: string;
  storyTitle?: string;
  story?: string;
  sourcing?: string;
  sourcingFacts?: Array<{ label?: string; value?: string } | null>;
  image?: SanityImageSource;
  imageAlt?: string;
  order?: number;
  isVisible?: boolean;
  itemCount?: number;
};

type SanityMenuItem = {
  _id?: string;
  sourceId?: string;
  title?: string;
  category?: SanityMenuCategory;
  subcategory?: string;
  shortDescription?: string;
  mainImage?: SanityImageSource;
  mainImageAlt?: string;
  price?: number;
  showPrice?: boolean;
  currency?: "PEN" | "USD";
  isActive?: boolean;
  order?: number;
};

function fetchOptions(tags: string[]) {
  if (process.env.NODE_ENV === "development") return { cache: "no-store" as const };
  return { next: { revalidate: 300, tags } };
}

function normalizeFacts(facts: SanityMenuCategory["sourcingFacts"]): SourcingFact[] | undefined {
  if (!Array.isArray(facts)) return undefined;
  const clean = facts
    .map((fact) => ({ label: fact?.label?.trim() || "", value: fact?.value?.trim() || "" }))
    .filter((fact) => fact.label && fact.value);
  return clean.length ? clean : undefined;
}

function normalizeCategoryImage(category: SanityMenuCategory | undefined): CatalogImage | undefined {
  if (!category?.image) return undefined;
  const src = urlForImage(category.image)?.width(1600).height(1100).fit("crop").auto("format").url();
  if (!src) return undefined;
  return {
    src,
    alt: category.imageAlt?.trim() || category.title?.trim() || "Categoría de la Carta",
    width: 1600,
    height: 1100,
  };
}

function normalizeCategory(category: SanityMenuCategory | undefined): CatalogCategory {
  return {
    id: category?._id || "menu-uncategorized",
    title: category?.title?.trim() || "Sin categoría",
    slug: category?.slug?.trim() || "sin-categoria",
    description: category?.description?.trim() || undefined,
    tagline: category?.tagline?.trim() || undefined,
    storyTitle: category?.storyTitle?.trim() || undefined,
    story: category?.story?.trim() || undefined,
    sourcing: category?.sourcing?.trim() || undefined,
    sourcingFacts: normalizeFacts(category?.sourcingFacts),
    image: normalizeCategoryImage(category),
    order: typeof category?.order === "number" ? category.order : 999,
    isVisible: category?.isVisible !== false,
    showInPrintedMenu: true,
    itemCount: typeof category?.itemCount === "number" ? category.itemCount : 0,
  };
}

function normalizeImage(source: SanityImageSource | undefined, alt: string): CatalogImage {
  const src = urlForImage(source)?.width(1200).height(1400).fit("crop").auto("format").url();
  return src ? { src, alt: alt || "Elemento de la Carta", width: 1200, height: 1400 } : { ...fallbackImage, alt: alt || fallbackImage.alt };
}

function normalizeItem(item: SanityMenuItem): CatalogItem | null {
  if (!item._id || !item.title?.trim() || !item.category) return null;
  const title = item.title.trim();
  const category = normalizeCategory(item.category);
  if (!category.isVisible || item.isActive === false) return null;

  return {
    id: item.sourceId || item._id,
    title,
    slug: item._id.replace(/[^a-z0-9-]+/gi, "-").toLowerCase(),
    category,
    subcategory: item.subcategory?.trim() || undefined,
    origin: "Raíces",
    shortDescription: item.shortDescription?.trim() || "",
    description: [],
    mainImage: normalizeImage(item.mainImage, item.mainImageAlt?.trim() || title),
    gallery: [],
    presentations: [],
    availability: true,
    ingredients: [],
    allergens: [],
    verifiedClaims: [],
    price: typeof item.price === "number" && item.price >= 0 ? item.price : undefined,
    showPrice: item.showPrice !== false,
    currency: item.currency === "USD" ? "USD" : "PEN",
    isActive: item.isActive ?? true,
    isFeatured: false,
    order: typeof item.order === "number" ? item.order : 999,
  };
}

async function legacyMenuItems(): Promise<CatalogItem[]> {
  const items = await getCatalogItems();
  return items
    .filter((item) => item.category.showInPrintedMenu !== false && item.category.isVisible && item.isActive)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
}


export const getMenuItems = cache(async (): Promise<CatalogItem[]> => {
  if (!sanityClient) return legacyMenuItems();
  try {
    const docs = await sanityClient.fetch<SanityMenuItem[]>(menuItemsQuery, {}, fetchOptions([MENU_TAG]));
    const menuItems = (docs || []).map(normalizeItem).filter((item): item is CatalogItem => Boolean(item));

    // Desde que Carta tiene sus propios menuItem/menuCategory, esos documentos
    // son la única fuente normal de la Carta. El catálogo antiguo se conserva
    // únicamente como respaldo si la migración no existiera en absoluto; no se
    // mezcla con Productos de Origen porque eso haría que un producto nuevo
    // terminara apareciendo también en la Carta.
    if (menuItems.length > 0) {
      return menuItems.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
    }

    return legacyMenuItems();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[Sanity carta] Falló getMenuItems:", error);
    return legacyMenuItems();
  }
});

export const getMenuCategories = cache(async (): Promise<CatalogCategory[]> => {
  const menuItems = await getMenuItems();
  const categoriesInItems = [...new Map(menuItems.map((item) => [item.category.slug, item.category])).values()];
  if (!sanityClient) return categoriesInItems.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
  try {
    const docs = await sanityClient.fetch<SanityMenuCategory[]>(menuCategoriesQuery, {}, fetchOptions([MENU_CATEGORIES_TAG, MENU_TAG]));
    const migrated = (docs || []).map(normalizeCategory).filter((category) => category.isVisible);
    const bySlug = new Map<string, CatalogCategory>();
    for (const category of categoriesInItems) bySlug.set(category.slug, category);
    for (const category of migrated) bySlug.set(category.slug, category);
    return [...bySlug.values()].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[Sanity carta] Falló getMenuCategories:", error);
    return categoriesInItems.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
  }
});
