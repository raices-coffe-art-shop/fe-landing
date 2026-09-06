import { cache } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import { contactChannels } from "@/data/social";
import { sanityClient } from "./client";
import { urlForImage } from "./image";
import { siteSettingsQuery } from "./queries";

export const SITE_SETTINGS_TAG = "siteSettings";

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "youtube" | "whatsapp" | "email" | "other";

export type BrandLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  isFallback: boolean;
};

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
  isVisible: boolean;
  order: number;
};

// Una foto del muro de la pantalla del local, ya resuelta contra el CDN.
export type CollagePhoto = {
  src: string;
  alt: string;
};

export type SiteSettings = {
  brandLogo: BrandLogo;
  showCatalogPrices: boolean;
  collagePhotos: CollagePhoto[];
  socialLinks: SocialLink[];
};

type SanitySocialLink = Partial<SocialLink>;

type SanitySiteSettings = {
  brandLogo?: SanityImageSource;
  brandLogoAlt?: string | null;
  showCatalogPrices?: boolean | null;
  collagePhotos?: Array<{ image?: SanityImageSource; alt?: string | null } | null> | null;
  socialLinks?: SanitySocialLink[] | null;
} | null;

export const fallbackBrandLogo: BrandLogo = {
  src: "/raices-logo-lg.png",
  alt: "Raíces — Café y Cultura",
  width: 300,
  height: 300,
  isFallback: true,
};

const fallbackSocialLinks: SocialLink[] = [
  {
    platform: "whatsapp",
    label: "WhatsApp",
    url: contactChannels.whatsappHref,
    isVisible: true,
    order: 10,
  },
  {
    platform: "email",
    label: "Correo electrónico",
    url: `mailto:${contactChannels.email}`,
    isVisible: true,
    order: 20,
  },
  {
    platform: "instagram",
    label: "Instagram",
    url: contactChannels.instagram,
    isVisible: true,
    order: 30,
  },
  {
    platform: "facebook",
    label: "Facebook",
    url: contactChannels.facebook,
    isVisible: true,
    order: 40,
  },
];

const platforms = new Set<SocialPlatform>(["instagram", "facebook", "tiktok", "youtube", "whatsapp", "email", "other"]);

function isCompleteSocialLink(link: SanitySocialLink): link is SocialLink {
  return (
    typeof link.label === "string" &&
    link.label.trim().length > 0 &&
    typeof link.url === "string" &&
    link.url.trim().length > 0 &&
    typeof link.order === "number" &&
    typeof link.isVisible === "boolean" &&
    typeof link.platform === "string" &&
    platforms.has(link.platform as SocialPlatform)
  );
}

function replaceGenericSocialUrl(link: SocialLink): SocialLink {
  try {
    const parsed = new URL(link.url);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "");

    if (link.platform === "instagram" && hostname === "instagram.com" && pathname === "") {
      return { ...link, url: contactChannels.instagram };
    }

    if (link.platform === "facebook" && hostname === "facebook.com" && pathname === "") {
      return { ...link, url: contactChannels.facebook };
    }
  } catch {
    // La validación del schema evita URLs inválidas; conserva el valor si llega contenido antiguo.
  }

  return link;
}

function normalizeSocialLinks(links: SanitySocialLink[] | null | undefined, useFallback: boolean) {
  const completeLinks = links?.filter(isCompleteSocialLink).map(replaceGenericSocialUrl) ?? [];
  const knownPlatforms = new Set(completeLinks.map((link) => link.platform));
  const visibleLinks = completeLinks.filter((link) => link.isVisible);

  // Los canales oficiales esenciales deben seguir disponibles cuando el
  // documento existente todavía no los contiene. Si una plataforma existe y
  // está oculta en Sanity, se respeta esa decisión y no se vuelve a añadir.
  for (const fallbackLink of fallbackSocialLinks) {
    if (!knownPlatforms.has(fallbackLink.platform)) visibleLinks.push(fallbackLink);
  }

  if (visibleLinks.length > 0) return visibleLinks.sort((a, b) => a.order - b.order);
  return useFallback ? fallbackSocialLinks : [];
}

// Las fotos del muro se piden al CDN al tamaño de celda que usa la pantalla:
// veinticuatro imágenes a tamaño original pesarían de más en un televisor que se
// recarga solo cada cuatro horas. Las filas sin imagen se descartan.
const COLLAGE_PHOTO_WIDTH = 420;
const COLLAGE_PHOTO_HEIGHT = 520;

function normalizeCollagePhotos(photos: NonNullable<SanitySiteSettings>["collagePhotos"]): CollagePhoto[] {
  if (!Array.isArray(photos)) return [];
  const resolved: CollagePhoto[] = [];
  for (const photo of photos) {
    const src = urlForImage(photo?.image)
      ?.width(COLLAGE_PHOTO_WIDTH)
      .height(COLLAGE_PHOTO_HEIGHT)
      .fit("crop")
      .auto("format")
      .url();
    if (!src) continue;
    resolved.push({ src, alt: photo?.alt?.trim() || "Fotografía de Raíces" });
  }
  return resolved;
}

function normalizeSettings(settings: SanitySiteSettings): SiteSettings {
  const sanityLogo = urlForImage(settings?.brandLogo)?.width(360).height(360).fit("max").auto("format").url();
  const alt = settings?.brandLogoAlt?.trim() || fallbackBrandLogo.alt;

  return {
    brandLogo: sanityLogo
      ? {
          src: sanityLogo,
          alt,
          width: 300,
          height: 300,
          isFallback: false,
        }
      : {
          ...fallbackBrandLogo,
          alt,
        },
    showCatalogPrices: settings?.showCatalogPrices !== false,
    collagePhotos: normalizeCollagePhotos(settings?.collagePhotos),
    socialLinks: normalizeSocialLinks(settings?.socialLinks, !settings || !Array.isArray(settings.socialLinks)),
  };
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!sanityClient) return normalizeSettings(null);

  try {
    const fetchOptions = process.env.NODE_ENV === "development"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 300, tags: [SITE_SETTINGS_TAG] } };
    const settings = await sanityClient.fetch<SanitySiteSettings>(siteSettingsQuery, {}, fetchOptions);
    return normalizeSettings(settings);
  } catch {
    return normalizeSettings(null);
  }
});

export function getPrimarySocialHref(settings: SiteSettings, platform: SocialPlatform, fallback: string) {
  return settings.socialLinks.find((link) => link.platform === platform)?.url ?? fallback;
}
