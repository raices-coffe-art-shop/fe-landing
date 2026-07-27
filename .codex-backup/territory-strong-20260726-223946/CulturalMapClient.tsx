"use client";

import { useState } from "react";
import { documentaryRoute } from "@/data/documentary";

const mapPoints = [
  {
    id: "origen",
    title: "Ayacucho",
    description: "Origen de productos, personas, lengua, alimentos, arte e historias vinculadas con Raíces.",
  },
  {
    id: "encuentro",
    title: "Lima",
    description: "Lugar de encuentro donde los productos, obras y relatos se comparten dentro del espacio.",
  },
];

export function CulturalMapClient({ svgMarkup }: { svgMarkup: string }) {
  const [activeId, setActiveId] = useState(mapPoints[0].id);
  const activePoint = mapPoints.find((point) => point.id === activeId) ?? mapPoints[0];

  const selectPointFromKeyboard = (event: React.KeyboardEvent<SVGGElement>, id: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setActiveId(id);
  };

  return (
    <div className="cultural-map">
      <div className="map-narrative-heading">
        <p className="eyebrow">Del origen al encuentro</p>
        <h3>De {documentaryRoute.origin} a {documentaryRoute.encounter}: el recorrido detrás de lo que llega a Raíces.</h3>
        <p>Cada producto comienza en un lugar concreto y llega al local a través de personas, viajes y relaciones reales. Este mapa conecta el territorio donde nace con el espacio donde finalmente se comparte.</p>
      </div>

      <div className="cultural-map-body">
        <div
          className="regional-map"
          role="group"
          aria-label={"Mapa del Per\u00fa por regiones, destacando Lima y Ayacucho dentro de una ruta narrativa de origen"}
        >
          <div className="regional-map-grid" aria-hidden="true" />
          <div className="regional-map-contours" aria-hidden="true" />
          <span className="map-coordinate map-coordinate-top" aria-hidden="true">12.0464{"\u00b0"} S</span>
          <span className="map-coordinate map-coordinate-side" aria-hidden="true">74.2241{"\u00b0"} O</span>
          <span className="map-orientation" aria-hidden="true"><b>N</b><i /></span>
          <div className="regional-map-svg" dangerouslySetInnerHTML={{ __html: svgMarkup }} />

          <svg
            className="map-overlays"
            viewBox="0 0 542.76703 792"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Ruta entre Ayacucho y Lima"
          >
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
              d="M 314 594 C 282 570, 247 548, 218 520 C 202 504, 194 490, 199 501"
              filter="url(#routeGlow)"
            />

            <g
              className={`pin-group map-pin-control pin-lima ${activeId === "encuentro" ? "is-active" : ""}`}
              role="button"
              tabIndex={0}
              aria-label="Seleccionar Lima, lugar de encuentro"
              aria-pressed={activeId === "encuentro"}
              onClick={() => setActiveId("encuentro")}
              onKeyDown={(event) => selectPointFromKeyboard(event, "encuentro")}
            >
              <circle cx="199" cy="501" r="22" className="pin-hit" />
              <circle cx="199" cy="501" r="7" className="pin pin-outer" />
              <circle cx="199" cy="501" r="4" className="pin pin-inner" />
              <text x="175" y="486">LIMA</text>
            </g>
            <g
              className={`pin-group map-pin-control pin-ayacucho ${activeId === "origen" ? "is-active" : ""}`}
              role="button"
              tabIndex={0}
              aria-label="Seleccionar Ayacucho, lugar de origen"
              aria-pressed={activeId === "origen"}
              onClick={() => setActiveId("origen")}
              onKeyDown={(event) => selectPointFromKeyboard(event, "origen")}
            >
              <circle cx="314" cy="594" r="23" className="pin-hit" />
              <circle cx="314" cy="594" r="8" className="pin pin-outer" />
              <circle cx="314" cy="594" r="4.3" className="pin pin-inner" />
              <text x="324" y="586">AYACUCHO</text>
            </g>
          </svg>
        </div>

        <div className="map-caption">
          <div className="map-caption-heading">
            <small>Territorio seleccionado</small>
            <span>{activePoint.title}</span>
            <b>0{mapPoints.findIndex((point) => point.id === activePoint.id) + 1}</b>
          </div>
          <p>{activePoint.description}</p>
          <div className="map-caption-route" aria-hidden="true"><i /><span /><i /></div>
          <div className="map-legend" aria-label="Leyenda del mapa">
            <span><i className="legend-dot ayacucho" />Origen</span>
            <span><i className="legend-dot lima" />Encuentro</span>
            <span><i className="legend-dot sierra" />Viaje documental</span>
          </div>
        </div>
      </div>
    </div>
  );
}
