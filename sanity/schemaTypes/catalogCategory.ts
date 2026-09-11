import { defineArrayMember, defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";
import { AutoSlugInput } from "../components/AutoSlugInput";
import { isUniqueSlugWithinType } from "../lib/slugUniqueness";

export const catalogCategory = defineType({
  name: "catalogCategory",
  title: "Categoría de Productos de Origen",
  type: "document",
  initialValue: {
    order: 100,
    isVisible: true,
  },
  fields: [
    defineField({
      name: "title",
      title: "Nombre",
      description: "Es el nombre que verá la gente para agrupar productos. Ejemplos: “Café de origen”, “Alimentos” o “Artesanía utilitaria”. Debe ser corto y fácil de entender.",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "slug",
      title: "Dirección web (automática)",
      description: "Se genera automáticamente a partir del nombre de la categoría. No tienes que escribir ni editar nada aquí. Si otra categoría ya usa esa dirección, el sistema añadirá un número de forma automática.",
      type: "slug",
      components: { input: AutoSlugInput },
      validation: (Rule) => [
        Rule.required(),
        Rule.custom(async (value, context) => {
          const current = value?.current?.trim();
          if (!current) return true;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(current)) {
            return "La dirección web se genera automáticamente. No debe contener /, espacios ni caracteres especiales.";
          }
          const unique = await isUniqueSlugWithinType(value, context);
          return unique || "Ya existe otro elemento con esta dirección web.";
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Descripción",
      description: "Explica en una o dos frases qué reúne esta categoría. Escríbelo como texto natural para una persona. No uses una lista de palabras clave o tags.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    // Campos heredados de cuando Productos de Origen y Carta compartían el mismo modelo.
    // Se conservan para no perder datos antiguos, pero ya no se editan aquí.
    defineField({ name: "tagline", title: "Subtítulo legado de Carta", type: "string", hidden: true, readOnly: true }),
    defineField({ name: "storyTitle", title: "Título de historia legado de Carta", type: "string", hidden: true, readOnly: true }),
    defineField({ name: "story", title: "Historia legado de Carta", type: "text", hidden: true, readOnly: true }),
    defineField({ name: "sourcing", title: "Insumos legado de Carta", type: "text", hidden: true, readOnly: true }),
    defineField({
      name: "factsTitle",
      title: "Título del recuadro de datos",
      description: "Opcional. El encabezado del recuadro en la pantalla del local. Si lo dejas vacío dice “Origen y productores”. Cámbialo cuando el recuadro no hable de origen: por ejemplo “Personaliza a tu gusto” en Jugos & Smoothies.",
      type: "string",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "sourcingFacts",
      title: "Ficha legado de Carta",
      type: "array",
      hidden: true,
      readOnly: true,
      of: [
        defineArrayMember({
          type: "object",
          name: "sourcingFact",
          fields: [
            defineField({ name: "label", title: "Dato", type: "string" }),
            defineField({ name: "value", title: "Valor", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({ name: "image", title: "Imagen legado de Carta", type: "image", hidden: true, readOnly: true, options: { hotspot: true } }),
    defineField({ name: "imageAlt", title: "Descripción legado de Carta", type: "string", hidden: true, readOnly: true }),
    defineField({
      name: "order",
      title: "Orden",
      description: "Define qué categoría aparece primero cuando Productos de Origen usa orden manual. Un número menor aparece antes. Recomendación: 10, 20, 30…",
      type: "number",
      initialValue: 100,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "isVisible",
      title: "¿Mostrar esta categoría en el sitio?",
      description: "Sí = la categoría puede aparecer públicamente y sus productos pueden mostrarse. No = se oculta toda la categoría y, con ella, sus productos, sin borrar nada. No indica si un producto está disponible para comprar.",
      type: "boolean",
      initialValue: true,
      components: { input: YesNoBooleanInput },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "showInPrintedMenu",
      title: "Mostrar en Carta (legado)",
      description: "Campo antiguo conservado solo para compatibilidad durante la migración. La Carta ahora se administra en su propio apartado.",
      type: "boolean",
      hidden: true,
      readOnly: true,
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
