import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";

// Carga la Carta de Jugos & Smoothies que entregó el cliente: la sección nueva
// con su relato y su recuadro "Personaliza a tu gusto", más sus nueve productos
// repartidos en tres subsecciones.
//
// Uso: npm run jugos:migrate:dry  →  revisar  →  npm run jugos:migrate

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

const seedPath = path.join(process.cwd(), "scripts", "jugos-2026-seed.json");
const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));

// Los mismos límites del schema, para no descubrirlos en rojo dentro del Studio.
const LIMITS = {
  description: 300,
  tagline: 80,
  storyTitle: 120,
  story: 700,
  factsTitle: 60,
  factLabel: 40,
  factValue: 160,
  shortDescription: 220,
};

validateSeed(seed);

function validateSeed(data) {
  const category = data.category;
  if (!category?.slug || !category?.title) throw new Error("La categoría necesita slug y título.");
  for (const field of ["description", "tagline", "storyTitle", "story", "factsTitle"]) {
    const value = category[field];
    if (value && value.length > LIMITS[field]) {
      throw new Error(`El campo ${field} de la categoría supera ${LIMITS[field]} caracteres.`);
    }
  }
  for (const fact of category.facts || []) {
    if (!fact?.label || !fact?.value) throw new Error("Una fila del recuadro no tiene etiqueta o valor.");
    if (fact.label.length > LIMITS.factLabel) throw new Error(`La etiqueta “${fact.label}” es muy larga.`);
    if (fact.value.length > LIMITS.factValue) throw new Error(`El valor de “${fact.label}” es muy largo.`);
  }

  if (!Array.isArray(data.products) || data.products.length === 0) {
    throw new Error("El seed debe traer productos.");
  }
  const slugs = new Set();
  for (const product of data.products) {
    if (!product?.slug || !product?.title) throw new Error("Un producto no tiene slug o título.");
    if (slugs.has(product.slug)) throw new Error(`El slug ${product.slug} está repetido.`);
    slugs.add(product.slug);
    if (typeof product.price !== "number") throw new Error(`${product.slug} no tiene precio numérico.`);
    if (product.shortDescription && product.shortDescription.length > LIMITS.shortDescription) {
      throw new Error(`La descripción de ${product.slug} supera ${LIMITS.shortDescription} caracteres.`);
    }
  }
}

// Sanity exige un _key estable en cada elemento de un array de objetos.
function factKey(label, index) {
  const slug = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "dato"}-${index}`;
}

const categoryId = (slug) => `catalogCategory.${slug}`;
const productId = (slug) => `catalogItem.${slug}`;

const category = seed.category;
const catId = categoryId(category.slug);

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN" : "MIGRACIÓN REAL"}`);
console.log("");

// --- 1. La sección -------------------------------------------------------
const facts = (category.facts || []).map((fact, index) => ({
  _type: "sourcingFact",
  _key: factKey(fact.label, index),
  label: fact.label,
  value: fact.value,
}));

if (isDryRun) {
  console.log(`[sección] ${category.title} (orden ${category.order}, slug ${category.slug})`);
  console.log(`   subtítulo: ${category.tagline}`);
  console.log(`   relato: ${category.story.length} caracteres — “${category.storyTitle}”`);
  console.log(`   recuadro “${category.factsTitle}”:`);
  for (const fact of facts) console.log(`      · ${fact.label}: ${fact.value}`);
} else {
  // createIfNotExists respeta lo que el equipo haya editado antes; el patch de
  // abajo solo fija los campos que trae la carta.
  await client.createIfNotExists({
    _id: catId,
    _type: "catalogCategory",
    title: category.title,
    slug: { _type: "slug", current: category.slug },
    order: category.order,
    isVisible: true,
  });
  await client
    .patch(catId)
    .set({
      title: category.title,
      slug: { _type: "slug", current: category.slug },
      order: category.order,
      description: category.description,
      tagline: category.tagline,
      storyTitle: category.storyTitle,
      story: category.story,
      factsTitle: category.factsTitle,
      sourcingFacts: facts,
      showInPrintedMenu: category.showInPrintedMenu !== false,
      isVisible: true,
    })
    .commit();
  console.log(`[sección] ${category.title} lista — ${facts.length} dato(s) en el recuadro`);
}

// --- 2. Los productos ----------------------------------------------------
console.log("");
let subGroup = null;
for (const product of seed.products) {
  if (product.subcategory !== subGroup) {
    subGroup = product.subcategory;
    console.log(`  ${subGroup}`);
  }

  if (isDryRun) {
    console.log(`   · ${product.title} — S/ ${product.price.toFixed(2)}`);
    console.log(`     ${product.shortDescription}`);
    continue;
  }

  const id = productId(product.slug);
  await client.createIfNotExists({
    _id: id,
    _type: "catalogItem",
    title: product.title,
    slug: { _type: "slug", current: product.slug },
  });
  await client
    .patch(id)
    .set({
      title: product.title,
      slug: { _type: "slug", current: product.slug },
      category: { _type: "reference", _ref: catId },
      subcategory: product.subcategory,
      shortDescription: product.shortDescription,
      price: product.price,
      currency: "PEN",
      showPrice: true,
      isActive: true,
      order: product.order,
    })
    .commit();
  console.log(`   · ${product.title} listo`);
}

console.log("");
console.log(isDryRun ? "Dry run completado. Nada se escribió." : "Migración completada.");
