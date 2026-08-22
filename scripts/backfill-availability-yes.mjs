import process from "node:process";
import { createRequire } from "node:module";
import { createClient } from "next-sanity";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dryRun = process.argv.includes("--dry-run");

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID en .env.local.");
if (!dryRun && !token) {
  throw new Error("Falta SANITY_API_WRITE_TOKEN en .env.local para modificar los productos.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02",
  useCdn: false,
  token,
  perspective: "raw",
});

// Incluimos publicados y drafts. La intención de esta migración puntual es
// exactamente la solicitada: todos los productos que ya existen parten como
// disponibles (Sí), independientemente de que el campo fuera antiguo, faltara
// o tuviera otro valor.
const docs = await client.fetch(`*[_type == "catalogItem"]{
  _id,
  title,
  availability
}`);

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Versiones de productos encontradas: ${docs.length}`);

const toChange = docs.filter((doc) => doc.availability !== true);

if (toChange.length === 0) {
  console.log("\n✓ Todos los productos ya tienen disponibilidad = Sí.");
  process.exit(0);
}

console.log(`\n${dryRun ? "Se cambiarían" : "Se cambiarán"} ${toChange.length} versión(es) a disponibilidad = Sí:`);
for (const doc of toChange) {
  console.log(`- ${doc.title || "Producto sin título"} · ${doc._id} · valor anterior: ${JSON.stringify(doc.availability)}`);
}

if (dryRun) {
  console.log("\nDry run: no se modificó Sanity.");
  process.exit(0);
}

// 100 mutaciones por transacción es un margen conservador; para este proyecto
// normalmente habrá muchas menos.
const chunkSize = 100;
for (let i = 0; i < toChange.length; i += chunkSize) {
  const chunk = toChange.slice(i, i + chunkSize);
  let tx = client.transaction();
  for (const doc of chunk) {
    tx = tx.patch(doc._id, (patch) => patch.set({ availability: true }));
  }
  await tx.commit();
}

const remaining = await client.fetch(
  `count(*[_type == "catalogItem" && availability != true])`,
  {},
  { perspective: "raw" },
);

if (remaining === 0) {
  console.log("\n✓ Listo: todos los productos existentes tienen disponibilidad = Sí.");
} else {
  console.error(`\n✗ Quedaron ${remaining} versión(es) sin disponibilidad = Sí.`);
  process.exitCode = 1;
}
