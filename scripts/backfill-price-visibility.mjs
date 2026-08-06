import process from "node:process";
import { createRequire } from "node:module";
import { createClient } from "next-sanity";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-02";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
if (!token) throw new Error("Falta SANITY_API_WRITE_TOKEN para actualizar los documentos existentes.");

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
const productIds = await client.fetch(`*[_type == "catalogItem" && !defined(showPrice)]._id`);

let transaction = client.transaction();
transaction = transaction.patch("siteSettings", (patch) => patch.setIfMissing({ showCatalogPrices: true }));
for (const id of productIds) {
  transaction = transaction.patch(id, (patch) => patch.setIfMissing({ showPrice: true }));
}

await transaction.commit();
console.log(`Configuración global actualizada: siteSettings.showCatalogPrices = true si faltaba.`);
console.log(`Productos actualizados: ${productIds.length}.`);
console.log("Los controles de precio ya tienen un valor inicial coherente en Sanity Studio.");
