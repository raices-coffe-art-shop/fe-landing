import { defineArrayMember, defineField, defineType } from "sanity";
import { AutoSlugInput } from "../components/AutoSlugInput";
import { isUniqueSlugWithinType } from "../lib/slugUniqueness";

export const post = defineType({
  name: "post",
  title: "Publicación",
  type: "document",
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "media", title: "Portada" },
    { name: "publishing", title: "Publicación" },
    { name: "seo", title: "SEO" },
  ],
  initialValue: () => ({
    author: "Raíces",
    publishedAt: new Date().toISOString(),
  }),
  fields: [
    defineField({
      name: "title",
      title: "Título",
      description: "El titular de la publicación. Escríbelo como se lo contarías a alguien en el local: claro y concreto. Ejemplo: “Llegó la cosecha de café de Pedro”.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().min(4).max(120),
    }),
    defineField({
      name: "slug",
      title: "Dirección web (automática)",
      description: "Se genera sola a partir del título. No tienes que escribir nada aquí. Es la dirección que compartirás en Instagram o WhatsApp.",
      type: "slug",
      group: "content",
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
          return unique || "Ya existe otra publicación con esta dirección web.";
        }),
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Resumen",
      description: "Dos o tres frases que resuman la publicación. Es lo que se ve en la lista de publicaciones y lo que aparece en Google y al compartir el enlace.",
      type: "text",
      rows: 3,
      group: "content",
      validation: (Rule) => Rule.required().min(20).max(280),
    }),
    defineField({
      name: "body",
      title: "Contenido",
      description: "El texto de la publicación. Puedes usar negritas, subtítulos, listas, enlaces e insertar fotos entre los párrafos con el botón de imagen.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Párrafo", value: "normal" },
            { title: "Subtítulo", value: "h2" },
            { title: "Subtítulo menor", value: "h3" },
            { title: "Cita", value: "blockquote" },
          ],
          lists: [
            { title: "Lista con viñetas", value: "bullet" },
            { title: "Lista numerada", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Negrita", value: "strong" },
              { title: "Cursiva", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                title: "Enlace",
                type: "object",
                fields: [
                  {
                    name: "href",
                    title: "Dirección",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          title: "Fotografía",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Descripción de la imagen",
              description: "Describe lo que se ve, para personas que usan lectores de pantalla.",
              type: "string",
              validation: (Rule) => Rule.required().min(3).max(180),
            },
            {
              name: "caption",
              title: "Pie de foto (opcional)",
              type: "string",
              validation: (Rule) => Rule.max(180),
            },
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "coverImage",
      title: "Foto de portada",
      description: "La imagen que encabeza la publicación y la que se ve al compartir el enlace. Usa una foto horizontal y de buena calidad.",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImageAlt",
      title: "Descripción de la portada",
      description: "Describe brevemente la foto de portada. Ejemplo: “Pedro sosteniendo granos de café recién cosechados”.",
      type: "string",
      group: "media",
      validation: (Rule) => Rule.required().min(3).max(180),
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      description: "La fecha que se muestra en la publicación. Las más recientes aparecen primero.",
      type: "datetime",
      group: "publishing",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Autor",
      description: "Quién firma la publicación. Por defecto es “Raíces”.",
      type: "string",
      group: "publishing",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "seo",
      title: "SEO (Google)",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    { title: "Más recientes", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
    { title: "Más antiguas", name: "publishedAtAsc", by: [{ field: "publishedAt", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", publishedAt: "publishedAt", author: "author", media: "coverImage" },
    prepare({ title, publishedAt, author, media }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })
        : "sin fecha";
      return {
        title: title || "Publicación sin título",
        subtitle: author ? `${date} · ${author}` : date,
        media,
      };
    },
  },
});
