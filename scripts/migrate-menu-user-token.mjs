import process from "node:process";
import { getCliClient } from "sanity/cli";

/**
 * Migración de Carta ejecutada dentro del contexto de Sanity CLI.
 * Usa la sesión del usuario con `sanity exec --with-user-token`, por lo que
 * no depende de SANITY_API_WRITE_TOKEN.
 *
 * Dry run:
 *   npx sanity exec scripts/migrate-menu-user-token.mjs --with-user-token -- --dry-run
 * Migración real:
 *   npx sanity exec scripts/migrate-menu-user-token.mjs --with-user-token
 */

const dryRun = process.argv.includes("--dry-run");
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const client = getCliClient({ apiVersion }).withConfig({ useCdn: false, perspective: "published" });

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "elemento";
}

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, child]) => child !== undefined)
      .map(([key, child]) => [key, clean(child)]),
  );
}

const before = await client.fetch(`{
  "menuItems": count(*[_type == "menuItem"]),
  "menuCategories": count(*[_type == "menuCategory"]),
  "legacyItems": count(*[_type == "catalogItem" && coalesce(category->showInPrintedMenu, true) == true && category->slug.current != "arte"]),
  "legacyCategories": count(*[_type == "catalogCategory" && coalesce(showInPrintedMenu, true) == true && slug.current != "arte"])
}`);

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
    _id, title, "slug": slug.current,
    "categoryId": category->_id,
    "categoryTitle": category->title,
    "categorySlug": category->slug.current,
    subcategory, shortDescription, mainImage, mainImageAlt,
    price, showPrice, currency, isActive, order
  }
`);

console.log("============================================================");
console.log("RAÍCES — MIGRACIÓN DE CARTA CON USUARIO DE SANITY");
console.log(`Modo: ${dryRun ? "SIMULACIÓN" : "ESCRITURA REAL"}`);
console.log(`Antes: ${before.menuCategories} categorías Carta · ${before.menuItems} elementos Carta`);
console.log(`Origen detectado: ${categories.length} categorías · ${items.length} elementos`);
console.log("============================================================\n");

if (!categories.length) {
  throw new Error("No se encontraron categorías históricas de Carta. No se escribió nada.");
}
if (!items.length) {
  throw new Error("No se encontraron elementos históricos de Carta. No se escribió nada.");
}

const categoryTargetBySource = new Map();
for (const category of categories) {
  const slug = category.slug || slugify(category.title);
  const targetId = `menuCategory.${slug}`;
  categoryTargetBySource.set(category._id, targetId);

  console.log(`[Categoría] ${category.title} -> ${targetId}`);

  if (!dryRun) {
    await client.createOrReplace(clean({
      _id: targetId,
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
    }));
  }
}

let copied = 0;
let skipped = 0;
for (const item of items) {
  const categoryRef = categoryTargetBySource.get(item.categoryId);
  if (!categoryRef) {
    console.warn(`[OMITIDO] ${item.title}: no se pudo resolver su categoría ${item.categoryTitle || item.categoryId}.`);
    skipped += 1;
    continue;
  }

  const slug = item.slug || slugify(item.title);
  const targetId = `menuItem.${slug}`;
  console.log(`[Elemento] ${item.title} · ${item.categoryTitle || item.categorySlug || "sin categoría"}${typeof item.price === "number" ? ` · ${item.currency === "USD" ? "$" : "S/"} ${item.price}` : ""}`);

  if (!dryRun) {
    await client.createOrReplace(clean({
      _id: targetId,
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
      sourceCatalogItem: { _type: "reference", _ref: item._id },
    }));

    // Solo marcamos el origen DESPUÉS de crear correctamente el destino.
    await client
      .patch(item._id)
      .set({ migrationDestination: "carta", migratedAt: new Date().toISOString() })
      .commit();
  }
  copied += 1;
}

if (dryRun) {
  console.log(`\nSIMULACIÓN COMPLETA: se crearían ${categories.length} categorías y ${copied} elementos.`);
  if (skipped) console.log(`ADVERTENCIA: ${skipped} elemento(s) quedarían omitidos por categoría no resuelta.`);
  console.log("No se modificó Sanity.");
  process.exit(0);
}

const after = await client.fetch(`{
  "menuItems": count(*[_type == "menuItem"]),
  "menuCategories": count(*[_type == "menuCategory"]),
  "brokenReferences": count(*[_type == "menuItem" && !defined(category->_id)]),
  "withoutSource": count(*[_type == "menuItem" && !defined(sourceCatalogItem->_id)])
}`);

console.log("\n============================================================");
console.log("VERIFICACIÓN INMEDIATA");
console.log(`Categorías de la Carta creadas: ${after.menuCategories}`);
console.log(`Elementos de la Carta creados:   ${after.menuItems}`);
console.log(`Referencias de categoría rotas:  ${after.brokenReferences}`);
console.log(`Elementos sin origen guardado:   ${after.withoutSource}`);
console.log("============================================================");

if (after.menuCategories === 0 || after.menuItems === 0) {
  throw new Error("La escritura terminó pero Sanity sigue sin documentos de Carta. No continúes: copia esta salida.");
}
if (after.brokenReferences > 0) {
  throw new Error(`Hay ${after.brokenReferences} elemento(s) con referencia de categoría rota.`);
}

console.log("\nOK: los documentos nuevos existen realmente en el dataset.");
console.log("Abre /studio > Carta y haz Ctrl+F5.");
