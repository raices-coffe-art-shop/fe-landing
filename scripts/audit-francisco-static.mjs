import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));
const products = JSON.parse(read("scripts/francisco-productos-origen-2026-09.json"));
const art = JSON.parse(read("scripts/francisco-galeria-arte-2026-09.json"));
const qrManifest = JSON.parse(read("entrega/qr/QR_MANIFIESTO.json"));
const failures = [];
const notes = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}
function positionOrder(text, needles, label) {
  let last = -1;
  for (const needle of needles) {
    const pos = text.indexOf(needle);
    assert(pos >= 0, `${label}: no se encontró ${needle}`);
    if (pos >= 0) assert(pos > last, `${label}: ${needle} está fuera de orden`);
    last = Math.max(last, pos);
  }
}

// Fuentes estructuradas oficiales.
assert(products.categories.length === 5, `Productos de Origen: se esperaban 5 categorías y hay ${products.categories.length}`);
assert(products.products.length === 20, `Productos de Origen: se esperaban 20 productos y hay ${products.products.length}`);
assert(art.category?.slug === "ceramica-tradicional-de-quinua", "Galería: categoría oficial incorrecta");
assert(art.items.length === 3, `Galería: se esperaban 3 piezas y hay ${art.items.length}`);
assert(new Set(art.items.map((x) => x.slug)).size === 3, "Galería: hay slugs duplicados");
assert(art.items.map((x) => x.slug).join("|") === "torito-de-quinua|iglesia-de-quinua|retablo-tradicional", "Galería: piezas u orden distintos del alcance confirmado");

const expectedMissingPrices = new Set(["polvo-cacao-250g", "nibs-cacao-250g", "cancha-paccho-tradicional", "mix-frutos-secos"]);
const missingPrices = new Set(products.products.filter((x) => typeof x.price !== "number").map((x) => x.slug));
assert(missingPrices.size === expectedMissingPrices.size && [...expectedMissingPrices].every((x) => missingPrices.has(x)), `Precios pendientes: conjunto inesperado (${[...missingPrices].join(", ")})`);
for (const item of products.products) {
  assert(item.categorySlug && products.categories.some((c) => c.slug === item.categorySlug), `Producto ${item.slug}: categoría inexistente`);
  assert(Array.isArray(item.presentations) && item.presentations.length > 0, `Producto ${item.slug}: sin presentación`);
  assert(item.image && exists(item.image), `Producto ${item.slug}: imagen local inexistente (${item.image})`);
  if (typeof item.price !== "number") assert(item.showPrice === false, `Producto ${item.slug}: sin precio pero showPrice no es false`);
}
for (const category of products.categories) assert(category.image && exists(category.image), `Categoría ${category.slug}: imagen local inexistente`);
for (const item of art.items) assert(item.image && exists(item.image), `Galería ${item.slug}: imagen local inexistente`);

// Una pieza representativa destacada por cada familia para que la portada no oculte categorías nuevas.
const featuredByCategory = new Map();
for (const item of products.products.filter((x) => x.isFeatured)) featuredByCategory.set(item.categorySlug, (featuredByCategory.get(item.categorySlug) || 0) + 1);
for (const category of products.categories) assert(featuredByCategory.get(category.slug) === 1, `Portada: ${category.title} debe tener exactamente 1 producto destacado`);

// Navegación y hero.
const hero = read("components/Hero.tsx");
positionOrder(hero, ['href="/carta"', 'href="/productos-de-origen"', 'href="#historia"', 'href="#visita"'], "Hero");
const header = read("components/SiteHeaderClient.tsx");
positionOrder(header, ['label: "La Carta"', 'label: "Productos de Origen"', 'label: "Galería de Arte"', 'label: "Acerca de nosotros"', 'label: "Nuestra Historia"', 'label: "Personas"', 'label: "Publicaciones"', 'label: "Visítanos"'], "Menú");

// Separación de dominios y rutas heredadas.
const migration = read("scripts/update-francisco-2026-09.mjs");
assert(migration.includes('"menuCounts"'), "Migración: falta control explícito de aislamiento de Carta");
assert(!/patch\([^\n]*menu|createOrReplace\([^\n]*menuItem|createOrReplace\([^\n]*menuCategory/.test(migration), "Migración: parece escribir sobre Carta");
assert(read("app/catalogo/page.tsx").includes('"/productos-de-origen"'), "Ruta /catalogo no redirige a Productos de Origen");
assert(read("app/arte/page.tsx").includes('"/galeria-de-arte"'), "Ruta /arte no redirige a Galería de Arte");

// Lista antes de boxes.
const originPage = read("app/productos-de-origen/page.tsx");
assert(originPage.indexOf("<OriginOfficialList") >= 0, "Productos de Origen: falta lista oficial");
assert(originPage.indexOf("<OriginOfficialList") < originPage.indexOf("<OriginCategoryGrid"), "Productos de Origen: la lista oficial no aparece antes de los boxes");
const originGrid = read("components/OriginCategoryGrid.tsx");
for (const required of ["categoryImage", "presentations", "Precio a consultar", "Pedir por WhatsApp"]) assert(originGrid.includes(required), `Boxes: falta ${required}`);

// Galería conectada al Home y sin narrativa fija antigua dentro de los componentes públicos de Galería.
const home = read("app/page.tsx");
assert(home.includes("getArtItems") && home.includes("<CulturalSplitShowcase items={artItems}"), "Home: preview de Galería no está conectado a artItem");
for (const file of ["app/page.tsx", "app/galeria-de-arte/page.tsx", "components/CulturalSplitShowcase.tsx", "data/art.ts"]) {
  const text = read(file);
  assert(!text.includes("La mirada de Lized"), `${file}: conserva narrativa antigua de Galería de Lized`);
  assert(!text.includes("Cuadros de Liz"), `${file}: conserva ficha antigua de Galería`);
}

// Webhook/cache: los tres dominios deben mantener tags independientes.
const webhook = read("app/api/revalidate/route.ts");
for (const token of ["MENU_TAG", "CATALOG_TAG", "ART_TAG", 'body._type === "menuCategory"', 'body._type === "catalogCategory"', 'body._type === "artCategory"']) assert(webhook.includes(token), `Webhook: falta ${token}`);

// QRs físicos.
const requiredQrSlugs = ["sitio-web", "todos-los-links", "carta", "productos-de-origen", "galeria-de-arte", "historia", "personas", "publicaciones", "visitanos", "google-maps", "whatsapp", "tiktok", "email", "instagram", "facebook"];
assert(qrManifest.length === requiredQrSlugs.length, `QR: se esperaban ${requiredQrSlugs.length} destinos y hay ${qrManifest.length}`);
for (const slug of requiredQrSlugs) {
  assert(qrManifest.some((x) => x.slug === slug), `QR: falta ${slug} en el manifiesto`);
  assert(exists(`entrega/qr/QR_Raices_${slug}_grande.png`), `QR: falta PNG grande de ${slug}`);
}
assert(exists("entrega/qr/QR_Raices_hoja_completa.png"), "QR: falta hoja completa");
assert(!qrManifest.some((x) => x.slug === "youtube"), "QR: se agregó YouTube sin URL oficial confirmada");
const whatsappQr = qrManifest.find((x) => x.slug === "whatsapp")?.url || "";
const socialFallback = read("data/social.ts");
const fallbackWhatsapp = socialFallback.match(/whatsappHref:\s*"([^"]+)"/)?.[1] || "";
const linksHub = read("components/LinksHub.tsx");
if (fallbackWhatsapp && whatsappQr && fallbackWhatsapp !== whatsappQr) {
  notes.push(`WhatsApp requiere confirmación antes de imprimir en volumen: el fallback local es ${fallbackWhatsapp}, mientras /links auditado usa ${whatsappQr}. El QR de la tarjeta web se genera dinámicamente desde el href real para no mezclar números.`);
  const whatsappBlock = linksHub.split("whatsapp:")[1]?.split("instagram:")[0] || "";
  assert(!whatsappBlock.includes("qrCode:"), "LinksHub: WhatsApp no debe usar QR estático mientras existan dos números distintos");
}

// No deben quedar placeholders en las superficies públicas modificadas.
for (const file of ["app/page.tsx", "app/productos-de-origen/page.tsx", "app/galeria-de-arte/page.tsx", "components/CatalogPreview.tsx", "components/CulturalSplitShowcase.tsx", "data/catalogFallback.ts"]) {
  const text = read(file);
  for (const placeholder of ["Cat A 1", "Cat B 2", "Prod 1", "Prod 2"]) assert(!text.includes(placeholder), `${file}: conserva placeholder ${placeholder}`);
}

// Datos que deliberadamente siguen pendientes por falta de insumo.
notes.push("Pendientes documentados: precios de Polvo de Cacao, Nibs de Cacao, Cancha Paccho y Mix de Frutos Secos.");
notes.push("Panadería/Granos usa una foto documental referencial ya existente en el proyecto, porque Francisco no entregó una específica.");
notes.push("Galería no publica medidas ni precios porque la fuente indica consultar pieza.");
notes.push("YouTube no tiene QR porque no se entregó ni se detectó una URL oficial en /links.");

console.log("============================================================");
console.log("Auditoría estática — entrega Francisco 17/09/2026");
console.log(`Categorías Productos de Origen: ${products.categories.length}`);
console.log(`Productos: ${products.products.length}`);
console.log(`Piezas de Galería: ${art.items.length}`);
console.log(`QR físicos: ${qrManifest.length}`);
console.log(`Incidencias: ${failures.length}`);
for (const note of notes) console.log(`INFO: ${note}`);
if (failures.length) {
  for (const failure of failures) console.error(`ERROR: ${failure}`);
  process.exit(1);
}
console.log("OK: estructura, alcance, aislamiento, contenido local y paquete QR coinciden con la entrega documentada.");
