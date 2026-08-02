import { cache } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import { contactChannels } from "@/data/social";
import { sanityClient } from "./client";
import { urlForImage } from "./image";
import { siteSettingsQuery } from "./queries";

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
  customPlatformName?: string;
  label: string;
  url: string;
  isVisible: boolean;
  order: number;
};

export type SiteSettings = {
  brandLogo: BrandLogo;
  socialLinks: SocialLink[];
};

type SanitySocialLink = Partial<SocialLink>;

type SanitySiteSettings = {
  brandLogo?: SanityImageSource;
  brandLogoAlt?: string | null;
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

function isVisibleSocialLink(link: SanitySocialLink): link is SocialLink {
  return (
    typeof link.label === "string" &&
    link.label.trim().length > 0 &&
    typeof link.url === "string" &&
    link.url.trim().length > 0 &&
    typeof link.order === "number" &&
    link.isVisible === true &&
    typeof link.platform === "string" &&
    platforms.has(link.platform as SocialPlatform)
  );
}

function normalizeSocialLinks(links: SanitySocialLink[] | null | undefined) {
  const visibleLinks = links?.filter(isVisibleSocialLink) ?? [];
  return visibleLinks.length > 0
    ? visibleLinks.sort((a, b) => a.order - b.order)
    : fallbackSocialLinks;
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
    socialLinks: normalizeSocialLinks(settings?.socialLinks),
  };
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!sanityClient) return normalizeSettings(null);

  try {
    const settings = await sanityClient.fetch<SanitySiteSettings>(siteSettingsQuery, {}, { next: { revalidate: 300 } });
    return normalizeSettings(settings);
  } catch {
    return normalizeSettings(null);
  }
});

export function getPrimarySocialHref(settings: SiteSettings, platform: SocialPlatform, fallback: string) {
  return settings.socialLinks.find((link) => link.platform === platform)?.url ?? fallback;
}
