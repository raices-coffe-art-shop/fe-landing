import { readFileSync } from "fs";
import { join } from "path";
import { CulturalMapClient } from "@/components/CulturalMapClient";

function getSvgMarkup() {
  const filePath = join(process.cwd(), "public", "peru-regiones.svg");
  const raw = readFileSync(filePath, "utf8");
  return raw
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/standalone="no"/g, "")
    .replace(/width="[^"]*"/g, "")
    .replace(/height="[^"]*"/g, "")
    .replace(
      /<svg/,
      '<svg class="peru-map-svg" viewBox="0 0 542.76703 792" preserveAspectRatio="xMidYMid meet"',
    );
}

export function CulturalMap() {
  const svgMarkup = getSvgMarkup();

  return <CulturalMapClient svgMarkup={svgMarkup} />;
}
