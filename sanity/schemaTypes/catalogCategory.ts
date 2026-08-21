import { defineField, defineType } from "sanity";
<<<<<<< Updated upstream
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
      description: "Es el nombre que verá la gente para agrupar productos. Ejemplos: “Café y cacao”, “Alimentos” o “Arte”. Debe ser corto y fácil de entender.",
=======
>>>>>>> Stashed changes
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "slug",
<<<<<<< Updated upstream
      title: "Dirección web (slug)",
      description: "Es el identificador usado en direcciones y filtros internos. Normalmente pulsa Generate/Generar a partir del nombre. Evita cambiarlo después de que la categoría ya se use en el sitio.",
=======
      title: "Slug",
>>>>>>> Stashed changes
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
<<<<<<< Updated upstream
      description: "Explica en una o dos frases qué reúne esta categoría. Escríbelo como texto natural para una persona. No uses una lista de palabras clave o tags.",
=======
>>>>>>> Stashed changes
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
<<<<<<< Updated upstream
      name: "image",
      title: "Imagen de la categoría",
      description: "Foto representativa de toda la categoría. Se usa en la carta impresa y en la pantalla del local. Si se deja vacía, el sitio puede usar la foto del primer producto destacado de esa categoría.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Descripción de la imagen",
      description: "Describe lo que se ve en la foto para personas que usan lectores de pantalla. Ejemplo: “Granos de café tostado sobre una mesa”. No uses hashtags ni listas de palabras clave.",
      type: "string",
      hidden: ({ document }) => !document?.image,
      validation: (Rule) =>
        Rule.max(180).custom((value, context) => {
          const document = context.document as { image?: unknown } | undefined;
          if (document?.image && !value?.trim()) return "Describe brevemente la imagen.";
          return true;
        }),
    }),
    defineField({
      name: "order",
      title: "Orden",
      description: "Define qué categoría aparece primero cuando el catálogo usa orden manual. Un número menor aparece antes. Recomendación: 10, 20, 30…",
=======
      name: "order",
      title: "Orden",
>>>>>>> Stashed changes
      type: "number",
      initialValue: 100,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "isVisible",
<<<<<<< Updated upstream
      title: "¿Mostrar esta categoría en el sitio?",
      description: "Sí = la categoría puede aparecer públicamente y sus productos pueden mostrarse. No = se oculta toda la categoría y, con ella, sus productos, sin borrar nada. No indica si un producto está disponible para comprar.",
      type: "boolean",
      initialValue: true,
      components: { input: YesNoBooleanInput },
=======
      title: "Visible en el sitio",
      type: "boolean",
      initialValue: true,
>>>>>>> Stashed changes
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    { title: "Orden manual", name: "manualOrder", by: [{ field: "order", direction: "asc" }] },
    { title: "Nombre A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
  preview: {
<<<<<<< Updated upstream
    select: { title: "title", order: "order", visible: "isVisible", media: "image" },
    prepare({ title, order, visible, media }) {
      return {
        title: title || "Categoría sin nombre",
        subtitle: `Orden ${typeof order === "number" ? order : "—"} · ${visible === false ? "oculta" : "visible"}`,
        media,
=======
    select: { title: "title", order: "order", visible: "isVisible" },
    prepare({ title, order, visible }) {
      return {
        title: title || "Categoría sin nombre",
        subtitle: `Orden ${typeof order === "number" ? order : "—"} · ${visible === false ? "oculta" : "visible"}`,
>>>>>>> Stashed changes
      };
    },
  },
});
