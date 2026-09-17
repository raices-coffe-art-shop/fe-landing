import type { CatalogCategory, CatalogItem } from "@/sanity/lib/catalogTypes";
import { shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";

type OriginOfficialListProps = {
  items: CatalogItem[];
  categories: CatalogCategory[];
  showCatalogPrices: boolean;
};

function formatOfficialPrice(item: Pick<CatalogItem, "price" | "currency">) {
  if (typeof item.price !== "number") return null;
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: item.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(item.price);
}

export function OriginOfficialList({ items, categories, showCatalogPrices }: OriginOfficialListProps) {
  const visibleCategories = categories.filter((category) => category.isVisible !== false);

  if (!visibleCategories.length) return null;

  return (
    <section className="origin-official-list page-shell" aria-labelledby="origin-official-list-title">
      <div className="origin-official-list-heading">
        <div>
          <p className="eyebrow">Lista oficial</p>
          <h2 id="origin-official-list-title">Productos de Origen</h2>
        </div>
        <p>
          Presentaciones y precios vigentes según la información entregada para esta sección.
          Cuando no se proporcionó un precio, se indica <strong>Consultar</strong>.
        </p>
      </div>

      <div className="origin-official-list-groups">
        {visibleCategories.map((category, categoryIndex) => {
          const categoryItems = items
            .filter((item) => item.category.id === category.id)
            .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"));

          if (!categoryItems.length) return null;

          return (
            <section className="origin-official-group" key={category.id}>
              <h3><span>{categoryIndex + 1}.</span> {category.title}</h3>
              <div className="origin-official-table-wrap">
                <table className="origin-official-table">
                  <thead>
                    <tr>
                      <th scope="col">Producto / detalle</th>
                      <th scope="col">Presentación</th>
                      <th scope="col">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryItems.map((item) => {
                      const formattedPrice = formatOfficialPrice(item);
                      const displayPrice = Boolean(formattedPrice) && shouldDisplayCatalogPrice(item, showCatalogPrices);
                      const presentation = item.presentations.filter(Boolean).join(" · ") || "—";

                      return (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.title}</strong>
                            {item.producerOrCreator && <small>{item.producerOrCreator}</small>}
                            {item.shortDescription && <small>{item.shortDescription}</small>}
                          </td>
                          <td>{presentation}</td>
                          <td><strong>{displayPrice ? formattedPrice : "Consultar"}</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
