import process from "node:process";
import { createClient } from "next-sanity";

/**
 * Migración reforzada SOLO para Galería de Arte.
 *
 * Motivo: el catálogo histórico puede seguir mostrando piezas bajo "Arte"
 * aunque un dereference category->slug.current no las detecte desde un script
 * con perspectiva published. Este migrador trabaja con la perspectiva que usa
 * Studio (drafts), inspecciona también category._ref y el título de categoría,
 * y no depende de una única forma de resolver la referencia.
 *
 * No borra documentos antiguos. Crea/sincroniza artItem + artCategory y marca
 * el catalogItem fuente con migrationDestination = "galeria-de-arte".
 * Es idempotente y puede ejecutarse varias veces.
 */

const isDryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!token) throw new Error("Falta SANITY_API_WRITE_TOKEN. Es necesario incluso para leer la perspectiva de Studio.");

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "drafts",
});

function canonicalId(id = "") {
  return String(id).replace(/^drafts\./, "");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "pieza";
}

function normalizeText(value) {
  return String(value || "").trim().toLocaleLowerCase("es");
}

function artCategoryId(slug) { return `artCategory.${slug}`; }
function artItemId(slug, legacyId) { return `artItem.${slug || slugify(canonicalId(legacyId))}`; }

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
  await client.createIfNotExists(withoutUndefined(doc));
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

const legacyCategories = await client.fetch(`
  *[_type == "catalogCategory"]{
    _id, title, "slug": slug.current
  }
`);

const artCategorySourceIds = new Set(
  (legacyCategories || [])
    .filter((category) => category?.slug === "arte" || normalizeText(category?.title) === "arte")
    .map((category) => canonicalId(category._id)),
);

const allLegacyItems = await client.fetch(`
  *[_type == "catalogItem"] | order(order asc, title asc){
    _id, migrationDestination, title, "slug": slug.current,
    "categoryRef": category._ref,
    "categoryId": category->_id,
    "categoryTitle": category->title,
    "categorySlug": category->slug.current,
    subcategory, origin, region, shortDescription, description,
    mainImage, mainImageAlt, gallery,
    producerOrCreator, availability, process, inquiryMessage,
    price, showPrice, currency, isActive, isFeatured, order
  }
`);

const legacyArtItems = (allLegacyItems || []).filter((item) => {
  const slug = item?.slug || "";
  if (slug === "manualidades") return false;

  const ref = canonicalId(item?.categoryRef || item?.categoryId || "");
  return (
    item?.categorySlug === "arte" ||
    normalizeText(item?.categoryTitle) === "arte" ||
    artCategorySourceIds.has(ref)
  );
});

console.log("============================================================");
console.log("Raíces - Migración reforzada de Galería de Arte");
console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN" : "MIGRACIÓN REAL"}`);
console.log(`Categorías históricas identificadas como Arte: ${artCategorySourceIds.size}`);
console.log(`Piezas históricas detectadas: ${legacyArtItems.length}`);
console.log("");

if (!legacyArtItems.length) {
  console.log("No se detectaron piezas antiguas de Arte. Si Studio todavía muestra pendientes, revisa que este script use el mismo proyecto/dataset que Studio.");
  process.exit(0);
}

const categoryDocs = new Map();
for (const item of legacyArtItems) {
  const title = item.subcategory?.trim() || "Piezas";
  const slug = slugify(title);
  if (!categoryDocs.has(slug)) {
    categoryDocs.set(slug, {
      _id: artCategoryId(slug),
      _type: "artCategory",
      title,
      slug: { _type: "slug", current: slug },
      order: (categoryDocs.size + 1) * 10,
      isVisible: true,
    });
  }
}

for (const category of categoryDocs.values()) {
  console.log(`[categoría] ${category.title} -> ${category._id}`);
  if (!isDryRun) await upsertExact(category, ["title", "slug", "order", "isVisible"]);
}

for (const item of legacyArtItems) {
  const slug = item.slug || slugify(item.title);
  const categorySlug = slugify(item.subcategory?.trim() || "Piezas");
  const sourceId = canonicalId(item._id);
  const destinationId = artItemId(slug, sourceId);
  const doc = {
    _id: destinationId,
    _type: "artItem",
    title: item.title,
    slug: { _type: "slug", current: slug },
    category: { _type: "reference", _ref: artCategoryId(categorySlug) },
    subcategory: item.subcategory,
    origin: item.origin,
    shortDescription: item.shortDescription,
    description: item.description,
    mainImage: item.mainImage,
    mainImageAlt: item.mainImageAlt,
    gallery: item.gallery,
    producerOrCreator: item.producerOrCreator,
    availability: item.availability,
    inquiryMessage: item.inquiryMessage,
    price: item.price,
    showPrice: item.showPrice,
    currency: item.currency,
    isActive: item.isActive,
    isFeatured: item.isFeatured,
    order: item.order,
    sourceCatalogItem: { _type: "reference", _ref: sourceId },
  };

  console.log(`[pieza] ${item.title} -> /galeria-de-arte/${slug}${item.migrationDestination === "galeria-de-arte" ? " (ya marcada; se resincroniza)" : ""}`);

  if (!isDryRun) {
    await upsertExact(doc, [
      "title", "slug", "category", "subcategory", "origin", "shortDescription",
      "description", "mainImage", "mainImageAlt", "gallery", "producerOrCreator",
      "availability", "inquiryMessage", "price", "showPrice", "currency",
      "isActive", "isFeatured", "order", "sourceCatalogItem",
    ]);

    // Marca el documento tal como lo devuelve la perspectiva de Studio. Si el
    // resultado corresponde a un draft, se marca ese draft; si es publicado,
    // se marca el publicado. En ambos casos deja de aparecer como pendiente.
    await client.patch(item._id).set({
      migrationDestination: "galeria-de-arte",
      migratedAt: new Date().toISOString(),
    }).commit();
  }
}

console.log("");
console.log(isDryRun
  ? "Dry run terminado: no se escribió nada. Si ves Cuadros de Lized, Retablos y Toritos de Ayacucho arriba, ejecuta npm run art:split."
  : "Migración de Galería terminada. No se borró ningún documento antiguo. Ejecuta npm run art:split:verify.");
