import { defineField, defineType } from "sanity";

const socialPlatforms = [
  { title: "Instagram", value: "instagram" },
  { title: "Facebook", value: "facebook" },
  { title: "TikTok", value: "tiktok" },
  { title: "YouTube", value: "youtube" },
  { title: "WhatsApp", value: "whatsapp" },
  { title: "Correo electrónico", value: "email" },
  { title: "Otra", value: "other" },
];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Configuración del sitio",
  type: "document",
  initialValue: {
    title: "Configuración del sitio",
    brandLogoAlt: "Raíces — Café y Cultura",
    socialLinks: [
      {
        platform: "whatsapp",
        label: "WhatsApp",
        url: "https://wa.me/51915123159",
        isVisible: true,
        order: 10,
      },
      {
        platform: "email",
        label: "Correo electrónico",
        url: "mailto:raicescoffeeartshop@gmail.com",
        isVisible: true,
        order: 20,
      },
      {
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
        isVisible: true,
        order: 30,
      },
      {
        platform: "facebook",
        label: "Facebook",
        url: "https://facebook.com",
        isVisible: true,
        order: 40,
      },
    ],
  },
  fields: [
    defineField({
      name: "title",
      title: "Título interno",
      type: "string",
      initialValue: "Configuración del sitio",
    }),
    defineField({
      name: "brandLogo",
      title: "Logo principal",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brandLogoAlt",
      title: "Texto alternativo del logo",
      type: "string",
      initialValue: "Raíces — Café y Cultura",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "socialLinks",
      title: "Redes sociales",
      type: "array",
      of: [
        defineField({
          name: "socialLink",
          title: "Red social",
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Plataforma",
              type: "string",
              options: {
                list: socialPlatforms,
                layout: "dropdown",
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "customPlatformName",
              title: "Nombre personalizado",
              type: "string",
              hidden: ({ parent }) => parent?.platform !== "other",
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { platform?: string } | undefined;
                  if (parent?.platform === "other" && !value?.trim()) return "Indica el nombre de la plataforma.";
                  return true;
                }),
            }),
            defineField({
              name: "label",
              title: "Etiqueta",
              type: "string",
              validation: (Rule) => Rule.required().min(2),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) =>
                Rule.required().uri({
                  scheme: ["http", "https", "mailto", "tel"],
                  allowRelative: false,
                }),
            }),
            defineField({
              name: "isVisible",
              title: "Visible",
              type: "boolean",
              initialValue: true,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "order",
              title: "Orden",
              type: "number",
              initialValue: 10,
              validation: (Rule) => Rule.required().integer().min(0),
            }),
          ],
          preview: {
            select: {
              title: "label",
              platform: "platform",
              visible: "isVisible",
            },
            prepare({ title, platform, visible }) {
              return {
                title: title || "Red sin etiqueta",
                subtitle: `${platform || "sin plataforma"}${visible === false ? " - oculta" : ""}`,
              };
            },
          },
          validation: (Rule) =>
            Rule.custom((value) => {
              const item = value as
                | {
                    platform?: string;
                    customPlatformName?: string;
                    label?: string;
                    url?: string;
                    isVisible?: boolean;
                    order?: number;
                  }
                | undefined;
              if (!item) return true;
              if (!item.platform || !item.label?.trim() || !item.url || typeof item.isVisible !== "boolean" || typeof item.order !== "number") {
                return "Completa plataforma, etiqueta, URL, visibilidad y orden antes de publicar.";
              }
              if (item.platform === "other" && !item.customPlatformName?.trim()) return "Indica el nombre personalizado.";
              return true;
            }),
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Configuración del sitio",
      };
    },
  },
});
