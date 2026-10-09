import { defineArrayMember, defineField, defineType } from "sanity";

export const screenSettings = defineType({
  name: "screenSettings",
  title: "Pantalla del local",
  type: "document",
  fields: [
    defineField({
      name: "collagePhotos",
      title: "Fotos de «Nuestros productos»",
      description:
        "Estas fotos forman el muro que aparece en la pantalla del local después del código QR. Sube al menos cuatro para usar una selección propia; si no hay suficientes, la pantalla toma fotografías de la Carta como respaldo.",
      type: "array",
      options: { sortable: true, layout: "grid" },
      of: [
        defineArrayMember({
          type: "object",
          name: "collagePhoto",
          title: "Foto",
          fields: [
            defineField({
              name: "image",
              title: "Fotografía",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Descripción de la imagen",
              description:
                "Describe brevemente lo que se ve para accesibilidad. Ejemplo: “Taza de café sobre una mesa de madera”.",
              type: "string",
              validation: (Rule) => Rule.max(180),
            }),
          ],
          preview: { select: { title: "alt", media: "image" } },
        }),
      ],
      validation: (Rule) => Rule.max(24),
    }),
    defineField({
      name: "originPhoto",
      title: "Imagen de «Nuestra historia»",
      description:
        "Fotografía principal de la pantalla «Nuestra historia». Si la dejas vacía, se conserva automáticamente la fotografía actual de Francisco y Lized como respaldo.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "originPhotoAlt",
      title: "Descripción de la imagen de «Nuestra historia»",
      description:
        "Texto accesible para describir la fotografía. Si lo dejas vacío, se usa la descripción actual de la historia.",
      type: "string",
      validation: (Rule) => Rule.max(180),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Pantalla del local" };
    },
  },
});
