import { defineArrayMember, defineField, defineType } from "sanity";
import { YesNoBooleanInput } from "../components/YesNoBooleanInput";
import { AutoSlugInput } from "../components/AutoSlugInput";
import { isUniqueSlugWithinType } from "../lib/slugUniqueness";

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
    { name: "seo", title: "SEO (Google)" },
  ],
  initialValue: {
    isActive: true,
    isFeatured: false,
    order: 100,
    origin: "Ayacucho",
    tone: "green",
    currency: "PEN",
    showPrice: true,
    availability: true,
  },
  fields: [
    defineField({
      name: "title",
      title: "Título",
      description: "Es el nombre del producto que verá la gente. Ejemplo: “Café molido de Ayacucho”. Escríbelo como un nombre normal, sin hashtags ni palabras repetidas para Google.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: "slug",
      title: "Dirección web (automática)",
      description: "Se genera automáticamente a partir del título. No tienes que escribir ni editar nada aquí. Por ejemplo, “Café molido” crea /catalogo/cafe-molido. Si otro producto ya usa esa dirección, el sistema elegirá automáticamente cafe-molido-2, cafe-molido-3, etc.",
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
          return unique || "Ya existe otro elemento con esta dirección web.";
        }),
      ],
    }),
    defineField({
      name: "category",
      title: "Categoría",
      description: "Elige el grupo principal al que pertenece el producto. Ejemplo: Café y cacao, Alimentos o Arte. Esto ayuda a ordenar el catálogo y las recomendaciones.",
      type: "reference",
      group: "content",
      to: [{ type: "catalogCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subcategory",
      title: "Subcategoría",
      description: "Opcional. Sirve para especificar un grupo más concreto dentro de la categoría. Ejemplo: “Café en grano” o “Cerámica”. Si no hace falta, déjalo vacío.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: "origin",
      title: "Procedencia",
      description: "Indica de dónde proviene el producto, alimento u obra. Ejemplo: “Ayacucho”. No es la dirección del local de Raíces.",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "region",
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
    }),
    defineField({
      name: "shortDescription",
      title: "Descripción corta",
      description: "Escribe 1 o 2 frases naturales que expliquen qué es el producto y qué lo hace especial. Se muestra en tarjetas y también puede usarse en buscadores. No pongas una lista de tags o palabras sueltas como “café, Ayacucho, orgánico, Lima”; escribe una frase que una persona leería normalmente.",
      type: "text",
      rows: 4,
      group: "content",
      validation: (Rule) => Rule.required().min(10).max(280),
    }),
    defineField({
      name: "description",
      title: "Descripción completa",
      description: "Aquí puedes contar la historia completa del producto en varios párrafos: origen, elaboración, persona que lo produce, tradición, uso o cualquier contexto que ayude a entenderlo. Es texto para personas, no una lista de palabras para Google.",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "mainImage",
      title: "Imagen principal",
      description: "Es la foto principal del producto. Aparece en el catálogo, en su ficha y al compartir el enlace. Usa una imagen clara, de buena calidad y que represente realmente el artículo.",
      type: "image",
      group: "media",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImageAlt",
      title: "Descripción de la imagen principal",
      description: "Describe brevemente lo que se ve en la foto para personas que usan lectores de pantalla y para que los buscadores entiendan la imagen. Ejemplo: “Bolsa de café ayacuchano en grano sobre una mesa”. No llenes este campo con tags o palabras repetidas.",
      type: "string",
      group: "media",
      validation: (Rule) => Rule.required().min(3).max(180),
    }),
    defineField({
      name: "gallery",
      title: "Galería",
      description: "Añade fotos adicionales del producto: otros ángulos, detalles, empaque, proceso o contexto. No es obligatorio llenar la galería.",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Descripción de esta imagen",
              description: "Explica en una frase qué aparece en esta foto. Ejemplo: “Detalle del empaque de café de Ayacucho”. Evita hashtags y listas de palabras clave.",
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
      description: "Opcional. Escribe el nombre de la persona, familia, asociación o taller que produce o crea este artículo cuando esa información sea conocida y pueda publicarse.",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.max(140),
    }),
    defineField({
      name: "presentations",
      title: "Presentaciones",
      description: "Añade una opción por cada forma o tamaño en que se ofrece el producto. Ejemplos: “250 g”, “500 g”, “Taza individual”. Si solo existe una presentación y no hace falta aclararla, puede quedar vacío.",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "availability",
      title: "¿Se puede comprar o pedir ahora?",
      description: "Esto NO controla si la ficha aparece en la web. Marca Sí cuando el producto puede comprarse o pedirse en este momento; marca No cuando está agotado o temporalmente no disponible, pero quieres que la ficha siga visible. No representa una cantidad de stock.",
      type: "boolean",
      group: "details",
      initialValue: true,
      components: { input: YesNoBooleanInput },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "process",
      title: "Proceso",
      description: "Opcional. Explica de manera sencilla cómo se cultiva, elabora, transforma o crea el producto. Ejemplo: tostado, molienda, fermentación, técnica artesanal o preparación.",
      type: "text",
      rows: 5,
      group: "details",
    }),
    defineField({
      name: "ingredients",
      title: "Ingredientes",
      description: "Añade un ingrediente por línea/elemento cuando corresponda a alimentos o bebidas. Usa nombres normales, por ejemplo “cacao”, “panela” o “leche”. Para artículos no alimenticios puede quedar vacío.",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "allergens",
      title: "Alérgenos",
      description: "Indica solo alérgenos que realmente correspondan al producto, uno por elemento, por ejemplo “leche” o “frutos secos”. Si no se conoce con certeza, no inventes información.",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "verifiedClaims",
      title: "Afirmaciones verificadas",
      description: "Incluye únicamente datos que el negocio pueda respaldar, por ejemplo una certificación, procedencia comprobada o característica confirmada por el productor. Evita promesas de salud o frases como “100% orgánico” si no existe sustento.",
      type: "array",
      group: "details",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "price",
      title: "Precio",
      description: "Opcional. Escribe solo el número, sin “S/”, “soles” ni símbolo de moneda. Ejemplo: para S/ 12.50 escribe 12.50. Si se deja vacío, no se muestra un precio.",
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
      description: "Elige la moneda del precio: Soles (PEN) para precios en soles o Dólares (USD) para precios en dólares. Este campo aparece solo cuando has escrito un precio.",
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
      type: "string",
      group: "details",
      validation: (Rule) => Rule.max(260),
    }),
    defineField({
      name: "tone",
      title: "Tono visual",
      description: "Elige el color/acento con el que este producto puede identificarse visualmente en algunas partes del sitio. No cambia el producto ni su categoría; es únicamente una decisión de presentación.",
      type: "string",
      group: "publishing",
      options: { list: tones, layout: "radio" },
      initialValue: "green",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isActive",
      title: "¿Mostrar este producto en el sitio?",
      description: "Este campo controla la VISIBILIDAD de toda la ficha. Sí = el producto puede aparecer en catálogo y abrirse públicamente. No = se oculta por completo sin borrarlo. Es distinto de “¿Se puede comprar o pedir ahora?”: un producto puede seguir visible aunque temporalmente no esté disponible.",
      type: "boolean",
      group: "publishing",
      initialValue: true,
      components: { input: YesNoBooleanInput },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isFeatured",
      title: "¿Destacar este producto en la portada?",
      description: "Sí = puede aparecer entre los productos destacados de la página principal y también tiene prioridad como imagen representativa de su categoría. No = sigue apareciendo normalmente en el catálogo si está visible.",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      components: { input: YesNoBooleanInput },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Orden",
      description: "Controla qué aparece primero cuando varios productos se ordenan manualmente. Los números menores van antes: 10 aparece antes que 20. Puedes usar 10, 20, 30… para dejar espacio entre posiciones.",
      type: "number",
      group: "publishing",
      initialValue: 100,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "seo",
      title: "SEO (cómo aparece en Google)",
      description: "Opcional. Aquí puedes ajustar el título y la descripción que usan los buscadores y al compartir el enlace. Si lo dejas vacío, el sitio usa automáticamente el título del producto y su descripción corta. SEO se escribe para personas: frases naturales, no listas de tags.",
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
      availability: "availability",
    },
    prepare({ title, media, category, origin, active, featured, price, currency, showPrice, availability }) {
      const state = active === false ? "inactivo" : "activo";
      const featuredLabel = featured ? " · destacado" : "";
      const availabilityLabel = availability === false ? " · no disponible" : "";
      const priceLabel = typeof price === "number"
        ? ` · ${showPrice === false ? "precio oculto" : `${currency === "USD" ? "US$" : "S/"} ${price.toFixed(price % 1 === 0 ? 0 : 2)}`}`
        : "";
      return {
        title: title || "Producto sin título",
        media,
        subtitle: `${category || "Sin categoría"} · ${origin || "Sin procedencia"} · ${state}${featuredLabel}${availabilityLabel}${priceLabel}`,
      };
    },
  },
});
