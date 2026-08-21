import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";

const isDryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!isDryRun && !token) {
  throw new Error("Falta SANITY_API_WRITE_TOKEN. Usa un token privado de escritura solo para la migración.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const seedPath = path.join(process.cwd(), "scripts", "catalog-seed.json");
const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));
validateSeed(seed);

function validateSeed(data) {
  if (!Array.isArray(data.categories) || !Array.isArray(data.products)) {
    throw new Error("El seed debe contener arrays categories y products.");
  }

  const categorySlugs = new Set();
  for (const category of data.categories) {
    if (!category?.title || !category?.slug || typeof category.order !== "number") {
      throw new Error(`Categoría incompleta: ${JSON.stringify(category)}`);
    }
    if (categorySlugs.has(category.slug)) throw new Error(`Categoría duplicada: ${category.slug}`);
    categorySlugs.add(category.slug);
  }

  const productSlugs = new Set();
  for (const product of data.products) {
    const required = ["slug", "title", "categorySlug", "origin", "shortDescription", "image", "mainImageAlt"];
    const missing = required.filter((field) => !product?.[field]);
    if (missing.length) throw new Error(`Producto ${product?.slug || "sin slug"} incompleto: ${missing.join(", ")}`);
    if (productSlugs.has(product.slug)) throw new Error(`Producto duplicado: ${product.slug}`);
    if (!categorySlugs.has(product.categorySlug)) {
      throw new Error(`El producto ${product.slug} referencia una categoría inexistente: ${product.categorySlug}`);
    }
    try {
      new URL(product.image);
    } catch {
      throw new Error(`URL de imagen inválida en ${product.slug}: ${product.image}`);
    }
    productSlugs.add(product.slug);
  }
}

function categoryId(slug) {
  return `catalogCategory.${slug}`;
}

function productId(slug) {
  return `catalogItem.${slug}`;
}

function textToPortableText(...paragraphs) {
  return paragraphs
    .filter((paragraph) => typeof paragraph === "string" && paragraph.trim())
    .map((paragraph, index) => ({
      _type: "block",
      _key: `paragraph-${index + 1}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `span-${index + 1}`,
          text: paragraph.trim(),
          marks: [],
        },
      ],
    }));
}

async function uploadRemoteImage(url, filename) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo descargar ${url}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return client.assets.upload("image", buffer, { filename });
}

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN" : "MIGRACIÓN REAL"}`);
console.log(`Categorías: ${seed.categories.length}`);
console.log(`Productos: ${seed.products.length}`);

const defaultSocialLinks = [
  { _type: "socialLink", _key: "whatsapp", platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/51915123159", isVisible: true, order: 10 },
  { _type: "socialLink", _key: "email", platform: "email", label: "Correo electrónico", url: "mailto:raicescoffeeartshop@gmail.com", isVisible: true, order: 20 },
  { _type: "socialLink", _key: "instagram", platform: "instagram", label: "Instagram", url: "https://www.instagram.com/raicescoffeeartshop/", isVisible: true, order: 30 },
  { _type: "socialLink", _key: "facebook", platform: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=100089073728506&locale=es_LA", isVisible: true, order: 40 },
];

if (isDryRun) {
  console.log("[siteSettings] Se completarán las redes sociales si el singleton existe y el campo está vacío.");
} else {
  const currentSettings = await client.getDocument("siteSettings");
  if (currentSettings) {
    const patch = client.patch("siteSettings").setIfMissing({
      title: "Configuración del sitio",
      brandLogoAlt: "Raíces — Café y Cultura",
      showCatalogPrices: true,
    });
    const updates = {};
    if (/^ra[ií]ces\s+test$/i.test(String(currentSettings.title || "").trim())) {
      updates.title = "Configuración del sitio";
    }
    if (/^test$/i.test(String(currentSettings.brandLogoAlt || "").trim())) {
      updates.brandLogoAlt = "Raíces — Café y Cultura";
    }
    if (!Array.isArray(currentSettings.socialLinks) || currentSettings.socialLinks.length === 0) {
      updates.socialLinks = defaultSocialLinks;
    }
    if (Object.keys(updates).length > 0) patch.set(updates);
    await patch.commit();
  } else {
    console.warn("[siteSettings] No existe el singleton. Créalo/publica el logo desde /studio antes de migrar.");
  }
}

for (const category of seed.categories) {
  const document = {
    _id: categoryId(category.slug),
    _type: "catalogCategory",
    title: category.title,
    slug: { _type: "slug", current: category.slug },
    description: category.description,
    order: category.order,
    isVisible: category.isVisible !== false,
  };

  if (isDryRun) console.log(`[categoría] ${document._id} · ${document.title}`);
  else await client.createOrReplace(document);
}

for (const product of seed.products) {
  const id = productId(product.slug);
  let image;

  if (isDryRun) {
    console.log(`[producto] ${id} · ${product.title} · ${product.image}`);
  } else {
    const existing = await client.fetch(`*[_id == $id][0]{mainImage}`, { id });
    image = existing?.mainImage;

    if (!image?.asset?._ref) {
      const asset = await uploadRemoteImage(product.image, `${product.slug}.jpg`);
      image = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      };
    }

    await client.createOrReplace({
      _id: id,
      _type: "catalogItem",
      title: product.title,
      slug: { _type: "slug", current: product.slug },
      category: { _type: "reference", _ref: categoryId(product.categorySlug) },
      subcategory: product.subcategory,
      origin: product.origin,
      region: product.region,
      shortDescription: product.shortDescription,
      description: textToPortableText(product.story || product.shortDescription, product.process),
      mainImage: image,
      mainImageAlt: product.mainImageAlt,
      producerOrCreator: product.producerOrCreator,
      presentations: product.presentations || [],
      availability: typeof product.availability === "boolean" ? product.availability : true,
      process: product.process,
      ingredients: product.ingredients || [],
      allergens: product.allergens || [],
      verifiedClaims: product.verifiedClaims || [],
      inquiryMessage: product.inquiryMessage,
      price: typeof product.price === "number" ? product.price : undefined,
      currency: product.currency === "USD" ? "USD" : "PEN",
      showPrice: product.showPrice !== false,
      tone: product.tone || "green",
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured === true,
      order: product.order,
      seo: {
        _type: "seo",
        title: `${product.title} — Catálogo Raíces`,
        description: product.shortDescription,
      },
    });
  }
}

console.log(isDryRun ? "Dry run terminado. No se escribió nada." : "Migración terminada sin duplicar IDs.");
