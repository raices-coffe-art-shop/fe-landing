import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
<<<<<<< Updated upstream
  title: "SEO (Google)",
=======
  title: "SEO",
>>>>>>> Stashed changes
  type: "object",
  fields: [
    defineField({
      name: "title",
<<<<<<< Updated upstream
      title: "Título para Google",
      description: "Es el título que puede aparecer en Google y al compartir esta página. Escríbelo como una frase/título normal y útil para una persona, no como tags. Ejemplo: “Café molido de Ayacucho | Raíces”. Si lo dejas vacío, se usa el nombre normal del producto.",
=======
      title: "Título SEO",
>>>>>>> Stashed changes
      type: "string",
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: "description",
<<<<<<< Updated upstream
      title: "Descripción para Google",
      description: "Resume la página en 1 o 2 frases naturales. Explica qué encontrará la persona si entra. No escribas “café, Ayacucho, Lima, artesanal, comprar” como palabras separadas ni uses hashtags. Ejemplo: “Descubre nuestro café molido de origen ayacuchano y conoce su procedencia, presentación y disponibilidad”.",
=======
      title: "Descripción SEO",
>>>>>>> Stashed changes
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(180),
    }),
  ],
});
