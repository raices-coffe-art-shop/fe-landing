export type CulturalWord = {
  id: string;
  word: string;
  translation: string;
  language: "Quechua Chanka" | "Aymara";
};

export const culturalWords: CulturalWord[] = [
  { id: "willakuy", word: "Willakuy", translation: "relato", language: "Quechua Chanka" },
  { id: "kawsay", word: "Kawsay", translation: "vida", language: "Quechua Chanka" },
  { id: "paqariy", word: "Paqariy", translation: "origen", language: "Quechua Chanka" },
  { id: "saphi", word: "Saphi", translation: "raiz", language: "Quechua Chanka" },
  { id: "nawpa", word: "Nawpa", translation: "tiempo antiguo", language: "Quechua Chanka" },
  { id: "unay", word: "Unay", translation: "tiempo atras", language: "Quechua Chanka" },
  { id: "ayni", word: "Ayni", translation: "reciprocidad", language: "Quechua Chanka" },
  { id: "yachay", word: "Yachay", translation: "saber", language: "Quechua Chanka" },
  { id: "tinkuy", word: "Tinkuy", translation: "encuentro", language: "Quechua Chanka" },
  { id: "llaqta", word: "Llaqta", translation: "pueblo", language: "Quechua Chanka" },
  { id: "ayllu", word: "Ayllu", translation: "comunidad", language: "Quechua Chanka" },
  { id: "runa", word: "Runa", translation: "persona", language: "Quechua Chanka" },
  { id: "maki", word: "Maki", translation: "mano", language: "Quechua Chanka" },
  { id: "chakra", word: "Chakra", translation: "campo de cultivo", language: "Quechua Chanka" },
  { id: "tarpuy", word: "Tarpuy", translation: "siembra", language: "Quechua Chanka" },
  { id: "mikhuy", word: "Mikhuy", translation: "alimento", language: "Quechua Chanka" },
  { id: "muruy", word: "Muruy", translation: "semilla", language: "Quechua Chanka" },
  { id: "pacha", word: "Pacha", translation: "tiempo y tierra", language: "Quechua Chanka" },
  { id: "urqu", word: "Urqu", translation: "montana", language: "Quechua Chanka" },
  { id: "mayu", word: "Mayu", translation: "rio", language: "Quechua Chanka" },
  { id: "yaku", word: "Yaku", translation: "agua", language: "Quechua Chanka" },
  { id: "wayra", word: "Wayra", translation: "viento", language: "Quechua Chanka" },
  { id: "inti", word: "Inti", translation: "sol", language: "Quechua Chanka" },
  { id: "killa", word: "Killa", translation: "luna", language: "Quechua Chanka" },
  { id: "suma", word: "Suma", translation: "bueno", language: "Aymara" },
  { id: "qamana", word: "Qamana", translation: "vivir", language: "Aymara" },
  { id: "uma", word: "Uma", translation: "agua", language: "Aymara" },
  { id: "uta", word: "Uta", translation: "casa", language: "Aymara" },
  { id: "jaqi", word: "Jaqi", translation: "persona", language: "Aymara" },
  { id: "thakhi", word: "Thakhi", translation: "camino", language: "Aymara" },
  { id: "achachila", word: "Achachila", translation: "ancestro", language: "Aymara" },
  { id: "uraqi", word: "Uraqi", translation: "tierra", language: "Aymara" },
];
