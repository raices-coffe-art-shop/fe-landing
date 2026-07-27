import { personCardPhotos, type PersonCardPhoto } from "./peopleMedia";

export type Person = {
  slug: string;
  name: string;
  shortName: string;
  role: string;
  region: string;
  category: string;
  product: string;
  eyebrow: string;
  summary: string;
  story: string[];
  quote?: string;
  status: "documentada" | "por-documentar";
  portraitTone: "green" | "clay" | "honey" | "ink";
  initials: string;
  facts: { label: string; value: string; public?: boolean }[];
  preferredName?: string;
  community?: string;
  language?: string[];
  products?: string[];
  portrait?: string;
  portraitGallery?: PersonCardPhoto[];
  interviewStatus?: "pending" | "recorded" | "edited" | "published";
  consentStatus?: "pending" | "granted";
  media?: import("./documentary").DocumentaryMedia[];
};

export const people: Person[] = [
  {
    slug: "pedro-nahui-atao",
    name: "Pedro Ñahui Atao",
    shortName: "Pedro Ñahui",
    role: "Productor vinculado con café y cacao",
    region: "VRAEM · Ayacucho",
    category: "Café y cacao",
    product: "Café y cacao de origen",
    eyebrow: "La historia detrás del grano",
    summary: "Pedro forma parte de las relaciones que permiten mirar el café y el cacao desde su procedencia, su proceso y la persona que los trabaja.",
    story: [
      "El archivo de Raíces registra recorridos por el VRAEM, reuniones con productores, muestras de grano y espacios de transformación.",
      "Su historia se presenta como parte de una relación directa: producto, territorio y conversación aparecen juntos, sin convertir el café en un objeto anónimo.",
      "La ficha crecerá únicamente con información validada por su protagonista y con fotografías autorizadas."
    ],
    status: "documentada",
    portraitTone: "green",
    initials: "PÑ",
    portraitGallery: personCardPhotos.pedro,
    facts: [
      { label: "Relación", value: "Visitas de campo y selección de granos" },
      { label: "Territorio", value: "VRAEM, Ayacucho" },
      { label: "Productos", value: "Café y cacao" }
    ],
    preferredName: "Pedro Ñahui",
    language: ["Español"],
    products: ["Café", "Cacao"],
    interviewStatus: "pending",
    consentStatus: "pending",
    media: []
  },
  {
    slug: "fortunato-miel",
    name: "Fortunato",
    shortName: "Fortunato",
    role: "Productor de miel",
    region: "Ayacucho",
    category: "Miel y alimentos",
    product: "Miel",
    eyebrow: "Una ruta guiada por la floración",
    summary: "Fortunato representa el vínculo entre el producto, la floración y el paisaje que sostiene el trabajo de la miel.",
    story: [
      "Las fotografías disponibles registran encuentros, paisaje y un espacio de productos locales.",
      "Raíces presenta esta relación desde lo que puede reconocer con claridad: una persona vinculada con la miel, su entorno y el cuidado del producto.",
      "Los detalles técnicos de temporada, comunidad y proceso se incorporarán solo cuando estén confirmados por su protagonista."
    ],
    status: "documentada",
    portraitTone: "honey",
    initials: "FO",
    portraitGallery: personCardPhotos.fortunato,
    facts: [
      { label: "Producto", value: "Miel" },
      { label: "Relación", value: "Encuentros, paisaje y producto local" },
      { label: "Territorio", value: "Ayacucho" }
    ],
    products: ["Miel"],
    interviewStatus: "pending",
    consentStatus: "pending",
    media: []
  },
  {
    slug: "dina-cacao",
    name: "Dina",
    shortName: "Dina",
    role: "Productora y transformadora de cacao",
    region: "Ayacucho",
    category: "Cacao",
    product: "Cacao y derivados",
    eyebrow: "Una historia entre producto y comunidad",
    summary: "Dina aparece vinculada al cacao y a los procesos de transformación que Raíces busca contar desde la voz de quienes los realizan.",
    story: [
      "El material disponible muestra una visita, una conversación y el cacao dentro de un espacio de producción.",
      "Raíces evita completar su historia con datos no confirmados. La ficha conserva lo observado y deja los detalles específicos para una validación posterior.",
      "Cuando su testimonio esté autorizado, esta página podrá explicar el recorrido del cacao hasta el producto terminado."
    ],
    status: "documentada",
    portraitTone: "clay",
    initials: "DI",
    portraitGallery: personCardPhotos.dina,
    facts: [
      { label: "Producto", value: "Cacao y derivados" },
      { label: "Relación", value: "Visita, conversación y producto" },
      { label: "Territorio", value: "Ayacucho" }
    ],
    products: ["Cacao"],
    interviewStatus: "pending",
    consentStatus: "pending",
    media: []
  },
  {
    slug: "paco-productos",
    name: "Paco",
    shortName: "Paco",
    role: "Persona vinculada con productos y relaciones de origen",
    region: "Raíces · Ayacucho y Lima",
    category: "Productos de origen",
    product: "Acompañamiento de productos y proveedores",
    eyebrow: "Trabajo cotidiano alrededor del producto",
    summary: "Paco aparece en Personas por su vínculo con productos, proveedores y procesos. No forma parte de la fundación de Raíces.",
    story: [
      "Su presencia se entiende dentro del trabajo cotidiano que permite que ciertos productos lleguen al espacio, se expliquen mejor y mantengan relación con su origen.",
      "Raíces lo presenta en esta sección junto con productores, proveedores y colaboradores vinculados con los productos.",
      "Cualquier testimonio o detalle adicional se publicará solo cuando haya sido validado."
    ],
    status: "por-documentar",
    portraitTone: "ink",
    initials: "PA",
    facts: [
      { label: "Rol", value: "Vínculo con productos y proveedores" },
      { label: "Relación", value: "Colaboración alrededor de productos de origen" },
      { label: "Sección", value: "Personas" }
    ],
    products: ["Productos de origen"],
    interviewStatus: "pending",
    consentStatus: "pending",
    media: []
  }
];

export type Product = {
  slug: string;
  name: string;
  category: "Café y cacao" | "Alimentos" | "Arte";
  subcategory: string;
  region: string;
  procedencia: string;
  note: string;
  tone: "green" | "honey" | "cacao" | "clay" | "retablo" | "ink";
  image: string;
  price?: string;
  presentations?: string[];
  availability?: string;
  producerOrCreator?: string;
  story?: string;
  process?: string;
  ingredients?: string[];
  allergens?: string[];
  verifiedClaims?: string[];
};

export const products: Product[] = [
  {
    slug: "cafe-preparado",
    name: "Café preparado",
    category: "Café y cacao",
    subcategory: "Café preparado",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Preparado en el local con café de origen ayacuchano.",
    tone: "green",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=82",
    producerOrCreator: "Pedro Ñahui Atao"
  },
  {
    slug: "cafe-en-grano",
    name: "Granos de café",
    category: "Café y cacao",
    subcategory: "Café en grano",
    region: "VRAEM · Ayacucho",
    procedencia: "VRAEM, Ayacucho",
    note: "Grano seleccionado para preparar o llevar.",
    tone: "green",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=82",
    producerOrCreator: "Pedro Ñahui Atao"
  },
  {
    slug: "cafe-molido",
    name: "Café molido",
    category: "Café y cacao",
    subcategory: "Café molido",
    region: "VRAEM · Ayacucho",
    procedencia: "VRAEM, Ayacucho",
    note: "Presentación molida de café ayacuchano.",
    tone: "green",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=82",
    producerOrCreator: "Pedro Ñahui Atao"
  },
  {
    slug: "cacao",
    name: "Cacao",
    category: "Café y cacao",
    subcategory: "Cacao",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Cacao y derivados vinculados con procesos de transformación local.",
    tone: "cacao",
    image: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=1200&q=82",
    producerOrCreator: "Dina"
  },
  {
    slug: "chocolate-panela",
    name: "Chocolate con panela",
    category: "Café y cacao",
    subcategory: "Chocolates",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Chocolate vinculado con cacao de origen. Las afirmaciones de etiqueta se publican solo cuando estén verificadas.",
    tone: "cacao",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1200&q=82"
  },
  {
    slug: "miel",
    name: "Miel",
    category: "Alimentos",
    subcategory: "Miel y polen",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Miel vinculada con floración, paisaje y trabajo de origen.",
    tone: "honey",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=82",
    producerOrCreator: "Fortunato"
  },
  {
    slug: "polen",
    name: "Polen",
    category: "Alimentos",
    subcategory: "Miel y polen",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Producto asociado al trabajo apícola.",
    tone: "honey",
    image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1200&q=82",
    producerOrCreator: "Fortunato"
  },
  {
    slug: "arandanos",
    name: "Arándanos",
    category: "Alimentos",
    subcategory: "Frutas y frescos",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Fruta fresca seleccionada según disponibilidad.",
    tone: "green",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=1200&q=82"
  },
  {
    slug: "mermeladas",
    name: "Mermeladas",
    category: "Alimentos",
    subcategory: "Mermeladas y conservas",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Conservas y sabores de origen para llevar.",
    tone: "honey",
    image: "https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?auto=format&fit=crop&w=1200&q=82"
  },
  {
    slug: "pan-chapla",
    name: "Pan chapla",
    category: "Alimentos",
    subcategory: "Panes tradicionales",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Hecho en horno de leña.",
    tone: "clay",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=82"
  },
  {
    slug: "postres",
    name: "Postres",
    category: "Alimentos",
    subcategory: "Postres",
    region: "Raíces · Lima",
    procedencia: "Raíces, Lima",
    note: "Keke de plátano, budín de chocolate y postres de temporada.",
    tone: "clay",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=82"
  },
  {
    slug: "queso",
    name: "Queso",
    category: "Alimentos",
    subcategory: "Lácteos",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Producto lácteo regional según disponibilidad.",
    tone: "clay",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=1200&q=82"
  },
  {
    slug: "cuadros-lized",
    name: "Cuadros de Lized",
    category: "Arte",
    subcategory: "Pinturas y cuadros",
    region: "Raíces · Lima",
    procedencia: "Obra de Lized",
    note: "Pinturas de Lized vinculadas con memorias, ideas y miradas sobre Ayacucho.",
    tone: "retablo",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=82",
    producerOrCreator: "Lized"
  },
  {
    slug: "retablos",
    name: "Retablos",
    category: "Arte",
    subcategory: "Retablos",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Piezas culturales ayacuchanas con autoría identificable cuando corresponda.",
    tone: "retablo",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=82"
  },
  {
    slug: "toritos-ayacucho",
    name: "Toritos de Ayacucho",
    category: "Arte",
    subcategory: "Cerámica ayacuchana",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Piezas cerámicas seleccionadas por su vínculo cultural con el territorio.",
    tone: "ink",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=82"
  },
  {
    slug: "manualidades",
    name: "Manualidades",
    category: "Arte",
    subcategory: "Manualidades",
    region: "Ayacucho",
    procedencia: "Ayacucho",
    note: "Objetos culturales y artesanales seleccionados para el espacio.",
    tone: "ink",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=82"
  }
];
