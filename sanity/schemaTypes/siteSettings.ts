import { defineArrayMember, defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Configuración del sitio",
  type: "document",
  groups: [
    { name: "brand", title: "Marca", default: true },
    { name: "catalog", title: "Catálogo" },
    { name: "social", title: "Redes sociales" },
    { name: "screen", title: "Pantalla del local" },
  ],
  initialValue: {
    brandLogoAlt: "Raíces — Café y Cultura",
    showCatalogPrices: true,
    socialLinks: [
      {
        _type: "socialLink",
        _key: "whatsapp",
        platform: "whatsapp",
        label: "WhatsApp",
        url: "https://wa.me/51915123159",
        isVisible: true,
        order: 10,
      },
      {
        _type: "socialLink",
        _key: "email",
        platform: "email",
        label: "Correo electrónico",
        url: "mailto:raicescoffeeartshop@gmail.com",
        isVisible: true,
        order: 20,
      },
      {
        _type: "socialLink",
        _key: "instagram",
        platform: "instagram",
        label: "Instagram",
        url: "https://www.instagram.com/raicescoffeeartshop/",
        isVisible: true,
        order: 30,
      },
      {
        _type: "socialLink",
        _key: "facebook",
        platform: "facebook",
        label: "Facebook",
        url: "https://www.facebook.com/profile.php?id=100089073728506&locale=es_LA",
        isVisible: true,
        order: 40,
      },
    ],
  },
  fields: [
    defineField({
      name: "brandLogo",
      title: "Logo principal",
      description: "Es el logo oficial que usa el sitio en zonas como la navegación, el pie de página y /links. Cambiarlo aquí puede cambiarlo en varias partes de la web a la vez.",
      type: "image",
      group: "brand",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brandLogoAlt",
      title: "Descripción del logo",
      description: "Texto accesible que identifica el logo cuando la imagen no puede verse o se usa un lector de pantalla. Debe describir la marca, por ejemplo “Raíces — Café y Cultura”, no una lista de palabras clave.",
      type: "string",
      group: "brand",
      initialValue: "Raíces — Café y Cultura",
      validation: (Rule) => Rule.required().min(2).max(160),
    }),
    defineField({
      name: "showCatalogPrices",
      title: "¿Permitir mostrar precios en el sitio?",
      description: "Este es el control GENERAL de precios. Sí = cada producto puede mostrar su precio si también tiene activada su propia opción “¿Mostrar el precio de este producto?”. No = se ocultan todos los precios del sitio de una sola vez, sin borrar los montos guardados.",
      type: "boolean",
      group: "catalog",
      initialValue: true,
      components: { input: YesNoBooleanInput },
    }),
    defineField({
      name: "socialLinks",
      title: "Redes sociales y contacto",
      description: "Aquí administras los enlaces de WhatsApp, correo y redes que aparecen en el footer y en /links. Puedes cambiar la dirección, el texto, el orden o decidir si cada enlace es visible.",
      type: "array",
      group: "social",
      options: { sortable: true },
      of: [defineArrayMember({ type: "socialLink" })],
      validation: (Rule) =>
        Rule.unique().custom((links) => {
          if (!Array.isArray(links)) return true;
          const seen = new Set<string>();
          for (const link of links as Array<{ platform?: string }>) {
            if (!link.platform || link.platform === "other") continue;
            if (seen.has(link.platform)) return `La plataforma ${link.platform} está repetida.`;
            seen.add(link.platform);
          }
          return true;
        }),
    }),
    defineField({
      name: "collagePhotos",
      title: "Fotos del muro de la pantalla",
      description: "El muro de fotografías que aparece en la pantalla del local, después del código QR. Sube aquí las fotos que quieras mostrar; si dejas la lista vacía, el muro usa las fotografías de los productos del catálogo. Hacen falta al menos cuatro para que tome las tuyas.",
      type: "array",
      group: "screen",
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
              description: "Describe lo que se ve, para personas que usan lectores de pantalla. Ejemplo: “Taza de café sobre una mesa de madera”.",
              type: "string",
              validation: (Rule) => Rule.max(180),
            }),
          ],
          preview: { select: { title: "alt", media: "image" } },
        }),
      ],
      validation: (Rule) => Rule.max(24),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Configuración del sitio" };
    },
  },
});
