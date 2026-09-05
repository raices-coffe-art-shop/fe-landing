import { humanOrigin } from "@/data/social";
import { people } from "@/data/people";
import type { MenuScreenSlide } from "@/lib/menuScreenSlides";

// Después del código QR la pantalla deja de ser carta y pasa a contar quiénes
// están detrás: primero cómo nació Raíces, con la fotografía de los fundadores,
// y luego los productores, de dos en dos. Es el mismo contenido que la landing
// muestra en #historia y en "Las personas detrás de Raíces", así que sale de
// data/social.ts y data/people.ts, no de Sanity.

export const PEOPLE_PER_SLIDE = 2;

// Estas pantallas son de lectura, no de precios: se quedan más tiempo.
export const NARRATIVE_DWELL = 1.5;

// Solo el primer párrafo y medio entran cómodos a distancia; el resto del relato
// vive en la web, a la que lleva el QR de la pantalla anterior.
const ORIGIN_PARAGRAPHS = 2;

export type TvV4PersonCard = {
  slug: string;
  name: string;
  role: string;
  region: string;
  summary: string;
  photo: { src: string; alt: string; position: string } | null;
};

export type TvV4Slide =
  | MenuScreenSlide
  | {
      kind: "origin";
      key: string;
      tagline: string;
      title: string;
      headline: string;
      paragraphs: string[];
      photo: { src: string; alt: string };
      note: { label: string; text: string };
      dwell: number;
    }
  | {
      kind: "people";
      key: string;
      tagline: string;
      title: string;
      cards: TvV4PersonCard[];
      dwell: number;
    };

export function buildOriginSlide(): TvV4Slide {
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
    dwell: NARRATIVE_DWELL,
  };
}

export function buildPeopleSlides(): TvV4Slide[] {
  // Cada persona entra con su primera fotografía de ficha; las que aún no
  // tienen retrato se muestran igual, con su nombre y su oficio.
  const cards: TvV4PersonCard[] = people.map((person) => {
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

  const slides: TvV4Slide[] = [];
  for (let page = 0; page < Math.ceil(cards.length / PEOPLE_PER_SLIDE); page += 1) {
    slides.push({
      kind: "people",
      key: `personas-${page + 1}`,
      tagline: "Personas antes que productos",
      title: "Las personas detrás de Raíces",
      cards: cards.slice(page * PEOPLE_PER_SLIDE, (page + 1) * PEOPLE_PER_SLIDE),
      dwell: NARRATIVE_DWELL,
    });
  }
  return slides;
}
