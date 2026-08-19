import { business } from "@/data/business";
import type { CatalogCategory, CatalogItem } from "@/sanity/lib/catalogTypes";
import { shouldDisplayCatalogPrice } from "@/sanity/lib/catalogShared";
import { absoluteUrl, getSiteUrl } from "./siteUrl";

// Los precios solo se emiten cuando también son visibles en la web: Google no
// debe mostrar un precio que la página oculta.
function itemOffer(item: CatalogItem, showCatalogPrices: boolean) {
  if (!shouldDisplayCatalogPrice(item, showCatalogPrices) || typeof item.price !== "number") {
    return {};
  }
  return {
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: item.currency,
      url: absoluteUrl(`/catalogo/${item.slug}`),
      availability: "https://schema.org/InStock",
    },
  };
}

export function cafeJsonLd(): Record<string, unknown> {
  const address: Record<string, unknown> = {
    "@type": "PostalAddress",
    addressLocality: business.address.addressLocality,
    addressRegion: business.address.addressRegion,
    addressCountry: business.address.addressCountry,
  };
  if (business.address.streetAddress) {
    address.streetAddress = business.address.streetAddress;
  }

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${getSiteUrl()}/#negocio`,
    name: business.name,
    alternateName: business.alternateName,
    ...(business.legalName ? { legalName: business.legalName } : {}),
    description: business.description,
    url: getSiteUrl(),
    logo: absoluteUrl("/raices-logo-lg.png"),
    image: absoluteUrl("/media/raices/raices-local-entrada.webp"),
    telephone: business.telephone,
    email: business.email,
    servesCuisine: business.servesCuisine,
    priceRange: business.priceRange,
    sameAs: business.sameAs,
    address,
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    hasMenu: absoluteUrl("/catalogo"),
    ...(business.mapsPlaceUrl ? { hasMap: business.mapsPlaceUrl } : {}),
    ...(business.openingHours
      ? {
          openingHoursSpecification: business.openingHours.map((spec) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: spec.dayOfWeek,
            opens: spec.opens,
            closes: spec.closes,
          })),
        }
      : {}),
  };
}

export function menuJsonLd(
  items: CatalogItem[],
  categories: CatalogCategory[],
  showCatalogPrices: boolean,
): Record<string, unknown> {
  const sections = categories
    .map((category) => {
      const sectionItems = items.filter((item) => item.category.id === category.id);
      if (sectionItems.length === 0) return null;
      return {
        "@type": "MenuSection",
        name: category.title,
        ...(category.description ? { description: category.description } : {}),
        hasMenuItem: sectionItems.map((item) => ({
          "@type": "MenuItem",
          name: item.title,
          description: item.shortDescription,
          image: item.mainImage.src,
          url: absoluteUrl(`/catalogo/${item.slug}`),
          ...itemOffer(item, showCatalogPrices),
        })),
      };
    })
    .filter((section) => section !== null);

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `Carta de ${business.name}`,
    url: absoluteUrl("/catalogo"),
    inLanguage: "es-PE",
    hasMenuSection: sections,
  };
}

export function productJsonLd(item: CatalogItem, showCatalogPrices: boolean): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: item.shortDescription,
    image: item.mainImage.src,
    url: absoluteUrl(`/catalogo/${item.slug}`),
    brand: { "@type": "Brand", name: business.name },
    ...(item.category ? { category: item.category.title } : {}),
    ...itemOffer(item, showCatalogPrices),
  };
}

export function breadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}
