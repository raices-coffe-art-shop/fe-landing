import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api/", "/catalogo/imprimir", "/catalogo/tv"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
