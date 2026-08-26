"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { BrandLogo } from "@/sanity/lib/siteSettings";
import { SocialPlatformIcon } from "@/components/SocialPlatformIcon";

type NavLink = { label: string; href: string };

// Seis destinos en el orden en que se recorre la marca: del relato al producto
// y cierre en la visita. Territorio y Comunidad quedan dentro de la portada, y
// Links vive en el pie, que es su lugar natural.
const navLinks: NavLink[] = [
  { label: "Historia", href: "/#historia" },
  { label: "Personas", href: "/#personas" },
  { label: "Arte", href: "/arte" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Publicaciones", href: "/publicaciones" },
  { label: "Visítanos", href: "/#visita" },
];

type SiteHeaderClientProps = {
  brandLogo: BrandLogo;
  contactHref: string;
};

export function SiteHeaderClient({ brandLogo, contactHref }: SiteHeaderClientProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navigationId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousBodyOverflow = useRef("");
  const previousHtmlOverflow = useRef("");
  const shouldReturnFocus = useRef(false);

  useEffect(() => {
    let frame = 0;
    let previous = false;

    const update = () => {
      frame = 0;
      const next = window.scrollY > 48;
      if (next === previous) return;
      previous = next;
      setScrolled(next);
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    previous = window.scrollY > 48;
    setScrolled(previous);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    previousBodyOverflow.current = document.body.style.overflow;
    previousHtmlOverflow.current = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const lenis = window.__raicesLenis;
    lenis?.stop?.();

    const backgroundElements = Array.from(
      document.body.querySelectorAll<HTMLElement>("body > main, body > footer")
    );
    const previousInert = backgroundElements.map((element) => element.inert);
    backgroundElements.forEach((element) => { element.inert = true; });

    // Además de pausar Lenis, estos listeners evitan que el scroll nativo
    // reaccione detrás del panel en dispositivos táctiles.
    const preventBackgroundScroll = (event: Event) => {
      const target = event.target as Node | null;
      if (target && menuRef.current?.contains(target)) return;
      event.preventDefault();
    };
    window.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", preventBackgroundScroll, { passive: false });

    const firstLink = menuRef.current?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    return () => {
      document.body.style.overflow = previousBodyOverflow.current;
      document.documentElement.style.overflow = previousHtmlOverflow.current;
      lenis?.start?.();
      window.removeEventListener("wheel", preventBackgroundScroll);
      window.removeEventListener("touchmove", preventBackgroundScroll);
      backgroundElements.forEach((element, index) => {
        element.inert = previousInert[index];
      });
      if (shouldReturnFocus.current) {
        buttonRef.current?.focus();
        shouldReturnFocus.current = false;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        shouldReturnFocus.current = true;
        setOpen(false);
        return;
      }

      if (event.key === "Tab") {
        const focusable = [
          buttonRef.current,
          ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [])
        ].filter((element): element is HTMLElement => Boolean(element));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onHashChange = () => setOpen(false);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      shouldReturnFocus.current = true;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const closeMenu = (returnFocus = false) => {
    shouldReturnFocus.current = returnFocus;
    setOpen(false);
  };

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Raíces, inicio">
          <img className="brand-logo" src={brandLogo.src} alt={brandLogo.alt} width={52} height={52} />
          <span className="brand-tag">Café y cultura</span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          {navLinks.map(({ label, href }) => (
            <a key={href} href={href}>{label}</a>
          ))}
          <a className="nav-cta" href={contactHref} target="_blank" rel="noreferrer">
            <SocialPlatformIcon platform="whatsapp" className="nav-whatsapp-icon" /><span>Conversemos</span>
          </a>
        </nav>

        <button
          ref={buttonRef}
          className="menu-button"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={navigationId}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          <span className="menu-button-label">{open ? "Cerrar" : "Menú"}</span>
          <span className="menu-button-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        className="mobile-menu-backdrop"
        aria-hidden="true"
        onClick={() => closeMenu()}
      />

      <div
        ref={menuRef}
        id={navigationId}
        className="mobile-menu"
        aria-hidden={!open}
      >
        <nav aria-label="Navegación móvil">
          <p>Explora Raíces</p>
          {navLinks.map(({ label, href }, index) => (
            <a key={href} href={href} onClick={() => closeMenu()} tabIndex={open ? 0 : -1}>
              <span>{String(index + 1).padStart(2, "0")}</span>{label}
            </a>
          ))}
          <a className="mobile-wa" href={contactHref} target="_blank" rel="noreferrer" onClick={() => closeMenu()} tabIndex={open ? 0 : -1}>
            <SocialPlatformIcon platform="whatsapp" className="mobile-wa-icon" />
            <span>Escribir por WhatsApp</span>
          </a>
        </nav>
      </div>

      </header>

      <a
        className={`floating-whatsapp ${open ? "is-hidden" : ""}`}
        href={contactHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Escribir a Raíces por WhatsApp"
      >
        <SocialPlatformIcon platform="whatsapp" className="floating-whatsapp-icon" />
        <span>WhatsApp</span>
      </a>
    </>
  );
}
