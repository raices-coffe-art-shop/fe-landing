import { defineArrayMember, defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";
import { AutoSlugInput } from "../components/AutoSlugInput";
import { isUniqueSlugWithinType } from "../lib/slugUniqueness";

export const menuCategory = defineType({
  name: "menuCategory",
  title: "Categoría de la Carta",
  type: "document",
  initialValue: { order: 100, isVisible: true },
  fields: [
    defineField({
      name: "title",
      title: "Nombre de la categoría",
      description: "Nombre que aparecerá en la Carta. Ejemplos: Cafés, Bebidas frías, Postres o Piqueos.",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: "slug",
      title: "Identificador automático",
      description: "Se genera automáticamente a partir del nombre. Sirve para organizar la Carta internamente; no crea una página pública propia.",
      type: "slug",
      components: { input: AutoSlugInput },
      validation: (Rule) => [Rule.required(), Rule.custom(async (value, context) => isUniqueSlugWithinType(value, context))],
    }),
    defineField({
      name: "description",
      title: "Descripción corta",
      description: "Texto breve que puede acompañar a la categoría en la Carta cuando no existe una historia de origen.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: "tagline",
      title: "Subtítulo para la pantalla TV",
      description: "Línea corta que aparece bajo el nombre de la categoría en /carta/tv.",
      type: "string",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "storyTitle",
      title: "Título de historia de origen",
      description: "Opcional. Encabezado del relato que acompaña esta categoría en la Carta y en la pantalla TV.",
      type: "string",
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: "story",
      title: "Historia de origen",
      description: "Opcional. Relato breve sobre el origen, productor o contexto de esta categoría. Se usa en la Carta y la pantalla TV.",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.max(700),
    }),
    defineField({
      name: "sourcing",
      title: "Insumos y productores",
      description: "Opcional. Información breve sobre proveedores o procedencia de los insumos de esta categoría.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: "sourcingFacts",
      title: "Ficha de origen",
      description: "Opcional. Datos cortos como Origen, Productor, Altitud o Perfil. Se muestran como una ficha en la pantalla TV.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "sourcingFact",
          title: "Dato",
          fields: [
            defineField({ name: "label", title: "Dato", type: "string", validation: (Rule) => Rule.required().max(40) }),
            defineField({ name: "value", title: "Valor", type: "string", validation: (Rule) => Rule.required().max(160) }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: "image",
      title: "Imagen de la categoría",
      description: "Opcional. Foto representativa usada en la versión imprimible y en la pantalla TV.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageAlt",
      title: "Descripción de la imagen",
      description: "Describe brevemente lo que aparece en la foto.",
      type: "string",
      hidden: ({ document }) => !document?.image,
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "order",
      title: "Orden",
      description: "Un número menor aparece antes. Recomendación: 10, 20, 30…",
      type: "number",
      initialValue: 100,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "isVisible",
      title: "¿Mostrar esta categoría en la Carta?",
      description: "Sí = aparece en /carta, impresión y TV. No = queda guardada pero se oculta sin borrarla.",
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
  preview: { select: { title: "title", subtitle: "description", media: "image" } },
});
