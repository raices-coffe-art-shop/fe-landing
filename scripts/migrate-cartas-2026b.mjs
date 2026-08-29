import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";

// Segunda entrega de cartas del cliente (agosto 2026):
//  · Sándwiches (16) y Bebidas Andinas (7), cartas nuevas.
//  · Corrección de la chocolatería: la productora es la Ing. Agroforestal
//    Dina Torres Barboza, de Agroindustrias Campos del Valle. El PDF anterior
//    decía "Dina Campos" confundiendo su apellido con el de la empresa.
//  · Reorganización a dos niveles: los 15 cafés pasan de cuatro categorías
//    sueltas a la sección "Café" con su antigua categoría como subsección.
//
// Uso: npm run cartas:migrate:dry  →  revisar  →  npm run cartas:migrate

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

const seedPath = path.join(process.cwd(), "scripts", "cartas-2026b-seed.json");
const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));

validateSeed(seed);

function validateSeed(data) {
  if (!Array.isArray(data.categories) || !Array.isArray(data.products)) {
    throw new Error("El seed debe contener arrays categories y products.");
  }

  const categorySlugs = new Set(data.categories.map((category) => category.slug));
  for (const update of data.categoryUpdates || []) categorySlugs.add(update.slug);

  const productSlugs = new Set();
  for (const product of data.products) {
    const required = ["slug", "title", "categorySlug", "shortDescription"];
    const missing = required.filter((field) => !product?.[field]);
    if (missing.length) throw new Error(`Producto ${product?.slug || "sin slug"} incompleto: ${missing.join(", ")}`);
    if (productSlugs.has(product.slug)) throw new Error(`Producto duplicado: ${product.slug}`);
    if (!categorySlugs.has(product.categorySlug)) {
      throw new Error(`El producto ${product.slug} referencia una categoría inexistente: ${product.categorySlug}`);
    }
    if (typeof product.price !== "number" || product.price <= 0) {
      throw new Error(`Precio inválido en ${product.slug}: ${product.price}`);
    }
    productSlugs.add(product.slug);
  }

  for (const item of data.reassign || []) {
    if (!item.slug || !item.categorySlug) {
      throw new Error(`Reasignación incompleta: ${JSON.stringify(item)}`);
    }
  }
}

const categoryId = (slug) => `catalogCategory.${slug}`;
const productId = (slug) => `catalogItem.${slug}`;

function textToPortableText(...paragraphs) {
  return paragraphs
    .filter((paragraph) => typeof paragraph === "string" && paragraph.trim())
    .map((paragraph, index) => ({
      _type: "block",
      _key: `paragraph-${index + 1}`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `span-${index + 1}`, text: paragraph.trim(), marks: [] }],
    }));
}

function buildDescription(product) {
  const origen = seed.origenes?.[product.origen];
  if (!origen) return textToPortableText(product.shortDescription);
  return textToPortableText(product.shortDescription, origen.historia, origen.ficha, origen.cata);
}

const originByFamily = {
  cafe: "Ayna - San Francisco, VRAEM (Ayacucho)",
  cacao: "Pichari, VRAEM (Cusco)",
  sandwiches: "Ayacucho",
  andinas: "Ayacucho",
};

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN" : "MIGRACIÓN REAL"}`);
console.log(
  `Categorías nuevas: ${seed.categories.length} · Productos nuevos: ${seed.products.length} · Reasignaciones: ${(seed.reassign || []).length}`,
);
console.log("");

// --- 1. Categorías nuevas -----------------------------------------------
for (const category of seed.categories) {
  const id = categoryId(category.slug);
  if (isDryRun) {
    console.log(`[categoría] ${id} — "${category.title}" (orden ${category.order})`);
    continue;
  }
  await client.createIfNotExists({
    _id: id,
    _type: "catalogCategory",
    title: category.title,
    slug: { _type: "slug", current: category.slug },
    description: category.description,
    order: category.order,
    isVisible: true,
    showInPrintedMenu: category.showInPrintedMenu !== false,
  });
  await client
    .patch(id)
    .set({
      title: category.title,
      description: category.description,
      order: category.order,
      showInPrintedMenu: category.showInPrintedMenu !== false,
    })
    .commit();
  console.log(`[categoría] ${category.title} lista`);
}

// --- 2. Ajustes a categorías existentes ----------------------------------
for (const update of seed.categoryUpdates || []) {
  const id = categoryId(update.slug);
  if (isDryRun) {
    const cambios = [
      update.title ? `título → "${update.title}"` : null,
      update.newSlug ? `slug → ${update.newSlug}` : null,
      typeof update.order === "number" ? `orden → ${update.order}` : null,
      update.isVisible === false ? "se OCULTA" : null,
      update.showInPrintedMenu === false ? "fuera de la carta" : null,
    ].filter(Boolean);
    console.log(`[categoría existente] ${update.slug}: ${cambios.join(", ") || "sin cambios"}`);
    continue;
  }
  const existing = await client.getDocument(id);
  if (!existing) {
    console.log(`[categoría existente] ${update.slug} no existe en Sanity, se omite`);
    continue;
  }
  const patch = {};
  if (update.title) patch.title = update.title;
  if (update.description) patch.description = update.description;
  if (typeof update.order === "number") patch.order = update.order;
  if (typeof update.isVisible === "boolean") patch.isVisible = update.isVisible;
  if (typeof update.showInPrintedMenu === "boolean") patch.showInPrintedMenu = update.showInPrintedMenu;
  // El _id se conserva siempre: las referencias de los productos no se rompen.
  if (update.newSlug) patch.slug = { _type: "slug", current: update.newSlug };
  await client.patch(id).set(patch).commit();
  console.log(`[categoría existente] ${update.slug} actualizada`);
}

// --- 3. Reasignación de productos ya cargados ----------------------------
for (const item of seed.reassign || []) {
  const id = productId(item.slug);
  if (isDryRun) {
    const destino = item.subcategory ? `${item.categorySlug} › ${item.subcategory}` : item.categorySlug;
    console.log(`[reasignar] ${item.slug} → ${destino} (orden ${item.order})`);
    continue;
  }
  const existing = await client.getDocument(id);
  if (!existing) {
    console.log(`[reasignar] ${item.slug} no existe, se omite`);
    continue;
  }
  const patch = {
    category: { _type: "reference", _ref: categoryId(item.categorySlug) },
  };
  if (item.subcategory) patch.subcategory = item.subcategory;
  if (typeof item.order === "number") patch.order = item.order;
  // La chocolatería corrige además su historia de origen.
  if (item.origen) patch.description = buildDescription({ ...item, shortDescription: existing.shortDescription });
  await client.patch(id).set(patch).commit();
  console.log(`[reasignar] ${item.slug} actualizado`);
}

// --- 4. Productos de las cartas nuevas -----------------------------------
for (const product of seed.products) {
  const id = productId(product.slug);

  if (isDryRun) {
    console.log(
      `[producto] ${id} — "${product.title}" S/ ${product.price} · ${product.categorySlug} › ${product.subcategory || "—"}`,
    );
    continue;
  }

  const existing = await client.getDocument(id);

  const base = {
    title: product.title,
    slug: { _type: "slug", current: product.slug },
    category: { _type: "reference", _ref: categoryId(product.categorySlug) },
    subcategory: product.subcategory,
    origin: originByFamily[product.origen] || "Ayacucho",
    shortDescription: product.shortDescription,
    price: product.price,
    currency: "PEN",
    showPrice: true,
    availability: true,
    isActive: true,
    isFeatured: product.isFeatured === true,
    order: product.order,
  };

  if (existing) {
    // Se actualizan los datos de la carta sin tocar lo que el equipo haya
    // escrito en el Studio (descripción larga, fotos, galería, SEO).
    await client.patch(id).set(base).commit();
    console.log(`[producto] ${product.title} actualizado`);
  } else {
    await client.create({
      _id: id,
      _type: "catalogItem",
      ...base,
      description: buildDescription(product),
      seo: {
        _type: "seo",
        title: `${product.title} — Carta de Raíces`,
        description: product.shortDescription.slice(0, 180),
      },
    });
    console.log(`[producto] ${product.title} creado`);
  }
}

console.log("");
console.log(isDryRun ? "Dry run completado. Nada se escribió." : "Migración completada.");
