"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavIcon = "home" | "story" | "territory" | "people" | "art" | "catalog" | "visit" | "links" | "contact";

const links: { label: string; href: string; icon: NavIcon }[] = [
  { label: "Inicio", href: "/#inicio", icon: "home" },
  { label: "Historia", href: "/#historia", icon: "story" },
  { label: "Territorio", href: "/#territorio", icon: "territory" },
  { label: "Personas", href: "/#personas", icon: "people" },
  { label: "Arte", href: "/#arte", icon: "art" },
  { label: "Catálogo", href: "/#catalogo", icon: "catalog" },
  { label: "Visítanos", href: "/#visita", icon: "visit" },
  { label: "Enlaces", href: "/links", icon: "links" }
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

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Raíces, inicio">
          <span className="brand-word">Raíces</span>
          <span className="brand-tag">Café y Cultura</span>
        </Link>

        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map(({ label, href, icon }) => (
            <a key={href} href={href}><NavSvg icon={icon} />{label}</a>
          ))}
          <a className="nav-cta" href="https://wa.me/51999999999" target="_blank" rel="noreferrer">
            <NavSvg icon="contact" />Conversemos
          </a>
        </nav>

        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu">
          <span>{open ? "Cerrar" : "Menú"}</span>
          <i aria-hidden="true" />
        </button>
      </div>

      <div id="mobile-menu" className="mobile-menu" aria-hidden={!open}>
        <p>Explora Raíces</p>
        {links.map(({ label, href, icon }, index) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            <span>0{index + 1}</span><NavSvg icon={icon} />{label}
          </a>
        ))}
        <a className="mobile-wa" href="https://wa.me/51999999999" target="_blank" rel="noreferrer">
          Escribir por WhatsApp ↗
        </a>
      </div>
    </header>
  );
}
