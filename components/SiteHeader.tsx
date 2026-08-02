import { SiteHeaderClient } from "@/components/SiteHeaderClient";
import { contactChannels } from "@/data/social";
import { getPrimarySocialHref, getSiteSettings } from "@/sanity/lib/siteSettings";

export async function SiteHeader() {
  const settings = await getSiteSettings();

  return (
    <SiteHeaderClient
      brandLogo={settings.brandLogo}
      contactHref={getPrimarySocialHref(settings, "whatsapp", contactChannels.whatsappHref)}
    />
  );
}
