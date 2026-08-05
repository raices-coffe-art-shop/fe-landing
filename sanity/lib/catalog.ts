import "server-only";

import { cache } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import type {
  CatalogCategory,
  CatalogImage,
  CatalogItem,
  PortableTextBlock,
} from "./catalogTypes";
import { sanityClient } from "./client";
import { urlForImage } from "./image";
import {
  catalogCategoriesQuery,
  catalogItemBySlugQuery,
  catalogItemsQuery,
  featuredCatalogItemsQuery,
  relatedCatalogItemsQuery,
} from "./queries";

export type {
  CatalogCategory,
  CatalogImage,
  CatalogItem,
  PortableTextBlock,
  PortableTextSpan,
} from "./catalogTypes";

export const CATALOG_TAG = "catalog";
export const CATALOG_CATEGORIES_TAG = "catalogCategories";
export const catalogItemTag = (slug: string) => `catalogItem:${slug}`;

type SanityCategory = {
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

type SanityCatalogItem = {
  _id?: string;
  title?: string;
  slug?: string;
  category?: SanityCategory;
  subcategory?: string;
  origin?: string;
  region?: string;
  shortDescription?: string;
  description?: PortableTextBlock[];
  mainImage?: SanityImageSource;
  mainImageAlt?: string;
  gallery?: SanityGalleryImage[];
  producerOrCreator?: string;
  presentations?: string[];
  availability?: string;
  process?: string;
  ingredients?: string[];
  allergens?: string[];
  verifiedClaims?: string[];
  inquiryMessage?: string;
  price?: number;
  showPrice?: boolean;
  currency?: CatalogItem["currency"];
  tone?: CatalogItem["tone"];
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
  seo?: CatalogItem["seo"];
};

const fallbackImage: CatalogImage = {
  src: "/ayacucho-sacsamarca.webp",
  alt: "Paisaje de Ayacucho",
  width: 1200,
  height: 1400,
};

function fetchOptions(tags: string[]) {
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store" as const };
  }

  return {
    next: {
      revalidate: 300,
      tags,
    },
  };
}

function reportCatalogError(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Sanity catálogo] Falló ${scope}:`, error);
  }
}

function normalizeCategory(category: SanityCategory | undefined): CatalogCategory {
  return {
    id: category?._id || "uncategorized",
    title: category?.title?.trim() || "Sin categoría",
    slug: category?.slug?.trim() || "sin-categoria",
    description: category?.description?.trim() || undefined,
    order: typeof category?.order === "number" ? category.order : 999,
    isVisible: category?.isVisible !== false,
    itemCount: typeof category?.itemCount === "number" ? category.itemCount : 0,
  };
}

function normalizeImage(source: SanityImageSource | null | undefined, alt: string, width = 1200, height = 1400): CatalogImage {
  const src = urlForImage(source)?.width(width).height(height).fit("crop").auto("format").url();
  return src
    ? { src, alt: alt.trim() || "Imagen de producto de Raíces", width, height }
    : { ...fallbackImage, alt: alt.trim() || fallbackImage.alt };
}

function normalizeItem(item: SanityCatalogItem): CatalogItem | null {
  if (!item._id || !item.title?.trim() || !item.slug?.trim() || !item.category) {
    return null;
  }

  const title = item.title.trim();
  return {
    id: item._id,
    title,
    slug: item.slug.trim(),
    category: normalizeCategory(item.category),
    subcategory: item.subcategory?.trim() || undefined,
    origin: item.origin?.trim() || "Ayacucho",
    region: item.region?.trim() || undefined,
    shortDescription: item.shortDescription?.trim() || `Conoce más sobre ${title}.`,
    description: Array.isArray(item.description) ? item.description : [],
    mainImage: normalizeImage(item.mainImage, item.mainImageAlt?.trim() || title),
    gallery: Array.isArray(item.gallery)
      ? item.gallery.map((image) => normalizeImage(image as SanityImageSource, image.alt?.trim() || title, 1000, 1200))
      : [],
    producerOrCreator: item.producerOrCreator?.trim() || undefined,
    presentations: Array.isArray(item.presentations) ? item.presentations.filter(Boolean) : [],
    availability: item.availability?.trim() || undefined,
    process: item.process?.trim() || undefined,
    ingredients: Array.isArray(item.ingredients) ? item.ingredients.filter(Boolean) : [],
    allergens: Array.isArray(item.allergens) ? item.allergens.filter(Boolean) : [],
    verifiedClaims: Array.isArray(item.verifiedClaims) ? item.verifiedClaims.filter(Boolean) : [],
    inquiryMessage: item.inquiryMessage?.trim() || undefined,
    price: typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0 ? item.price : undefined,
    showPrice: item.showPrice !== false,
    currency: item.currency === "USD" ? "USD" : "PEN",
    tone: item.tone || "green",
    isActive: item.isActive !== false,
    isFeatured: item.isFeatured === true,
    order: typeof item.order === "number" ? item.order : 999,
    seo: item.seo,
  };
}

function normalizeItems(items: SanityCatalogItem[] | null | undefined) {
  return (items || [])
    .map(normalizeItem)
    .filter((item): item is CatalogItem => item !== null)
    .filter((item) => item.isActive && item.category.isVisible)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
}

export const getFeaturedCatalogItems = cache(async (): Promise<CatalogItem[]> => {
  if (!sanityClient) return [];
  try {
    const items = await sanityClient.fetch<SanityCatalogItem[]>(
      featuredCatalogItemsQuery,
      {},
      fetchOptions([CATALOG_TAG]),
    );
    return normalizeItems(items).filter((item) => item.isFeatured).slice(0, 6);
  } catch (error) {
    reportCatalogError("getFeaturedCatalogItems", error);
    return [];
  }
});

export const getCatalogItems = cache(async (): Promise<CatalogItem[]> => {
  if (!sanityClient) return [];
  try {
    const items = await sanityClient.fetch<SanityCatalogItem[]>(
      catalogItemsQuery,
      {},
      fetchOptions([CATALOG_TAG]),
    );
    return normalizeItems(items);
  } catch (error) {
    reportCatalogError("getCatalogItems", error);
    return [];
  }
});

export const getCatalogCategories = cache(async (): Promise<CatalogCategory[]> => {
  if (!sanityClient) return [];
  try {
    const categories = await sanityClient.fetch<SanityCategory[]>(
      catalogCategoriesQuery,
      {},
      fetchOptions([CATALOG_CATEGORIES_TAG, CATALOG_TAG]),
    );
    return (categories || [])
      .map(normalizeCategory)
      .filter((category) => category.isVisible)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
  } catch (error) {
    reportCatalogError("getCatalogCategories", error);
    return [];
  }
});

export const getCatalogItemBySlug = cache(async (slug: string): Promise<CatalogItem | null> => {
  if (!sanityClient || !slug) return null;
  try {
    const item = await sanityClient.fetch<SanityCatalogItem | null>(
      catalogItemBySlugQuery,
      { slug },
      fetchOptions([CATALOG_TAG, catalogItemTag(slug)]),
    );
    const normalized = item ? normalizeItem(item) : null;
    return normalized?.isActive && normalized.category.isVisible ? normalized : null;
  } catch (error) {
    reportCatalogError(`getCatalogItemBySlug(${slug})`, error);
    return null;
  }
});

export const getRelatedCatalogItems = cache(async (categoryId: string, slug: string): Promise<CatalogItem[]> => {
  if (!sanityClient || !categoryId || !slug) return [];
  try {
    const items = await sanityClient.fetch<SanityCatalogItem[]>(
      relatedCatalogItemsQuery,
      { categoryId, slug },
      fetchOptions([CATALOG_TAG]),
    );
    return normalizeItems(items).slice(0, 3);
  } catch (error) {
    reportCatalogError(`getRelatedCatalogItems(${slug})`, error);
    return [];
  }
});
