import { defineField, defineType } from "sanity";

export const catalogCategory = defineType({
  name: "catalogCategory",
  title: "Categoría de catálogo",
  type: "document",
  initialValue: {
    order: 100,
    isVisible: true,
  },
  fields: [
    defineField({
      name: "title",
      title: "Nombre",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: "image",
      title: "Imagen de la categoría",
      type: "image",
      options: { hotspot: true },
      description:
        "Se usa en la carta impresa y en la pantalla del local. Si se deja vacía, se toma la foto del primer producto destacado de la categoría.",
    }),
    defineField({
      name: "imageAlt",
      title: "Texto alternativo de la imagen",
      type: "string",
      description: "Describe la foto para lectores de pantalla.",
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "order",
      title: "Orden",
      type: "number",
      initialValue: 100,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "isVisible",
      title: "Visible en el sitio",
      type: "boolean",
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    { title: "Orden manual", name: "manualOrder", by: [{ field: "order", direction: "asc" }] },
    { title: "Nombre A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", order: "order", visible: "isVisible", media: "image" },
    prepare({ title, order, visible, media }) {
      return {
        title: title || "Categoría sin nombre",
        subtitle: `Orden ${typeof order === "number" ? order : "—"} · ${visible === false ? "oculta" : "visible"}`,
        media,
      };
    },
  },
});
