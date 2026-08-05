import { contactChannels } from "@/data/social";

const googleMapsEmbedUrl =
  "https://www.google.com/maps?q=-12.0854495,-77.0831729&z=18&output=embed";

export function LocationMapSection() {
  return (
    <section className="location-map-section" id="ubicacion" aria-labelledby="location-map-title">
      {/*
        ContinuousRoots todavía usa #archivo como punto geométrico. Este ancla
        invisible conserva la continuidad sin volver a renderizar el archivo.
      */}
      <span className="location-map-root-anchor" id="archivo" aria-hidden="true" />

      <div className="location-map-pattern" aria-hidden="true" />

      <div className="page-shell location-map-heading">
        <div>
          <p className="eyebrow light">Dónde encontrarnos</p>
          <h2 id="location-map-title">Raíces también se conoce recorriendo el lugar que habita.</h2>
        </div>

        <div className="location-map-intro">
          <span>12.0854495° S · 77.0831729° O</span>
          <p>
            Explora el entorno desde el mapa y abre la vista completa para planificar tu visita.
          </p>
          <a href={contactChannels.maps} target="_blank" rel="noreferrer">
            Abrir en Google Maps <b aria-hidden="true">↗</b>
          </a>
        </div>
      </div>

      <div className="page-shell location-map-shell">
        <div className="location-map-frame">
          <iframe
            src={googleMapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Raíces en Google Maps"
          />

          <div className="location-map-caption" aria-hidden="true">
            <span>Ubicación</span>
            <strong>Lima, Perú</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
