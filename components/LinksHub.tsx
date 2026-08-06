"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SocialPlatformIcon } from "@/components/SocialPlatformIcon";
import { heroImages } from "@/data/heroImages";
import type { BrandLogo, SocialLink, SocialPlatform } from "@/sanity/lib/siteSettings";

const LINKS_HERO_INTERVAL_MS = 7200;
const LINKS_HERO_TRANSITION_MS = 1350;

type LinkItem = {
  id: string;
  label: string;
  action: string;
  note: string;
  href: string;
  meta: string;
  tone: "honey" | "green" | "red" | "ink" | "clay" | "coffee";
  external?: boolean;
  icon: "whatsapp" | "catalog" | "people" | "story" | "maps" | "instagram" | "facebook" | "tiktok" | "youtube" | "email" | "other";
  qrCode: string;
  qrImage: string;
};

const editorialLinks: LinkItem[] = [
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
];

const socialMeta: Record<SocialPlatform, Omit<LinkItem, "id" | "label" | "href">> = {
  whatsapp: {
    action: "Abrir WhatsApp",
    note: "Pedidos, consultas y visitas al espacio.",
    meta: "Atención directa",
    tone: "honey",
    external: true,
    icon: "whatsapp",
    qrCode: "/qr-codes/whatsapp.svg",
    qrImage: "/qr/andes.svg",
  },
  instagram: {
    action: "Visitar Instagram",
    note: "Sigue la bitácora y conoce nuevos relatos en Instagram.",
    meta: "Lo que estamos haciendo",
    tone: "coffee",
    external: true,
    icon: "instagram",
    qrCode: "/qr-codes/instagram.svg",
    qrImage: "/qr/cafe.svg",
  },
  facebook: {
    action: "Visitar Facebook",
    note: "Actualizaciones, anuncios y publicaciones de Raíces.",
    meta: "Comunidad",
    tone: "green",
    external: true,
    icon: "facebook",
    qrCode: "/qr-codes/instagram.svg",
    qrImage: "/qr/textil.svg",
  },
  tiktok: {
    action: "Visitar TikTok",
    note: "Videos breves y momentos del espacio.",
    meta: "Video social",
    tone: "red",
    external: true,
    icon: "tiktok",
    qrCode: "/qr-codes/instagram.svg",
    qrImage: "/qr/retablo.svg",
  },
  youtube: {
    action: "Visitar YouTube",
    note: "Videos, entrevistas y registros del proyecto.",
    meta: "Archivo audiovisual",
    tone: "clay",
    external: true,
    icon: "youtube",
    qrCode: "/qr-codes/instagram.svg",
    qrImage: "/qr/ceramica.svg",
  },
  email: {
    action: "Escribir correo",
    note: "Consultas, colaboraciones y mensajes directos.",
    meta: "Correo directo",
    tone: "ink",
    icon: "email",
    qrCode: "/qr-codes/whatsapp.svg",
    qrImage: "/qr/plaza.svg",
  },
  other: {
    action: "Abrir enlace",
    note: "Otro canal oficial de Raíces.",
    meta: "Canal oficial",
    tone: "clay",
    external: true,
    icon: "other",
    qrCode: "/qr-codes/catalogo.svg",
    qrImage: "/qr/cafe.svg",
  },
};

function socialLinksToItems(links: SocialLink[]): LinkItem[] {
  return links.map((link) => ({
    id: `social-${link.platform}-${link.order}`,
    label: link.label,
    href: link.url,
    ...socialMeta[link.platform],
  }));
}

function LinkIcon({ type }: { type: LinkItem["icon"] }) {
  const socialTypes: SocialPlatform[] = [
    "whatsapp",
    "instagram",
    "facebook",
    "tiktok",
    "youtube",
    "email",
    "other",
  ];

  if (socialTypes.includes(type as SocialPlatform)) {
    return (
      <SocialPlatformIcon
        platform={type as SocialPlatform}
        className="link-card-icon social-platform-icon"
      />
    );
  }

  return (
    <svg className="link-card-icon" viewBox="0 0 64 64" aria-hidden="true">
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
    </svg>
  );
}

function LinkQr({ item }: { item: LinkItem }) {
  const [qrCode, setQrCode] = useState(item.qrCode);

  useEffect(() => {
    let cancelled = false;
    const value = /^(https?:|mailto:|tel:)/i.test(item.href)
      ? item.href
      : new URL(item.href, window.location.origin).toString();

    QRCode.toDataURL(value, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#2b211c", light: "#f4efe5" },
    })
      .then((dataUrl) => {
        if (!cancelled) setQrCode(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrCode(item.qrCode);
      });

    return () => {
      cancelled = true;
    };
  }, [item.href, item.qrCode]);

  return (
    <div className="link-qr" aria-label={`Código QR para ${item.label}`}>
      <img className="link-qr-code" src={qrCode} alt="" />
      <span className="link-qr-image">
        <img src={item.qrImage} alt="" />
      </span>
    </div>
  );
}

type LinksHubProps = {
  brandLogo: BrandLogo;
  socialLinks: SocialLink[];
};

function isExternalLink(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function LinksHub({ brandLogo, socialLinks }: LinksHubProps) {
  const primaryLinks = [...socialLinksToItems(socialLinks), ...editorialLinks];
  const [shared, setShared] = useState(false);
  const [openId, setOpenId] = useState(primaryLinks[0]?.id ?? "catalogo");
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const [previousHeroImage, setPreviousHeroImage] = useState<number | null>(null);
  const [heroRotationVersion, setHeroRotationVersion] = useState(0);
  const heroCardRef = useRef<HTMLElement>(null);
  const heroNearViewportRef = useRef(true);
  const clearPreviousHeroTimerRef = useRef(0);

  const visibleHeroImageIndexes = useMemo(() => {
    if (previousHeroImage === null || previousHeroImage === activeHeroImage) {
      return [activeHeroImage];
    }
    return [previousHeroImage, activeHeroImage];
  }, [activeHeroImage, previousHeroImage]);

  const changeHeroImage = useCallback((nextIndex: number, resetAutoRotation = false) => {
    if (!heroImages.length) return;

    const normalizedIndex = (nextIndex + heroImages.length) % heroImages.length;
    setActiveHeroImage((current) => {
      if (current === normalizedIndex) return current;

      setPreviousHeroImage(current);
      window.clearTimeout(clearPreviousHeroTimerRef.current);
      clearPreviousHeroTimerRef.current = window.setTimeout(
        () => setPreviousHeroImage(null),
        LINKS_HERO_TRANSITION_MS + 120,
      );
      return normalizedIndex;
    });

    if (resetAutoRotation) {
      setHeroRotationVersion((version) => version + 1);
    }
  }, []);

  const showPreviousHeroImage = () => {
    changeHeroImage(activeHeroImage - 1, true);
  };

  const showNextHeroImage = () => {
    changeHeroImage(activeHeroImage + 1, true);
  };

  useEffect(() => {
    const card = heroCardRef.current;
    if (!card || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        heroNearViewportRef.current = entry.isIntersecting;
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!heroImages.length || document.hidden) return;
    const preload = new window.Image();
    preload.src = heroImages[(activeHeroImage + 1) % heroImages.length].src;
  }, [activeHeroImage]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || heroImages.length < 2) return;

    const interval = window.setInterval(() => {
      if (!heroNearViewportRef.current || document.hidden) return;
      setActiveHeroImage((current) => {
        const next = (current + 1) % heroImages.length;
        setPreviousHeroImage(current);
        window.clearTimeout(clearPreviousHeroTimerRef.current);
        clearPreviousHeroTimerRef.current = window.setTimeout(
          () => setPreviousHeroImage(null),
          LINKS_HERO_TRANSITION_MS + 120,
        );
        return next;
      });
    }, LINKS_HERO_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(clearPreviousHeroTimerRef.current);
    };
  }, [heroRotationVersion]);

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

        <section ref={heroCardRef} className="links-hero-card">
          <div className="links-hero-media" aria-hidden="true">
            {visibleHeroImageIndexes.map((index) => {
              const image = heroImages[index];
              return (
                <div
                  key={image.src}
                  className={`links-hero-photo ${activeHeroImage === index ? "is-active" : "is-previous"}`}
                  style={{
                    backgroundImage: `url("${image.src}")`,
                    backgroundPosition: image.linksPosition ?? "center 50%",
                  }}
                />
              );
            })}
          </div>
          <div className="links-hero-glow" aria-hidden="true" />
          <div className="links-hero-content">
            <div className="links-kicker-row">
              <p className="links-kicker">Café · arte · territorio</p>
              <span>Ayacucho en Lima</span>
            </div>
            <h1 className="links-identity">
              <img src={brandLogo.src} alt={brandLogo.alt} width={168} height={168} />
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

          <div className="links-hero-controls" aria-label="Selector de imágenes del proyecto">
            <button
              className="links-hero-arrow"
              type="button"
              onClick={showPreviousHeroImage}
              aria-label="Mostrar imagen anterior"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14.5 5-7 7 7 7" />
              </svg>
            </button>

            <div className="links-hero-dots" role="group" aria-label="Elegir imagen">
              {heroImages.map((image, index) => (
                <button
                  key={image.src}
                  className={index === activeHeroImage ? "is-active" : ""}
                  type="button"
                  onClick={() => changeHeroImage(index, true)}
                  aria-label={`Mostrar imagen ${index + 1}: ${image.alt}`}
                  aria-current={index === activeHeroImage ? "true" : undefined}
                />
              ))}
            </div>

            <span className="links-hero-count" aria-live="polite">
              {String(activeHeroImage + 1).padStart(2, "0")} / {String(heroImages.length).padStart(2, "0")}
            </span>

            <button
              className="links-hero-arrow"
              type="button"
              onClick={showNextHeroImage}
              aria-label="Mostrar imagen siguiente"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9.5 5 7 7-7 7" />
              </svg>
            </button>
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
                      target={item.external || isExternalLink(item.href) ? "_blank" : undefined}
                      rel={item.external || isExternalLink(item.href) ? "noreferrer" : undefined}
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
