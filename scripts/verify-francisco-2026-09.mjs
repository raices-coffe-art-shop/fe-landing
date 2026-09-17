import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!token) throw new Error("Falta SANITY_API_WRITE_TOKEN.");

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "drafts" });
const root = process.cwd();
const products = JSON.parse(await fs.readFile(path.join(root, "scripts", "francisco-productos-origen-2026-09.json"), "utf8"));
const art = JSON.parse(await fs.readFile(path.join(root, "scripts", "francisco-galeria-arte-2026-09.json"), "utf8"));

const live = await client.fetch(`{
  "catalogItems": *[_type == "catalogItem" && coalesce(isActive,true) == true && !defined(migrationDestination) && category->slug.current != "arte" && !(category->slug.current in *[_type == "menuCategory"].slug.current)] | order(order asc){_id,title,"slug":slug.current,"category":category->slug.current,presentations,price,showPrice,currency,mainImage},
  "catalogCategories": *[_type == "catalogCategory" && coalesce(isVisible,true) == true && slug.current != "arte" && !(slug.current in *[_type == "menuCategory"].slug.current)] | order(order asc){_id,title,"slug":slug.current,image},
  "artItems": *[_type == "artItem" && coalesce(isActive,true) == true] | order(order asc){_id,title,"slug":slug.current,"category":category->slug.current,mainImage},
  "artCategories": *[_type == "artCategory" && coalesce(isVisible,true) == true] | order(order asc){_id,title,"slug":slug.current},
  "menuCounts": {"items": count(*[_type == "menuItem"]), "categories": count(*[_type == "menuCategory"])}
}`);

const failures = [];
function compareSet(label, expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  for (const value of expectedSet) if (!actualSet.has(value)) failures.push(`${label}: falta ${value}`);
  for (const value of actualSet) if (!expectedSet.has(value)) failures.push(`${label}: sobra activo ${value}`);
}

compareSet("categorías de Productos de Origen", products.categories.map((x) => x.slug), live.catalogCategories.map((x) => x.slug));
compareSet("productos", products.products.map((x) => x.slug), live.catalogItems.map((x) => x.slug));
compareSet("categorías de Galería", [art.category.slug], live.artCategories.map((x) => x.slug));
compareSet("piezas de Galería", art.items.map((x) => x.slug), live.artItems.map((x) => x.slug));

const itemsBySlug = new Map(live.catalogItems.map((item) => [item.slug, item]));
for (const expected of products.products) {
  const actual = itemsBySlug.get(expected.slug);
  if (!actual) continue;
  if (actual.category !== expected.categorySlug) failures.push(`${expected.slug}: categoría ${actual.category} != ${expected.categorySlug}`);
  const expectedPrice = typeof expected.price === "number" ? expected.price : undefined;
  const actualPrice = typeof actual.price === "number" ? actual.price : undefined;
  if (actualPrice !== expectedPrice) failures.push(`${expected.slug}: precio ${actualPrice ?? "—"} != ${expectedPrice ?? "Consultar"}`);
  const expectedShow = typeof expected.price === "number" ? expected.showPrice !== false : false;
  if (Boolean(actual.showPrice) !== expectedShow) failures.push(`${expected.slug}: showPrice incorrecto`);
  if (!actual.mainImage?.asset?._ref) failures.push(`${expected.slug}: falta imagen principal`);
}

for (const item of live.artItems) {
  if (!item.mainImage?.asset?._ref) failures.push(`${item.slug}: falta imagen principal de Galería`);
}

console.log("============================================================");
console.log("Verificación — entrega Francisco 17/09/2026");
console.log(`Carta (solo control de aislamiento): ${live.menuCounts?.categories ?? 0} categorías / ${live.menuCounts?.items ?? 0} ítems`);
console.log(`Productos de Origen activos: ${live.catalogCategories.length} categorías / ${live.catalogItems.length} productos`);
console.log(`Galería activa: ${live.artCategories.length} categoría(s) / ${live.artItems.length} piezas`);
console.log(`Incidencias: ${failures.length}`);

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("OK: el contenido público coincide exactamente con la entrega documentada de Francisco y Carta sigue en su modelo independiente.");
}
