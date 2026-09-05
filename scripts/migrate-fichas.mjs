import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createClient } from "next-sanity";

// Carga el subtítulo y la ficha de origen de cada sección, transcritos de las
// cartas en PDF del cliente. Es lo que la pantalla del local muestra bajo el
// relato, en el mismo formato de etiqueta y valor que usan sus cartas.
//
// Uso: npm run fichas:migrate:dry  →  revisar  →  npm run fichas:migrate

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

const seedPath = path.join(process.cwd(), "scripts", "fichas-2026-seed.json");
const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));

// Los mismos límites del schema: si el texto los supera, el Studio lo marcaría
// en rojo y el editor no entendería por qué.
const MAX_TAGLINE = 80;
const MAX_LABEL = 40;
const MAX_VALUE = 160;
const MAX_FACTS = 8;

validateSeed(seed);

function validateSeed(data) {
  if (!Array.isArray(data.secciones)) throw new Error("El seed debe contener un array secciones.");
  for (const section of data.secciones) {
    const name = section?.categorySlug || "sin slug";
    if (!section?.categorySlug) throw new Error(`Sección sin categorySlug.`);
    if (section.tagline && section.tagline.length > MAX_TAGLINE) {
      throw new Error(`El subtítulo de ${name} supera ${MAX_TAGLINE} caracteres.`);
    }
    const facts = section.facts || [];
    if (facts.length > MAX_FACTS) {
      throw new Error(`La ficha de ${name} tiene ${facts.length} datos; el máximo es ${MAX_FACTS}.`);
    }
    for (const fact of facts) {
      if (!fact?.label || !fact?.value) {
        throw new Error(`La ficha de ${name} tiene una fila sin etiqueta o sin valor.`);
      }
      if (fact.label.length > MAX_LABEL) {
        throw new Error(`La etiqueta “${fact.label}” de ${name} supera ${MAX_LABEL} caracteres.`);
      }
      if (fact.value.length > MAX_VALUE) {
        throw new Error(`El valor de “${fact.label}” en ${name} supera ${MAX_VALUE} caracteres.`);
      }
    }
  }
}

// Sanity exige un _key estable en cada elemento de un array de objetos. Se deriva
// de la etiqueta para que repetir la migración no reordene ni duplique filas.
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

console.log(`Proyecto: ${projectId}`);
console.log(`Dataset: ${dataset}`);
console.log(`Modo: ${isDryRun ? "DRY RUN" : "MIGRACIÓN REAL"}`);
console.log(`Secciones: ${seed.secciones.length}`);
console.log("");

for (const section of seed.secciones) {
  const id = categoryId(section.categorySlug);
  const facts = (section.facts || []).map((fact, index) => ({
    _type: "sourcingFact",
    _key: factKey(fact.label, index),
    label: fact.label,
    value: fact.value,
  }));

  if (isDryRun) {
    console.log(`[sección] ${section.categoryName || section.categorySlug}`);
    console.log(`   subtítulo: ${section.tagline || "—"}`);
    if (facts.length === 0) {
      console.log(`   ficha: sin datos (su carta no la trae)`);
    } else {
      for (const fact of facts) console.log(`   · ${fact.label}: ${fact.value}`);
    }
    continue;
  }

  const existing = await client.getDocument(id);
  if (!existing) {
    console.log(`[sección] ${section.categorySlug} no existe en Sanity, se omite`);
    continue;
  }

  const patch = {};
  if (section.tagline) patch.tagline = section.tagline;
  // Una ficha vacía se escribe igual: así la sección queda explícitamente sin
  // ficha en vez de arrastrar datos de una carga anterior.
  patch.sourcingFacts = facts;

  await client.patch(id).set(patch).commit();
  console.log(
    `[sección] ${section.categoryName || section.categorySlug} lista — ${facts.length} dato(s) de ficha`,
  );
}

console.log("");
console.log(isDryRun ? "Dry run completado. Nada se escribió." : "Migración completada.");
