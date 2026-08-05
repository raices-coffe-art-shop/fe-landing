import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Título SEO",
      type: "string",
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: "description",
      title: "Descripción SEO",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(180),
    }),
  ],
});
