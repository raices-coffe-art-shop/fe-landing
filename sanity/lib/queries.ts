import { defineQuery } from "next-sanity";

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    title,
    brandLogo,
    brandLogoAlt,
    showCatalogPrices,
    "socialLinks": socialLinks[] | order(order asc){
      platform,
      customPlatformName,
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
      isVisible
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
    tone,
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
      isVisible
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
    tone,
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
      isVisible
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
    tone,
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
      isVisible
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
    tone,
    isActive,
    isFeatured,
    order,
    seo
  }
`);
