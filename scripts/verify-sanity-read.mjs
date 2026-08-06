import process from "node:process";
import { createRequire } from "node:module";
import { createClient } from "next-sanity";

// Carga .env.local, .env.development y .env con la misma lógica que Next.js.
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID en tus archivos .env.");
if (!dataset) throw new Error("Falta NEXT_PUBLIC_SANITY_DATASET en tus archivos .env.");
if (!token) {
  throw new Error(
    "Falta SANITY_API_WRITE_TOKEN. Guárdalo completo, en una sola línea, dentro de .env.local y vuelve a ejecutar el comando.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "published",
});

const result = await client.fetch(`{
  "products": count(*[_type == "catalogItem"]),
  "activeProducts": count(*[_type == "catalogItem" && coalesce(isActive, true) == true]),
  "categories": count(*[_type == "catalogCategory"]),
  "visibleCategories": count(*[_type == "catalogCategory" && coalesce(isVisible, true) == true]),
  "siteSettings": count(*[_type == "siteSettings"])
}`);

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Token privado detectado: sí (${token.length} caracteres)`);
console.table(result);

if (!result.products || !result.categories) {
  process.exitCode = 1;
  console.error("No se encontraron productos o categorías publicados con el token configurado.");
} else {
  console.log("Lectura autenticada de Sanity correcta.");
}
