import type { Metadata } from "next";
import QRCode from "qrcode";
import { business } from "@/data/business";
import { contactChannels } from "@/data/social";
import { getCatalogItems } from "@/sanity/lib/catalog";
import type { CatalogItem } from "@/sanity/lib/catalog";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { getSiteSettings } from "@/sanity/lib/siteSettings";
import { getSiteUrl } from "@/lib/siteUrl";
import { PrintActions } from "./PrintActions";
import styles from "./imprimir.module.css";

export const metadata: Metadata = {
  title: "Carta para imprimir",
  robots: { index: false, follow: false },
};

type CategoryGroup = {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: CatalogItem[];
};

// Los grupos se derivan de los items: una categoría sin productos no aparece.
function groupByCategory(items: CatalogItem[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();
  for (const item of items) {
    const existing = groups.get(item.category.id);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(item.category.id, {
        id: item.category.id,
        title: item.category.title,
        description: item.category.description,
        order: item.category.order,
        items: [item],
      });
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"))
    .map((group) => ({ ...group, items: [...group.items].sort((a, b) => a.order - b.order) }));
}

export default async function ImprimirCartaPage() {
  const [items, settings] = await Promise.all([getCatalogItems(), getSiteSettings()]);
  const groups = groupByCategory(items);
  const siteUrl = getSiteUrl();
  const catalogUrl = `${siteUrl}/catalogo`;
  const catalogDisplayUrl = catalogUrl.replace(/^https?:\/\//, "");

  const qrDataUrl = await QRCode.toDataURL(catalogUrl, {
    width: 480,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#2b211c", light: "#ffffff" },
  });

  return (
    <main className={styles.page}>
      {/* El navegador imprime fecha, título y URL en los márgenes de la hoja. Con @page margin: 0
          desaparecen, y la tabla repite estos espaciadores como margen en cada página impresa. */}
      <table className={styles.printTable}>
        <thead><tr><td><div className={styles.printSpacer} /></td></tr></thead>
        <tbody><tr><td>
      <div className={styles.sheet}>
        <header className={styles.header}>
          <img
            className={styles.logo}
            src={settings.brandLogo.src}
            alt={settings.brandLogo.alt}
            width={56}
            height={56}
          />
          <p className={styles.wordmark}>Raíces</p>
          <p className={styles.tagline}>Café y Cultura — Ayacucho · Lima</p>
        </header>

        {groups.length === 0 ? (
          <p className={styles.emptyNote}>
            La carta se está actualizando. Escanea el código para ver el catálogo en línea.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.id} className={styles.category}>
              <h2 className={styles.categoryTitle}>{group.title}</h2>
              {group.description && <p className={styles.categoryNote}>{group.description}</p>}
              <ul className={styles.items}>
                {group.items.map((item) => {
                  const price = shouldDisplayCatalogPrice(item, settings.showCatalogPrices)
                    ? formatCatalogPrice(item)
                    : null;
                  return (
                    <li key={item.id} className={styles.item}>
                      <div className={styles.itemRow}>
                        <span className={styles.itemName}>{item.title}</span>
                        <span className={styles.leader} aria-hidden="true" />
                        {price ? (
                          <span className={styles.itemPrice}>{price}</span>
                        ) : (
                          <span className={styles.itemInquiry}>Consultar</span>
                        )}
                      </div>
                      {item.shortDescription && (
                        <p className={styles.itemDescription}>{item.shortDescription}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}

        <footer className={styles.footer}>
          <img className={styles.qr} src={qrDataUrl} alt={`Código QR de la carta: ${catalogDisplayUrl}`} />
          <div className={styles.footerCopy}>
            <p className={styles.footerLead}>Escanea para ver el catálogo completo</p>
            <p className={styles.footerUrl}>{catalogDisplayUrl}</p>
          </div>
          <div className={styles.footerContact}>
            <p>WhatsApp {contactChannels.whatsappDisplay}</p>
            <p>@raicescoffeeartshop</p>
            <p>
              {business.address.streetAddress
                ? `${business.address.streetAddress}, ${business.address.addressLocality}`
                : `${business.address.addressLocality}, Perú`}
            </p>
          </div>
        </footer>
      </div>
        </td></tr></tbody>
        <tfoot><tr><td><div className={styles.printSpacer} /></td></tr></tfoot>
      </table>
      <PrintActions />
    </main>
  );
}
