import { defineArrayMember, defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";
import { AutoSlugInput } from "../components/AutoSlugInput";
import { isUniqueSlugWithinType } from "../lib/slugUniqueness";

const currencies = [
  { title: "Soles (PEN)", value: "PEN" },
  { title: "Dólares (USD)", value: "USD" },
];

export const artItem = defineType({
  name: "artItem",
  title: "Pieza de Galería de Arte",
  type: "document",
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "media", title: "Imágenes" },
    { name: "details", title: "Detalles y venta" },
    { name: "publishing", title: "Publicación" },
  ],
  initialValue: { origin: "Ayacucho", availability: true, isActive: true, order: 100, currency: "PEN", showPrice: true },
  fields: [
    defineField({ name: "title", title: "Nombre de la pieza", description: "Nombre que verá la gente. Ejemplo: Torito de Quinua, Retablo ayacuchano o Nacimiento artesanal.", type: "string", group: "content", validation: (Rule) => Rule.required().min(2).max(120) }),
    defineField({
      name: "slug",
      title: "Dirección web (automática)",
      description: "Se crea sola. Por ejemplo, “Torito de Quinua” genera /galeria-de-arte/torito-de-quinua.",
      type: "slug",
      group: "content",
      components: { input: AutoSlugInput },
      validation: (Rule) => [Rule.required(), Rule.custom(async (value, context) => isUniqueSlugWithinType(value, context))],
    }),
    defineField({ name: "category", title: "Categoría", description: "Elige el grupo al que pertenece la pieza: Toritos, Retablos, Nacimientos, Pinturas, etc.", type: "reference", group: "content", to: [{ type: "artCategory" }], validation: (Rule) => Rule.required() }),
    defineField({ name: "subcategory", title: "Subcategoría", description: "Opcional. Úsala solo si hace falta una clasificación más específica dentro de la categoría.", type: "string", group: "content", validation: (Rule) => Rule.max(80) }),
    defineField({ name: "shortDescription", title: "Texto corto", description: "Una o dos frases para la tarjeta de la galería.", type: "text", rows: 3, group: "content", validation: (Rule) => Rule.required().max(280) }),
    defineField({ name: "description", title: "Descripción completa", description: "Cuenta la historia, significado, técnica o contexto de la pieza en varios párrafos.", type: "array", group: "content", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "mainImage", title: "Imagen principal", description: "Foto principal de la pieza. Aparece en la galería y en su ficha.", type: "image", group: "media", options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: "mainImageAlt", title: "Descripción de la imagen principal", description: "Describe brevemente qué aparece en la foto.", type: "string", group: "media", hidden: ({ document }) => !document?.mainImage, validation: (Rule) => Rule.max(180) }),
    defineField({
      name: "gallery",
      title: "Galería de imágenes",
      description: "Opcional. Añade otros ángulos o detalles de la pieza.",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Descripción de esta imagen", type: "string", validation: (Rule) => Rule.required().max(180) })] })],
    }),
    defineField({ name: "origin", title: "Procedencia", description: "Lugar de procedencia de la pieza. Ejemplo: Quinua, Ayacucho.", type: "string", group: "details", initialValue: "Ayacucho", validation: (Rule) => Rule.max(120) }),
    defineField({ name: "producerOrCreator", title: "Artista, artesano o creador", description: "Opcional. Nombre de la persona, familia o taller responsable de la pieza.", type: "string", group: "details", validation: (Rule) => Rule.max(140) }),
    defineField({ name: "availability", title: "¿Disponible para comprar?", description: "Sí = puede comprarse o consultarse ahora. No = la ficha sigue visible, pero se muestra como no disponible.", type: "boolean", group: "details", initialValue: true, components: { input: YesNoBooleanInput }, validation: (Rule) => Rule.required() }),
    defineField({ name: "price", title: "Precio", description: "Opcional. Escribe solo el número, sin S/ ni texto.", type: "number", group: "details", validation: (Rule) => Rule.min(0) }),
    defineField({ name: "currency", title: "Moneda", description: "Normalmente Soles (PEN).", type: "string", group: "details", initialValue: "PEN", options: { list: currencies, layout: "radio" }, hidden: ({ document }) => typeof document?.price !== "number" }),
    defineField({ name: "showPrice", title: "¿Mostrar el precio?", description: "No borra el precio: solo decide si el público lo ve.", type: "boolean", group: "details", initialValue: true, components: { input: YesNoBooleanInput }, hidden: ({ document }) => typeof document?.price !== "number" }),
    defineField({ name: "isActive", title: "¿Mostrar esta pieza en la galería?", description: "Sí = aparece públicamente. No = se oculta sin borrarla.", type: "boolean", group: "publishing", initialValue: true, components: { input: YesNoBooleanInput }, validation: (Rule) => Rule.required() }),
    defineField({ name: "order", title: "Orden", description: "Un número menor aparece antes. Recomendación: 10, 20, 30…", type: "number", group: "publishing", initialValue: 100, validation: (Rule) => Rule.required().integer().min(0) }),
    // Conserva el vínculo con el documento original del catálogo. El original
    // no se borra durante la separación, de modo que ningún dato histórico se
    // pierde aunque la ficha de arte use un formulario más simple.
    defineField({ name: "sourceCatalogItem", title: "Origen de migración", type: "reference", to: [{ type: "catalogItem" }], hidden: true, readOnly: true }),
  ],
  orderings: [
    { title: "Orden manual", name: "manualOrder", by: [{ field: "order", direction: "asc" }] },
    { title: "Nombre A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", category: "category.title", creator: "producerOrCreator", media: "mainImage" },
    prepare({ title, category, creator, media }) { return { title, subtitle: [category, creator].filter(Boolean).join(" · "), media }; },
  },
});
