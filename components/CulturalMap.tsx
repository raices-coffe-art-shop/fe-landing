import { readFileSync } from "fs";
import { join } from "path";

function getSvgMarkup() {
  const filePath = join(process.cwd(), "public", "peru-regiones.svg");
  const raw = readFileSync(filePath, "utf8");
  return raw
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/standalone="no"/g, "")
    .replace(/width="[^"]*"/g, "")
    .replace(/height="[^"]*"/g, "")
    .replace(/<svg/, '<svg class="peru-map-svg" preserveAspectRatio="xMidYMid meet"');
}

export function CulturalMap() {
  const svgMarkup = getSvgMarkup();

  return (
    <div className="cultural-map">
      <div
        className="regional-map"
        role="img"
        aria-label="Mapa del Perú por regiones, destacando Lima y Ayacucho dentro de una ruta narrativa de origen"
      >
        <div className="regional-map-svg" dangerouslySetInnerHTML={{ __html: svgMarkup }} />

        <svg className="map-overlays" viewBox="0 0 542.76703 792" aria-hidden="true">
          <defs>
            <filter id="routeGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            className="route-path primary"
            d="M 199 501 C 220 490, 244 515, 268 555 C 284 579, 295 589, 314 594"
            filter="url(#routeGlow)"
          />
          <path
            className="route-path secondary"
            d="M 314 594 C 347 582, 372 576, 392 569"
          />

          <g className="pin-group pin-lima">
            <circle cx="199" cy="501" r="7" className="pin pin-outer" />
            <circle cx="199" cy="501" r="4" className="pin pin-inner" />
            <text x="175" y="486">LIMA</text>
          </g>
          <g className="pin-group pin-ayacucho">
            <circle cx="314" cy="594" r="8" className="pin pin-outer" />
            <circle cx="314" cy="594" r="4.3" className="pin pin-inner" />
            <text x="324" y="586">AYACUCHO</text>
          </g>
          <g className="pin-group pin-sierra">
            <circle cx="392" cy="569" r="5.5" className="pin pin-outer" />
            <circle cx="392" cy="569" r="3.2" className="pin pin-inner" />
            <text x="403" y="563">SIERRA EN EXPANSIÓN</text>
          </g>
        </svg>
      </div>

      <div className="map-caption">
        <span>Un mapa de procedencias, no de sucursales.</span>
        <p>
          Ayacucho y Lima aparecen como nodos principales del relato. El resto del mapa permanece sobrio,
          listo para incorporar nuevas regiones de la sierra peruana sin perder el foco en el origen.
        </p>
        <div className="map-legend" aria-label="Leyenda del mapa">
          <span><i className="legend-dot lima" />Lima</span>
          <span><i className="legend-dot ayacucho" />Ayacucho</span>
          <span><i className="legend-dot sierra" />Sierra invitada</span>
        </div>
      </div>
    </div>
  );
}
