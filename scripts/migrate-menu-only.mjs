import process from "node:process";
import { createClient } from "next-sanity";

/**
 * Migra SOLO la Carta desde los documentos históricos catalogItem/catalogCategory
 * hacia menuItem/menuCategory. No toca Galería de Arte ni borra documentos antiguos.
 *
 * La selección coincide con la Carta pública histórica:
 *   catalogCategory.showInPrintedMenu != false
 * excluyendo la antigua categoría arte.
 *
 * Uso:
 *   npm run menu:split:dry
 *   npm run menu:split
 */

const isDryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!isDryRun && !token) throw new Error("Falta SANITY_API_WRITE_TOKEN para escribir la migración.");

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "published" });

function slugify(value) {
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "elemento";
}
function menuCategoryId(slug) { return `menuCategory.${slug}`; }
function menuItemId(slug, legacyId) { return `menuItem.${slug || slugify(legacyId)}`; }
function withoutUndefined(value) {
  if (Array.isArray(value)) return value.map(withoutUndefined);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([, child]) => child !== undefined)
    .map(([key, child]) => [key, withoutUndefined(child)]));
}
async function upsertExact(doc, syncFields) {
  await client.createIfNotExists(withoutUndefined(doc));
  const set = {}; const unset = [];
  for (const field of syncFields) {
    if (doc[field] === undefined) unset.push(field);
    else set[field] = withoutUndefined(doc[field]);
  }
  let patch = client.patch(doc._id);
  if (Object.keys(set).length) patch = patch.set(set);
  if (unset.length) patch = patch.unset(unset);
  await patch.commit({ autoGenerateArrayKeys: true });
}

const categories = await client.fetch(`
  *[_type == "catalogCategory" && coalesce(showInPrintedMenu, true) == true && slug.current != "arte"]
  | order(order asc, title asc){
    _id, title, "slug": slug.current, description, tagline, storyTitle, story,
    sourcing, sourcingFacts, image, imageAlt, order, isVisible
  }
`);

const items = await client.fetch(`
  *[_type == "catalogItem" && coalesce(category->showInPrintedMenu, true) == true && category->slug.current != "arte"]
  | order(category->order asc, order asc, title asc){
    _id, migrationDestination, title, "slug": slug.current,
    "categoryId": category->_id, "categoryTitle": category->title,
    subcategory, shortDescription, mainImage, mainImageAlt,
    price, showPrice, currency, isActive, order
  }
`);

console.log("============================================================");
console.log("Raíces - Migración SOLO Carta");
console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN (no escribe)" : "MIGRACIÓN REAL"}`);
console.log(`Detectado: ${categories.length} categorías · ${items.length} elementos`);
console.log("============================================================\n");

if (!categories.length || !items.length) {
  throw new Error("No se encontraron categorías/elementos de la Carta en el catálogo histórico. No se escribió nada.");
}

const legacyToMenuCategory = new Map();
for (const category of categories) {
  const slug = category.slug || slugify(category.title);
  const id = menuCategoryId(slug);
  legacyToMenuCategory.set(category._id, id);
  const doc = {
    _id: id, _type: "menuCategory", title: category.title,
    slug: { _type: "slug", current: slug },
    description: category.description, tagline: category.tagline,
    storyTitle: category.storyTitle, story: category.story,
    sourcing: category.sourcing, sourcingFacts: category.sourcingFacts,
    image: category.image, imageAlt: category.imageAlt,
    order: typeof category.order === "number" ? category.order : 100,
    isVisible: category.isVisible !== false,
  };
  console.log(`[Categoría] ${category.title}`);
  if (!isDryRun) await upsertExact(doc, ["title","slug","description","tagline","storyTitle","story","sourcing","sourcingFacts","image","imageAlt","order","isVisible"]);
}

let copied = 0;
for (const item of items) {
  const categoryRef = legacyToMenuCategory.get(item.categoryId);
  if (!categoryRef) {
    console.warn(`[OMITIDO] ${item.title}: categoría no resuelta.`);
    continue;
  }
  const slug = item.slug || slugify(item.title);
  const id = menuItemId(slug, item._id);
  const doc = {
    _id: id, _type: "menuItem", title: item.title,
    category: { _type: "reference", _ref: categoryRef },
    subcategory: item.subcategory, shortDescription: item.shortDescription,
    mainImage: item.mainImage, mainImageAlt: item.mainImageAlt,
    price: item.price, showPrice: item.showPrice !== false,
    currency: item.currency === "USD" ? "USD" : "PEN",
    isActive: item.isActive !== false,
    order: typeof item.order === "number" ? item.order : 100,
    sourceCatalogItem: { _type: "reference", _ref: item._id },
  };
  console.log(`[Elemento] ${item.title} · ${item.categoryTitle}${typeof item.price === "number" ? ` · S/ ${item.price}` : ""}${item.isActive === false ? " · oculto" : ""}`);
  if (!isDryRun) {
    await upsertExact(doc, ["title","category","subcategory","shortDescription","mainImage","mainImageAlt","price","showPrice","currency","isActive","order","sourceCatalogItem"]);
    await client.patch(item._id).set({ migrationDestination: "carta", migratedAt: new Date().toISOString() }).commit();
  }
  copied += 1;
}

if (isDryRun) {
  console.log(`\nDRY RUN terminado. Se migrarían ${copied} elementos y ${categories.length} categorías.`);
  console.log("Si la lista coincide con la Carta actual, ejecuta npm run menu:split.");
} else {
  console.log(`\nOK. Carta migrada: ${copied} elementos y ${categories.length} categorías.`);
  console.log("Los documentos históricos NO se borraron.");
  console.log("Ahora abre /studio > Carta y recarga con Ctrl+F5.");
}
