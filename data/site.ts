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
    role: "Caficultor · Café Ayacuchano",
    region: "VRAEM · Ayacucho",
    category: "Café",
    product: "Café Ayacuchano",
    eyebrow: "La historia detrás del café ayacuchano",
    summary: "Pedro representa el vínculo directo entre el café del VRAEM, su trabajo de origen y la historia que llega a cada taza de Café Ayacuchano.",
    story: [
      "Pedro Ñahui Atao está vinculado a Café Ayacuchano y al trabajo del café en el VRAEM. Raíces lo presenta desde esa relación concreta entre producto, territorio y persona.",
      "Las fotografías registran distintos momentos de ese recorrido: el café en feria, el espacio de venta, el campo y el proceso de tostado.",
      "La intención de esta ficha es que el café no aparezca como un producto anónimo, sino conectado con quien lo trabaja y con el territorio del que proviene."
    ],
    status: "documentada",
    portraitTone: "green",
    initials: "PÑ",
    portraitGallery: personCardPhotos.pedro,
    facts: [
      { label: "Producto", value: "Café" },
      { label: "Proyecto", value: "Café Ayacuchano" },
      { label: "Territorio", value: "VRAEM, Ayacucho" }
    ],
    preferredName: "Pedro Ñahui",
    language: ["Español"],
    products: ["Café"],
    interviewStatus: "pending",
    consentStatus: "pending",
    media: []
  },
  {
    slug: "fortunato-melgar-rojas",
    name: "Fortunato Melgar Rojas",
    shortName: "Fortunato",
    role: "Apicultor",
    region: "Ayacucho",
    category: "Miel",
    product: "Miel",
    eyebrow: "El trabajo paciente de las abejas",
    summary: "Fortunato es apicultor y lleva muchos años acompañando el proceso de las abejas, un oficio en el que paisaje, floración y cuidado forman parte del producto final.",
    story: [
      "El trabajo de Fortunato está ligado a la apicultura y a los ciclos que hacen posible la miel.",
      "Sus fotografías reúnen el producto, el espacio donde trabaja y encuentros realizados en Ayacucho, manteniendo la historia cerca de la persona que la hace posible.",
      "Raíces presenta su miel desde ese oficio: no solo como alimento, sino como resultado de experiencia, observación y acompañamiento de las abejas."
    ],
    status: "documentada",
    portraitTone: "honey",
    initials: "FM",
    portraitGallery: personCardPhotos.fortunato,
    facts: [
      { label: "Oficio", value: "Apicultura" },
      { label: "Producto", value: "Miel" },
      { label: "Territorio", value: "Ayacucho" }
    ],
    preferredName: "Fortunato",
    products: ["Miel"],
    interviewStatus: "pending",
    consentStatus: "pending",
    media: []
  },
  {
    slug: "dina-torres",
    name: "Dina Torres",
    shortName: "Dina",
    role: "Productora de cacao y chocolate",
    region: "VRAEM",
    category: "Cacao y chocolate",
    product: "Cacao y chocolate",
    eyebrow: "Del cacao al chocolate",
    summary: "Dina está vinculada al cacao y al chocolate, desde la materia prima hasta los productos que permiten contar el origen y la transformación detrás de cada barra.",
    story: [
      "Dina forma parte de las historias que Raíces reúne alrededor del cacao y su transformación en chocolate.",
      "El material disponible muestra tanto el producto como momentos de visita y presentación, reforzando la conexión entre la persona, el cacao y lo que finalmente llega al público.",
      "La ficha se concentra en lo confirmado por el material compartido: cacao, chocolate y trabajo de transformación, sin añadir datos biográficos que todavía no hayan sido validados."
    ],
    status: "documentada",
    portraitTone: "clay",
    initials: "DT",
    portraitGallery: personCardPhotos.dina,
    facts: [
      { label: "Materia prima", value: "Cacao" },
      { label: "Transformación", value: "Chocolate" },
      { label: "Territorio", value: "VRAEM" }
    ],
    preferredName: "Dina",
    products: ["Cacao", "Chocolate"],
    interviewStatus: "pending",
    consentStatus: "pending",
    media: []
  },
  {
    slug: "karen-cordova",
    name: "Karen Córdova",
    shortName: "Karen",
    role: "Panadera · Panadería Kullany",
    region: "Ayacucho",
    category: "Pan tradicional",
    product: "Pan chapla y tanta wawa",
    eyebrow: "Tradición panadera ayacuchana",
    summary: "Karen Córdova está vinculada a la panadería Kullany y a dos expresiones de la tradición panadera ayacuchana: el pan chapla y la tanta wawa.",
    story: [
      "Karen se incorpora a Personas por su vínculo con la panadería Kullany y con la elaboración de pan chapla y tanta wawa.",
      "Mientras se incorporan fotografías personales autorizadas, esta ficha utiliza imágenes documentales del proceso de panadería para mantener el foco en el oficio y el producto.",
      "Raíces presenta esta historia desde la tradición del pan ayacuchano, evitando completar con datos personales que todavía no hayan sido confirmados."
    ],
    status: "documentada",
    portraitTone: "ink",
    initials: "KC",
    portraitGallery: personCardPhotos.karen,
    facts: [
      { label: "Panadería", value: "Kullany" },
      { label: "Productos", value: "Pan chapla y tanta wawa" },
      { label: "Territorio", value: "Ayacucho" }
    ],
    preferredName: "Karen",
    products: ["Pan chapla", "Tanta wawa"],
    interviewStatus: "pending",
    consentStatus: "pending",
    media: []
  }
];
