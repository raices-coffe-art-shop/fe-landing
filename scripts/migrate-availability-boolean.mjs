import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const dryRun = process.argv.includes("--dry-run");

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!dataset) throw new Error("Falta NEXT_PUBLIC_SANITY_DATASET.");
if (!dryRun && !token) throw new Error("Falta SANITY_API_WRITE_TOKEN para escribir cambios.");

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02",
  useCdn: false,
  token,
});

const TRUE_VALUES = new Set(["si", "sí", "true", "disponible", "en stock", "stock"]);
const FALSE_VALUES = new Set(["no", "false", "agotado", "no disponible", "sin stock"]);

function normalizeLegacyAvailability(value) {
  if (typeof value === "boolean") return { action: "keep", value };
  if (typeof value !== "string") return { action: "unset" };

  const normalized = value.trim().toLowerCase();
  if (!normalized) return { action: "unset" };
  if (TRUE_VALUES.has(normalized)) return { action: "set", value: true };
  if (FALSE_VALUES.has(normalized)) return { action: "set", value: false };

  // Un texto ambiguo (p. ej. “Consultar disponibilidad”) no se convierte a
  // Sí o No automáticamente para evitar publicar una afirmación incorrecta.
  return { action: "unset", ambiguous: true };
}

const docs = await client.fetch(
  `*[_type == "catalogItem" && defined(availability)]{_id, title, availability}`,
);

let changed = 0;
let ambiguous = 0;

for (const doc of docs) {
  const result = normalizeLegacyAvailability(doc.availability);
  if (result.action === "keep") continue;

  changed += 1;
  if (result.ambiguous) ambiguous += 1;

  const label = `${doc.title || doc._id} (${JSON.stringify(doc.availability)})`;
  if (result.action === "set") {
    console.log(`${dryRun ? "[dry] " : ""}${label} -> ${result.value ? "Sí" : "No"}`);
    if (!dryRun) await client.patch(doc._id).set({ availability: result.value }).commit();
  } else {
    console.log(`${dryRun ? "[dry] " : ""}${label} -> se deja sin seleccionar${result.ambiguous ? " (valor anterior ambiguo)" : ""}`);
    if (!dryRun) await client.patch(doc._id).unset(["availability"]).commit();
  }
}

console.log(`\nRevisados: ${docs.length}. Cambios: ${changed}. Valores ambiguos: ${ambiguous}.`);
if (ambiguous > 0) {
  console.log("Los valores ambiguos se dejaron vacíos para que una persona elija Sí o No en Sanity sin inventar disponibilidad.");
}
