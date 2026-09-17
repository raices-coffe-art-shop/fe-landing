import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";

const isDryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!token) throw new Error("Falta SANITY_API_WRITE_TOKEN. El script necesita leer la perspectiva de Studio y escribir solo fuera de dry-run.");

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "drafts" });
const root = process.cwd();
const productSeed = JSON.parse(await fs.readFile(path.join(root, "scripts", "francisco-productos-origen-2026-09.json"), "utf8"));
const artSeed = JSON.parse(await fs.readFile(path.join(root, "scripts", "francisco-galeria-arte-2026-09.json"), "utf8"));

const catalogCategoryId = (slug) => `catalogCategory.${slug}`;
const catalogItemId = (slug) => `catalogItem.${slug}`;
const artCategoryId = (slug) => `artCategory.${slug}`;
const artItemId = (slug) => `artItem.${slug}`;
const canonicalId = (id = "") => String(id).replace(/^drafts\./, "");

function withoutUndefined(value) {
  if (Array.isArray(value)) return value.map(withoutUndefined);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([, child]) => child !== undefined)
    .map(([key, child]) => [key, withoutUndefined(child)]));
}

function textToPortableText(...paragraphs) {
  return paragraphs
    .filter((paragraph) => typeof paragraph === "string" && paragraph.trim())
    .map((paragraph, index) => ({
      _type: "block",
      _key: `p-${index + 1}`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `s-${index + 1}`, text: paragraph.trim(), marks: [] }],
    }));
}

function validateSeed() {
  if (!Array.isArray(productSeed.categories) || !Array.isArray(productSeed.products)) throw new Error("Seed de Productos de Origen inválido.");
  if (!artSeed?.category || !Array.isArray(artSeed.items)) throw new Error("Seed de Galería inválido.");
  const categorySlugs = new Set(productSeed.categories.map((category) => category.slug));
  if (categorySlugs.size !== productSeed.categories.length) throw new Error("Hay categorías de Productos de Origen duplicadas.");
  const productSlugs = new Set();
  for (const product of productSeed.products) {
    if (productSlugs.has(product.slug)) throw new Error(`Producto duplicado: ${product.slug}`);
    productSlugs.add(product.slug);
    if (!categorySlugs.has(product.categorySlug)) throw new Error(`Categoría inexistente para ${product.slug}: ${product.categorySlug}`);
  }
  const artSlugs = new Set(artSeed.items.map((item) => item.slug));
  if (artSlugs.size !== artSeed.items.length) throw new Error("Hay piezas de Galería duplicadas.");
}

validateSeed();

for (const file of [
  ...productSeed.categories.map((category) => category.image).filter(Boolean),
  ...productSeed.products.map((product) => product.image).filter(Boolean),
  ...artSeed.items.map((item) => item.image).filter(Boolean),
]) {
  await fs.access(path.join(root, file));
}

const officialCatalogCategoryIds = new Set(productSeed.categories.map((category) => catalogCategoryId(category.slug)));
const officialCatalogItemIds = new Set(productSeed.products.map((product) => catalogItemId(product.slug)));
const officialArtCategoryIds = new Set([artCategoryId(artSeed.category.slug)]);
const officialArtItemIds = new Set(artSeed.items.map((item) => artItemId(item.slug)));

const current = await client.fetch(`{
  "catalogItems": *[_type == "catalogItem" && !defined(migrationDestination) && category->slug.current != "arte" && !(category->slug.current in *[_type == "menuCategory"].slug.current)]{_id,title,"slug":slug.current},
  "catalogCategories": *[_type == "catalogCategory" && slug.current != "arte" && !(slug.current in *[_type == "menuCategory"].slug.current)]{_id,title,"slug":slug.current},
  "artItems": *[_type == "artItem"]{_id,title,"slug":slug.current,isActive},
  "artCategories": *[_type == "artCategory"]{_id,title,"slug":slug.current,isVisible},
  "menuCounts": {"items": count(*[_type == "menuItem"]), "categories": count(*[_type == "menuCategory"])}
}`);

const catalogItemsToArchive = (current.catalogItems || []).filter((doc) => !officialCatalogItemIds.has(canonicalId(doc._id)));
const catalogCategoriesToHide = (current.catalogCategories || []).filter((doc) => !officialCatalogCategoryIds.has(canonicalId(doc._id)));
const artItemsToArchive = (current.artItems || []).filter((doc) => !officialArtItemIds.has(canonicalId(doc._id)));
const artCategoriesToHide = (current.artCategories || []).filter((doc) => !officialArtCategoryIds.has(canonicalId(doc._id)));

console.log("============================================================");
console.log("Raíces — actualización Francisco 17/09/2026");
console.log(`Proyecto/dataset: ${projectId}/${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN (sin escrituras)" : "MIGRACIÓN REAL"}`);
console.log(`Carta aislada: ${current.menuCounts?.categories ?? 0} categorías / ${current.menuCounts?.items ?? 0} ítems (no se modifican)`);
console.log(`Productos de Origen oficiales: ${productSeed.categories.length} categorías / ${productSeed.products.length} productos`);
console.log(`Galería oficial: 1 categoría / ${artSeed.items.length} piezas`);
console.log(`Se ocultarán del catálogo público: ${catalogCategoriesToHide.length} categorías / ${catalogItemsToArchive.length} productos anteriores`);
console.log(`Se ocultarán de Galería pública: ${artCategoriesToHide.length} categorías / ${artItemsToArchive.length} piezas anteriores`);

for (const doc of catalogItemsToArchive) console.log(`[archivar producto] ${doc.title} (${doc.slug || doc._id})`);
for (const doc of catalogCategoriesToHide) console.log(`[ocultar categoría] ${doc.title} (${doc.slug || doc._id})`);
for (const doc of artItemsToArchive) console.log(`[archivar arte] ${doc.title} (${doc.slug || doc._id})`);
for (const doc of artCategoriesToHide) console.log(`[ocultar categoría arte] ${doc.title} (${doc.slug || doc._id})`);

if (isDryRun) {
  console.log("\nDry run finalizado. No se modificó Sanity.");
  process.exit(0);
}

for (const doc of catalogItemsToArchive) {
  await client.patch(doc._id).set({ isActive: false }).commit();
}
for (const doc of catalogCategoriesToHide) {
  await client.patch(doc._id).set({ isVisible: false }).commit();
}
for (const doc of artItemsToArchive) {
  await client.patch(doc._id).set({ isActive: false }).commit();
}
for (const doc of artCategoriesToHide) {
  await client.patch(doc._id).set({ isVisible: false }).commit();
}

const uploadedAssets = new Map();
async function getImageAsset(relativePath) {
  if (!relativePath) return undefined;
  if (uploadedAssets.has(relativePath)) return uploadedAssets.get(relativePath);
  const absolutePath = path.join(root, relativePath);
  const filename = `francisco-2026-09-${path.basename(relativePath)}`;
  const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`, { filename });
  const asset = existing?._id
    ? existing
    : await client.assets.upload("image", await fs.readFile(absolutePath), { filename });
  uploadedAssets.set(relativePath, asset);
  return asset;
}

function imageRef(asset) {
  return asset?._id ? { _type: "image", asset: { _type: "reference", _ref: asset._id } } : undefined;
}

for (const category of productSeed.categories) {
  const asset = await getImageAsset(category.image);
  await client.createOrReplace(withoutUndefined({
    _id: catalogCategoryId(category.slug),
    _type: "catalogCategory",
    title: category.title,
    slug: { _type: "slug", current: category.slug },
    description: category.description,
    image: imageRef(asset),
    imageAlt: category.imageAlt,
    order: category.order,
    isVisible: true,
    showInPrintedMenu: false,
  }));
}

for (const product of productSeed.products) {
  const asset = await getImageAsset(product.image);
  await client.createOrReplace(withoutUndefined({
    _id: catalogItemId(product.slug),
    _type: "catalogItem",
    title: product.title,
    slug: { _type: "slug", current: product.slug },
    category: { _type: "reference", _ref: catalogCategoryId(product.categorySlug) },
    subcategory: product.subcategory,
    origin: product.origin || "Ayacucho",
    region: product.region || undefined,
    shortDescription: product.shortDescription,
    description: textToPortableText(product.story || product.shortDescription),
    mainImage: imageRef(asset),
    mainImageAlt: product.mainImageAlt || product.title,
    producerOrCreator: product.producerOrCreator || undefined,
    presentations: product.presentations || [],
    availability: product.availability !== false,
    process: product.process,
    ingredients: product.ingredients || [],
    allergens: product.allergens || [],
    verifiedClaims: product.verifiedClaims || [],
    inquiryMessage: product.inquiryMessage,
    price: typeof product.price === "number" ? product.price : undefined,
    showPrice: typeof product.price === "number" ? product.showPrice !== false : false,
    currency: product.currency === "USD" ? "USD" : "PEN",
    isActive: product.isActive !== false,
    isFeatured: product.isFeatured === true,
    order: product.order,
    seo: {
      _type: "seo",
      title: `${product.title} — Productos de Origen — Raíces`,
      description: product.shortDescription,
    },
  }));
}

await client.createOrReplace(withoutUndefined({
  _id: artCategoryId(artSeed.category.slug),
  _type: "artCategory",
  title: artSeed.category.title,
  slug: { _type: "slug", current: artSeed.category.slug },
  description: artSeed.category.description,
  order: artSeed.category.order,
  isVisible: true,
}));

for (const item of artSeed.items) {
  const asset = await getImageAsset(item.image);
  await client.createOrReplace(withoutUndefined({
    _id: artItemId(item.slug),
    _type: "artItem",
    title: item.title,
    slug: { _type: "slug", current: item.slug },
    category: { _type: "reference", _ref: artCategoryId(artSeed.category.slug) },
    subcategory: item.subcategory,
    origin: item.origin || "Quinua, Ayacucho",
    shortDescription: item.shortDescription,
    description: textToPortableText(item.story || item.shortDescription),
    mainImage: imageRef(asset),
    mainImageAlt: item.mainImageAlt || item.title,
    producerOrCreator: item.producerOrCreator,
    availability: true,
    price: undefined,
    showPrice: false,
    currency: "PEN",
    isActive: true,
    order: item.order,
  }));
}

console.log("\nActualización terminada. Los registros anteriores se conservaron ocultos; no se borraron datos históricos.");
console.log("Ejecuta: npm run francisco:verify");
