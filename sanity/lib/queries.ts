import { defineQuery } from "next-sanity";

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    brandLogo,
    brandLogoAlt,
    showCatalogPrices,
    "collagePhotos": collagePhotos[]{
      image,
      alt
    },
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
    !defined(migrationDestination) &&
    category->slug.current != "arte" &&
    !(category->slug.current in *[_type == "menuCategory"].slug.current) &&
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
      tagline,
      storyTitle,
      story,
      sourcing,
      sourcingFacts,
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
  *[
    _type == "catalogItem" &&
    coalesce(isActive, true) == true &&
    !defined(migrationDestination) &&
    category->slug.current != "arte" &&
    !(category->slug.current in *[_type == "menuCategory"].slug.current)
  ]
  | order(order asc, _updatedAt desc){
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      tagline,
      storyTitle,
      story,
      sourcing,
      sourcingFacts,
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
  *[
    _type == "catalogCategory" &&
    slug.current != "arte" &&
    !(slug.current in *[_type == "menuCategory"].slug.current)
  ] | order(order asc, title asc){
    _id,
    title,
    "slug": slug.current,
    description,
    tagline,
    storyTitle,
    story,
    sourcing,
    sourcingFacts,
    image,
    imageAlt,
    order,
    isVisible,
    showInPrintedMenu,
    "itemCount": count(*[
      _type == "catalogItem" &&
      references(^._id) &&
      coalesce(isActive, true) == true &&
      !defined(migrationDestination) &&
      ^.slug.current != "arte"
    ])
  }
`);

export const catalogItemBySlugQuery = defineQuery(`
  *[
    _type == "catalogItem" &&
    slug.current == $slug &&
    coalesce(isActive, true) == true &&
    !defined(migrationDestination) &&
    category->slug.current != "arte" &&
    !(category->slug.current in *[_type == "menuCategory"].slug.current)
  ][0]{
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      tagline,
      storyTitle,
      story,
      sourcing,
      sourcingFacts,
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


export const legacyCatalogDestinationBySlugQuery = defineQuery(`
  *[_type == "catalogItem" && slug.current == $slug][0]{
    migrationDestination,
    "categorySlug": category->slug.current
  }
`);

export const relatedCatalogItemsQuery = defineQuery(`
  *[
    _type == "catalogItem" &&
    coalesce(isActive, true) == true &&
    !defined(migrationDestination) &&
    category->slug.current != "arte" &&
    !(category->slug.current in *[_type == "menuCategory"].slug.current) &&
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
      tagline,
      storyTitle,
      story,
      sourcing,
      sourcingFacts,
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

// Publicaciones, de la más reciente a la más antigua.
//
// No hace falta filtrar por un campo propio de "publicado": el cliente de Sanity
// consulta con perspective "published", así que los borradores ya quedan fuera.
// Un segundo interruptor solo lograba que un artículo publicado desde el Studio
// no apareciera en el sitio, sin ninguna pista de por qué.
export const postsQuery = defineQuery(`
  *[
    _type == "post" &&
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
    slug.current == $slug
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

// ---------------------------------------------------------------------------
// Carta: documentos propios, separados de Productos de Origen.
// ---------------------------------------------------------------------------
export const menuItemsQuery = defineQuery(`
  *[_type == "menuItem" && coalesce(isActive, true) == true]
  | order(order asc, _updatedAt desc){
    _id,
    "sourceId": sourceCatalogItem->_id,
    title,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      tagline,
      storyTitle,
      story,
      sourcing,
      sourcingFacts,
      image,
      imageAlt,
      order,
      isVisible
    },
    subcategory,
    shortDescription,
    mainImage,
    mainImageAlt,
    price,
    showPrice,
    currency,
    isActive,
    order
  }
`);

export const menuCategoriesQuery = defineQuery(`
  *[_type == "menuCategory"] | order(order asc, title asc){
    _id,
    title,
    "slug": slug.current,
    description,
    tagline,
    storyTitle,
    story,
    sourcing,
    sourcingFacts,
    image,
    imageAlt,
    order,
    isVisible,
    "itemCount": count(*[_type == "menuItem" && references(^._id) && coalesce(isActive, true) == true])
  }
`);

// ---------------------------------------------------------------------------
// Galería de Arte: piezas propias, sin depender de Productos de Origen.
// ---------------------------------------------------------------------------
export const artItemsQuery = defineQuery(`
  *[_type == "artItem" && coalesce(isActive, true) == true]
  | order(isFeatured desc, order asc, _updatedAt desc){
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      isVisible
    },
    subcategory,
    origin,
    shortDescription,
    description,
    mainImage,
    mainImageAlt,
    gallery[]{... , alt},
    producerOrCreator,
    availability,
    inquiryMessage,
    price,
    showPrice,
    currency,
    isActive,
    isFeatured,
    order
  }
`);

export const artCategoriesQuery = defineQuery(`
  *[_type == "artCategory"] | order(order asc, title asc){
    _id,
    title,
    "slug": slug.current,
    description,
    order,
    isVisible,
    "itemCount": count(*[_type == "artItem" && references(^._id) && coalesce(isActive, true) == true])
  }
`);

export const artItemBySlugQuery = defineQuery(`
  *[_type == "artItem" && slug.current == $slug && coalesce(isActive, true) == true][0]{
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
      order,
      isVisible
    },
    subcategory,
    origin,
    shortDescription,
    description,
    mainImage,
    mainImageAlt,
    gallery[]{... , alt},
    producerOrCreator,
    availability,
    inquiryMessage,
    price,
    showPrice,
    currency,
    isActive,
    isFeatured,
    order
  }
`);

export const relatedArtItemsQuery = defineQuery(`
  *[
    _type == "artItem" &&
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
      order,
      isVisible
    },
    subcategory,
    origin,
    shortDescription,
    description,
    mainImage,
    mainImageAlt,
    gallery[]{... , alt},
    producerOrCreator,
    availability,
    inquiryMessage,
    price,
    showPrice,
    currency,
    isActive,
    isFeatured,
    order
  }
`);

// Compatibilidad temporal: permite que Galería de Arte muestre las piezas que
// todavía viven en el antiguo catálogo mientras se ejecuta la migración.
export const legacyArtCatalogItemsQuery = defineQuery(`
  *[
    _type == "catalogItem" &&
    coalesce(isActive, true) == true &&
    category->slug.current == "arte" &&
    slug.current != "manualidades" &&
    !defined(migrationDestination)
  ] | order(isFeatured desc, order asc, _updatedAt desc){
    _id,
    title,
    "slug": slug.current,
    category->{
      _id,
      title,
      "slug": slug.current,
      description,
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
    gallery[]{... , alt},
    producerOrCreator,
    availability,
    process,
    inquiryMessage,
    price,
    showPrice,
    currency,
    isActive,
    isFeatured,
    order
  }
`);
