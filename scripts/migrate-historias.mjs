import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";

// Carga las historias de origen de cada sección de la carta, transcritas de los
// PDFs del cliente, y aplica los cambios del PDF final de sándwiches:
// se oculta el "Maní Energético & Plátano" (ya no está en la carta) y se
// actualiza la descripción de "Palta con Pollo".
//
// Uso: npm run historias:migrate:dry  →  revisar  →  npm run historias:migrate

const isDryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!isDryRun && !token) {
  throw new Error("Falta SANITY_API_WRITE_TOKEN. Usa un token privado de escritura solo para la migración.");
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const seedPath = path.join(process.cwd(), "scripts", "historias-2026-seed.json");
const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));

validateSeed(seed);

function validateSeed(data) {
  if (!Array.isArray(data.historias)) throw new Error("El seed debe contener un array historias.");
  for (const item of data.historias) {
    const required = ["categorySlug", "story"];
    const missing = required.filter((field) => !item?.[field]);
    if (missing.length) {
      throw new Error(`Historia de ${item?.categorySlug || "sin slug"} incompleta: ${missing.join(", ")}`);
    }
    // Los límites del schema: si el texto los supera, el Studio lo marcaría en rojo.
    if (item.story.length > 700) throw new Error(`La historia de ${item.categorySlug} supera 700 caracteres.`);
    if (item.storyTitle && item.storyTitle.length > 120) {
      throw new Error(`El título de la historia de ${item.categorySlug} supera 120 caracteres.`);
    }
    if (item.sourcing && item.sourcing.length > 400) {
      throw new Error(`Los insumos de ${item.categorySlug} superan 400 caracteres.`);
    }
  }
}

const categoryId = (slug) => `catalogCategory.${slug}`;
const productId = (slug) => `catalogItem.${slug}`;

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN" : "MIGRACIÓN REAL"}`);
console.log(
  `Historias: ${seed.historias.length} · Bajas: ${(seed.deactivate || []).length} · Ajustes: ${(seed.productUpdates || []).length}`,
);
console.log("");

// --- 1. Historias por sección --------------------------------------------
for (const item of seed.historias) {
  const id = categoryId(item.categorySlug);

  if (isDryRun) {
    console.log(`[historia] ${item.categoryName || item.categorySlug}`);
    console.log(`   título: ${item.storyTitle || "—"}`);
    console.log(`   relato: ${item.story.length} caracteres`);
    if (item.sourcing) console.log(`   insumos: ${item.sourcing.length} caracteres`);
    continue;
  }

  const existing = await client.getDocument(id);
  if (!existing) {
    console.log(`[historia] ${item.categorySlug} no existe en Sanity, se omite`);
    continue;
  }

  const patch = { story: item.story };
  if (item.storyTitle) patch.storyTitle = item.storyTitle;
  if (item.sourcing) patch.sourcing = item.sourcing;
  await client.patch(id).set(patch).commit();
  console.log(`[historia] ${item.categoryName || item.categorySlug} lista`);
}

// --- 2. Productos que la carta final ya no incluye ------------------------
for (const item of seed.deactivate || []) {
  const id = productId(item.slug);
  if (isDryRun) {
    console.log(`[baja] ${item.slug} quedará oculto — ${item.motivo}`);
    continue;
  }
  const existing = await client.getDocument(id);
  if (!existing) continue;
  await client.patch(id).set({ isActive: false }).commit();
  console.log(`[baja] ${item.slug} oculto`);
}

// --- 3. Ajustes de texto de la carta final --------------------------------
for (const item of seed.productUpdates || []) {
  const id = productId(item.slug);
  if (isDryRun) {
    console.log(`[ajuste] ${item.slug}: nueva descripción`);
    continue;
  }
  const existing = await client.getDocument(id);
  if (!existing) continue;
  const patch = {};
  if (item.shortDescription) patch.shortDescription = item.shortDescription;
  if (item.title) patch.title = item.title;
  if (typeof item.price === "number") patch.price = item.price;
  await client.patch(id).set(patch).commit();
  console.log(`[ajuste] ${item.slug} actualizado`);
}

console.log("");
console.log(isDryRun ? "Dry run completado. Nada se escribió." : "Migración completada.");
