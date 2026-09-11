import process from "node:process";
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "published" });

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function same(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function cleanImage(image) {
  if (!image) return undefined;
  return {
    asset: image.asset?._ref || undefined,
    crop: image.crop || undefined,
    hotspot: image.hotspot || undefined,
  };
}

function cleanGallery(gallery) {
  if (!Array.isArray(gallery)) return undefined;
  return gallery.map((image) => ({
    asset: image?.asset?._ref || undefined,
    crop: image?.crop || undefined,
    hotspot: image?.hotspot || undefined,
    alt: image?.alt || undefined,
  }));
}

const counts = await client.fetch(`{
  "menuItems": count(*[_type == "menuItem"]),
  "menuCategories": count(*[_type == "menuCategory"]),
  "artItems": count(*[_type == "artItem"]),
  "artCategories": count(*[_type == "artCategory"]),
  "productsOfOrigin": count(*[_type == "catalogItem" && !defined(migrationDestination) && category->slug.current != "arte"]),
  "migratedToMenu": count(*[_type == "catalogItem" && migrationDestination == "carta"]),
  "migratedToArt": count(*[_type == "catalogItem" && migrationDestination == "galeria-de-arte"]),
  "pendingMenu": count(*[
    _type == "catalogItem" &&
    !defined(migrationDestination) &&
    coalesce(category->showInPrintedMenu, true) == true &&
    category->slug.current != "arte"
  ]),
  "pendingArt": count(*[
    _type == "catalogItem" &&
    !defined(migrationDestination) &&
    category->slug.current == "arte" &&
    slug.current != "manualidades"
  ]),
  "orphanMenuItems": count(*[_type == "menuItem" && !defined(category->_id)]),
  "orphanArtItems": count(*[_type == "artItem" && !defined(category->_id)]),
  "menuWithoutSource": count(*[_type == "menuItem" && !defined(sourceCatalogItem->_id)]),
  "artWithoutSource": count(*[_type == "artItem" && !defined(sourceCatalogItem->_id)])
}`);

const sourceMenuCategories = await client.fetch(`
  *[_type == "catalogCategory" && coalesce(showInPrintedMenu, true) == true && slug.current != "arte"]{
    _id, title, "slug": slug.current, description, tagline, storyTitle, story,
    sourcing, sourcingFacts, image{asset->{_id}, crop, hotspot}, imageAlt, order, isVisible
  }
`);
const targetMenuCategories = await client.fetch(`
  *[_type == "menuCategory"]{
    _id, title, "slug": slug.current, description, tagline, storyTitle, story,
    sourcing, sourcingFacts, image{asset->{_id}, crop, hotspot}, imageAlt, order, isVisible
  }
`);

const sourceMenuItems = await client.fetch(`
  *[_type == "catalogItem" && migrationDestination == "carta"]{
    _id, title, "slug": slug.current,
    "categorySlug": category->slug.current,
    subcategory, shortDescription,
    mainImage{asset->{_id}, crop, hotspot}, mainImageAlt,
    price, showPrice, currency, isActive, order
  }
`);
const targetMenuItems = await client.fetch(`
  *[_type == "menuItem"]{
    _id, "sourceId": sourceCatalogItem->_id, title,
    "categorySlug": category->slug.current,
    subcategory, shortDescription,
    mainImage{asset->{_id}, crop, hotspot}, mainImageAlt,
    price, showPrice, currency, isActive, order
  }
`);

const sourceArtItems = await client.fetch(`
  *[_type == "catalogItem" && migrationDestination == "galeria-de-arte"]{
    _id, title, "slug": slug.current, subcategory, origin, shortDescription,
    description,
    mainImage{asset->{_id}, crop, hotspot}, mainImageAlt,
    gallery[]{asset->{_id}, crop, hotspot, alt},
    producerOrCreator, availability, inquiryMessage,
    price, showPrice, currency, isActive, isFeatured, order
  }
`);
const targetArtItems = await client.fetch(`
  *[_type == "artItem"]{
    _id, "sourceId": sourceCatalogItem->_id, title, "slug": slug.current,
    "categoryTitle": category->title,
    subcategory, origin, shortDescription, description,
    mainImage{asset->{_id}, crop, hotspot}, mainImageAlt,
    gallery[]{asset->{_id}, crop, hotspot, alt},
    producerOrCreator, availability, inquiryMessage,
    price, showPrice, currency, isActive, isFeatured, order
  }
`);

console.log("Verificación de separación de contenido");
console.log(`Proyecto: ${projectId} · Dataset: ${dataset}`);
console.table(counts);

const failures = [];
if (counts.pendingMenu > 0) failures.push(`${counts.pendingMenu} elementos de Carta siguen pendientes de separar`);
if (counts.pendingArt > 0) failures.push(`${counts.pendingArt} piezas de Galería siguen pendientes de separar`);
if (counts.orphanMenuItems > 0) failures.push(`${counts.orphanMenuItems} elementos de Carta tienen categoría rota`);
if (counts.orphanArtItems > 0) failures.push(`${counts.orphanArtItems} piezas de Galería tienen categoría rota`);
if (counts.menuWithoutSource > 0) failures.push(`${counts.menuWithoutSource} elementos de Carta no conservan referencia al documento original`);
if (counts.artWithoutSource > 0) failures.push(`${counts.artWithoutSource} piezas de Galería no conservan referencia al documento original`);

const targetCategoryBySlug = new Map(targetMenuCategories.map((item) => [item.slug, item]));
for (const source of sourceMenuCategories) {
  const target = targetCategoryBySlug.get(source.slug);
  if (!target) {
    failures.push(`Carta: falta la categoría destino "${source.title}" (${source.slug})`);
    continue;
  }
  const expected = {
    title: source.title,
    slug: source.slug,
    description: source.description,
    tagline: source.tagline,
    storyTitle: source.storyTitle,
    story: source.story,
    sourcing: source.sourcing,
    sourcingFacts: source.sourcingFacts,
    image: cleanImage(source.image ? { ...source.image, asset: { _ref: source.image.asset?._id } } : undefined),
    imageAlt: source.imageAlt,
    order: typeof source.order === "number" ? source.order : 100,
    isVisible: source.isVisible !== false,
  };
  const actual = {
    title: target.title,
    slug: target.slug,
    description: target.description,
    tagline: target.tagline,
    storyTitle: target.storyTitle,
    story: target.story,
    sourcing: target.sourcing,
    sourcingFacts: target.sourcingFacts,
    image: cleanImage(target.image ? { ...target.image, asset: { _ref: target.image.asset?._id } } : undefined),
    imageAlt: target.imageAlt,
    order: target.order,
    isVisible: target.isVisible !== false,
  };
  if (!same(expected, actual)) failures.push(`Carta: la categoría "${source.title}" no coincide exactamente con el contenido anterior`);
}

const targetMenuBySource = new Map(targetMenuItems.map((item) => [item.sourceId, item]));
for (const source of sourceMenuItems) {
  const target = targetMenuBySource.get(source._id);
  if (!target) {
    failures.push(`Carta: falta el elemento destino "${source.title}"`);
    continue;
  }
  const expected = {
    title: source.title,
    categorySlug: source.categorySlug,
    subcategory: source.subcategory,
    shortDescription: source.shortDescription,
    mainImage: cleanImage(source.mainImage ? { ...source.mainImage, asset: { _ref: source.mainImage.asset?._id } } : undefined),
    mainImageAlt: source.mainImageAlt,
    price: source.price,
    showPrice: source.showPrice !== false,
    currency: source.currency === "USD" ? "USD" : "PEN",
    isActive: source.isActive !== false,
    order: typeof source.order === "number" ? source.order : 100,
  };
  const actual = {
    title: target.title,
    categorySlug: target.categorySlug,
    subcategory: target.subcategory,
    shortDescription: target.shortDescription,
    mainImage: cleanImage(target.mainImage ? { ...target.mainImage, asset: { _ref: target.mainImage.asset?._id } } : undefined),
    mainImageAlt: target.mainImageAlt,
    price: target.price,
    showPrice: target.showPrice !== false,
    currency: target.currency === "USD" ? "USD" : "PEN",
    isActive: target.isActive !== false,
    order: typeof target.order === "number" ? target.order : 100,
  };
  if (!same(expected, actual)) failures.push(`Carta: "${source.title}" no conserva exactamente categoría/subcategoría/texto/precio/imagen/estado/orden`);
}

const targetArtBySource = new Map(targetArtItems.map((item) => [item.sourceId, item]));
for (const source of sourceArtItems) {
  const target = targetArtBySource.get(source._id);
  if (!target) {
    failures.push(`Galería: falta la pieza destino "${source.title}"`);
    continue;
  }
  const expected = {
    title: source.title,
    slug: source.slug,
    categoryTitle: source.subcategory?.trim() || "Piezas",
    subcategory: source.subcategory,
    origin: source.origin || "Ayacucho",
    shortDescription: source.shortDescription || `Conoce más sobre ${source.title}.`,
    description: source.description,
    mainImage: cleanImage(source.mainImage ? { ...source.mainImage, asset: { _ref: source.mainImage.asset?._id } } : undefined),
    mainImageAlt: source.mainImageAlt || source.title,
    gallery: cleanGallery((source.gallery || []).map((image) => ({ ...image, asset: { _ref: image.asset?._id } }))),
    producerOrCreator: source.producerOrCreator,
    availability: typeof source.availability === "boolean" ? source.availability : true,
    inquiryMessage: source.inquiryMessage,
    price: source.price,
    showPrice: source.showPrice !== false,
    currency: source.currency === "USD" ? "USD" : "PEN",
    isActive: source.isActive !== false,
    isFeatured: source.isFeatured === true,
    order: typeof source.order === "number" ? source.order : 100,
  };
  const actual = {
    title: target.title,
    slug: target.slug,
    categoryTitle: target.categoryTitle,
    subcategory: target.subcategory,
    origin: target.origin,
    shortDescription: target.shortDescription,
    description: target.description,
    mainImage: cleanImage(target.mainImage ? { ...target.mainImage, asset: { _ref: target.mainImage.asset?._id } } : undefined),
    mainImageAlt: target.mainImageAlt,
    gallery: cleanGallery((target.gallery || []).map((image) => ({ ...image, asset: { _ref: image.asset?._id } }))),
    producerOrCreator: target.producerOrCreator,
    availability: target.availability !== false,
    inquiryMessage: target.inquiryMessage,
    price: target.price,
    showPrice: target.showPrice !== false,
    currency: target.currency === "USD" ? "USD" : "PEN",
    isActive: target.isActive !== false,
    isFeatured: target.isFeatured === true,
    order: typeof target.order === "number" ? target.order : 100,
  };
  if (!same(expected, actual)) failures.push(`Galería: "${source.title}" no conserva exactamente sus datos anteriores`);
}

console.log("");
console.log(`Paridad Carta: ${sourceMenuItems.length} elementos antiguos contrastados con ${targetMenuItems.length} documentos nuevos.`);
console.log(`Paridad Galería: ${sourceArtItems.length} piezas antiguas contrastadas con ${targetArtItems.length} documentos nuevos.`);

if (failures.length) {
  console.error("\nHay puntos pendientes:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("\nOK: separación completa y paridad validada. Carta y Galería conservan los datos de origen necesarios.");
}
