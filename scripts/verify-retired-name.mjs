import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set(["node_modules", ".git", ".next", "dist", "build"]);
const ignoredFiles = new Set([path.basename(import.meta.url)]);
const textExts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".txt", ".css", ".scss", ".html"]);
const retiredName = ["Li", "zed"].join("");
const escaped = retiredName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const legacyPattern = new RegExp(`(^|[^a-záéíóúñ])${escaped}([^a-záéíóúñ]|$)`, "i");
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (entry.name === "verify-retired-name.mjs") continue;
    if (!textExts.has(path.extname(entry.name).toLowerCase())) continue;
    const text = fs.readFileSync(full, "utf8");
    text.split(/\r?\n/).forEach((line, index) => {
      if (legacyPattern.test(line)) {
        hits.push(`${path.relative(root, full)}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

walk(root);

if (hits.length) {
  console.error("Se encontraron referencias al nombre retirado:\n");
  for (const hit of hits) console.error(`- ${hit}`);
  process.exit(1);
}

console.log("OK: no se encontraron referencias al nombre retirado en los archivos fuente revisados.");
