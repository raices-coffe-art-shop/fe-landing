import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";

// Carga la carta de café y chocolatería que entregó el cliente (agosto 2026).
//
// A diferencia de migrate-catalog.mjs, este script:
//  1. Lee las fotografías del disco en lugar de descargarlas por HTTP.
//  2. No usa createOrReplace sobre lo ya publicado: parchea campos concretos,
//     para no pisar las ediciones que el equipo haya hecho en el Studio.
//
// Uso: npm run carta:migrate:dry  →  revisar  →  npm run carta:migrate

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

const seedPath = path.join(process.cwd(), "scripts", "carta-2026-seed.json");
const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));

// Las fotos las entregó el cliente fuera del repositorio (no se versionan).
const photosDir = process.env.CARTA_PHOTOS_DIR
  ? path.resolve(process.env.CARTA_PHOTOS_DIR)
  : path.join(process.env.USERPROFILE || process.env.HOME || "", "Downloads", "fotos-raices");

await validateSeed(seed);

async function validateSeed(data) {
  if (!Array.isArray(data.categories) || !Array.isArray(data.products)) {
    throw new Error("El seed debe contener arrays categories y products.");
  }

  const categorySlugs = new Set(data.categories.map((category) => category.slug));
  for (const category of data.categories) {
    if (!category?.title || !category?.slug || typeof category.order !== "number") {
      throw new Error(`Categoría incompleta: ${JSON.stringify(category)}`);
    }
  }

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
    if (product.photo) {
      const file = path.join(photosDir, product.photo);
      try {
        await fs.access(file);
      } catch {
        throw new Error(`No se encontró la foto de ${product.slug}: ${file}`);
      }
      if (!product.mainImageAlt) {
        throw new Error(`El producto ${product.slug} tiene foto pero le falta mainImageAlt.`);
      }
    }
    productSlugs.add(product.slug);
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

// La historia de origen y la ficha técnica son las mismas para todos los cafés
// (y para los dos chocolates): se cargan como punto de partida y el equipo
// puede afinarlas producto por producto desde el Studio.
function buildDescription(product) {
  const origen = seed.origenes?.[product.origen];
  if (!origen) return textToPortableText(product.shortDescription);
  return textToPortableText(product.shortDescription, origen.historia, origen.ficha, origen.cata);
}

async function uploadLocalImage(filename) {
  const file = path.join(photosDir, filename);
  const buffer = await fs.readFile(file);
  return client.assets.upload("image", buffer, { filename });
}

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Fotos: ${photosDir}`);
console.log(`Modo: ${isDryRun ? "DRY RUN" : "MIGRACIÓN REAL"}`);
console.log(`Categorías nuevas: ${seed.categories.length} · Productos nuevos: ${seed.products.length}`);
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
      `carta → ${update.showInPrintedMenu === false ? "NO" : "sí"}`,
    ].filter(Boolean);
    console.log(`[categoría existente] ${update.slug}: ${cambios.join(", ")}`);
    continue;
  }
  const existing = await client.getDocument(id);
  if (!existing) {
    console.log(`[categoría existente] ${update.slug} no existe en Sanity, se omite`);
    continue;
  }
  const patch = { showInPrintedMenu: update.showInPrintedMenu !== false };
  if (update.title) patch.title = update.title;
  if (update.description) patch.description = update.description;
  if (typeof update.order === "number") patch.order = update.order;
  // El _id se conserva para no romper las referencias de sus productos.
  if (update.newSlug) patch.slug = { _type: "slug", current: update.newSlug };
  await client.patch(id).set(patch).commit();
  console.log(`[categoría existente] ${update.slug} actualizada`);
}

// --- 3. Productos de la carta --------------------------------------------
for (const product of seed.products) {
  const id = productId(product.slug);

  if (isDryRun) {
    const foto = product.photo ? ` · foto ${product.photo}` : " · sin foto";
    console.log(`[producto] ${id} — "${product.title}" S/ ${product.price}${foto}`);
    continue;
  }

  const existing = await client.fetch(`*[_id == $id][0]{ _id, mainImage }`, { id });

  let mainImage = existing?.mainImage;
  if (!mainImage?.asset?._ref && product.photo) {
    const asset = await uploadLocalImage(product.photo);
    mainImage = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
    console.log(`   ↑ foto subida: ${product.photo}`);
  }

  const base = {
    _id: id,
    _type: "catalogItem",
    title: product.title,
    slug: { _type: "slug", current: product.slug },
    category: { _type: "reference", _ref: categoryId(product.categorySlug) },
    origin: product.origen === "cacao" ? "Pichari, VRAEM (Cusco)" : "Ayna - San Francisco, VRAEM (Ayacucho)",
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
    // Ya existe: se actualizan los datos de la carta sin tocar lo que el
    // equipo haya escrito en el Studio (descripción larga, galería, SEO).
    const patch = { ...base };
    delete patch._id;
    delete patch._type;
    if (mainImage) patch.mainImage = mainImage;
    if (product.mainImageAlt) patch.mainImageAlt = product.mainImageAlt;
    await client.patch(id).set(patch).commit();
    console.log(`[producto] ${product.title} actualizado`);
  } else {
    await client.create({
      ...base,
      ...(mainImage ? { mainImage } : {}),
      ...(product.mainImageAlt ? { mainImageAlt: product.mainImageAlt } : {}),
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

// --- 4. Productos que la carta nueva reemplaza ----------------------------
for (const slug of seed.deactivate || []) {
  const id = productId(slug);
  if (isDryRun) {
    console.log(`[baja] ${id} quedará oculto (isActive: false)`);
    continue;
  }
  const existing = await client.getDocument(id);
  if (!existing) continue;
  await client.patch(id).set({ isActive: false }).commit();
  console.log(`[baja] ${slug} oculto`);
}

console.log("");
console.log(isDryRun ? "Dry run completado. Nada se escribió." : "Migración completada.");
