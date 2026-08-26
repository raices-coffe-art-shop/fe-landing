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
    name: "Fortunato Melgar Rojas",
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
    initials: "FM",
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
    name: "Dina Torres",
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
    initials: "DT",
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
