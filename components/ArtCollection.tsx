"use client";

import { useId, useMemo, useState } from "react";
import type { CatalogCategory, CatalogItem } from "@/sanity/lib/catalogTypes";
import { ArtCard } from "./ArtCard";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

function searchable(item: CatalogItem) {
  return normalize([item.title, item.category.title, item.subcategory, item.origin, item.shortDescription, item.producerOrCreator].filter(Boolean).join(" "));
}

export function ArtCollection({ items, categories, contactHref, showPrices }: { items: CatalogItem[]; categories: CatalogCategory[]; contactHref: string; showPrices: boolean }) {
  const searchId = useId();
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);
  const [desktopColumns, setDesktopColumns] = useState<3 | 4>(4);
  const term = normalize(searchTerm);

  const filtered = useMemo(() => {
    const byCategory = activeCategory === "todos" ? items : items.filter((item) => item.category.slug === activeCategory);
    return term ? byCategory.filter((item) => searchable(item).includes(term)) : byCategory;
  }, [activeCategory, items, term]);

  const clearFilters = () => { setSearchTerm(""); setActiveCategory("todos"); };

  return (
    <>
      <div className="catalog-search page-shell">
        <div className="catalog-search-heading">
          <label htmlFor={searchId}>Buscar una pieza</label>
          <p>Escribe el nombre, la categoría, la procedencia o una palabra relacionada.</p>
        </div>
        <div className="catalog-search-control">
          <span aria-hidden="true">⌕</span>
          <input id={searchId} type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Ejemplo: torito, retablo, nacimiento…" autoComplete="off" />
          {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Limpiar búsqueda">Limpiar</button>}
        </div>
        <p className="catalog-search-results" aria-live="polite">{filtered.length} {filtered.length === 1 ? "pieza encontrada" : "piezas encontradas"}</p>
      </div>

      {categories.length > 0 && (
        <div className="catalog-filters page-shell" role="group" aria-label="Filtrar piezas por categoría">
          <button type="button" className={activeCategory === "todos" ? "is-active" : ""} onClick={() => setActiveCategory("todos")} aria-pressed={activeCategory === "todos"}>Todas las piezas</button>
          {categories.map((category) => (
            <button key={category.id} type="button" className={activeCategory === category.slug ? "is-active" : ""} onClick={() => setActiveCategory(category.slug)} aria-pressed={activeCategory === category.slug}>{category.title}</button>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="catalog-view-toolbar catalog-view-toolbar-full page-shell" aria-label="Opciones de visualización de la Galería de Arte">
          <div className="catalog-view-group catalog-view-desktop">
            <div className="catalog-view-options" role="group" aria-label="Cantidad de piezas por fila">
              <button type="button" className={desktopColumns === 4 ? "is-active" : ""} onClick={() => setDesktopColumns(4)} aria-pressed={desktopColumns === 4}>4 por fila</button>
              <button type="button" className={desktopColumns === 3 ? "is-active" : ""} onClick={() => setDesktopColumns(3)} aria-pressed={desktopColumns === 3}>3 por fila</button>
            </div>
          </div>
          <div className="catalog-view-group catalog-view-mobile">
            <div className="catalog-view-options" role="group" aria-label="Cantidad de piezas por fila">
              <button type="button" className={mobileColumns === 2 ? "is-active" : ""} onClick={() => setMobileColumns(2)} aria-pressed={mobileColumns === 2}>2 por fila</button>
              <button type="button" className={mobileColumns === 1 ? "is-active" : ""} onClick={() => setMobileColumns(1)} aria-pressed={mobileColumns === 1}>1 por fila</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length ? (
        <div className={`catalog-rail page-shell catalog-rail-full catalog-mobile-cols-${mobileColumns} catalog-desktop-cols-${desktopColumns}`} aria-live="polite">
          {filtered.map((item, index) => <ArtCard key={item.id} item={item} index={index} contactHref={contactHref} showPrices={showPrices} />)}
        </div>
      ) : (
        <div className="catalog-empty page-shell" role="status">
          <p className="eyebrow">Sin resultados</p>
          <h3>No encontramos una pieza con esos filtros.</h3>
          <p>Prueba con otra palabra o categoría para descubrir más piezas de la galería.</p>
          <button type="button" onClick={clearFilters}>Mostrar toda la Galería de Arte</button>
        </div>
      )}
    </>
  );
}
