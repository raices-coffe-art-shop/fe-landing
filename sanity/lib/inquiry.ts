import type { CatalogItem } from "./catalogTypes";

export function buildCatalogInquiryHref(baseHref: string, item: Pick<CatalogItem, "title" | "inquiryMessage">) {
  const message = item.inquiryMessage?.trim() || `Hola, quisiera consultar por ${item.title}.`;

  try {
    const url = new URL(baseHref);

    if (url.protocol === "mailto:") {
      if (!url.searchParams.has("subject")) url.searchParams.set("subject", `Consulta por ${item.title}`);
      url.searchParams.set("body", message);
      return url.toString();
    }

    if (url.protocol === "tel:") return url.toString();

    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    const separator = baseHref.includes("?") ? "&" : "?";
    return `${baseHref}${separator}text=${encodeURIComponent(message)}`;
  }
}
