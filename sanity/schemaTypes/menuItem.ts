import { defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";

const currencies = [
  { title: "Soles (PEN)", value: "PEN" },
  { title: "Dólares (USD)", value: "USD" },
];

export const menuItem = defineType({
  name: "menuItem",
  title: "Elemento de la Carta",
  type: "document",
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "media", title: "Imagen" },
    { name: "price", title: "Precio y publicación" },
  ],
  initialValue: { isActive: true, order: 100, currency: "PEN", showPrice: true },
  fields: [
    defineField({
      name: "title",
      title: "Nombre",
      description: "Nombre que verá el cliente en la Carta. Ejemplo: Cappuccino, Chocolate caliente o Pan con chicharrón.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: "category",
      title: "Categoría de la Carta",
      description: "Elige en qué sección de la Carta aparece este elemento.",
      type: "reference",
      group: "content",
      to: [{ type: "menuCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subcategory",
      title: "Subcategoría",
      description: "Opcional. Úsala solo si dentro de una categoría necesitas separar grupos, por ejemplo Calientes y Frías.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "shortDescription",
      title: "Descripción corta",
      description: "Texto breve que aparece debajo del nombre del elemento en la Carta.",
      type: "text",
      rows: 3,
      group: "content",
      validation: (Rule) => Rule.max(260),
    }),
    defineField({
      name: "mainImage",
      title: "Imagen",
      description: "Opcional. Se usa sobre todo para la versión con fotos y la pantalla TV.",
      type: "image",
      group: "media",
      options: { hotspot: true },
    }),
    defineField({
      name: "mainImageAlt",
      title: "Descripción de la imagen",
      description: "Describe brevemente lo que aparece en la foto.",
      type: "string",
      group: "media",
      hidden: ({ document }) => !document?.mainImage,
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "price",
      title: "Precio",
      description: "Escribe solo el número, sin S/ ni texto. Ejemplo: 12.50.",
      type: "number",
      group: "price",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "currency",
      title: "Moneda",
      description: "Normalmente Soles (PEN).",
      type: "string",
      group: "price",
      initialValue: "PEN",
      options: { list: currencies, layout: "radio" },
      hidden: ({ document }) => typeof document?.price !== "number",
    }),
    defineField({
      name: "showPrice",
      title: "¿Mostrar el precio?",
      description: "No elimina el precio: solo decide si se muestra públicamente.",
      type: "boolean",
      group: "price",
      initialValue: true,
      components: { input: YesNoBooleanInput },
      hidden: ({ document }) => typeof document?.price !== "number",
    }),
    defineField({
      name: "isActive",
      title: "¿Mostrar este elemento en la Carta?",
      description: "Sí = aparece en /carta, impresión y TV. No = queda guardado pero oculto.",
      type: "boolean",
      group: "price",
      initialValue: true,
      components: { input: YesNoBooleanInput },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Orden",
      description: "Un número menor aparece antes dentro de su categoría. Recomendación: 10, 20, 30…",
      type: "number",
      group: "price",
      initialValue: 100,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    // Referencia interna al documento antiguo del catálogo. Se mantiene oculta
    // para conservar el vínculo con todos los datos originales sin recargar el
    // formulario de la Carta con campos que aquí no se necesitan.
    defineField({
      name: "sourceCatalogItem",
      title: "Origen de migración",
      type: "reference",
      to: [{ type: "catalogItem" }],
      hidden: true,
      readOnly: true,
    }),
  ],
  orderings: [
    { title: "Orden manual", name: "manualOrder", by: [{ field: "order", direction: "asc" }] },
    { title: "Nombre A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", category: "category.title", media: "mainImage", price: "price" },
    prepare({ title, category, media, price }) {
      const priceLabel = typeof price === "number" ? ` · S/ ${price.toFixed(2)}` : "";
      return { title, subtitle: `${category || "Sin categoría"}${priceLabel}`, media };
    },
  },
});
