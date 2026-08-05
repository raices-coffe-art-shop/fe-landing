import { defineField, defineType } from "sanity";

export const socialPlatforms: Array<{ title: string; value: string }> = [
  { title: "Instagram", value: "instagram" },
  { title: "Facebook", value: "facebook" },
  { title: "TikTok", value: "tiktok" },
  { title: "YouTube", value: "youtube" },
  { title: "WhatsApp", value: "whatsapp" },
  { title: "Correo electrónico", value: "email" },
  { title: "Otra", value: "other" },
];

function hasProtocol(value: string, protocols: string[]) {
  try {
    const url = new URL(value);
    return protocols.includes(url.protocol);
  } catch {
    return false;
  }
}

function isValidWhatsappUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "tel:") return true;
    if (url.protocol !== "https:") return false;
    return ["wa.me", "api.whatsapp.com", "www.whatsapp.com"].includes(url.hostname);
  } catch {
    return false;
  }
}

export const socialLink = defineType({
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
          if (parent?.platform === "other" && !value?.trim()) {
            return "Indica el nombre de la plataforma.";
          }
          return true;
        }),
    }),
    defineField({
      name: "label",
      title: "Etiqueta visible",
      description: "Texto que se mostrará en el footer y en /links.",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (Rule) =>
        Rule.required()
          .uri({
            scheme: ["http", "https", "mailto", "tel"],
            allowRelative: false,
          })
          .custom((value, context) => {
            const parent = context.parent as { platform?: string } | undefined;
            if (!value?.trim()) return "Indica una URL.";
            if (parent?.platform === "email" && !hasProtocol(value, ["mailto:"])) {
              return "Usa el formato mailto:correo@dominio.com.";
            }
            if (parent?.platform === "whatsapp" && !isValidWhatsappUrl(value)) {
              return "Usa https://wa.me/..., api.whatsapp.com o tel:.";
            }
            return true;
          }),
    }),
    defineField({
      name: "isVisible",
      title: "Visible en el sitio",
      type: "boolean",
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Orden",
      description: "Los valores menores aparecen primero.",
      type: "number",
      initialValue: 10,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: "label",
      platform: "platform",
      customPlatformName: "customPlatformName",
      order: "order",
      visible: "isVisible",
    },
    prepare({ title, platform, customPlatformName, order, visible }) {
      const platformLabel = platform === "other" ? customPlatformName || "Otra" : platform || "Sin plataforma";
      return {
        title: title || "Red sin etiqueta",
        subtitle: `${platformLabel} · orden ${typeof order === "number" ? order : "sin definir"} · ${visible === false ? "oculta" : "visible"}`,
      };
    },
  },
});
