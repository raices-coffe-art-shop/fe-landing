import { defineQuery } from "next-sanity";

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    brandLogo,
    brandLogoAlt,
    showCatalogPrices,
    "socialLinks": socialLinks[] | order(order asc){
      platform,
      label,
      url,
      isVisible,
      order
    }
  }
`);

// Las consultas de catálogo recuperan primero los documentos publicados y
// aplican la visibilidad editorial en la capa de normalización. Esto evita que
// una referencia incompleta o un booleano legado haga desaparecer todo el
// catálogo y facilita diagnosticar contenido recién migrado.
export const featuredCatalogItemsQuery = defineQuery(`
  *[
    _type == "catalogItem" &&
    coalesce(isActive, true) == true &&
    coalesce(isFeatured, false) == true
  ] | order(order asc, _updatedAt desc)[0...12]{
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      image,
      imageAlt,
      order,
      isVisible,
      showInPrintedMenu
    },
    subcategory,
    origin,
    region,
    shortDescription,
    description,
    mainImage,
    mainImageAlt,
    gallery[]{
      ...,
      alt
    },
    producerOrCreator,
    presentations,
    availability,
    process,
    ingredients,
    allergens,
    verifiedClaims,
    inquiryMessage,
    price,
    showPrice,
    currency,
    isActive,
    isFeatured,
    order,
    seo
  }
`);

export const catalogItemsQuery = defineQuery(`
  *[_type == "catalogItem" && coalesce(isActive, true) == true]
  | order(order asc, _updatedAt desc){
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      image,
      imageAlt,
      order,
      isVisible,
      showInPrintedMenu
    },
    subcategory,
    origin,
    region,
    shortDescription,
    description,
    mainImage,
    mainImageAlt,
    gallery[]{
      ...,
      alt
    },
    producerOrCreator,
    presentations,
    availability,
    process,
    ingredients,
    allergens,
    verifiedClaims,
    inquiryMessage,
    price,
    showPrice,
    currency,
    isActive,
    isFeatured,
    order,
    seo
  }
`);

export const catalogCategoriesQuery = defineQuery(`
  *[_type == "catalogCategory"] | order(order asc, title asc){
    _id,
    title,
    "slug": slug.current,
    description,
    image,
    imageAlt,
    order,
    isVisible,
    showInPrintedMenu,
    "itemCount": 0
  }
`);

export const catalogItemBySlugQuery = defineQuery(`
  *[
    _type == "catalogItem" &&
    slug.current == $slug &&
    coalesce(isActive, true) == true
  ][0]{
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      image,
      imageAlt,
      order,
      isVisible,
      showInPrintedMenu
    },
    subcategory,
    origin,
    region,
    shortDescription,
    description,
    mainImage,
    mainImageAlt,
    gallery[]{
      ...,
      alt
    },
    producerOrCreator,
    presentations,
    availability,
    process,
    ingredients,
    allergens,
    verifiedClaims,
    inquiryMessage,
    price,
    showPrice,
    currency,
    isActive,
    isFeatured,
    order,
    seo
  }
`);

export const relatedCatalogItemsQuery = defineQuery(`
  *[
    _type == "catalogItem" &&
    coalesce(isActive, true) == true &&
    category._ref == $categoryId &&
    slug.current != $slug
  ] | order(isFeatured desc, order asc)[0...6]{
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      image,
      imageAlt,
      order,
      isVisible,
      showInPrintedMenu
    },
    subcategory,
    origin,
    region,
    shortDescription,
    description,
    mainImage,
    mainImageAlt,
    gallery[]{
      ...,
      alt
    },
    producerOrCreator,
    presentations,
    availability,
    process,
    ingredients,
    allergens,
    verifiedClaims,
    inquiryMessage,
    price,
    showPrice,
    currency,
    isActive,
    isFeatured,
    order,
    seo
  }
`);

// Publicaciones: solo las marcadas como publicadas y con fecha ya alcanzada,
// de la más reciente a la más antigua.
export const postsQuery = defineQuery(`
  *[
    _type == "post" &&
    coalesce(isPublished, false) == true &&
    defined(slug.current)
  ] | order(publishedAt desc){
    _id,
    title,
    "slug": slug.current,
    excerpt,
    coverImage,
    coverImageAlt,
    publishedAt,
    author,
    seo
  }
`);

export const postBySlugQuery = defineQuery(`
  *[
    _type == "post" &&
    slug.current == $slug &&
    coalesce(isPublished, false) == true
  ][0]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    body,
    coverImage,
    coverImageAlt,
    publishedAt,
    author,
    seo
  }
`);
