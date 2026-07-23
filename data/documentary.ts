export type ContentStatus = "confirmed" | "pending" | "editorial-reference" | "in-editing";

export type DocumentaryJourneyStatus = "planned" | "in-progress" | "completed" | "editing";

export type DocumentaryMedia = {
  id: string;
  type: "image" | "audio" | "video" | "note";
  src?: string;
  alt?: string;
  caption: string;
  status: ContentStatus;
};

export type DocumentaryStop = {
  id: string;
  order: number;
  personId?: string;
  title: string;
  productOrCraft: string;
  location?: string;
  summary: string;
  status: "planned" | "visited" | "editing" | "published";
  coverImage?: string;
  gallery?: DocumentaryMedia[];
};

export const documentaryRoute = {
  origin: "Ayacucho",
  encounter: "Lima",
  tripDate: "2026-06",
  status: "pending-confirmation" as const,
  journeyStatus: "planned" as DocumentaryJourneyStatus,
  stops: [] as DocumentaryStop[],
};

export const documentaryStops: DocumentaryStop[] = [
  {
    id: "cafe-especialidad",
    order: 1,
    personId: "pedro-nahui-atao",
    title: "Café de especialidad",
    productOrCraft: "Café",
    location: "Ayacucho · ubicación por confirmar",
    summary: "Una conversación para registrar proceso, organización y trazabilidad sin separar el grano de la persona que lo trabaja.",
    status: "planned",
    coverImage: "/ayacucho-hero-3.jpg",
  },
  {
    id: "miel-floracion",
    order: 2,
    title: "Miel y floración",
    productOrCraft: "Miel",
    location: "Ubicación por confirmar",
    summary: "Historia pendiente sobre floración, movilidad de colmenas y relación con el paisaje.",
    status: "planned",
    coverImage: "/ayacucho-hero-5.jpg",
  },
  {
    id: "panes-alimentos",
    order: 3,
    title: "Panes y alimentos tradicionales",
    productOrCraft: "Pan, palta, queso y alimentos",
    location: "Ubicación por confirmar",
    summary: "Parada preparada para documentar alimentos cotidianos, técnicas y memoria familiar.",
    status: "planned",
    coverImage: "/ayacucho-hero-1.jpg",
  },
  {
    id: "arte-oficios",
    order: 4,
    title: "Arte y oficios",
    productOrCraft: "Pintura, retablo y objetos",
    location: "Ubicación por confirmar",
    summary: "Material pendiente sobre autoría, técnica, procedencia y relato detrás de cada pieza.",
    status: "planned",
    coverImage: "/ayacucho-hero-6.png",
  },
  {
    id: "cacao",
    order: 5,
    title: "Cacao y transformación",
    productOrCraft: "Cacao",
    location: "Procedencia por confirmar",
    summary: "Ficha lista para registrar variedad, proceso y relación directa cuando exista información validada.",
    status: "planned",
    coverImage: "/ayacucho-hero-2.jpeg",
  },
];

export const archiveCategories = [
  {
    id: "territorio",
    title: "Territorio",
    status: "confirmed" as ContentStatus,
    summary: "Paisajes locales usados como contexto territorial, no como retratos de productores.",
    media: [
      { id: "sacsamarca", type: "image", src: "/ayacucho-sacsamarca.jpg", alt: "Paisaje de Sacsamarca en Ayacucho", caption: "Paisaje ayacuchano", status: "confirmed" as ContentStatus },
      { id: "hero-03", type: "image", src: "/ayacucho-hero-3.jpg", alt: "Valle ayacuchano rodeado de montañas", caption: "Valle y montaña", status: "confirmed" as ContentStatus },
      { id: "hero-05", type: "image", src: "/ayacucho-hero-5.jpg", alt: "Campos andinos bajo un cielo nublado", caption: "Paisaje agrícola", status: "confirmed" as ContentStatus },
      { id: "hero-06", type: "image", src: "/ayacucho-hero-6.png", alt: "Persona observando terrazas agrícolas andinas", caption: "Territorio andino", status: "confirmed" as ContentStatus },
    ],
  },
  {
    id: "cafe",
    title: "Café",
    status: "in-editing" as ContentStatus,
    summary: "Fotografías, entrevistas y notas de proceso por incorporar.",
    media: [
      { id: "cafe-01", type: "image", src: "/ayacucho-hero-3.jpg", alt: "Valle ayacuchano asociado al origen del café", caption: "Paisaje de procedencia", status: "editorial-reference" as ContentStatus },
      { id: "cafe-02", type: "image", src: "/ayacucho-sacsamarca.jpg", alt: "Contexto territorial ayacuchano", caption: "Contexto territorial", status: "editorial-reference" as ContentStatus },
      { id: "cafe-03", type: "image", src: "/ayacucho-hero-5.jpg", alt: "Campos andinos", caption: "Campo y ruta", status: "editorial-reference" as ContentStatus },
      { id: "cafe-04", type: "image", src: "/ayacucho-hero-1.jpg", alt: "Ciudad de Ayacucho", caption: "Punto de encuentro", status: "editorial-reference" as ContentStatus },
    ],
  },
  {
    id: "miel",
    title: "Miel",
    status: "pending" as ContentStatus,
    summary: "Material documental pendiente de registro y autorización.",
    media: [
      { id: "miel-01", type: "image", src: "/ayacucho-hero-5.jpg", alt: "Campos y floración en paisaje andino", caption: "Floración por documentar", status: "editorial-reference" as ContentStatus },
      { id: "miel-02", type: "image", src: "/ayacucho-hero-6.png", alt: "Terrazas agrícolas andinas", caption: "Ruta de trabajo", status: "editorial-reference" as ContentStatus },
      { id: "miel-03", type: "image", src: "/ayacucho-hero-3.jpg", alt: "Valle ayacuchano", caption: "Paisaje de temporada", status: "editorial-reference" as ContentStatus },
      { id: "miel-04", type: "image", src: "/ayacucho-hero-4.webp", alt: "Cañón rocoso con agua", caption: "Territorio en registro", status: "editorial-reference" as ContentStatus },
    ],
  },
  {
    id: "cacao",
    title: "Cacao",
    status: "pending" as ContentStatus,
    summary: "Categoría preparada para futuras entrevistas.",
    media: [
      { id: "cacao-01", type: "image", src: "/ayacucho-hero-2.jpeg", alt: "Agua turquesa entre rocas", caption: "Referencia territorial", status: "editorial-reference" as ContentStatus },
      { id: "cacao-02", type: "image", src: "/ayacucho-hero-5.jpg", alt: "Campos andinos", caption: "Procedencia pendiente", status: "editorial-reference" as ContentStatus },
      { id: "cacao-03", type: "image", src: "/ayacucho-sacsamarca.jpg", alt: "Paisaje ayacuchano", caption: "Ruta por confirmar", status: "editorial-reference" as ContentStatus },
      { id: "cacao-04", type: "image", src: "/ayacucho-hero-1.jpg", alt: "Plaza de Ayacucho", caption: "Encuentro documental", status: "editorial-reference" as ContentStatus },
    ],
  },
  {
    id: "alimentos",
    title: "Quesos y alimentos",
    status: "pending" as ContentStatus,
    summary: "Espacio para alimentos tradicionales, pan, palta y quesos.",
    media: [
      { id: "alimentos-01", type: "image", src: "/ayacucho-hero-1.jpg", alt: "Centro histórico de Ayacucho", caption: "Mercado y ciudad por documentar", status: "editorial-reference" as ContentStatus },
      { id: "alimentos-02", type: "image", src: "/ayacucho-hero-6.png", alt: "Terrazas agrícolas", caption: "Paisaje agrícola", status: "editorial-reference" as ContentStatus },
      { id: "alimentos-03", type: "image", src: "/ayacucho-hero-5.jpg", alt: "Campo andino", caption: "Campo y alimento", status: "editorial-reference" as ContentStatus },
      { id: "alimentos-04", type: "image", src: "/ayacucho-hero-3.jpg", alt: "Valle entre montañas", caption: "Contexto productivo", status: "editorial-reference" as ContentStatus },
    ],
  },
  {
    id: "arte",
    title: "Arte y oficios",
    status: "in-editing" as ContentStatus,
    summary: "Autoría, técnica y procedencia por documentar con cada pieza.",
    media: [
      { id: "arte-01", type: "image", src: "/ayacucho-hero-6.png", alt: "Persona observando paisaje andino", caption: "Oficio y territorio", status: "editorial-reference" as ContentStatus },
      { id: "arte-02", type: "image", src: "/ayacucho-hero-1.jpg", alt: "Centro histórico de Ayacucho", caption: "Procedencia cultural", status: "editorial-reference" as ContentStatus },
      { id: "arte-03", type: "image", src: "/ayacucho-sacsamarca.jpg", alt: "Paisaje de Sacsamarca", caption: "Memoria visual", status: "editorial-reference" as ContentStatus },
      { id: "arte-04", type: "image", src: "/ayacucho-hero-4.webp", alt: "Cañón y pozas turquesas", caption: "Registro de territorio", status: "editorial-reference" as ContentStatus },
    ],
  },
];

export const quechuaTerms = [
  { term: "Willakuy", translationEs: "relato", explanation: "Término de referencia pendiente de revisión contextual.", dialect: "pending" as const, validation: "pending-review" as const },
  { term: "Kawsay", translationEs: "vida", explanation: "Pendiente de validación por Lized o hablante competente.", dialect: "pending" as const, validation: "pending-review" as const },
  { term: "Paqariy", translationEs: "origen", explanation: "Uso editorial pendiente de revisión.", dialect: "pending" as const, validation: "pending-review" as const },
  { term: "Saphi", translationEs: "raíz", explanation: "Uso editorial pendiente de revisión.", dialect: "pending" as const, validation: "pending-review" as const },
  { term: "Ñawpa", translationEs: "lo antiguo", explanation: "Pendiente de revisión en variedad chanka.", dialect: "pending" as const, validation: "pending-review" as const },
  { term: "Unay", translationEs: "tiempo atrás", explanation: "Pendiente de revisión en variedad chanka.", dialect: "pending" as const, validation: "pending-review" as const },
];
