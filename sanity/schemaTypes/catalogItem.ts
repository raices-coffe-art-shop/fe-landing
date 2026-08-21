import { defineArrayMember, defineField, defineType } from "sanity";
<<<<<<< Updated upstream
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";
=======
>>>>>>> Stashed changes

const currencies = [
  { title: "Soles (PEN)", value: "PEN" },
  { title: "Dólares (USD)", value: "USD" },
];

const tones = [
  { title: "Verde", value: "green" },
  { title: "Miel", value: "honey" },
  { title: "Cacao", value: "cacao" },
  { title: "Arcilla", value: "clay" },
  { title: "Retablo", value: "retablo" },
  { title: "Tinta", value: "ink" },
];

export const catalogItem = defineType({
  name: "catalogItem",
  title: "Producto de catálogo",
  type: "document",
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "media", title: "Imágenes" },
    { name: "details", title: "Detalles" },
    { name: "publishing", title: "Publicación" },
<<<<<<< Updated upstream
    { name: "seo", title: "SEO (Google)" },
=======
    { name: "seo", title: "SEO" },
>>>>>>> Stashed changes
  ],
  initialValue: {
    isActive: true,
    isFeatured: false,
    order: 100,
    origin: "Ayacucho",
    tone: "green",
    currency: "PEN",
    showPrice: true,
<<<<<<< Updated upstream
    availability: true,
=======
>>>>>>> Stashed changes
  },
  fields: [
    defineField({
      name: "title",
      title: "Título",
<<<<<<< Updated upstream
      description: "Es el nombre del producto que verá la gente. Ejemplo: “Café molido de Ayacucho”. Escríbelo como un nombre normal, sin hashtags ni palabras repetidas para Google.",
=======
>>>>>>> Stashed changes
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: "slug",
<<<<<<< Updated upstream
      title: "Dirección web (slug)",
      description: "Es la parte final de la dirección de esta ficha. Por ejemplo, “cafe-molido” crea /catalogo/cafe-molido. Normalmente basta con pulsar el botón Generate/Generar y no tocarlo después de publicar.",
=======
      title: "Slug",
>>>>>>> Stashed changes
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
<<<<<<< Updated upstream
      description: "Elige el grupo principal al que pertenece el producto. Ejemplo: Café y cacao, Alimentos o Arte. Esto ayuda a ordenar el catálogo y las recomendaciones.",
=======
>>>>>>> Stashed changes
      type: "reference",
      group: "content",
      to: [{ type: "catalogCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subcategory",
      title: "Subcategoría",
<<<<<<< Updated upstream
      description: "Opcional. Sirve para especificar un grupo más concreto dentro de la categoría. Ejemplo: “Café en grano” o “Cerámica”. Si no hace falta, déjalo vacío.",
=======
>>>>>>> Stashed changes
      type: "string",
      group: "content",
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: "origin",
      title: "Procedencia",
<<<<<<< Updated upstream
      description: "Indica de dónde proviene el producto, alimento u obra. Ejemplo: “Ayacucho”. No es la dirección del local de Raíces.",
=======
>>>>>>> Stashed changes
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "region",
<<<<<<< Updated upstream
      title: "Lugar específico (opcional)",
      description: "Úsalo solo si aporta más precisión que Procedencia. Ejemplo: si Procedencia es “Ayacucho”, aquí podría ir “VRAEM” o “Sacsamarca”. Si vas a repetir exactamente “Ayacucho”, déjalo vacío.",
      type: "string",
      group: "content",
      validation: (Rule) => [
        Rule.max(120),
        Rule.custom((value, context) => {
          if (!value?.trim()) return true;
          const document = context.document as { origin?: string } | undefined;
          const origin = document?.origin?.trim();
          if (origin && value.trim().toLocaleLowerCase("es") === origin.toLocaleLowerCase("es")) {
            return "No repitas la Procedencia. Deja este campo vacío o escribe un lugar más específico.";
          }
          return true;
        }).warning(),
      ],
=======
      title: "Región o territorio",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.max(120),
>>>>>>> Stashed changes
    }),
    defineField({
      name: "shortDescription",
      title: "Descripción corta",
<<<<<<< Updated upstream
      description: "Escribe 1 o 2 frases naturales que expliquen qué es el producto y qué lo hace especial. Se muestra en tarjetas y también puede usarse en buscadores. No pongas una lista de tags o palabras sueltas como “café, Ayacucho, orgánico, Lima”; escribe una frase que una persona leería normalmente.",
=======
      description: "Se usa en las tarjetas. La ficha puede mostrar un texto más amplio.",
>>>>>>> Stashed changes
      type: "text",
      rows: 4,
      group: "content",
      validation: (Rule) => Rule.required().min(10).max(280),
    }),
    defineField({
      name: "description",
      title: "Descripción completa",
<<<<<<< Updated upstream
      description: "Aquí puedes contar la historia completa del producto en varios párrafos: origen, elaboración, persona que lo produce, tradición, uso o cualquier contexto que ayude a entenderlo. Es texto para personas, no una lista de palabras para Google.",
=======
>>>>>>> Stashed changes
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "mainImage",
      title: "Imagen principal",
<<<<<<< Updated upstream
      description: "Es la foto principal del producto. Aparece en el catálogo, en su ficha y al compartir el enlace. Usa una imagen clara, de buena calidad y que represente realmente el artículo.",
=======
>>>>>>> Stashed changes
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImageAlt",
<<<<<<< Updated upstream
      title: "Descripción de la imagen principal",
      description: "Describe brevemente lo que se ve en la foto para personas que usan lectores de pantalla y para que los buscadores entiendan la imagen. Ejemplo: “Bolsa de café ayacuchano en grano sobre una mesa”. No llenes este campo con tags o palabras repetidas.",
=======
      title: "Texto alternativo de la imagen principal",
>>>>>>> Stashed changes
      type: "string",
      group: "media",
      validation: (Rule) => Rule.required().min(3).max(180),
    }),
    defineField({
      name: "gallery",
      title: "Galería",
<<<<<<< Updated upstream
      description: "Añade fotos adicionales del producto: otros ángulos, detalles, empaque, proceso o contexto. No es obligatorio llenar la galería.",
=======
>>>>>>> Stashed changes
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
<<<<<<< Updated upstream
              title: "Descripción de esta imagen",
              description: "Explica en una frase qué aparece en esta foto. Ejemplo: “Detalle del empaque de café de Ayacucho”. Evita hashtags y listas de palabras clave.",
=======
              title: "Texto alternativo",
>>>>>>> Stashed changes
              type: "string",
              validation: (Rule) => Rule.required().min(3).max(180),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "producerOrCreator",
      title: "Productor, artesano o creador",
<<<<<<< Updated upstream
      description: "Opcional. Escribe el nombre de la persona, familia, asociación o taller que produce o crea este artículo cuando esa información sea conocida y pueda publicarse.",
=======
>>>>>>> Stashed changes
      type: "string",
      group: "details",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "presentations",
      title: "Presentaciones",
<<<<<<< Updated upstream
      description: "Añade una opción por cada forma o tamaño en que se ofrece el producto. Ejemplos: “250 g”, “500 g”, “Taza individual”. Si solo existe una presentación y no hace falta aclararla, puede quedar vacío.",
=======
>>>>>>> Stashed changes
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "availability",
<<<<<<< Updated upstream
      title: "¿Se puede comprar o pedir ahora?",
      description: "Esto NO controla si la ficha aparece en la web. Marca Sí cuando el producto puede comprarse o pedirse en este momento; marca No cuando está agotado o temporalmente no disponible, pero quieres que la ficha siga visible. No representa una cantidad de stock.",
      type: "boolean",
      group: "details",
      initialValue: true,
      components: { input: YesNoBooleanInput },
      validation: (Rule) => Rule.required(),
=======
      title: "Disponibilidad",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.max(180),
>>>>>>> Stashed changes
    }),
    defineField({
      name: "process",
      title: "Proceso",
<<<<<<< Updated upstream
      description: "Opcional. Explica de manera sencilla cómo se cultiva, elabora, transforma o crea el producto. Ejemplo: tostado, molienda, fermentación, técnica artesanal o preparación.",
=======
>>>>>>> Stashed changes
      type: "text",
      rows: 5,
      group: "details",
    }),
    defineField({
      name: "ingredients",
      title: "Ingredientes",
<<<<<<< Updated upstream
      description: "Añade un ingrediente por línea/elemento cuando corresponda a alimentos o bebidas. Usa nombres normales, por ejemplo “cacao”, “panela” o “leche”. Para artículos no alimenticios puede quedar vacío.",
=======
>>>>>>> Stashed changes
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "allergens",
      title: "Alérgenos",
<<<<<<< Updated upstream
      description: "Indica solo alérgenos que realmente correspondan al producto, uno por elemento, por ejemplo “leche” o “frutos secos”. Si no se conoce con certeza, no inventes información.",
=======
>>>>>>> Stashed changes
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "verifiedClaims",
      title: "Afirmaciones verificadas",
<<<<<<< Updated upstream
      description: "Incluye únicamente datos que el negocio pueda respaldar, por ejemplo una certificación, procedencia comprobada o característica confirmada por el productor. Evita promesas de salud o frases como “100% orgánico” si no existe sustento.",
=======
>>>>>>> Stashed changes
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "price",
      title: "Precio",
<<<<<<< Updated upstream
      description: "Opcional. Escribe solo el número, sin “S/”, “soles” ni símbolo de moneda. Ejemplo: para S/ 12.50 escribe 12.50. Si se deja vacío, no se muestra un precio.",
=======
      description: "Opcional. Cuando se completa, el precio aparece en las tarjetas y en la ficha del producto.",
>>>>>>> Stashed changes
      type: "number",
      group: "details",
      validation: (Rule) =>
        Rule.min(0).custom((value) => {
          if (typeof value !== "number") return true;
          return Number.isInteger(value * 100) || "Usa como máximo dos decimales.";
        }),
    }),
    defineField({
      name: "currency",
      title: "Moneda",
<<<<<<< Updated upstream
      description: "Elige la moneda del precio: Soles (PEN) para precios en soles o Dólares (USD) para precios en dólares. Este campo aparece solo cuando has escrito un precio.",
=======
>>>>>>> Stashed changes
      type: "string",
      group: "details",
      initialValue: "PEN",
      options: { list: currencies, layout: "radio" },
      hidden: ({ document }) => typeof document?.price !== "number",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const document = context.document as { price?: number } | undefined;
          if (typeof document?.price === "number" && !value) return "Selecciona la moneda del precio.";
          return true;
        }),
    }),
    defineField({
      name: "showPrice",
<<<<<<< Updated upstream
      title: "¿Mostrar el precio de este producto?",
      description: "Controla solo el precio de esta ficha. Sí = puede mostrarse si existe un precio y la opción general de precios está habilitada. No = el monto queda guardado en Sanity, pero no se muestra al público.",
      type: "boolean",
      group: "details",
      initialValue: true,
      hidden: ({ document }) => typeof document?.price !== "number",
      components: { input: YesNoBooleanInput },
    }),
    defineField({
      name: "inquiryMessage",
      title: "Mensaje de consulta por WhatsApp",
      description: "Opcional. Es el texto que se prepara cuando alguien pulsa Consultar. Ejemplo: “Hola, quisiera consultar por Café molido”. Si lo dejas vacío, el sitio genera automáticamente un mensaje usando el nombre del producto.",
=======
      title: "Mostrar precio de este producto",
      description: "Permite ocultar el precio de este producto aunque exista un monto. La configuración global del catálogo también debe estar activada.",
      type: "boolean",
      group: "details",
      initialValue: true,
    }),
    defineField({
      name: "inquiryMessage",
      title: "Mensaje de consulta",
      description: "Opcional. Si se deja vacío se genera uno con el nombre del producto.",
>>>>>>> Stashed changes
      type: "string",
      group: "details",
      validation: (Rule) => Rule.max(260),
    }),
    defineField({
      name: "tone",
      title: "Tono visual",
<<<<<<< Updated upstream
      description: "Elige el color/acento con el que este producto puede identificarse visualmente en algunas partes del sitio. No cambia el producto ni su categoría; es únicamente una decisión de presentación.",
=======
>>>>>>> Stashed changes
      type: "string",
      group: "publishing",
      options: { list: tones, layout: "radio" },
      initialValue: "green",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isActive",
<<<<<<< Updated upstream
      title: "¿Mostrar este producto en el sitio?",
      description: "Este campo controla la VISIBILIDAD de toda la ficha. Sí = el producto puede aparecer en catálogo y abrirse públicamente. No = se oculta por completo sin borrarlo. Es distinto de “¿Se puede comprar o pedir ahora?”: un producto puede seguir visible aunque temporalmente no esté disponible.",
      type: "boolean",
      group: "publishing",
      initialValue: true,
      components: { input: YesNoBooleanInput },
=======
      title: "Activo en el sitio",
      type: "boolean",
      group: "publishing",
      initialValue: true,
>>>>>>> Stashed changes
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isFeatured",
<<<<<<< Updated upstream
      title: "¿Destacar este producto en la portada?",
      description: "Sí = puede aparecer entre los productos destacados de la página principal y también tiene prioridad como imagen representativa de su categoría. No = sigue apareciendo normalmente en el catálogo si está visible.",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      components: { input: YesNoBooleanInput },
=======
      title: "Destacado en la portada",
      type: "boolean",
      group: "publishing",
      initialValue: false,
>>>>>>> Stashed changes
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Orden",
<<<<<<< Updated upstream
      description: "Controla qué aparece primero cuando varios productos se ordenan manualmente. Los números menores van antes: 10 aparece antes que 20. Puedes usar 10, 20, 30… para dejar espacio entre posiciones.",
=======
>>>>>>> Stashed changes
      type: "number",
      group: "publishing",
      initialValue: 100,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "seo",
<<<<<<< Updated upstream
      title: "SEO (cómo aparece en Google)",
      description: "Opcional. Aquí puedes ajustar el título y la descripción que usan los buscadores y al compartir el enlace. Si lo dejas vacío, el sitio usa automáticamente el título del producto y su descripción corta. SEO se escribe para personas: frases naturales, no listas de tags.",
=======
      title: "SEO",
>>>>>>> Stashed changes
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    { title: "Orden manual", name: "manualOrder", by: [{ field: "order", direction: "asc" }] },
    { title: "Título A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
    { title: "Actualizados recientemente", name: "updatedDesc", by: [{ field: "_updatedAt", direction: "desc" }] },
    { title: "Destacados primero", name: "featured", by: [{ field: "isFeatured", direction: "desc" }, { field: "order", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      category: "category.title",
      origin: "origin",
      active: "isActive",
      featured: "isFeatured",
      price: "price",
      currency: "currency",
      showPrice: "showPrice",
<<<<<<< Updated upstream
      availability: "availability",
    },
    prepare({ title, media, category, origin, active, featured, price, currency, showPrice, availability }) {
      const state = active === false ? "inactivo" : "activo";
      const featuredLabel = featured ? " · destacado" : "";
      const availabilityLabel = availability === false ? " · no disponible" : "";
=======
    },
    prepare({ title, media, category, origin, active, featured, price, currency, showPrice }) {
      const state = active === false ? "inactivo" : "activo";
      const featuredLabel = featured ? " · destacado" : "";
>>>>>>> Stashed changes
      const priceLabel = typeof price === "number"
        ? ` · ${showPrice === false ? "precio oculto" : `${currency === "USD" ? "US$" : "S/"} ${price.toFixed(price % 1 === 0 ? 0 : 2)}`}`
        : "";
      return {
        title: title || "Producto sin título",
        media,
<<<<<<< Updated upstream
        subtitle: `${category || "Sin categoría"} · ${origin || "Sin procedencia"} · ${state}${featuredLabel}${availabilityLabel}${priceLabel}`,
=======
        subtitle: `${category || "Sin categoría"} · ${origin || "Sin procedencia"} · ${state}${featuredLabel}${priceLabel}`,
>>>>>>> Stashed changes
      };
    },
  },
});
