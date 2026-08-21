import "server-only";

import { cache } from "react";
import type { SanityImageSource } from "@sanity/image-url";
<<<<<<< Updated upstream
import {
  fallbackCatalogCategories,
  fallbackCatalogItems,
  getFallbackCatalogItemBySlug,
  getFallbackRelatedCatalogItems,
} from "@/data/catalogFallback";
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  image?: SanityImageSource;
  imageAlt?: string;
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  availability?: boolean | string;
=======
  availability?: string;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// La imagen de categoría se usa en la carta impresa (~65 mm de ancho, >300 dpi)
// y en la franja lateral de la vista TV, por eso el formato apaisado amplio.
const CATEGORY_IMAGE_WIDTH = 1600;
const CATEGORY_IMAGE_HEIGHT = 1100;

=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// A diferencia de normalizeImage, aquí NO se cae a la foto de paisaje: devolver
// undefined permite que las vistas apliquen el respaldo por producto.
function normalizeCategoryImage(category: SanityCategory | undefined): CatalogImage | undefined {
  if (!category?.image) return undefined;
  const src = urlForImage(category.image)
    ?.width(CATEGORY_IMAGE_WIDTH)
    .height(CATEGORY_IMAGE_HEIGHT)
    .fit("crop")
    .auto("format")
    .url();
  if (!src) return undefined;
  return {
    src,
    alt: category.imageAlt?.trim() || category.title?.trim() || "Categoría del catálogo de Raíces",
    width: CATEGORY_IMAGE_WIDTH,
    height: CATEGORY_IMAGE_HEIGHT,
  };
}

=======
>>>>>>> Stashed changes
function normalizeCategory(category: SanityCategory | undefined): CatalogCategory {
  return {
    id: category?._id || "uncategorized",
    title: category?.title?.trim() || "Sin categoría",
    slug: category?.slug?.trim() || "sin-categoria",
    description: category?.description?.trim() || undefined,
<<<<<<< Updated upstream
    image: normalizeCategoryImage(category),
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    region: (() => {
      const origin = item.origin?.trim() || "Ayacucho";
      const region = item.region?.trim();
      if (!region || region.toLocaleLowerCase("es") === origin.toLocaleLowerCase("es")) return undefined;
      return region;
    })(),
=======
    region: item.region?.trim() || undefined,
>>>>>>> Stashed changes
    shortDescription: item.shortDescription?.trim() || `Conoce más sobre ${title}.`,
    description: Array.isArray(item.description) ? item.description : [],
    mainImage: normalizeImage(item.mainImage, item.mainImageAlt?.trim() || title),
    gallery: Array.isArray(item.gallery)
      ? item.gallery.map((image) => normalizeImage(image as SanityImageSource, image.alt?.trim() || title, 1000, 1200))
      : [],
    producerOrCreator: item.producerOrCreator?.trim() || undefined,
    presentations: Array.isArray(item.presentations) ? item.presentations.filter(Boolean) : [],
<<<<<<< Updated upstream
    availability:
      typeof item.availability === "boolean"
        ? item.availability
        : typeof item.availability === "string"
          ? !["no", "false", "agotado", "no disponible", "sin stock"].includes(item.availability.trim().toLowerCase())
          : undefined,
=======
    availability: item.availability?.trim() || undefined,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  if (!sanityClient) return fallbackCatalogItems.filter((item) => item.isFeatured).slice(0, 6);
=======
  if (!sanityClient) return [];
>>>>>>> Stashed changes
  try {
    const items = await sanityClient.fetch<SanityCatalogItem[]>(
      featuredCatalogItemsQuery,
      {},
      fetchOptions([CATALOG_TAG]),
    );
    return normalizeItems(items).filter((item) => item.isFeatured).slice(0, 6);
  } catch (error) {
    reportCatalogError("getFeaturedCatalogItems", error);
<<<<<<< Updated upstream
    return fallbackCatalogItems.filter((item) => item.isFeatured).slice(0, 6);
=======
    return [];
>>>>>>> Stashed changes
  }
});

export const getCatalogItems = cache(async (): Promise<CatalogItem[]> => {
<<<<<<< Updated upstream
  if (!sanityClient) return fallbackCatalogItems;
=======
  if (!sanityClient) return [];
>>>>>>> Stashed changes
  try {
    const items = await sanityClient.fetch<SanityCatalogItem[]>(
      catalogItemsQuery,
      {},
      fetchOptions([CATALOG_TAG]),
    );
<<<<<<< Updated upstream
    const normalized = normalizeItems(items);
    return normalized.length > 0 ? normalized : fallbackCatalogItems;
  } catch (error) {
    reportCatalogError("getCatalogItems", error);
    return fallbackCatalogItems;
=======
    return normalizeItems(items);
  } catch (error) {
    reportCatalogError("getCatalogItems", error);
    return [];
>>>>>>> Stashed changes
  }
});

export const getCatalogCategories = cache(async (): Promise<CatalogCategory[]> => {
<<<<<<< Updated upstream
  if (!sanityClient) return fallbackCatalogCategories;
=======
  if (!sanityClient) return [];
>>>>>>> Stashed changes
  try {
    const categories = await sanityClient.fetch<SanityCategory[]>(
      catalogCategoriesQuery,
      {},
      fetchOptions([CATALOG_CATEGORIES_TAG, CATALOG_TAG]),
    );
<<<<<<< Updated upstream
    const normalized = (categories || [])
      .map(normalizeCategory)
      .filter((category) => category.isVisible)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
    return normalized.length > 0 ? normalized : fallbackCatalogCategories;
  } catch (error) {
    reportCatalogError("getCatalogCategories", error);
    return fallbackCatalogCategories;
=======
    return (categories || [])
      .map(normalizeCategory)
      .filter((category) => category.isVisible)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));
  } catch (error) {
    reportCatalogError("getCatalogCategories", error);
    return [];
>>>>>>> Stashed changes
  }
});

export const getCatalogItemBySlug = cache(async (slug: string): Promise<CatalogItem | null> => {
<<<<<<< Updated upstream
  if (!slug) return null;
  if (!sanityClient) return getFallbackCatalogItemBySlug(slug);
=======
  if (!sanityClient || !slug) return null;
>>>>>>> Stashed changes
  try {
    const item = await sanityClient.fetch<SanityCatalogItem | null>(
      catalogItemBySlugQuery,
      { slug },
      fetchOptions([CATALOG_TAG, catalogItemTag(slug)]),
    );
    const normalized = item ? normalizeItem(item) : null;
<<<<<<< Updated upstream
    return normalized?.isActive && normalized.category.isVisible
      ? normalized
      : getFallbackCatalogItemBySlug(slug);
  } catch (error) {
    reportCatalogError(`getCatalogItemBySlug(${slug})`, error);
    return getFallbackCatalogItemBySlug(slug);
=======
    return normalized?.isActive && normalized.category.isVisible ? normalized : null;
  } catch (error) {
    reportCatalogError(`getCatalogItemBySlug(${slug})`, error);
    return null;
>>>>>>> Stashed changes
  }
});

export const getRelatedCatalogItems = cache(async (categoryId: string, slug: string): Promise<CatalogItem[]> => {
<<<<<<< Updated upstream
  if (!categoryId || !slug) return [];
  if (!sanityClient || categoryId.startsWith("fallback-category-")) {
    return getFallbackRelatedCatalogItems(categoryId, slug);
  }
=======
  if (!sanityClient || !categoryId || !slug) return [];
>>>>>>> Stashed changes
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
