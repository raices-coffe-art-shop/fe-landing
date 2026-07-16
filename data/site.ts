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
  quote: string;
  status: "documentada" | "por-documentar";
  portraitTone: "green" | "clay" | "honey" | "ink";
  initials: string;
  facts: { label: string; value: string }[];
};

export const people: Person[] = [
  {
    slug: "pedro-nahui-atao",
    name: "Pedro Ñahui Atao",
    shortName: "Pedro Ñahui",
    role: "Productor cafetalero",
    region: "VRAEM · Ayacucho",
    category: "Café",
    product: "Café ayacuchano",
    eyebrow: "La historia detrás del grano",
    summary:
      "Una vida vinculada al café, a la organización de familias productoras y a la defensa del valor de origen.",
    story: [
      "Pedro Ñahui Atao es productor cafetalero y presidente de la Asociación de Productores Café VRAE Ayacucho. Su trabajo ha contribuido a organizar a familias productoras, mejorar la calidad del café y hacer visible el potencial de su región.",
      "El relato compartido por el equipo de Raíces cuenta que sus primeros pasos incluyeron ofrecer café preparado y granos de manera directa. Esa parte de la historia permanece marcada para una entrevista y validación final con el propio productor.",
      "Raíces quiere presentar su trayectoria sin reducirla a una etiqueta comercial: como una historia de familia, territorio, cuidado y crecimiento sostenido desde Ayacucho."
    ],
    quote: "El café tiene un nombre antes de tener una marca.",
    status: "documentada",
    portraitTone: "green",
    initials: "PÑ",
    facts: [
      { label: "Producto", value: "Café de especialidad" },
      { label: "Región", value: "VRAEM, Ayacucho" },
      { label: "Organización", value: "Asociación de Productores Café VRAE Ayacucho" },
      { label: "Entrevista", value: "Pendiente de completar" }
    ]
  },
  {
    slug: "senor-de-la-miel",
    name: "El Señor de la Miel",
    shortName: "Señor de la Miel",
    role: "Apicultor itinerante",
    region: "Ayacucho · ubicación por confirmar",
    category: "Miel",
    product: "Miel de floración",
    eyebrow: "Una ruta guiada por las flores",
    summary:
      "Traslada sus colmenas en busca de nuevos lugares de polinización y convierte cada temporada en una procedencia distinta.",
    story: [
      "El dueño de Raíces lo recuerda por una práctica poco habitual: llevar sus panales hacia los lugares donde las abejas puedan encontrar nuevas floraciones y continuar polinizando.",
      "Su nombre, comunidad, ruta de trabajo y variedades de miel todavía deben documentarse en una entrevista. La página está preparada para incorporar su voz, fotografías y proceso sin inventar información.",
      "La intención es que cada frasco pueda explicar no solo qué contiene, sino también qué paisaje, floración y oficio lo hicieron posible."
    ],
    quote: "Cada floración cambia la miel y también cuenta una temporada.",
    status: "por-documentar",
    portraitTone: "honey",
    initials: "SM",
    facts: [
      { label: "Producto", value: "Miel" },
      { label: "Método", value: "Apicultura itinerante, por confirmar" },
      { label: "Región", value: "Pendiente" },
      { label: "Entrevista", value: "Pendiente" }
    ]
  },
  {
    slug: "productor-de-quesos",
    name: "El productor de quesos",
    shortName: "Productor de quesos",
    role: "Maestro productor",
    region: "Sierra peruana · por confirmar",
    category: "Quesos",
    product: "Quesos regionales",
    eyebrow: "Una historia que todavía debe escucharse",
    summary:
      "El producto ya forma parte del espacio; el sitio reserva un lugar para registrar a la persona, su comunidad y su oficio.",
    story: [
      "Raíces no quiere presentar un queso como un objeto anónimo. Por eso esta historia permanece abierta hasta conversar con quien lo produce.",
      "La ficha final deberá mostrar procedencia, tipo de leche, proceso, tiempos de maduración, relación con la comunidad y fotografías reales del trabajo.",
      "Hasta entonces, el contenido evita rellenar vacíos con textos genéricos y comunica con claridad qué información falta confirmar."
    ],
    quote: "El origen también se reconoce en la paciencia de un proceso.",
    status: "por-documentar",
    portraitTone: "clay",
    initials: "PQ",
    facts: [
      { label: "Producto", value: "Quesos regionales" },
      { label: "Comunidad", value: "Pendiente" },
      { label: "Proceso", value: "Pendiente" },
      { label: "Entrevista", value: "Pendiente" }
    ]
  },
  {
    slug: "artista-residente",
    name: "La artista de Raíces",
    shortName: "Artista residente",
    role: "Pintora y creadora",
    region: "Ayacucho / Lima · por confirmar",
    category: "Arte",
    product: "Pintura y objetos culturales",
    eyebrow: "El arte como parte del espacio",
    summary:
      "Pinturas y piezas creadas o seleccionadas para que el local funcione también como una pequeña ventana cultural.",
    story: [
      "El Art Shop nace de la presencia real de una creadora dentro del local y de la venta de pinturas, pequeñas esculturas, nacimientos y otros elementos vinculados con Ayacucho.",
      "Su nombre, formación, técnicas y obra disponible deben completarse con una entrevista y una sesión fotográfica.",
      "La presentación final debe sentirse como una galería contemporánea, no como una tienda de recuerdos: cada obra necesita autora, técnica, procedencia y relato."
    ],
    quote: "El arte no decora la historia: también la cuenta.",
    status: "por-documentar",
    portraitTone: "ink",
    initials: "AR",
    facts: [
      { label: "Práctica", value: "Pintura y creación artística" },
      { label: "Obras", value: "Catálogo pendiente" },
      { label: "Procedencia", value: "Pendiente" },
      { label: "Entrevista", value: "Pendiente" }
    ]
  }
];

export const products = [
  {
    name: "Café Ayacuchano",
    category: "Café",
    region: "VRAEM",
    note: "Grano y molido",
    tone: "green",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=82"
  },
  {
    name: "Miel de floración",
    category: "Miel",
    region: "Ayacucho",
    note: "Origen por documentar",
    tone: "honey",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=82"
  },
  {
    name: "Cacao de origen",
    category: "Cacao",
    region: "Por confirmar",
    note: "Historia en preparación",
    tone: "cacao",
    image: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=1200&q=82"
  },
  {
    name: "Quesos regionales",
    category: "Quesos",
    region: "Sierra peruana",
    note: "Productor por confirmar",
    tone: "clay",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=1200&q=82"
  },
  {
    name: "Retablos y nacimientos",
    category: "Arte",
    region: "Ayacucho",
    note: "Piezas y autores por registrar",
    tone: "retablo",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=82"
  },
  {
    name: "Selección Raíces",
    category: "Regalos",
    region: "Varias procedencias",
    note: "Caja curada",
    tone: "ink",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=82"
  }
];
