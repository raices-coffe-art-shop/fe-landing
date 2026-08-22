import Link from "next/link";
import { EditorialImage } from "./EditorialImage";
import type { CatalogItem } from "@/sanity/lib/catalogTypes";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { buildCatalogInquiryHref } from "@/sanity/lib/inquiry";

type CatalogCardProps = {
  item: CatalogItem;
  index: number;
  contactHref: string;
  showCatalogPrices: boolean;
  variant?: "preview" | "full";
};

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.2 5.5h13.6v9.2H10l-4.8 3.8v-13Z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 3.8h7.2L18 7.6v12.6H7V3.8Z" />
      <path d="M14 3.8v4h4M9.8 12h5.5M9.8 15.3h5.5" />
    </svg>
  );
}

export function CatalogCard({
  item,
  index,
  contactHref,
  showCatalogPrices,
  variant = "full",
}: CatalogCardProps) {
  const number = String(index + 1).padStart(2, "0");
  const formattedPrice = formatCatalogPrice(item);
  const displayPrice = formattedPrice && shouldDisplayCatalogPrice(item, showCatalogPrices);

  return (
    <article className={`product-card catalog-card catalog-card-${variant}`}>
      <div className="product-image catalog-card-image">
        <EditorialImage src={item.mainImage.src} alt={item.mainImage.alt} />
        <span className="product-number">{number}</span>
      </div>
      <div className="product-copy catalog-card-copy">
        <div className="catalog-card-meta">
          <span>{item.category.title}</span>
          <span>{item.origin}</span>
        </div>
        <p className="product-subcategory" aria-hidden={!item.subcategory}>{item.subcategory || "\u00A0"}</p>
        <div className="catalog-card-heading-block">
          <h3>{item.title}</h3>
          <div
            className={`catalog-card-price-slot ${displayPrice ? "has-price" : "is-inquiry"}`}
            aria-label={displayPrice ? `Precio: ${formattedPrice}` : "Precio disponible bajo consulta"}
          >
            {displayPrice ? (
              <>
                <span>Precio</span>
                <strong>{formattedPrice}</strong>
              </>
            ) : (
              <strong>Consultar</strong>
            )}
          </div>
        </div>
        <p className="catalog-card-description">{item.shortDescription}</p>
        <div className="catalog-card-actions">
          <a
            className="catalog-action catalog-action-primary"
            href={buildCatalogInquiryHref(contactHref, item)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Consultar por ${item.title}`}
          >
            <MessageIcon />
            <span>Consultar</span>
          </a>
          <Link
            className="catalog-action catalog-action-secondary"
            href={`/catalogo/${item.slug}`}
            aria-label={`Ver ficha completa de ${item.title}`}
          >
            <FileIcon />
            <span>Ver ficha</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
