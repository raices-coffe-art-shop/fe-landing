import type { CatalogCategory, CatalogImage, CatalogItem } from "@/sanity/lib/catalogTypes";

// Imagen de paisaje que `normalizeImage` asigna a un producto sin fotografía
// propia. Como representa a Ayacucho y no al producto, solo se usa aquí como
// último recurso: una categoría prefiere siempre una foto real.
export const CATALOG_FALLBACK_IMAGE_SRC = "/ayacucho-sacsamarca.webp";

type PhotoSource = Pick<CatalogItem, "mainImage" | "isFeatured">;

// Fotografías que representan a una categoría, en orden de preferencia:
// imagen subida en el Studio → productos destacados → resto de productos.
// Deduplica por `src` para no repetir la misma foto en la columna impresa.
export function resolveCategoryPhotos(
  categoryImage: CatalogImage | null | undefined,
  items: readonly PhotoSource[],
  max = 2,
): CatalogImage[] {
  const featured = items.filter((item) => item.isFeatured).map((item) => item.mainImage);
  const rest = items.filter((item) => !item.isFeatured).map((item) => item.mainImage);
  const ordered = [categoryImage, ...featured, ...rest].filter(
    (image): image is CatalogImage => Boolean(image?.src),
  );

  const real = ordered.filter((image) => image.src !== CATALOG_FALLBACK_IMAGE_SRC);
  const source = real.length > 0 ? real : ordered;

  const seen = new Set<string>();
  const photos: CatalogImage[] = [];
  for (const image of source) {
    if (seen.has(image.src)) continue;
    seen.add(image.src);
    photos.push(image);
    if (photos.length >= max) break;
  }
  return photos;
}

export function resolveCategoryImage(
  category: Pick<CatalogCategory, "image"> | undefined,
  items: readonly PhotoSource[],
): CatalogImage | null {
  return resolveCategoryPhotos(category?.image, items, 1)[0] ?? null;
}

// Las fotos de producto llegan a tamaño de ficha (1200x1400). En la carta se
// imprimen a 58 mm y en la TV ocupan una franja lateral, así que se pide al CDN
// una versión proporcionada: un PDF de carta liviano se comparte por WhatsApp
// sin problemas. Si la URL no admite parámetros (imagen local), se deja igual.
export function resizeCatalogImage(image: CatalogImage, width: number, height: number): CatalogImage {
  try {
    const url = new URL(image.src);
    if (!url.searchParams.has("w")) return image;
    url.searchParams.set("w", String(width));
    if (url.searchParams.has("h")) url.searchParams.set("h", String(height));
    return { ...image, src: url.toString(), width, height };
  } catch {
    return image;
  }
}
