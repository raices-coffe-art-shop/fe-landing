"use client";

import Link from "next/link";
import { useState } from "react";

const primaryLinks = [
  {
    label: "Escríbenos por WhatsApp",
    note: "Pedidos, consultas y visitas al espacio",
    href: "https://wa.me/51999999999?text=Hola%2C%20quiero%20conocer%20Ra%C3%ADces.",
    meta: "Atención directa",
    tone: "honey",
    external: true,
  },
  {
    label: "Abrir el catálogo",
    note: "Café, miel, cacao, arte y piezas con origen",
    href: "/#catalogo",
    meta: "Lo más pedido",
    tone: "green",
  },
  {
    label: "Conocer las personas",
    note: "Productores, artistas y oficios que sostienen la propuesta",
    href: "/#personas",
    meta: "Historias vivas",
    tone: "red",
  },
  {
    label: "Leer la historia",
    note: "La idea detrás del café, la memoria y el regreso al origen",
    href: "/#historia",
    meta: "El manifiesto",
    tone: "ink",
  },
  {
    label: "Cómo llegar",
    note: "Ubicación y visita al espacio en Lima",
    href: "https://maps.google.com",
    meta: "Ruta al local",
    tone: "honey",
    external: true,
  },
  {
    label: "Instagram",
    note: "Novedades, piezas, mesas y escenas del día a día",
    href: "https://instagram.com",
    meta: "Lo que estamos haciendo",
    tone: "green",
    external: true,
  },
];

export function LinksHub() {
  const [shared, setShared] = useState(false);

  const sharePage = async () => {
    const payload = {
      title: "Raíces — Café y Cultura",
      text: "Conoce Raíces: café, cultura e historias que conectan Ayacucho con Lima.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
      }
    } catch {
      // El usuario puede cerrar el menú de compartir sin completar la acción.
    }
  };

  return (
    <main className="links-page">
      <div className="links-shell">
        <div className="links-topbar">
          <Link className="links-home" href="/">← Volver al sitio</Link>
          <button className="links-share" type="button" onClick={sharePage}>
            {shared ? "Enlace copiado" : "Compartir"} ↗
          </button>
        </div>

        <section className="links-hero-card">
          <div className="links-hero-photo" aria-hidden="true" />
          <div className="links-hero-glow" aria-hidden="true" />
          <div className="links-hero-content">
            <div className="links-kicker-row">
              <p className="links-kicker">Café · arte · territorio</p>
              <span>Ayacucho en Lima</span>
            </div>
            <h1 className="links-identity">
              <img src="/raices-logo-lg.png" alt="Raíces" width={168} height={168} />
            </h1>
            <p>
              Un enlace único para entrar al universo del proyecto: sabores, personas y escenas que siguen contando el origen.
            </p>
            <div className="links-origin-line"><span>Ayacucho</span><i /><span>Lima</span></div>
            <div className="links-chips" aria-label="Resumen rápido">
              <span>Pedidos por WhatsApp</span>
              <span>Catálogo vivo</span>
              <span>Historias reales</span>
            </div>
          </div>
        </section>

        <section className="links-feature-grid" aria-label="Accesos rápidos">
          {primaryLinks.map((item) => {
            const className = `links-main-link ${item.tone}`;
            const content = (
              <>
                <span className="links-index" aria-hidden="true">{item.meta}</span>
                <span className="links-copy">
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </span>
                <span className="links-arrow" aria-hidden="true">↗</span>
              </>
            );

            return item.external ? (
              <a key={item.label} className={className} href={item.href} target="_blank" rel="noreferrer">
                {content}
              </a>
            ) : (
              <Link key={item.label} className={className} href={item.href}>
                {content}
              </Link>
            );
          })}
        </section>

        <section className="links-story-card">
          <div className="links-story-copy">
            <p>Historia destacada</p>
            <h2>Pedro Ñahui Atao</h2>
            <blockquote>
              Una historia para leer con calma: café ayacuchano, memoria familiar y trabajo visible detrás de cada taza.
            </blockquote>
            <Link href="/personas/pedro-nahui-atao">Abrir historia ↗</Link>
          </div>
          <div className="links-story-art" aria-hidden="true">
            <span>01</span>
            <div>
              <i />
              <i />
              <i />
            </div>
            <small>Retrato editorial</small>
          </div>
        </section>

        <section className="links-footer-grid" aria-label="Información adicional">
          <div>
            <span>Visitas</span>
            <p>Coordina antes de venir. La experiencia se entiende mejor alrededor de una mesa.</p>
          </div>
          <div>
            <span>Pedidos</span>
            <p>Usa WhatsApp para consultas, disponibilidad y entregas.</p>
          </div>
          <div>
            <span>Origen</span>
            <p>Ayacucho no se usa como decoración; se presenta con voz propia.</p>
          </div>
        </section>

        <footer className="links-footer">
          <span>Raíces — Café y Cultura</span>
          <span>Una mesa, varios caminos</span>
        </footer>
      </div>
    </main>
  );
}
