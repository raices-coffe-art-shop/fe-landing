import "server-only";

import { cache } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import { fallbackCatalogItems } from "@/data/catalogFallback";
import type { CatalogCategory, CatalogImage, CatalogItem, PortableTextBlock } from "./catalogTypes";
import { sanityClient } from "./client";
import { urlForImage } from "./image";
import { artCategoriesQuery, artItemBySlugQuery, artItemsQuery, legacyArtCatalogItemsQuery } from "./queries";

export const ART_TAG = "artGallery";
export const ART_CATEGORIES_TAG = "artCategories";
export const artItemTag = (slug: string) => `artItem:${slug}`;

const fallbackImage: CatalogImage = {
  src: "/images/art-shop/art-shop-extra-01.webp",
  alt: "Pieza de la Galería de Arte de Raíces",
  width: 1200,
  height: 1400,
};

type SanityArtCategory = {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  order?: number;
  isVisible?: boolean;
  itemCount?: number;
};

type SanityGalleryImage = {
  alt?: string;
  asset?: unknown;
  crop?: unknown;
  hotspot?: unknown;
};

type SanityArtItem = {
  _id?: string;
  title?: string;
  slug?: string;
  category?: SanityArtCategory;
  subcategory?: string;
  origin?: string;
  region?: string;
  shortDescription?: string;
  description?: PortableTextBlock[];
  mainImage?: SanityImageSource;
  mainImageAlt?: string;
  gallery?: Array<SanityGalleryImage | null>;
  producerOrCreator?: string;
  availability?: boolean | string;
  process?: string;
  inquiryMessage?: string;
  price?: number;
  showPrice?: boolean;
  currency?: "PEN" | "USD";
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
};

function fetchOptions(tags: string[]) {
  if (process.env.NODE_ENV === "development") return { cache: "no-store" as const };
  return { next: { revalidate: 300, tags } };
}

function normalizeCategory(category: SanityArtCategory | undefined): CatalogCategory {
  return {
    id: category?._id || "art-uncategorized",
    title: category?.title?.trim() || "Arte",
    slug: category?.slug?.trim() || "arte",
    description: category?.description?.trim() || undefined,
    order: typeof category?.order === "number" ? category.order : 999,
    isVisible: category?.isVisible !== false,
    showInPrintedMenu: false,
    itemCount: typeof category?.itemCount === "number" ? category.itemCount : 0,
  };
}

function normalizeImage(source: SanityImageSource | null | undefined, alt: string, width = 1200, height = 1400): CatalogImage {
  const src = urlForImage(source)?.width(width).height(height).fit("crop").auto("format").url();
  return src ? { src, alt: alt || "Pieza de arte", width, height } : { ...fallbackImage, alt: alt || fallbackImage.alt };
}

function normalizeItem(item: SanityArtItem): CatalogItem | null {
  if (!item._id || !item.title?.trim() || !item.slug?.trim() || !item.category) return null;
  const category = normalizeCategory(item.category);
  if (!category.isVisible || item.isActive === false) return null;
  const title = item.title.trim();

  return {
    id: item._id,
    title,
    slug: item.slug.trim(),
    category,
    subcategory: item.subcategory?.trim() || undefined,
    origin: item.origin?.trim() || "Ayacucho",
    region: item.region?.trim() || undefined,
    shortDescription: item.shortDescription?.trim() || `Conoce más sobre ${title}.`,
    description: Array.isArray(item.description) ? item.description : [],
    mainImage: normalizeImage(item.mainImage, item.mainImageAlt?.trim() || title),
    gallery: Array.isArray(item.gallery)
      ? item.gallery.filter(Boolean).map((image) => normalizeImage(image as SanityImageSource, image?.alt?.trim() || title, 1000, 1200))
      : [],
    producerOrCreator: item.producerOrCreator?.trim() || undefined,
    presentations: [],
    availability:
      typeof item.availability === "boolean"
        ? item.availability
        : typeof item.availability === "string"
          ? !["no", "false", "agotado", "no disponible", "sin stock"].includes(item.availability.trim().toLowerCase())
          : undefined,
    process: item.process?.trim() || undefined,
    ingredients: [],
    allergens: [],
    verifiedClaims: [],
    inquiryMessage: item.inquiryMessage?.trim() || undefined,
    price: typeof item.price === "number" && item.price >= 0 ? item.price : undefined,
    showPrice: item.showPrice !== false,
    currency: item.currency === "USD" ? "USD" : "PEN",
    isActive: item.isActive ?? true,
    isFeatured: item.isFeatured === true,
    order: typeof item.order === "number" ? item.order : 999,
  };
}

function fallbackArtItems(): CatalogItem[] {
  if (process.env.NODE_ENV !== "development") return [];
  return fallbackCatalogItems
    .filter((item) => item.category.slug === "arte" && item.slug !== "manualidades")
    .map((item) => ({ ...item, category: { ...item.category, showInPrintedMenu: false } }))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
}

async function legacyArtItems(): Promise<CatalogItem[]> {
  if (!sanityClient) return fallbackArtItems();
  try {
    const docs = await sanityClient.fetch<SanityArtItem[]>(legacyArtCatalogItemsQuery, {}, fetchOptions(["catalog"]));
    const normalized = (docs || []).map(normalizeItem).filter((item): item is CatalogItem => Boolean(item));
    return normalized.length ? normalized : fallbackArtItems();
  } catch {
    return fallbackArtItems();
  }
}

function categoriesFromItems(items: CatalogItem[]): CatalogCategory[] {
  const map = new Map<string, CatalogCategory>();
  for (const item of items) if (!map.has(item.category.id)) map.set(item.category.id, item.category);
  return [...map.values()].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
}

export const getArtItems = cache(async (): Promise<CatalogItem[]> => {
  if (!sanityClient) return legacyArtItems();
  try {
    const docs = await sanityClient.fetch<SanityArtItem[]>(artItemsQuery, {}, fetchOptions([ART_TAG]));
    const normalized = (docs || []).map(normalizeItem).filter((item): item is CatalogItem => Boolean(item));
    if (normalized.length > 0) {
      return normalized.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
    }
    return legacyArtItems();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[Sanity galería] Falló getArtItems:", error);
    return legacyArtItems();
  }
});

export const getArtCategories = cache(async (): Promise<CatalogCategory[]> => {
  const items = await getArtItems();
  if (!sanityClient) return categoriesFromItems(items);
  try {
    const docs = await sanityClient.fetch<SanityArtCategory[]>(artCategoriesQuery, {}, fetchOptions([ART_CATEGORIES_TAG, ART_TAG]));
    const normalized = (docs || []).map(normalizeCategory).filter((category) => category.isVisible);
    const bySlug = new Map<string, CatalogCategory>();
    for (const category of [...normalized, ...categoriesFromItems(items)]) {
      if (!bySlug.has(category.slug)) bySlug.set(category.slug, category);
    }
    return [...bySlug.values()].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
  } catch {
    return categoriesFromItems(items);
  }
});

export const getArtItemBySlug = cache(async (slug: string): Promise<CatalogItem | null> => {
  if (!slug) return null;
  if (!sanityClient) return (await legacyArtItems()).find((item) => item.slug === slug) || null;
  try {
    const doc = await sanityClient.fetch<SanityArtItem | null>(artItemBySlugQuery, { slug }, fetchOptions([ART_TAG, artItemTag(slug)]));
    const normalized = doc ? normalizeItem(doc) : null;
    if (normalized) return normalized;
    return (await legacyArtItems()).find((item) => item.slug === slug) || null;
  } catch {
    return (await legacyArtItems()).find((item) => item.slug === slug) || null;
  }
});

export const getRelatedArtItems = cache(async (categoryId: string, slug: string): Promise<CatalogItem[]> => {
  if (!slug) return [];

  // Las recomendaciones pertenecen a toda la Galería de Arte, no únicamente
  // a la misma categoría. Priorizamos piezas de la misma categoría cuando las
  // haya y completamos con el resto de la galería. Esto evita una sección
  // vacía cuando, por ejemplo, Retablos, Toritos y Cuadros quedaron en
  // categorías distintas después de la migración.
  const items = (await getArtItems()).filter((item) => item.slug !== slug);
  if (!items.length) return [];

  return items
    .map((item, index) => ({
      item,
      index,
      sameCategory: Boolean(categoryId) && item.category.id === categoryId,
    }))
    .sort((a, b) => Number(b.sameCategory) - Number(a.sameCategory) || a.index - b.index)
    .slice(0, 3)
    .map(({ item }) => item);
});
