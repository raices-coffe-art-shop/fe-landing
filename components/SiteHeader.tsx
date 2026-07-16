"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  ["Historia", "#historia"],
  ["Territorio", "#territorio"],
  ["Personas", "#personas"],
  ["Arte", "#arte"],
  ["Catálogo", "#catalogo"],
  ["Visítanos", "#visita"],
  ["Enlaces", "/links"]
];

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
          {links.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
          ))}
          <a className="nav-cta" href="https://wa.me/51999999999" target="_blank" rel="noreferrer">
            Conversemos
          </a>
        </nav>

        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu">
          <span>{open ? "Cerrar" : "Menú"}</span>
          <i aria-hidden="true" />
        </button>
      </div>

      <div id="mobile-menu" className="mobile-menu" aria-hidden={!open}>
        <p>Explora Raíces</p>
        {links.map(([label, href], index) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            <span>0{index + 1}</span>{label}
          </a>
        ))}
        <a className="mobile-wa" href="https://wa.me/51999999999" target="_blank" rel="noreferrer">
          Escribir por WhatsApp ↗
        </a>
      </div>
    </header>
  );
}
