"use client";

import Link from "next/link";
import { useState } from "react";
import { contactChannels } from "@/data/social";

type LinkItem = {
  id: string;
  label: string;
  action: string;
  note: string;
  href: string;
  meta: string;
  tone: "honey" | "green" | "red" | "ink" | "clay" | "coffee";
  external?: boolean;
  icon: "whatsapp" | "catalog" | "people" | "story" | "maps" | "instagram";
  qrCode: string;
  qrImage: string;
};

const primaryLinks: LinkItem[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    action: "Abrir WhatsApp",
    note: "Pedidos, consultas y visitas al espacio.",
    href: `${contactChannels.whatsappHref}?text=Hola%2C%20quiero%20conocer%20Ra%C3%ADces.`,
    meta: "Atención directa",
    tone: "honey",
    external: true,
    icon: "whatsapp",
    qrCode: "/qr-codes/whatsapp.svg",
    qrImage: "/qr/andes.svg",
  },
  {
    id: "catalogo",
    label: "Carta y catálogo",
    action: "Abrir catálogo",
    note: "Café, miel, cacao, arte y piezas con origen.",
    href: "/#catalogo",
    meta: "Lo más pedido",
    tone: "green",
    icon: "catalog",
    qrCode: "/qr-codes/catalogo.svg",
    qrImage: "/qr/textil.svg",
  },
  {
    id: "personas",
    label: "Personas",
    action: "Conocer historias",
    note: "Productores, artistas y oficios que sostienen la propuesta.",
    href: "/#personas",
    meta: "Historias vivas",
    tone: "red",
    icon: "people",
    qrCode: "/qr-codes/personas.svg",
    qrImage: "/qr/retablo.svg",
  },
  {
    id: "historia",
    label: "Historia de Raíces",
    action: "Leer la historia",
    note: "La idea detrás del café, la memoria y el regreso al origen.",
    href: "/#historia",
    meta: "El manifiesto",
    tone: "ink",
    icon: "story",
    qrCode: "/qr-codes/historia.svg",
    qrImage: "/qr/ceramica.svg",
  },
  {
    id: "maps",
    label: "Google Maps",
    action: "Ver ubicación",
    note: "Ubicación y visita al espacio en Lima.",
    href: "https://maps.google.com",
    meta: "Ruta al local",
    tone: "clay",
    external: true,
    icon: "maps",
    qrCode: "/qr-codes/maps.svg",
    qrImage: "/qr/plaza.svg",
  },
  {
    id: "instagram",
    label: "Instagram",
    action: "Visitar Instagram",
    note: "Sigue la bitácora y conoce nuevos relatos en Instagram.",
    href: contactChannels.instagram,
    meta: "Lo que estamos haciendo",
    tone: "coffee",
    external: true,
    icon: "instagram",
    qrCode: "/qr-codes/instagram.svg",
    qrImage: "/qr/cafe.svg",
  },
];

function LinkIcon({ type }: { type: LinkItem["icon"] }) {
  return (
    <svg className="link-card-icon" viewBox="0 0 64 64" aria-hidden="true">
      {type === "whatsapp" && (
        <>
          <path d="M16 50l3.5-10.5a20 20 0 1 1 8.1 6.8L16 50Z" />
          <path d="M25.5 22.8c1.4-1.1 2.7-.7 3.4.9l1.1 2.6c.4.9.2 1.7-.5 2.4l-1.1 1c1.7 3.3 4.2 5.7 7.6 7.1l1-1.2c.7-.8 1.5-1 2.5-.6l2.8 1.1c1.5.7 1.9 2 .8 3.4-1 1.3-2.5 2-4.4 2-7.7-.1-16.6-8.3-17.2-16.1-.1-1.1.3-2 1.1-2.6Z" />
        </>
      )}
      {type === "catalog" && (
        <>
          <path d="M18 13h19c5 0 9 4 9 9v29H25a7 7 0 0 1-7-7V13Z" />
          <path d="M25 13v30a8 8 0 0 0 8 8" />
          <path d="M28 24h12M28 31h10M28 38h8" />
        </>
      )}
      {type === "people" && (
        <>
          <path d="M14 51c2.4-8 8.5-12 18-12s15.6 4 18 12" />
          <path d="M22 24a10 10 0 1 0 20 0 10 10 0 0 0-20 0Z" />
          <path d="M13 39c2.2-4.2 5.8-6.8 10.6-7.9M40.4 31.1C45.2 32.2 48.8 34.8 51 39" />
        </>
      )}
      {type === "story" && (
        <>
          <path d="M18 16c8-4 13-1 14 4 1-5 6-8 14-4v33c-8-4-13-1-14 4-1-5-6-8-14-4V16Z" />
          <path d="M32 20v33M23 25h5M23 32h5M36 25h5M36 32h5" />
        </>
      )}
      {type === "maps" && (
        <>
          <path d="M32 55S17 40.4 17 27a15 15 0 0 1 30 0c0 13.4-15 28-15 28Z" />
          <path d="M26 27a6 6 0 1 0 12 0 6 6 0 0 0-12 0Z" />
        </>
      )}
      {type === "instagram" && (
        <>
          <rect x="16" y="16" width="32" height="32" rx="10" />
          <path d="M25 32a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" />
          <path d="M41.5 22.5h.1" />
        </>
      )}
    </svg>
  );
}

function LinkQr({ item }: { item: LinkItem }) {
  return (
    <div className="link-qr" aria-label={`Código QR para ${item.label}`}>
      <img className="link-qr-code" src={item.qrCode} alt="" />
      <span className="link-qr-image">
        <img src={item.qrImage} alt="" />
      </span>
    </div>
  );
}

export function LinksHub() {
  const [shared, setShared] = useState(false);
  const [openId, setOpenId] = useState(primaryLinks[0].id);

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
      <div className="links-load-atmosphere" aria-hidden="true">
        <svg className="links-load-roots" viewBox="0 0 1200 1800" preserveAspectRatio="none">
          <defs>
            <linearGradient id="linksRootGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e0ad5f" />
              <stop offset="48%" stopColor="#9c6b43" />
              <stop offset="100%" stopColor="#63754d" />
            </linearGradient>
          </defs>
          <path pathLength="1" className="links-root-path links-root-main" d="M778 -30 C756 110 810 213 748 344 C684 483 708 626 650 768 C586 924 624 1070 553 1217 C495 1336 446 1458 420 1835" />
          <path pathLength="1" className="links-root-path links-root-branch branch-one" d="M748 344 C868 368 956 462 1032 602" />
          <path pathLength="1" className="links-root-path links-root-branch branch-two" d="M650 768 C518 748 414 684 304 566" />
          <path pathLength="1" className="links-root-path links-root-branch branch-three" d="M553 1217 C690 1252 794 1348 875 1499" />
          <path pathLength="1" className="links-root-path links-root-branch branch-four" d="M473 1403 C332 1433 232 1520 142 1674" />
          <path pathLength="1" className="links-root-path links-root-branch branch-five" d="M707 582 C818 607 894 690 966 820" />
          <path pathLength="1" className="links-root-path links-root-branch branch-six" d="M611 922 C487 912 390 864 286 760" />
          <path pathLength="1" className="links-root-path links-root-branch branch-seven" d="M520 1324 C625 1342 706 1409 770 1518" />
          <path pathLength="1" className="links-root-path links-root-branch branch-eight" d="M442 1542 C332 1560 256 1618 188 1716" />
        </svg>
        <div className="links-background-words">
          <span className="word-willakuy">Willakuy</span>
          <span className="word-kawsay">Kawsay</span>
          <span className="word-territorio">Territorio</span>
          <span className="word-memoria">Memoria</span>
          <span className="word-cafe">Café</span>
          <span className="word-arte">Arte</span>
          <span className="word-ayacucho">Ayacucho</span>
        </div>
      </div>
      <div className="links-shell">
        <div className="links-topbar">
          <Link className="links-home" href="/">Volver al sitio</Link>
          <button className="links-share" type="button" onClick={sharePage}>
            {shared ? "Enlace copiado" : "Compartir"}
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

        <section className="links-accordion" aria-label="Accesos de Raíces">
          {primaryLinks.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `links-panel-${item.id}`;
            const buttonId = `links-button-${item.id}`;

            return (
              <article key={item.id} className={`link-card ${item.tone} ${isOpen ? "is-open" : ""}`}>
                <button
                  id={buttonId}
                  className="link-card-trigger"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? "" : item.id)}
                >
                  <span className="link-card-mark"><LinkIcon type={item.icon} /></span>
                  <span className="link-card-copy">
                    <small>{item.meta}</small>
                    <strong>{item.label}</strong>
                  </span>
                  <span className="link-card-toggle" aria-hidden="true" />
                </button>

                <div
                  id={panelId}
                  className="link-card-panel"
                  role="region"
                  aria-labelledby={buttonId}
                >
                  <div className="link-card-panel-inner">
                    <p>{item.note}</p>
                    <LinkQr item={item} />
                    <a
                      className="link-card-action"
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                    >
                      {item.action}
                    </a>
                  </div>
                </div>
              </article>
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
            <Link href="/personas/pedro-nahui-atao">Abrir historia</Link>
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
