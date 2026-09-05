export type PortableTextSpan = {
  _key?: string;
  _type?: string;
  text?: string;
  marks?: string[];
};

export type PortableTextBlock = {
  _key?: string;
  _type?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: PortableTextSpan[];
  markDefs?: Array<{ _key?: string; _type?: string; href?: string }>;
};

export type CatalogImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

// Una fila de la ficha de origen: el par etiqueta–valor que usan las cartas del
// cliente ("Origen: Nueva Unión, Ayna", "Altitud: 1,600 – 2,000 m.s.n.m.").
export type SourcingFact = {
  label: string;
  value: string;
};

export type CatalogCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  tagline?: string;
  storyTitle?: string;
  story?: string;
  sourcing?: string;
  sourcingFacts?: SourcingFact[];
  image?: CatalogImage;
  order: number;
  isVisible: boolean;
  showInPrintedMenu: boolean;
  itemCount: number;
};

export type CatalogItem = {
  id: string;
  title: string;
  slug: string;
  category: CatalogCategory;
  subcategory?: string;
  origin: string;
  region?: string;
  shortDescription: string;
  description: PortableTextBlock[];
  mainImage: CatalogImage;
  gallery: CatalogImage[];
  producerOrCreator?: string;
  presentations: string[];
  availability?: boolean;
  process?: string;
  ingredients: string[];
  allergens: string[];
  verifiedClaims: string[];
  inquiryMessage?: string;
  price?: number;
  showPrice: boolean;
  currency: "PEN" | "USD";
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  seo?: {
    title?: string;
    description?: string;
  };
};
