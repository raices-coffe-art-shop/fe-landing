import Link from "next/link";
import type { CatalogCategory, CatalogItem } from "@/sanity/lib/catalogTypes";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { buildCatalogInquiryHref } from "@/sanity/lib/inquiry";
import { EditorialImage } from "./EditorialImage";

type OriginCategoryGridProps = {
  items: CatalogItem[];
  categories: CatalogCategory[];
  contactHref: string;
  showCatalogPrices: boolean;
  initialCategory?: string;
};

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.2 5.5h13.6v9.2H10l-4.8 3.8v-13Z" />
    </svg>
  );
}

export function OriginCategoryGrid({
  items,
  categories,
  contactHref,
  showCatalogPrices,
  initialCategory,
}: OriginCategoryGridProps) {
  const requestedCategory = initialCategory && initialCategory !== "todos"
    ? categories.find((category) => category.slug === initialCategory)
    : undefined;

  const visibleCategories = (requestedCategory ? [requestedCategory] : categories).slice(0, 6);

  if (visibleCategories.length === 0) {
    return (
      <div className="origin-category-empty page-shell">
        <p>No hay categorías de Productos de Origen publicadas por el momento.</p>
      </div>
    );
  }

  return (
    <div className="origin-category-container page-shell">
      <div className="origin-category-grid">
        {visibleCategories.map((category) => {
          const categoryItems = items.filter((item) => item.category.id === category.id);
          const categoryImage = category.image || categoryItems[0]?.mainImage;
          const inquiryHref = buildCatalogInquiryHref(contactHref, { title: category.title });

          return (
            <article className="origin-category-card" key={category.id}>
              {categoryImage && (
                <div className="origin-category-image">
                  <EditorialImage src={categoryImage.src} alt={categoryImage.alt} />
                </div>
              )}

              <div className="origin-category-content">
                <div className="origin-category-heading">
                  <h3>{category.title}</h3>
                </div>

                <ul className="origin-category-products">
                  {categoryItems.map((item) => {
                    const formattedPrice = formatCatalogPrice(item);
                    const displayPrice = formattedPrice && shouldDisplayCatalogPrice(item, showCatalogPrices);
                    const presentation = item.presentations.filter(Boolean).join(" · ");

                    return (
                      <li key={item.id}>
                        <div>
                          <Link href={`/productos-de-origen/${item.slug}`}>{item.title}</Link>
                          {presentation && <span>{presentation}</span>}
                        </div>
                        <div className="origin-category-product-side">
                          <strong>{displayPrice ? formattedPrice : "Precio a consultar"}</strong>
                          <a
                            className="origin-category-item-inquiry"
                            href={buildCatalogInquiryHref(contactHref, item)}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Consultar por ${item.title} en WhatsApp`}
                          >
                            Consultar
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <a
                  className="catalog-action catalog-action-primary origin-category-whatsapp"
                  href={inquiryHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Pedir por WhatsApp productos de ${category.title}`}
                >
                  <MessageIcon />
                  <span>Pedir por WhatsApp</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
