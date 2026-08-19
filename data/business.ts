import { contactChannels } from "./social";

// Identidad única del negocio (NAP: nombre, dirección, teléfono) para JSON-LD,
// la carta imprimible y el perfil de Google Business. Los campos en null están
// pendientes de confirmación del cliente y NO se emiten en el JSON-LD hasta
// tener el dato real (nunca publicar placeholders como si fueran datos).
export type OpeningHoursSpec = {
  dayOfWeek: string[];
  opens: string;
  closes: string;
};

export type BusinessAddress = {
  streetAddress: string | null;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
};

export type Business = {
  name: string;
  alternateName: string;
  legalName: string | null;
  description: string;
  telephone: string;
  email: string;
  address: BusinessAddress;
  geo: { latitude: number; longitude: number };
  openingHours: OpeningHoursSpec[] | null;
  priceRange: string;
  servesCuisine: string[];
  sameAs: string[];
  mapsPlaceUrl: string | null;
};

export const business: Business = {
  name: "Raíces — Café y Cultura",
  alternateName: "Raíces Coffee Art Shop",
  legalName: null, // TODO cliente: razón social, si desean publicarla
  description:
    "Cafetería y tienda cultural ayacuchana en Lima: café de origen, cacao, alimentos, arte y las historias de las personas que los hacen posibles.",
  telephone: "+51915123159",
  email: contactChannels.email,
  address: {
    streetAddress: null, // TODO cliente: calle y número del local
    addressLocality: "Lima",
    addressRegion: "Lima",
    addressCountry: "PE",
  },
  geo: { latitude: -12.0854495, longitude: -77.0831729 },
  openingHours: null, // TODO cliente: horarios por día, ej. [{ dayOfWeek: ["Monday","Tuesday"], opens: "08:00", closes: "20:00" }]
  priceRange: "S/ 5 – S/ 120",
  servesCuisine: ["Café peruano", "Cocina ayacuchana"],
  sameAs: [contactChannels.instagram, contactChannels.facebook],
  mapsPlaceUrl: null, // TODO: URL del place al crear el perfil de Google Business (botón Compartir)
};
