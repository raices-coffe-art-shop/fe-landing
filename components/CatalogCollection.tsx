"use client";

import { useId, useMemo, useState } from "react";
import type { CatalogCategory, CatalogItem } from "@/sanity/lib/catalogTypes";
import { CatalogCard } from "./CatalogCard";

type CatalogCollectionProps = {
  items: CatalogItem[];
  categories: CatalogCategory[];
  contactHref: string;
  showCatalogPrices: boolean;
  variant: "preview" | "full";
  initialCategory?: string;
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function searchableText(item: CatalogItem) {
  return normalizeSearchText(
    [
      item.title,
      item.category.title,
      item.subcategory,
      item.origin,
      item.region,
      item.shortDescription,
      item.producerOrCreator,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function CatalogCollection({
  items,
  categories,
  contactHref,
  showCatalogPrices,
  variant,
  initialCategory = "todos",
}: CatalogCollectionProps) {
  const searchId = useId();
  const categoryExists = categories.some((category) => category.slug === initialCategory);
  const [activeCategory, setActiveCategory] = useState(categoryExists ? initialCategory : "todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);
  const [desktopColumns, setDesktopColumns] = useState<3 | 4>(4);
  const normalizedSearch = normalizeSearchText(searchTerm);

  const filteredItems = useMemo(() => {
    const byCategory = activeCategory === "todos"
      ? items
      : items.filter((item) => item.category.slug === activeCategory);

    if (!normalizedSearch) return byCategory;
    return byCategory.filter((item) => searchableText(item).includes(normalizedSearch));
  }, [activeCategory, items, normalizedSearch]);

  const selectCategory = (slug: string) => {
    setActiveCategory(slug);
    if (variant !== "full") return;

    const url = new URL(window.location.href);
    if (slug === "todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", slug);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    selectCategory("todos");
  };

  return (
    <>
      {variant === "full" && (
        <div className="catalog-search page-shell">
          <div className="catalog-search-heading">
            <label htmlFor={searchId}>Buscar un producto</label>
            <p>Escribe el nombre, la categoría, la procedencia o una palabra relacionada.</p>
          </div>
          <div className="catalog-search-control">
            <span aria-hidden="true">⌕</span>
            <input
              id={searchId}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ejemplo: café, miel, retablos…"
              autoComplete="off"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} aria-label="Limpiar búsqueda">
                Limpiar
              </button>
            )}
          </div>
          <p className="catalog-search-results" aria-live="polite">
            {filteredItems.length} {filteredItems.length === 1 ? "producto encontrado" : "productos encontrados"}
          </p>
        </div>
      )}

      {categories.length > 0 && (
        <div className="catalog-filters page-shell" role="group" aria-label="Filtrar productos por categoría">
          <button
            type="button"
            className={activeCategory === "todos" ? "is-active" : ""}
            onClick={() => selectCategory("todos")}
            aria-pressed={activeCategory === "todos"}
          >
            Todos los productos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={activeCategory === category.slug ? "is-active" : ""}
              onClick={() => selectCategory(category.slug)}
              aria-pressed={activeCategory === category.slug}
            >
              {category.title}
            </button>
          ))}
        </div>
      )}


      {filteredItems.length > 0 && (
        <div
          className={`catalog-view-toolbar catalog-view-toolbar-${variant} page-shell`}
          aria-label="Opciones de visualización del catálogo"
        >
          {variant === "full" && (
            <div className="catalog-view-group catalog-view-desktop">
              <div className="catalog-view-options" role="group" aria-label="Cantidad de productos por fila">
                <button
                  type="button"
                  className={desktopColumns === 4 ? "is-active" : ""}
                  onClick={() => setDesktopColumns(4)}
                  aria-pressed={desktopColumns === 4}
                  aria-label="Mostrar cuatro productos por fila"
                >
                  <svg viewBox="0 0 28 24" aria-hidden="true" focusable="false">
                    <rect x="2" y="4" width="5" height="7" rx="1" />
                    <rect x="8.5" y="4" width="5" height="7" rx="1" />
                    <rect x="15" y="4" width="5" height="7" rx="1" />
                    <rect x="21.5" y="4" width="5" height="7" rx="1" />
                    <rect x="2" y="14" width="5" height="6" rx="1" />
                    <rect x="8.5" y="14" width="5" height="6" rx="1" />
                    <rect x="15" y="14" width="5" height="6" rx="1" />
                    <rect x="21.5" y="14" width="5" height="6" rx="1" />
                  </svg>
                  <span>4 por fila</span>
                </button>
                <button
                  type="button"
                  className={desktopColumns === 3 ? "is-active" : ""}
                  onClick={() => setDesktopColumns(3)}
                  aria-pressed={desktopColumns === 3}
                  aria-label="Mostrar tres productos por fila"
                >
                  <svg viewBox="0 0 28 24" aria-hidden="true" focusable="false">
                    <rect x="2" y="4" width="7" height="7" rx="1" />
                    <rect x="10.5" y="4" width="7" height="7" rx="1" />
                    <rect x="19" y="4" width="7" height="7" rx="1" />
                    <rect x="2" y="14" width="7" height="6" rx="1" />
                    <rect x="10.5" y="14" width="7" height="6" rx="1" />
                    <rect x="19" y="14" width="7" height="6" rx="1" />
                  </svg>
                  <span>3 por fila</span>
                </button>
              </div>
            </div>
          )}

          <div className="catalog-view-group catalog-view-mobile">
            <div className="catalog-view-options" role="group" aria-label="Cantidad de productos por fila">
              <button
                type="button"
                className={mobileColumns === 2 ? "is-active" : ""}
                onClick={() => setMobileColumns(2)}
                aria-pressed={mobileColumns === 2}
                aria-label="Mostrar dos productos por fila"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="3" y="4" width="7" height="7" rx="1" />
                  <rect x="14" y="4" width="7" height="7" rx="1" />
                  <rect x="3" y="15" width="7" height="5" rx="1" />
                  <rect x="14" y="15" width="7" height="5" rx="1" />
                </svg>
                <span>2 por fila</span>
              </button>
              <button
                type="button"
                className={mobileColumns === 1 ? "is-active" : ""}
                onClick={() => setMobileColumns(1)}
                aria-pressed={mobileColumns === 1}
                aria-label="Mostrar un producto por fila"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="3" y="4" width="18" height="6" rx="1" />
                  <rect x="3" y="14" width="18" height="6" rx="1" />
                </svg>
                <span>1 por fila</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length > 0 ? (
        <div
          className={`catalog-rail page-shell catalog-rail-${variant} catalog-mobile-cols-${mobileColumns} catalog-desktop-cols-${desktopColumns}`}
          aria-live="polite"
        >
          {filteredItems.map((item, index) => (
            <CatalogCard
              key={item.id}
              item={item}
              index={index}
              contactHref={contactHref}
              showCatalogPrices={showCatalogPrices}
              variant={variant}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-empty page-shell" role="status">
          <p className="eyebrow">Sin resultados</p>
          <h3>{normalizedSearch ? "No encontramos un producto con ese nombre." : "No hay productos publicados en esta categoría."}</h3>
          <p>
            {normalizedSearch
              ? "Prueba con una palabra más corta, otra categoría o revisa la escritura."
              : "Prueba otra categoría o vuelve pronto. El contenido se administra desde Sanity Studio."}
          </p>
          {(activeCategory !== "todos" || normalizedSearch) && (
            <button type="button" onClick={clearFilters}>Mostrar todo el catálogo</button>
          )}
        </div>
      )}
    </>
  );
}
