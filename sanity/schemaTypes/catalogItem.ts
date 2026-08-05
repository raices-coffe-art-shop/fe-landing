import { defineArrayMember, defineField, defineType } from "sanity";

const currencies = [
  { title: "Soles (PEN)", value: "PEN" },
  { title: "Dólares (USD)", value: "USD" },
];

const tones = [
  { title: "Verde", value: "green" },
  { title: "Miel", value: "honey" },
  { title: "Cacao", value: "cacao" },
  { title: "Arcilla", value: "clay" },
  { title: "Retablo", value: "retablo" },
  { title: "Tinta", value: "ink" },
];

export const catalogItem = defineType({
  name: "catalogItem",
  title: "Producto de catálogo",
  type: "document",
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "media", title: "Imágenes" },
    { name: "details", title: "Detalles" },
    { name: "publishing", title: "Publicación" },
    { name: "seo", title: "SEO" },
  ],
  initialValue: {
    isActive: true,
    isFeatured: false,
    order: 100,
    origin: "Ayacucho",
    tone: "green",
    currency: "PEN",
    showPrice: true,
  },
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "reference",
      group: "content",
      to: [{ type: "catalogCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subcategory",
      title: "Subcategoría",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: "origin",
      title: "Procedencia",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "region",
      title: "Región o territorio",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: "shortDescription",
      title: "Descripción corta",
      description: "Se usa en las tarjetas. La ficha puede mostrar un texto más amplio.",
      type: "text",
      rows: 4,
      group: "content",
      validation: (Rule) => Rule.required().min(10).max(280),
    }),
    defineField({
      name: "description",
      title: "Descripción completa",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "mainImage",
      title: "Imagen principal",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImageAlt",
      title: "Texto alternativo de la imagen principal",
      type: "string",
      group: "media",
      validation: (Rule) => Rule.required().min(3).max(180),
    }),
    defineField({
      name: "gallery",
      title: "Galería",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "string",
              validation: (Rule) => Rule.required().min(3).max(180),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "producerOrCreator",
      title: "Productor, artesano o creador",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "presentations",
      title: "Presentaciones",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "availability",
      title: "Disponibilidad",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "process",
      title: "Proceso",
      type: "text",
      rows: 5,
      group: "details",
    }),
    defineField({
      name: "ingredients",
      title: "Ingredientes",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "allergens",
      title: "Alérgenos",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "verifiedClaims",
      title: "Afirmaciones verificadas",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "price",
      title: "Precio",
      description: "Opcional. Cuando se completa, el precio aparece en las tarjetas y en la ficha del producto.",
      type: "number",
      group: "details",
      validation: (Rule) =>
        Rule.min(0).custom((value) => {
          if (typeof value !== "number") return true;
          return Number.isInteger(value * 100) || "Usa como máximo dos decimales.";
        }),
    }),
    defineField({
      name: "currency",
      title: "Moneda",
      type: "string",
      group: "details",
      initialValue: "PEN",
      options: { list: currencies, layout: "radio" },
      hidden: ({ document }) => typeof document?.price !== "number",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const document = context.document as { price?: number } | undefined;
          if (typeof document?.price === "number" && !value) return "Selecciona la moneda del precio.";
          return true;
        }),
    }),
    defineField({
      name: "showPrice",
      title: "Mostrar precio de este producto",
      description: "Permite ocultar el precio de este producto aunque exista un monto. La configuración global del catálogo también debe estar activada.",
      type: "boolean",
      group: "details",
      initialValue: true,
    }),
    defineField({
      name: "inquiryMessage",
      title: "Mensaje de consulta",
      description: "Opcional. Si se deja vacío se genera uno con el nombre del producto.",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.max(260),
    }),
    defineField({
      name: "tone",
      title: "Tono visual",
      type: "string",
      group: "publishing",
      options: { list: tones, layout: "radio" },
      initialValue: "green",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isActive",
      title: "Activo en el sitio",
      type: "boolean",
      group: "publishing",
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isFeatured",
      title: "Destacado en la portada",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Orden",
      type: "number",
      group: "publishing",
      initialValue: 100,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    { title: "Orden manual", name: "manualOrder", by: [{ field: "order", direction: "asc" }] },
    { title: "Título A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
    { title: "Actualizados recientemente", name: "updatedDesc", by: [{ field: "_updatedAt", direction: "desc" }] },
    { title: "Destacados primero", name: "featured", by: [{ field: "isFeatured", direction: "desc" }, { field: "order", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      category: "category.title",
      origin: "origin",
      active: "isActive",
      featured: "isFeatured",
      price: "price",
      currency: "currency",
      showPrice: "showPrice",
    },
    prepare({ title, media, category, origin, active, featured, price, currency, showPrice }) {
      const state = active === false ? "inactivo" : "activo";
      const featuredLabel = featured ? " · destacado" : "";
      const priceLabel = typeof price === "number"
        ? ` · ${showPrice === false ? "precio oculto" : `${currency === "USD" ? "US$" : "S/"} ${price.toFixed(price % 1 === 0 ? 0 : 2)}`}`
        : "";
      return {
        title: title || "Producto sin título",
        media,
        subtitle: `${category || "Sin categoría"} · ${origin || "Sin procedencia"} · ${state}${featuredLabel}${priceLabel}`,
      };
    },
  },
});
