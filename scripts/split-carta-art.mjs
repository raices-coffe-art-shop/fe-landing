import process from "node:process";
import { createClient } from "next-sanity";

/**
 * Separa de forma conservadora el catálogo histórico en las tres áreas
 * definitivas del sitio, tomando como fuente de verdad la Carta que ya existía:
 *
 *  - Carta: TODO catalogItem cuya categoría estaba marcada para la carta
 *    impresa (showInPrintedMenu != false), excepto Arte.
 *  - Galería de Arte: TODO catalogItem de la categoría histórica "arte",
 *    excepto el placeholder "manualidades".
 *  - Productos de Origen: conserva los catalogItem que no pertenecen a las dos
 *    áreas anteriores.
 *
 * La misma marca showInPrintedMenu es la que usaba /carta y /carta/imprimir,
 * por lo que la selección de la migración coincide con el contenido que veía
 * el cliente en la carta/PDF. También se copian elementos inactivos para no
 * perder datos: siguen guardados en Studio, pero no se muestran públicamente.
 *
 * Nunca borra los documentos antiguos. Los copia a tipos propios y marca el
 * original con migrationDestination para sacarlo de Productos de Origen.
 *
 * Es idempotente: puede ejecutarse varias veces. Si un destino ya existe, se
 * sincronizan de nuevo los campos que forman parte de Carta/Galería para evitar
 * que una migración interrumpida o antigua deje datos desfasados.
 *
 * Uso:
 *   npm run content:split:dry
 *   npm run content:split
 *   npm run content:split:verify
 */

const isDryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!isDryRun && !token) throw new Error("Falta SANITY_API_WRITE_TOKEN para escribir la migración.");

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "published",
});

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "piezas";
}

function menuCategoryId(slug) { return `menuCategory.${slug}`; }
function menuItemId(slug, legacyId) { return `menuItem.${slug || slugify(legacyId)}`; }
function artCategoryId(slug) { return `artCategory.${slug}`; }
function artItemId(slug, legacyId) { return `artItem.${slug || slugify(legacyId)}`; }

function withoutUndefined(value) {
  if (Array.isArray(value)) return value.map(withoutUndefined);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .map(([key, child]) => [key, withoutUndefined(child)]),
  );
}

async function upsertExact(doc, syncFields) {
  const createDoc = withoutUndefined(doc);
  await client.createIfNotExists(createDoc);

  const set = {};
  const unset = [];
  for (const field of syncFields) {
    if (doc[field] === undefined) unset.push(field);
    else set[field] = withoutUndefined(doc[field]);
  }

  let patch = client.patch(doc._id);
  if (Object.keys(set).length) patch = patch.set(set);
  if (unset.length) patch = patch.unset(unset);
  await patch.commit({ autoGenerateArrayKeys: true });
}

const menuCategories = await client.fetch(`
  *[
    _type == "catalogCategory" &&
    coalesce(showInPrintedMenu, true) == true &&
    slug.current != "arte"
  ] | order(order asc, title asc){
    _id, title, "slug": slug.current, description, tagline, storyTitle, story,
    sourcing, sourcingFacts, image, imageAlt, order, isVisible
  }
`);

// Deliberadamente NO filtramos isActive: un producto oculto de la Carta sigue
// siendo información del negocio y debe conservarse en el apartado Carta.
const menuItems = await client.fetch(`
  *[
    _type == "catalogItem" &&
    coalesce(category->showInPrintedMenu, true) == true &&
    category->slug.current != "arte"
  ] | order(category->order asc, order asc, title asc){
    _id, migrationDestination, title, "slug": slug.current,
    "categoryId": category->_id, "categoryTitle": category->title,
    "categorySlug": category->slug.current, subcategory,
    shortDescription, mainImage, mainImageAlt, price, showPrice, currency,
    isActive, order
  }
`);

const legacyArtItems = await client.fetch(`
  *[
    _type == "catalogItem" &&
    category->slug.current == "arte" &&
    slug.current != "manualidades"
  ] | order(order asc, title asc){
    _id, migrationDestination, title, "slug": slug.current, subcategory,
    origin, shortDescription, description, mainImage, mainImageAlt, gallery,
    producerOrCreator, availability, inquiryMessage, price, showPrice, currency,
    isActive, isFeatured, order
  }
`);

const pendingMenu = menuItems.filter((item) => item.migrationDestination !== "carta");
const pendingArt = legacyArtItems.filter((item) => item.migrationDestination !== "galeria-de-arte");

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN" : "MIGRACIÓN REAL"}`);
console.log(`Carta detectada: ${menuCategories.length} categorías · ${menuItems.length} elementos (${pendingMenu.length} por separar)`);
console.log(`Galería de Arte detectada: ${legacyArtItems.length} piezas (${pendingArt.length} por separar)`);
console.log("");
console.log("La Carta se detecta con la misma marca showInPrintedMenu usada por /carta y /carta/imprimir.");
console.log("");

const legacyToMenuCategory = new Map();
for (const category of menuCategories) {
  const slug = category.slug || slugify(category.title);
  const id = menuCategoryId(slug);
  legacyToMenuCategory.set(category._id, id);
  const doc = {
    _id: id,
    _type: "menuCategory",
    title: category.title,
    slug: { _type: "slug", current: slug },
    description: category.description,
    tagline: category.tagline,
    storyTitle: category.storyTitle,
    story: category.story,
    sourcing: category.sourcing,
    sourcingFacts: category.sourcingFacts,
    image: category.image,
    imageAlt: category.imageAlt,
    order: typeof category.order === "number" ? category.order : 100,
    isVisible: category.isVisible !== false,
  };

  if (isDryRun) {
    console.log(`[Carta · categoría] ${id} ← ${category.title}`);
  } else {
    await upsertExact(doc, [
      "title", "slug", "description", "tagline", "storyTitle", "story",
      "sourcing", "sourcingFacts", "image", "imageAlt", "order", "isVisible",
    ]);
  }
}

for (const item of menuItems) {
  const categoryRef = legacyToMenuCategory.get(item.categoryId);
  if (!categoryRef) {
    console.warn(`[Carta] Se omite ${item.title}: no se encontró su categoría.`);
    continue;
  }

  const slug = item.slug || slugify(item.title);
  const id = menuItemId(slug, item._id);
  const sourceRef = { _type: "reference", _ref: item._id };
  const doc = {
    _id: id,
    _type: "menuItem",
    title: item.title,
    category: { _type: "reference", _ref: categoryRef },
    subcategory: item.subcategory,
    shortDescription: item.shortDescription,
    mainImage: item.mainImage,
    mainImageAlt: item.mainImageAlt,
    price: item.price,
    showPrice: item.showPrice !== false,
    currency: item.currency === "USD" ? "USD" : "PEN",
    isActive: item.isActive !== false,
    order: typeof item.order === "number" ? item.order : 100,
    sourceCatalogItem: sourceRef,
  };

  if (isDryRun) {
    const status = item.isActive === false ? "oculto" : "visible";
    console.log(`[Carta · elemento] ${item.title} · ${item.categoryTitle} · ${status}${typeof item.price === "number" ? ` · S/ ${item.price}` : ""}`);
  } else {
    await upsertExact(doc, [
      "title", "category", "subcategory", "shortDescription", "mainImage",
      "mainImageAlt", "price", "showPrice", "currency", "isActive", "order",
      "sourceCatalogItem",
    ]);
    await client.patch(item._id).set({ migrationDestination: "carta", migratedAt: new Date().toISOString() }).commit();
  }
}

const artCategoryDocs = new Map();
for (const item of legacyArtItems) {
  const categoryTitle = item.subcategory?.trim() || "Piezas";
  const categorySlug = slugify(categoryTitle);
  if (!artCategoryDocs.has(categorySlug)) {
    artCategoryDocs.set(categorySlug, {
      _id: artCategoryId(categorySlug),
      _type: "artCategory",
      title: categoryTitle,
      slug: { _type: "slug", current: categorySlug },
      order: (artCategoryDocs.size + 1) * 10,
      isVisible: true,
    });
  }
}

for (const category of artCategoryDocs.values()) {
  if (isDryRun) {
    console.log(`[Galería · categoría] ${category._id} ← ${category.title}`);
  } else {
    await upsertExact(category, ["title", "slug", "order", "isVisible"]);
  }
}

for (const item of legacyArtItems) {
  const slug = item.slug || slugify(item.title);
  const categorySlug = slugify(item.subcategory?.trim() || "Piezas");
  const id = artItemId(slug, item._id);
  const sourceRef = { _type: "reference", _ref: item._id };
  const doc = {
    _id: id,
    _type: "artItem",
    title: item.title,
    slug: { _type: "slug", current: slug },
    category: { _type: "reference", _ref: artCategoryId(categorySlug) },
    subcategory: item.subcategory,
    origin: item.origin || "Ayacucho",
    shortDescription: item.shortDescription || `Conoce más sobre ${item.title}.`,
    description: item.description,
    mainImage: item.mainImage,
    mainImageAlt: item.mainImageAlt || item.title,
    gallery: item.gallery,
    producerOrCreator: item.producerOrCreator,
    availability: typeof item.availability === "boolean" ? item.availability : true,
    inquiryMessage: item.inquiryMessage,
    price: item.price,
    showPrice: item.showPrice !== false,
    currency: item.currency === "USD" ? "USD" : "PEN",
    isActive: item.isActive !== false,
    isFeatured: item.isFeatured === true,
    order: typeof item.order === "number" ? item.order : 100,
    sourceCatalogItem: sourceRef,
  };

  if (isDryRun) {
    console.log(`[Galería · pieza] ${item.title} → /galeria-de-arte/${slug}`);
  } else {
    await upsertExact(doc, [
      "title", "slug", "category", "subcategory", "origin", "shortDescription",
      "description", "mainImage", "mainImageAlt", "gallery", "producerOrCreator",
      "availability", "inquiryMessage", "price", "showPrice", "currency",
      "isActive", "isFeatured", "order", "sourceCatalogItem",
    ]);
    await client.patch(item._id).set({ migrationDestination: "galeria-de-arte", migratedAt: new Date().toISOString() }).commit();
  }
}

console.log("");
console.log(
  isDryRun
    ? "Dry run terminado. No se escribió nada. Si la lista coincide con la Carta actual, ejecuta npm run content:split."
    : "Separación terminada. No se borró ningún documento antiguo. Ejecuta npm run content:split:verify para comprobar paridad.",
);
