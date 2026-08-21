import { defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";

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
      description: "Elige a qué servicio lleva este botón: Instagram, Facebook, WhatsApp, correo, etc. Esto permite que el sitio muestre el icono correcto.",
      type: "string",
      options: {
        list: socialPlatforms,
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      title: "Texto visible del botón",
      description: "Es lo que leerá la persona en el sitio. Ejemplos: “Instagram”, “Escríbenos por WhatsApp” o “Correo”. Debe ser corto y claro.",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "url",
      title: "Enlace (URL)",
      description: "Pega la dirección completa a la que debe llevar el botón. Para una web usa https://...; para correo usa mailto:correo@dominio.com; para WhatsApp se recomienda https://wa.me/51... con el número completo.",
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
      title: "¿Mostrar este enlace en el sitio?",
      description: "Sí = el botón o enlace aparece al público. No = queda guardado en Sanity, pero se oculta del footer y de /links. Este control solo afecta a este enlace.",
      type: "boolean",
      initialValue: true,
      components: { input: YesNoBooleanInput },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Orden",
      description: "Controla la posición frente a los demás enlaces. Los números menores aparecen primero. Ejemplo: 10 antes que 20, y 20 antes que 30.",
      type: "number",
      initialValue: 10,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: "label",
      platform: "platform",
      order: "order",
      visible: "isVisible",
    },
    prepare({ title, platform, order, visible }) {
      const platformLabel = platform === "other" ? "Otra" : platform || "Sin plataforma";
      return {
        title: title || "Red sin etiqueta",
        subtitle: `${platformLabel} · orden ${typeof order === "number" ? order : "sin definir"} · ${visible === false ? "oculta" : "visible"}`,
      };
    },
  },
});
