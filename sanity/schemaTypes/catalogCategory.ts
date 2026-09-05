import { defineArrayMember, defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";
import { AutoSlugInput } from "../components/AutoSlugInput";
import { isUniqueSlugWithinType } from "../lib/slugUniqueness";

export const catalogCategory = defineType({
  name: "catalogCategory",
  title: "Categoría de catálogo",
  type: "document",
  initialValue: {
    order: 100,
    isVisible: true,
    showInPrintedMenu: true,
  },
  fields: [
    defineField({
      name: "title",
      title: "Nombre",
      description: "Es el nombre que verá la gente para agrupar productos. Ejemplos: “Café y cacao”, “Alimentos” o “Arte”. Debe ser corto y fácil de entender.",
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
    defineField({
      name: "tagline",
      title: "Subtítulo de la sección",
      description: "La línea corta que va bajo el título en la pantalla del local. Ejemplos: “Café de especialidad · Origen directo”, “Tradición ayacuchana · Insumos de origen”. Es distinta de la descripción, que es la frase larga del catálogo web.",
      type: "string",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "storyTitle",
      title: "Título de la historia",
      description: "El encabezado del relato de origen. Ejemplos: “Finca La Fortuna de Pedro”, “Dina Torres Barboza”. Se muestra sobre la historia en la carta impresa y en la pantalla del local.",
      type: "string",
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: "story",
      title: "Historia de origen",
      description: "El relato de esta sección: de dónde viene el producto y quién lo trabaja. Aparece en la carta que se imprime y en su propia pantalla en el local. Si lo dejas vacío, la sección se muestra solo con sus productos. El máximo es lo que entra completo en la pantalla del local sin recortarse.",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.max(700),
    }),
    defineField({
      name: "sourcing",
      title: "Insumos y productores",
      description: "Opcional. Los proveedores e insumos de esta sección, en una o dos frases. Ejemplo: “Pan chapla de la panadería Kullany Pan (Sra. Karen Córdova)”. Se muestra debajo de la historia en la carta impresa.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: "sourcingFacts",
      title: "Ficha de origen y productores",
      description: "Opcional. Los datos que acompañan al relato en la pantalla del local, uno por fila: origen, productor, altitud, perfil… Si la sección no tiene ficha, déjalo vacío y la pantalla no muestra ese recuadro.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "sourcingFact",
          title: "Dato",
          fields: [
            defineField({
              name: "label",
              title: "Dato",
              description: "El nombre del dato, corto. Ejemplos: “Origen”, “Altitud”, “Productora”.",
              type: "string",
              validation: (Rule) => Rule.required().max(40),
            }),
            defineField({
              name: "value",
              title: "Valor",
              description: "El contenido del dato. Ejemplo: “Nueva Unión, Ayna – San Francisco (VRAEM, Ayacucho)”.",
              type: "string",
              validation: (Rule) => Rule.required().max(160),
            }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
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
      title: "¿Mostrar en la carta del café?",
      description: "Sí = la categoría aparece en la carta que se imprime y en la pantalla del local. No = se queda solo en el catálogo de la web. Úsalo para lo que no se consume en la mesa, como el arte o las piezas artesanales.",
      type: "boolean",
      initialValue: true,
      components: { input: YesNoBooleanInput },
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
