import QRCode from "qrcode";
import { business } from "@/data/business";
import { contactChannels } from "@/data/social";
import { getCatalogItems } from "@/sanity/lib/catalog";
import type { CatalogItem } from "@/sanity/lib/catalog";
import { formatCatalogPrice, shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { getSiteSettings } from "@/sanity/lib/siteSettings";
import { getSiteUrl } from "@/lib/siteUrl";
import { resizeCatalogImage, resolveCategoryPhotos } from "@/lib/categoryImage";
import { filterPrintedMenuItems } from "@/lib/printedMenu";
import { PrintActions } from "./PrintActions";
import styles from "./carta.module.css";

// La hoja de la carta, compartida por dos rutas:
//   /catalogo/imprimir → herramienta interna, con fotos y botones de descarga.
//   /catalogo/carta    → lo que ve quien escanea el QR en la mesa: solo la carta.

type SubGroup = {
  title: string | null;
  items: CatalogItem[];
};

type CategoryGroup = {
  id: string;
  title: string;
  description?: string;
  image?: CatalogItem["category"]["image"];
  order: number;
  items: CatalogItem[];
  subGroups: SubGroup[];
};

// Los grupos se derivan de los items: una categoría sin productos no aparece.
function groupByCategory(items: CatalogItem[]): CategoryGroup[] {
  const groups = new Map<string, Omit<CategoryGroup, "subGroups">>();
  for (const item of items) {
    const existing = groups.get(item.category.id);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(item.category.id, {
        id: item.category.id,
        title: item.category.title,
        description: item.category.description,
        image: item.category.image,
        order: item.category.order,
        items: [item],
      });
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "es"))
    .map((group) => {
      const items = [...group.items].sort((a, b) => a.order - b.order);
      return { ...group, items, subGroups: buildSubGroups(items) };
    });
}

// Segundo nivel de la carta: cada sección puede traer sus propios subtítulos
// ("Clásicos", "Triples"…), tal como vienen en las cartas del cliente. Se
// derivan del campo Subcategoría respetando el orden de los productos, así el
// equipo controla la secuencia desde el Studio. Una sección sin subcategorías
// devuelve un único grupo sin título y se ve igual que antes.
function buildSubGroups(items: CatalogItem[]): SubGroup[] {
  const groups: SubGroup[] = [];
  for (const item of items) {
    const title = item.subcategory?.trim() || null;
    const current = groups.find((group) => group.title === title);
    if (current) current.items.push(item);
    else groups.push({ title, items: [item] });
  }
  return groups;
}

// La caja es cuadrada de 58 mm: a 300 dpi son ~685 px de lado. Se pide algo más
// para dar margen a impresoras de mayor densidad sin inflar el peso del PDF.
const PRINT_PHOTO_WIDTH = 760;
const PRINT_PHOTO_HEIGHT = 760;

type CartaSheetProps = {
  /** Muestra la columna de fotografías junto a cada categoría. */
  withPhotos: boolean;
  /** Botones de descarga: solo en la vista interna, nunca en la del comensal. */
  showActions: boolean;
};

export async function CartaSheet({ withPhotos, showActions }: CartaSheetProps) {
  const [items, settings] = await Promise.all([getCatalogItems(), getSiteSettings()]);
  const groups = groupByCategory(filterPrintedMenuItems(items));
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
              groups.map((group) => {
                // Una sola foto por categoría: la segunda rellenaba con imágenes
                // que no representaban a la sección.
                const photos = (
                  withPhotos ? resolveCategoryPhotos(group.image, group.items, 1) : []
                ).map((photo) => resizeCatalogImage(photo, PRINT_PHOTO_WIDTH, PRINT_PHOTO_HEIGHT));

                return (
                  <section
                    key={group.id}
                    className={`${styles.category} ${photos.length > 0 ? styles.categoryWithPhotos : ""}`}
                  >
                    <div className={styles.categoryBody}>
                      <h2 className={styles.categoryTitle}>{group.title}</h2>
                      {group.description && <p className={styles.categoryNote}>{group.description}</p>}
                      {group.subGroups.map((subGroup) => (
                        <div key={subGroup.title ?? "sin-subseccion"} className={styles.subGroup}>
                          {subGroup.title && (
                            <h3 className={styles.subCategoryTitle}>{subGroup.title}</h3>
                          )}
                          <ul className={styles.items}>
                            {subGroup.items.map((item) => {
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
                        </div>
                      ))}
                    </div>
                    {photos.length > 0 && (
                      <aside className={styles.categoryPhotos}>
                        {photos.map((photo) => (
                          <img
                            key={photo.src}
                            className={styles.categoryPhoto}
                            src={photo.src}
                            alt={photo.alt}
                            loading="eager"
                            decoding="async"
                          />
                        ))}
                      </aside>
                    )}
                  </section>
                );
              })
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
      {showActions && <PrintActions withPhotos={withPhotos} />}
    </main>
  );
}
