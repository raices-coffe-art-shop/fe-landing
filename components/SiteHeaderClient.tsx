"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { BrandLogo } from "@/sanity/lib/siteSettings";

type NavIcon = "home" | "story" | "territory" | "people" | "art" | "catalog" | "visit" | "links" | "contact";

type NavLink = { label: string; href: string; icon: NavIcon };

type WindowWithLenis = Window & {
  lenis?: {
    stop?: () => void;
    start?: () => void;
  };
};

const desktopLinks: NavLink[] = [
  { label: "Inicio", href: "/#inicio", icon: "home" },
  { label: "Nuestra historia", href: "/#historia", icon: "story" },
  { label: "Personas", href: "/#personas", icon: "people" },
  { label: "Territorio", href: "/#territorio", icon: "territory" },
  { label: "Arte", href: "/arte", icon: "art" },
  { label: "Catálogo", href: "/catalogo", icon: "catalog" },
  { label: "Comunidad", href: "/#comunidad", icon: "people" },
  { label: "Visítanos", href: "/#visita", icon: "visit" }
];

const mobileLinks: NavLink[] = [
  { label: "Inicio", href: "/#inicio", icon: "home" },
  { label: "Nuestra historia", href: "/#historia", icon: "story" },
  { label: "Personas", href: "/#personas", icon: "people" },
  { label: "Territorio", href: "/#territorio", icon: "territory" },
  { label: "Arte", href: "/arte", icon: "art" },
  { label: "Catálogo", href: "/catalogo", icon: "catalog" },
  { label: "Comunidad", href: "/#comunidad", icon: "people" },
  { label: "Visítanos", href: "/#visita", icon: "visit" }
];

function NavSvg({ icon }: { icon: NavIcon }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icon === "home" && <><path d="M3.5 11.4 12 4l8.5 7.4" /><path d="M5.5 10.6V20h13v-9.4" /><path d="M9.5 20v-5h5v5" /></>}
      {icon === "story" && <><path d="M4.5 5.5c3.5-1.5 6-.7 7.5 2 1.5-2.7 4-3.5 7.5-2v13c-3.5-1.5-6-.7-7.5 2-1.5-2.7-4-3.5-7.5-2v-13Z" /><path d="M12 7.5v13" /></>}
      {icon === "territory" && <><path d="m3.5 18 5.2-9 3.8 6.1 2.3-3.4 5.7 6.3" /><path d="M8.7 9 11 5l3.8 6.7" /></>}
      {icon === "people" && <><path d="M5 19c1.1-3.2 3.4-4.8 7-4.8s5.9 1.6 7 4.8" /><path d="M8.5 8.8a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" /></>}
      {icon === "art" && <><path d="M12 3.8c4.8 0 8.5 3.2 8.5 7.3 0 2.6-1.8 4.1-4 4.1h-1.2c-1 0-1.6.7-1.3 1.7.4 1.4-.6 3.3-2.8 3.3-4.1 0-7.7-3.5-7.7-8.2 0-4.6 3.7-8.2 8.5-8.2Z" /><path d="M7.6 11.1h.1M9.4 7.7h.1M13.5 7.3h.1M16.5 10.3h.1" /></>}
      {icon === "catalog" && <><path d="M6 4.5h9a3 3 0 0 1 3 3v12H8.5A2.5 2.5 0 0 1 6 17V4.5Z" /><path d="M8.5 4.5V17a2.5 2.5 0 0 0 2.5 2.5" /><path d="M10.5 9h4M10.5 12h3" /></>}
      {icon === "visit" && <><path d="M12 21s6-6.1 6-11A6 6 0 0 0 6 10c0 4.9 6 11 6 11Z" /><path d="M9.7 10a2.3 2.3 0 1 0 4.6 0 2.3 2.3 0 0 0-4.6 0Z" /></>}
      {icon === "links" && <><path d="M9.2 14.8 7.8 16.2a3.4 3.4 0 0 1-4.8-4.8l2.4-2.4a3.4 3.4 0 0 1 4.8 0" /><path d="m14.8 9.2 1.4-1.4a3.4 3.4 0 0 1 4.8 4.8l-2.4 2.4a3.4 3.4 0 0 1-4.8 0" /><path d="m8.8 15.2 6.4-6.4" /></>}
      {icon === "contact" && <><path d="M4.5 5.5h15v10h-8l-4.5 4v-4H4.5v-10Z" /><path d="M8 9h8M8 12h5" /></>}
    </svg>
  );
}

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
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    previousBodyOverflow.current = document.body.style.overflow;
    previousHtmlOverflow.current = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const lenis = (window as WindowWithLenis).lenis;
    lenis?.stop?.();

    const backgroundElements = Array.from(
      document.body.querySelectorAll<HTMLElement>("body > main, body > footer")
    );
    const previousInert = backgroundElements.map((element) => element.inert);
    backgroundElements.forEach((element) => { element.inert = true; });

    // SmoothScroll does not currently expose its Lenis instance globally. These
    // listeners prevent Lenis and native scrolling from reacting behind the panel.
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
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Raíces, inicio">
          <img className="brand-logo" src={brandLogo.src} alt={brandLogo.alt} width={52} height={52} />
          <span className="brand-tag">Café y cultura</span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          {desktopLinks.map(({ label, href, icon }) => (
            <a key={href} href={href}><NavSvg icon={icon} />{label}</a>
          ))}
          <a className="nav-cta" href={contactHref} target="_blank" rel="noreferrer">
            <NavSvg icon="contact" />Conversemos
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
          <span>{open ? "Cerrar" : "Menú"}</span>
          <span className="menu-button-lines" aria-hidden="true">
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
          {mobileLinks.map(({ label, href, icon }, index) => (
            <a key={href} href={href} onClick={() => closeMenu()} tabIndex={open ? 0 : -1}>
              <span>{String(index + 1).padStart(2, "0")}</span><NavSvg icon={icon} />{label}
            </a>
          ))}
          <a className="mobile-wa" href={contactHref} target="_blank" rel="noreferrer" onClick={() => closeMenu()} tabIndex={open ? 0 : -1}>
            Escribir por WhatsApp ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
