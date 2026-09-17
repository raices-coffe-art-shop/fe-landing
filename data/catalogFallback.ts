import type { CatalogCategory, CatalogItem } from "@/sanity/lib/catalogTypes";
import productSeedJson from "@/scripts/francisco-productos-origen-2026-09.json";
import artSeedJson from "@/scripts/francisco-galeria-arte-2026-09.json";

type SeedCategory = {
  slug: string;
  title: string;
  description?: string;
  order: number;
  image?: string;
  imageAlt?: string;
};

type SeedProduct = {
  slug: string;
  title: string;
  categorySlug: string;
  presentations?: string[];
  price?: number | null;
  showPrice?: boolean;
  currency?: "PEN" | "USD";
  origin?: string;
  region?: string | null;
  shortDescription: string;
  image: string;
  mainImageAlt?: string;
  producerOrCreator?: string | null;
  inquiryMessage?: string;
  availability?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  order: number;
};

type SeedArtItem = {
  slug: string;
  title: string;
  subcategory?: string;
  origin?: string;
  producerOrCreator?: string;
  shortDescription: string;
  image: string;
  mainImageAlt?: string;
  order: number;
};

const productSeed = productSeedJson as { categories: SeedCategory[]; products: SeedProduct[] };
const artSeed = artSeedJson as { category: SeedCategory; items: SeedArtItem[] };

function publicPath(value: string) {
  return value.startsWith("public/") ? `/${value.slice("public/".length)}` : value;
}

const categorySeeds: SeedCategory[] = [
  ...productSeed.categories,
  {
    ...artSeed.category,
    // La librería de compatibilidad reconoce "arte" como el dominio separado.
    slug: "arte",
    image: artSeed.items[0]?.image,
    imageAlt: artSeed.items[0]?.mainImageAlt,
    order: 90,
  },
];

export const fallbackCatalogCategories: CatalogCategory[] = categorySeeds.map((category) => ({
  id: `fallback-category-${category.slug}`,
  title: category.title,
  slug: category.slug,
  description: category.description,
  image: category.image
    ? {
        src: publicPath(category.image),
        alt: category.imageAlt || category.title,
        width: 1600,
        height: 1100,
      }
    : undefined,
  order: category.order,
  isVisible: true,
  showInPrintedMenu: false,
  itemCount: category.slug === "arte"
    ? artSeed.items.length
    : productSeed.products.filter((product) => product.categorySlug === category.slug).length,
}));

const categoriesBySlug = new Map(fallbackCatalogCategories.map((category) => [category.slug, category] as const));

const productItems: CatalogItem[] = productSeed.products.map((product) => ({
  id: `fallback-product-${product.slug}`,
  title: product.title,
  slug: product.slug,
  category: categoriesBySlug.get(product.categorySlug)!,
  origin: product.origin || "Ayacucho",
  region: product.region || undefined,
  shortDescription: product.shortDescription,
  description: [],
  mainImage: {
    src: publicPath(product.image),
    alt: product.mainImageAlt || product.title,
    width: 1200,
    height: 1400,
  },
  gallery: [],
  producerOrCreator: product.producerOrCreator || undefined,
  presentations: product.presentations || [],
  availability: product.availability ?? true,
  ingredients: [],
  allergens: [],
  verifiedClaims: [],
  inquiryMessage: product.inquiryMessage,
  price: typeof product.price === "number" ? product.price : undefined,
  showPrice: product.showPrice !== false && typeof product.price === "number",
  currency: product.currency === "USD" ? "USD" : "PEN",
  isActive: product.isActive !== false,
  isFeatured: product.isFeatured === true,
  order: product.order,
  seo: undefined,
}));

const artCategory = categoriesBySlug.get("arte")!;
const artItems: CatalogItem[] = artSeed.items.map((item, index) => ({
  id: `fallback-art-${item.slug}`,
  title: item.title,
  slug: item.slug,
  category: artCategory,
  subcategory: item.subcategory,
  origin: item.origin || "Quinua, Ayacucho",
  shortDescription: item.shortDescription,
  description: [],
  mainImage: {
    src: publicPath(item.image),
    alt: item.mainImageAlt || item.title,
    width: 1200,
    height: 1400,
  },
  gallery: [],
  producerOrCreator: item.producerOrCreator,
  presentations: [],
  availability: true,
  ingredients: [],
  allergens: [],
  verifiedClaims: [],
  inquiryMessage: `Hola, quisiera consultar por ${item.title}.`,
  price: undefined,
  showPrice: false,
  currency: "PEN",
  isActive: true,
  isFeatured: index === 0,
  order: item.order,
  seo: undefined,
}));

export const fallbackCatalogItems: CatalogItem[] = [...productItems, ...artItems];

export function getFallbackCatalogItemBySlug(slug: string) {
  return fallbackCatalogItems.find((item) => item.slug === slug) ?? null;
}

export function getFallbackRelatedCatalogItems(categoryId: string, slug: string) {
  return fallbackCatalogItems
    .filter((item) => item.category.id === categoryId && item.slug !== slug)
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.order - b.order)
    .slice(0, 6);
}
