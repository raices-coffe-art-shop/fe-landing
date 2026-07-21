"use client";

import { useState } from "react";
import { documentaryRoute } from "@/data/documentary";

const mapPoints = [
  { id: "origen", title: "Ayacucho", description: "Origen cultural, lingüístico y documental del proyecto.", coordinates: null, x: 58, y: 75 },
  {
    id: "encuentro",
    title: "Lima",
    description: "Lugar de encuentro donde las historias se comparten alrededor del café, el arte y los alimentos.",
    coordinates: null,
    x: 36,
    y: 63,
  },
];

export function CulturalMapClient({ svgMarkup }: { svgMarkup: string }) {
  const [activeId, setActiveId] = useState(mapPoints[0].id);
  const activePoint = mapPoints.find((point) => point.id === activeId) ?? mapPoints[0];

  return (
    <div className="cultural-map">
      <div className="map-narrative-heading">
        <p className="eyebrow">Del origen al encuentro</p>
        <h3>Una ruta visual entre {documentaryRoute.origin} y {documentaryRoute.encounter}, sin inventar paradas ni coordenadas.</h3>
      </div>

      <div
        className="regional-map"
        role="img"
        aria-label="Mapa del Perú por regiones, destacando Lima y Ayacucho dentro de una ruta narrativa de origen"
      >
        <div className="regional-map-grid" aria-hidden="true" />
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
            d="M 314 594 C 282 570, 247 548, 218 520 C 202 504, 194 490, 199 501"
            filter="url(#routeGlow)"
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
        </svg>

        <div className="map-point-controls" aria-label="Marcadores narrativos del mapa">
          {mapPoints.map((point) => (
            <button
              key={point.id}
              type="button"
              className={`map-point-button ${activeId === point.id ? "is-active" : ""}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => setActiveId(point.id)}
              aria-pressed={activeId === point.id}
            >
              <span>{point.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="map-caption">
        <span>{activePoint.title}</span>
        <p>{activePoint.description}</p>
        <div className="map-legend" aria-label="Leyenda del mapa">
          <span><i className="legend-dot ayacucho" />Origen</span>
          <span><i className="legend-dot lima" />Encuentro</span>
          <span><i className="legend-dot sierra" />Viaje documental</span>
        </div>
        <p className="map-route-status">Estado del viaje: pendiente de confirmación editorial.</p>
        <a className="map-cta" href="https://maps.google.com" target="_blank" rel="noreferrer">
          Cómo llegar
        </a>
      </div>
    </div>
  );
}
