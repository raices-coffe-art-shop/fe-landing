import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Configuración del sitio",
  type: "document",
  groups: [
    { name: "brand", title: "Marca", default: true },
    { name: "catalog", title: "Catálogo" },
    { name: "social", title: "Redes sociales" },
  ],
  initialValue: {
    title: "Configuración del sitio",
    brandLogoAlt: "Raíces — Café y Cultura",
    showCatalogPrices: true,
    socialLinks: [
      {
        _type: "socialLink",
        _key: "whatsapp",
        platform: "whatsapp",
        label: "WhatsApp",
        url: "https://wa.me/51915123159",
        isVisible: true,
        order: 10,
      },
      {
        _type: "socialLink",
        _key: "email",
        platform: "email",
        label: "Correo electrónico",
        url: "mailto:raicescoffeeartshop@gmail.com",
        isVisible: true,
        order: 20,
      },
      {
        _type: "socialLink",
        _key: "instagram",
        platform: "instagram",
        label: "Instagram",
        url: "https://www.instagram.com/raicescoffeeartshop/",
        isVisible: true,
        order: 30,
      },
      {
        _type: "socialLink",
        _key: "facebook",
        platform: "facebook",
        label: "Facebook",
        url: "https://www.facebook.com/profile.php?id=100089073728506&locale=es_LA",
        isVisible: true,
        order: 40,
      },
    ],
  },
  fields: [
    defineField({
      name: "title",
      title: "Título interno",
      description: "Solo sirve para reconocer este documento dentro de Sanity.",
      type: "string",
      group: "brand",
      initialValue: "Configuración del sitio",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brandLogo",
      title: "Logo principal",
      description: "La misma imagen se usa en navbar, footer y /links.",
      type: "image",
      group: "brand",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brandLogoAlt",
      title: "Texto alternativo del logo",
      type: "string",
      group: "brand",
      initialValue: "Raíces — Café y Cultura",
      validation: (Rule) => Rule.required().min(2).max(160),
    }),
    defineField({
      name: "showCatalogPrices",
      title: "Mostrar precios en todo el catálogo",
      description: "Control general. Al desactivarlo se ocultan todos los precios en la portada, /catalogo y las fichas, sin borrar los montos guardados.",
      type: "boolean",
      group: "catalog",
      initialValue: true,
    }),
    defineField({
      name: "socialLinks",
      title: "Redes sociales",
      description: "Administra las URLs, el orden y la visibilidad del footer y de /links.",
      type: "array",
      group: "social",
      options: { sortable: true },
      of: [defineArrayMember({ type: "socialLink" })],
      validation: (Rule) =>
        Rule.unique().custom((links) => {
          if (!Array.isArray(links)) return true;
          const seen = new Set<string>();
          for (const link of links as Array<{ platform?: string }>) {
            if (!link.platform || link.platform === "other") continue;
            if (seen.has(link.platform)) return `La plataforma ${link.platform} está repetida.`;
            seen.add(link.platform);
          }
          return true;
        }),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Configuración del sitio" };
    },
  },
});
