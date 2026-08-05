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

export type CatalogCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  isVisible: boolean;
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
  availability?: string;
  process?: string;
  ingredients: string[];
  allergens: string[];
  verifiedClaims: string[];
  inquiryMessage?: string;
  price?: number;
  showPrice: boolean;
  currency: "PEN" | "USD";
  tone: "green" | "honey" | "cacao" | "clay" | "retablo" | "ink";
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  seo?: {
    title?: string;
    description?: string;
  };
};
