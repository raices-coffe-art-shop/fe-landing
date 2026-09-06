import { humanOrigin } from "@/data/social";
import { people } from "@/data/people";
import { CATALOG_FALLBACK_IMAGE_SRC, resizeCatalogImage } from "@/lib/categoryImage";
import type { MenuScreenSlide } from "@/lib/menuScreenSlides";
import type { CatalogItem } from "@/sanity/lib/catalogTypes";
import type { CollagePhoto } from "@/sanity/lib/siteSettings";

// Después del código QR la pantalla deja de ser carta y pasa a contar quiénes
// están detrás: primero cómo nació Raíces, con la fotografía de los fundadores,
// y luego los productores, de dos en dos. Es el mismo contenido que la landing
// muestra en #historia y en "Las personas detrás de Raíces", así que sale de
// data/social.ts y data/people.ts, no de Sanity.

export const PEOPLE_PER_SLIDE = 2;

// Solo el primer párrafo y medio entran cómodos a distancia; el resto del relato
// vive en la web, a la que lleva el QR de la pantalla anterior.
const ORIGIN_PARAGRAPHS = 2;

// El collage se arma con las fotos que el equipo ya subió al Studio. Se piden
// al CDN a tamaño de celda: dieciséis fotos de ficha completa pesarían de más
// para una pantalla que se recarga sola cada cuatro horas.
const COLLAGE_PHOTO_WIDTH = 420;
const COLLAGE_PHOTO_HEIGHT = 520;
const COLLAGE_MAX_PHOTOS = 16;
const COLLAGE_MIN_PHOTOS = 4;

// Cada foto entra con un giro distinto y su propio retardo, para que caigan una
// a una en vez de aparecer todas juntas.
const COLLAGE_STAGGER_MS = 180;

// Las cuatro entradas del muro, elegibles por ?animation= sin desplegar nada.
// Los nombres van en español porque los escribe el equipo en la URL del televisor.
export const COLLAGE_ANIMATIONS = ["caida", "zoom", "giro", "revelado"] as const;
export type CollageAnimation = (typeof COLLAGE_ANIMATIONS)[number];
export const DEFAULT_COLLAGE_ANIMATION: CollageAnimation = "caida";

export function resolveCollageAnimation(raw: string | string[] | undefined): CollageAnimation {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  return COLLAGE_ANIMATIONS.find((name) => name === value) ?? DEFAULT_COLLAGE_ANIMATION;
}

export type TvCollagePhoto = {
  id: string;
  src: string;
  alt: string;
  angle: number;
  delayMs: number;
};

export type TvPersonCard = {
  slug: string;
  name: string;
  role: string;
  region: string;
  summary: string;
  photo: { src: string; alt: string; position: string } | null;
};

export type TvScreenSlide =
  | MenuScreenSlide
  | {
      kind: "collage";
      key: string;
      tagline: string;
      title: string;
      photos: TvCollagePhoto[];
      animation: CollageAnimation;
    }
  | {
      kind: "origin";
      key: string;
      tagline: string;
      title: string;
      headline: string;
      paragraphs: string[];
      photo: { src: string; alt: string };
      note: { label: string; text: string };
    }
  | {
      kind: "people";
      key: string;
      tagline: string;
      title: string;
      cards: TvPersonCard[];
    };

// Las fotos que el equipo subió al Studio para este muro. Solo se usan si hay
// suficientes: con dos o tres el muro quedaría desangelado y es mejor seguir con
// las de producto mientras el cliente termina de cargarlas.
function collageFromSettings(photos: CollagePhoto[]): Array<{ id: string; src: string; alt: string }> {
  if (photos.length < COLLAGE_MIN_PHOTOS) return [];
  return photos.map((photo, index) => ({ id: `muro-${index}`, src: photo.src, alt: photo.alt }));
}

// El respaldo: las fotografías de los productos del catálogo. Solo las reales,
// porque normalizeImage rellena con el paisaje de Ayacucho a los productos sin
// fotografía propia y ese no representa a ninguno.
function collageFromCatalog(items: CatalogItem[]): Array<{ id: string; src: string; alt: string }> {
  const seen = new Set<string>();
  const photos = items
    .filter((item) => {
      const src = item.mainImage?.src;
      if (!src || src === CATALOG_FALLBACK_IMAGE_SRC || seen.has(src)) return false;
      seen.add(src);
      return true;
    })
    .map((item) => {
      const image = resizeCatalogImage(item.mainImage, COLLAGE_PHOTO_WIDTH, COLLAGE_PHOTO_HEIGHT);
      return { id: item.id, src: image.src, alt: image.alt };
    });

  if (photos.length < COLLAGE_MIN_PHOTOS) return [];

  // Los productos llegan agrupados por categoría; recorrerlos a saltos mezcla el
  // muro sin azar, que rompería la hidratación al no coincidir servidor y cliente.
  const stride = photos.length % 7 === 0 ? 5 : 7;
  return photos.map((_, index) => photos[(index * stride) % photos.length]);
}

export function buildCollageSlide(
  items: CatalogItem[],
  screenPhotos: CollagePhoto[] = [],
  animation: CollageAnimation = DEFAULT_COLLAGE_ANIMATION,
): TvScreenSlide | null {
  const chosen = collageFromSettings(screenPhotos);
  const photos = chosen.length > 0 ? chosen : collageFromCatalog(items);
  if (photos.length === 0) return null;

  return {
    kind: "collage",
    key: "collage",
    tagline: "Con nombre, procedencia y una historia detrás",
    title: "Nuestros productos",
    animation,
    photos: photos.slice(0, COLLAGE_MAX_PHOTOS).map((photo, index) => ({
      id: photo.id,
      src: photo.src,
      alt: photo.alt,
      // Giros repartidos entre -7° y 7°, siempre los mismos para el mismo orden.
      angle: (((index * 47) % 15) - 7),
      delayMs: index * COLLAGE_STAGGER_MS,
    })),
  };
}

export function buildOriginSlide(): TvScreenSlide {
  const languageNote = humanOrigin.notes[1] ?? humanOrigin.notes[0];
  return {
    kind: "origin",
    key: "historia",
    tagline: humanOrigin.eyebrow,
    title: "Nuestra historia",
    headline: humanOrigin.title,
    paragraphs: humanOrigin.paragraphs.slice(0, ORIGIN_PARAGRAPHS),
    photo: { src: humanOrigin.foundersPhoto, alt: humanOrigin.foundersPhotoAlt },
    note: { label: languageNote.label, text: languageNote.text },
  };
}

export function buildPeopleSlides(): TvScreenSlide[] {
  // Cada persona entra con su primera fotografía de ficha; las que aún no
  // tienen retrato se muestran igual, con su nombre y su oficio.
  const cards: TvPersonCard[] = people.map((person) => {
    const photo = person.portraitGallery?.[0];
    return {
      slug: person.slug,
      name: person.name,
      role: person.role,
      region: person.region,
      summary: person.summary,
      // El encuadre de cada foto viene de data/peopleMedia.ts; sin él, centrada.
      photo: photo ? { src: photo.src, alt: photo.alt, position: photo.position ?? "center" } : null,
    };
  });

  const slides: TvScreenSlide[] = [];
  for (let page = 0; page < Math.ceil(cards.length / PEOPLE_PER_SLIDE); page += 1) {
    slides.push({
      kind: "people",
      key: `personas-${page + 1}`,
      tagline: "Personas antes que productos",
      title: "Las personas detrás de Raíces",
      cards: cards.slice(page * PEOPLE_PER_SLIDE, (page + 1) * PEOPLE_PER_SLIDE),
      });
  }
  return slides;
}
