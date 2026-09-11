import { defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";
import { AutoSlugInput } from "../components/AutoSlugInput";
import { isUniqueSlugWithinType } from "../lib/slugUniqueness";

export const artCategory = defineType({
  name: "artCategory",
  title: "Categoría de Galería de Arte",
  type: "document",
  initialValue: { order: 100, isVisible: true },
  fields: [
    defineField({ name: "title", title: "Nombre", description: "Ejemplos: Toritos, Retablos, Nacimientos, Pinturas.", type: "string", validation: (Rule) => Rule.required().min(2).max(80) }),
    defineField({ name: "slug", title: "Identificador automático", description: "Se genera automáticamente a partir del nombre y se usa para filtros de la galería.", type: "slug", components: { input: AutoSlugInput }, validation: (Rule) => [Rule.required(), Rule.custom(async (value, context) => isUniqueSlugWithinType(value, context))] }),
    defineField({ name: "description", title: "Descripción", description: "Opcional. Una frase breve que explique qué reúne esta categoría.", type: "text", rows: 3, validation: (Rule) => Rule.max(300) }),
    defineField({ name: "order", title: "Orden", description: "Un número menor aparece antes. Recomendación: 10, 20, 30…", type: "number", initialValue: 100, validation: (Rule) => Rule.required().integer().min(0) }),
    defineField({ name: "isVisible", title: "¿Mostrar esta categoría?", description: "Sí = sus piezas pueden aparecer públicamente. No = se oculta sin borrar nada.", type: "boolean", initialValue: true, components: { input: YesNoBooleanInput }, validation: (Rule) => Rule.required() }),
  ],
  orderings: [
    { title: "Orden manual", name: "manualOrder", by: [{ field: "order", direction: "asc" }] },
    { title: "Nombre A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
});
