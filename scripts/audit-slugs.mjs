import process from "node:process";
import { createRequire } from "node:module";
import { createClient } from "next-sanity";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID en .env.local.");

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-02-19",
  useCdn: false,
  token,
  perspective: "raw",
});

const docs = await client.fetch(`*[
  _type in ["catalogItem", "catalogCategory"] && defined(slug.current)
]{
  _id,
  _type,
  title,
  "slug": slug.current
}`);

function canonicalId(id) {
  return id.replace(/^drafts\./, "").replace(/^versions\.[^.]+\./, "");
}

const groups = new Map();
const unusual = [];

for (const doc of docs) {
  const slug = String(doc.slug || "").trim();
  if (!slug) continue;

  if (slug.includes("/") || /\s/.test(slug)) {
    unusual.push({ tipo: doc._type, titulo: doc.title || "—", slug, id: doc._id });
  }

  const key = `${doc._type}\u0000${slug.toLocaleLowerCase("es")}`;
  const group = groups.get(key) || new Map();
  const canonical = canonicalId(doc._id);
  if (!group.has(canonical)) group.set(canonical, []);
  group.get(canonical).push(doc);
  groups.set(key, group);
}

const duplicates = [];
for (const [key, canonicalDocs] of groups) {
  // Publicado + borrador del MISMO documento no es un duplicado.
  if (canonicalDocs.size <= 1) continue;
  const [type, slug] = key.split("\u0000");
  duplicates.push({
    tipo: type,
    slug,
    documentosDistintos: canonicalDocs.size,
    documentos: [...canonicalDocs.values()].map((versions) => ({
      titulo: versions[0]?.title || "—",
      idBase: canonicalId(versions[0]._id),
      versiones: versions.map((version) => version._id),
    })),
  });
}

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Documentos con slug revisados: ${docs.length}`);

if (duplicates.length === 0) {
  console.log("\n✓ No hay slugs repetidos entre documentos distintos del mismo tipo.");
} else {
  console.error(`\n✗ Se encontraron ${duplicates.length} slug(s) repetido(s) reales:`);
  console.dir(duplicates, { depth: null });
  process.exitCode = 1;
}

if (unusual.length > 0) {
  console.warn("\nAviso: estos slugs contienen / o espacios. Conviene regenerarlos sin la barra inicial:");
  console.table(unusual);
}
