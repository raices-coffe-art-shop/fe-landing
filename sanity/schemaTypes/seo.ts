import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO (Google)",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Título para Google",
      description: "Es el título que puede aparecer en Google y al compartir esta página. Escríbelo como una frase/título normal y útil para una persona, no como tags. Ejemplo: “Café molido de Ayacucho | Raíces”. Si lo dejas vacío, se usa el nombre normal del producto.",
      type: "string",
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: "description",
      title: "Descripción para Google",
      description: "Resume la página en 1 o 2 frases naturales. Explica qué encontrará la persona si entra. No escribas “café, Ayacucho, Lima, artesanal, comprar” como palabras separadas ni uses hashtags. Ejemplo: “Descubre nuestro café molido de origen ayacuchano y conoce su procedencia, presentación y disponibilidad”.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(180),
    }),
  ],
});
