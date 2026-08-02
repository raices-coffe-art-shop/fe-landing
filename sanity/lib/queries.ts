import { groq } from "next-sanity";

export const siteSettingsQuery = groq`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    title,
    brandLogo,
    brandLogoAlt,
    "socialLinks": socialLinks[isVisible == true] | order(order asc){
      platform,
      customPlatformName,
      label,
      url,
      isVisible,
      order
    }
  }
`;
