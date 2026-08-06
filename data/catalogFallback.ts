import type { CatalogCategory, CatalogItem } from "@/sanity/lib/catalogTypes";

type FallbackProduct = {
  slug: string;
  title: string;
  category: "Café y cacao" | "Alimentos" | "Arte";
  subcategory: string;
  origin: string;
  region: string;
  shortDescription: string;
  tone: CatalogItem["tone"];
  image: string;
  price: number;
  producerOrCreator?: string;
};

const categorySeed = [
  { title: "Café y cacao", slug: "cafe-y-cacao", order: 10 },
  { title: "Alimentos", slug: "alimentos", order: 20 },
  { title: "Arte", slug: "arte", order: 30 },
] as const;

const productSeed: FallbackProduct[] = [
  {
    slug: "cafe-preparado",
    title: "Café preparado",
    category: "Café y cacao",
    subcategory: "Café preparado",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Preparado en el local con café de origen ayacuchano.",
    tone: "green",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=82",
    price: 12,
    producerOrCreator: "Pedro Ñahui Atao",
  },
  {
    slug: "cafe-en-grano",
    title: "Granos de café",
    category: "Café y cacao",
    subcategory: "Café en grano",
    origin: "VRAEM, Ayacucho",
    region: "VRAEM · Ayacucho",
    shortDescription: "Grano seleccionado para preparar o llevar.",
    tone: "green",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=82",
    price: 38,
    producerOrCreator: "Pedro Ñahui Atao",
  },
  {
    slug: "cafe-molido",
    title: "Café molido",
    category: "Café y cacao",
    subcategory: "Café molido",
    origin: "VRAEM, Ayacucho",
    region: "VRAEM · Ayacucho",
    shortDescription: "Presentación molida de café ayacuchano.",
    tone: "green",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=82",
    price: 38,
    producerOrCreator: "Pedro Ñahui Atao",
  },
  {
    slug: "cacao",
    title: "Cacao",
    category: "Café y cacao",
    subcategory: "Cacao",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Cacao y derivados vinculados con procesos de transformación local.",
    tone: "cacao",
    image: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=1200&q=82",
    price: 32,
    producerOrCreator: "Dina",
  },
  {
    slug: "chocolate-panela",
    title: "Chocolate con panela",
    category: "Café y cacao",
    subcategory: "Chocolates",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Chocolate vinculado con cacao de origen y panela.",
    tone: "cacao",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1200&q=82",
    price: 18,
  },
  {
    slug: "miel",
    title: "Miel",
    category: "Alimentos",
    subcategory: "Miel y polen",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Miel vinculada con floración, paisaje y trabajo de origen.",
    tone: "honey",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=82",
    price: 28,
    producerOrCreator: "Fortunato",
  },
  {
    slug: "polen",
    title: "Polen",
    category: "Alimentos",
    subcategory: "Miel y polen",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Producto asociado al trabajo apícola.",
    tone: "honey",
    image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1200&q=82",
    price: 24,
    producerOrCreator: "Fortunato",
  },
  {
    slug: "arandanos",
    title: "Arándanos",
    category: "Alimentos",
    subcategory: "Frutas y frescos",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Fruta fresca seleccionada según disponibilidad.",
    tone: "green",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=1200&q=82",
    price: 18,
  },
  {
    slug: "mermeladas",
    title: "Mermeladas",
    category: "Alimentos",
    subcategory: "Mermeladas y conservas",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Conservas y sabores de origen para llevar.",
    tone: "honey",
    image: "https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?auto=format&fit=crop&w=1200&q=82",
    price: 22,
  },
  {
    slug: "pan-chapla",
    title: "Pan chapla",
    category: "Alimentos",
    subcategory: "Panes tradicionales",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Hecho en horno de leña.",
    tone: "clay",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=82",
    price: 6,
  },
  {
    slug: "postres",
    title: "Postres",
    category: "Alimentos",
    subcategory: "Postres",
    origin: "Raíces, Lima",
    region: "Raíces · Lima",
    shortDescription: "Keke de plátano, budín de chocolate y postres de temporada.",
    tone: "clay",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=82",
    price: 12,
  },
  {
    slug: "queso",
    title: "Queso",
    category: "Alimentos",
    subcategory: "Lácteos",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Producto lácteo regional según disponibilidad.",
    tone: "clay",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=1200&q=82",
    price: 26,
  },
  {
    slug: "cuadros-lized",
    title: "Cuadros de Lized",
    category: "Arte",
    subcategory: "Pinturas y cuadros",
    origin: "Obra de Lized",
    region: "Raíces · Lima",
    shortDescription: "Pinturas vinculadas con memorias, ideas y miradas sobre Ayacucho.",
    tone: "retablo",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=82",
    price: 120,
    producerOrCreator: "Lized",
  },
  {
    slug: "retablos",
    title: "Retablos",
    category: "Arte",
    subcategory: "Retablos",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Piezas culturales ayacuchanas con autoría identificable cuando corresponda.",
    tone: "retablo",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=82",
    price: 120,
  },
  {
    slug: "toritos-ayacucho",
    title: "Toritos de Ayacucho",
    category: "Arte",
    subcategory: "Cerámica ayacuchana",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Piezas cerámicas seleccionadas por su vínculo cultural con el territorio.",
    tone: "ink",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=82",
    price: 45,
  },
  {
    slug: "manualidades",
    title: "Manualidades",
    category: "Arte",
    subcategory: "Manualidades",
    origin: "Ayacucho",
    region: "Ayacucho",
    shortDescription: "Objetos culturales y artesanales seleccionados para el espacio.",
    tone: "ink",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=82",
    price: 35,
  },
];

export const fallbackCatalogCategories: CatalogCategory[] = categorySeed.map((category) => ({
  id: `fallback-category-${category.slug}`,
  title: category.title,
  slug: category.slug,
  description: undefined,
  order: category.order,
  isVisible: true,
  itemCount: productSeed.filter((product) => product.category === category.title).length,
}));

const categoriesByTitle = new Map(
  fallbackCatalogCategories.map((category) => [category.title, category] as const),
);

export const fallbackCatalogItems: CatalogItem[] = productSeed.map((product, index) => ({
  id: `fallback-product-${product.slug}`,
  title: product.title,
  slug: product.slug,
  category: categoriesByTitle.get(product.category)!,
  subcategory: product.subcategory,
  origin: product.origin,
  region: product.region,
  shortDescription: product.shortDescription,
  description: [],
  mainImage: {
    src: product.image,
    alt: product.title,
    width: 1200,
    height: 1400,
  },
  gallery: [],
  producerOrCreator: product.producerOrCreator,
  presentations: [],
  availability: "Consultar disponibilidad",
  process: undefined,
  ingredients: [],
  allergens: [],
  verifiedClaims: [],
  inquiryMessage: undefined,
  price: product.price,
  showPrice: true,
  currency: "PEN",
  tone: product.tone,
  isActive: true,
  isFeatured: index < 6,
  order: (index + 1) * 10,
  seo: undefined,
}));

export function getFallbackCatalogItemBySlug(slug: string) {
  return fallbackCatalogItems.find((item) => item.slug === slug) ?? null;
}

export function getFallbackRelatedCatalogItems(categoryId: string, slug: string) {
  return fallbackCatalogItems
    .filter((item) => item.category.id === categoryId && item.slug !== slug)
    .slice(0, 3);
}
