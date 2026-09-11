import process from "node:process";
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!token) throw new Error("Falta SANITY_API_WRITE_TOKEN.");

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "drafts" });
const canonicalId = (id = "") => String(id).replace(/^drafts\./, "");
const normalizeText = (v) => String(v || "").trim().toLocaleLowerCase("es");

const categories = await client.fetch(`*[_type == "catalogCategory"]{_id,title,"slug":slug.current}`);
const artCategorySourceIds = new Set((categories || [])
  .filter((c) => c?.slug === "arte" || normalizeText(c?.title) === "arte")
  .map((c) => canonicalId(c._id)));

const legacy = await client.fetch(`
  *[_type == "catalogItem"]{
    _id, title, "slug":slug.current, migrationDestination,
    "categoryRef":category._ref, "categoryId":category->_id,
    "categorySlug":category->slug.current, "categoryTitle":category->title
  }
`);

const source = (legacy || []).filter((item) => {
  if (item?.slug === "manualidades") return false;
  const ref = canonicalId(item?.categoryRef || item?.categoryId || "");
  return item?.categorySlug === "arte" || normalizeText(item?.categoryTitle) === "arte" || artCategorySourceIds.has(ref);
});

const targets = await client.fetch(`
  *[_type == "artItem"]{
    _id, title, "slug":slug.current, "sourceId":sourceCatalogItem->_id,
    "categoryId":category->_id
  }
`);

const targetBySource = new Map((targets || []).map((doc) => [canonicalId(doc.sourceId), doc]));
const failures = [];

for (const item of source) {
  const sourceId = canonicalId(item._id);
  if (item.migrationDestination !== "galeria-de-arte") {
    failures.push(`${item.title}: el documento antiguo todavía no está marcado como migrado`);
  }
  const target = targetBySource.get(sourceId);
  if (!target) failures.push(`${item.title}: no existe su artItem destino`);
  else if (!target.categoryId) failures.push(`${item.title}: su artItem no tiene categoría`);
}

console.log("============================================================");
console.log("Verificación de Galería de Arte");
console.log(`Piezas antiguas de Arte detectadas: ${source.length}`);
console.log(`Piezas nuevas artItem: ${targets.length}`);
console.log(`Pendientes detectados: ${failures.length}`);
console.log("");

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("OK: todas las piezas antiguas de Arte tienen destino en Galería y dejaron de estar pendientes.");
}
