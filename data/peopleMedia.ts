/**
 * Fotografías que rotan dentro de las cards de Personas.
 *
 * Para cambiar, añadir o quitar fotos:
 * 1. Copia el archivo en /public/media/people/
 * 2. Edita únicamente el arreglo de la persona correspondiente.
 * 3. `position` controla el encuadre CSS (ej.: "center 35%", "left center").
 */
export type PersonCardPhoto = {
  src: string;
  alt: string;
  position?: string;
};

export const personCardPhotos = {
  pedro: [
    { src: "/media/people/pedro-01.png", alt: "Pedro Ñahui mostrando una selección de granos", position: "center 38%" },
    { src: "/media/people/pedro-02.png", alt: "Pedro Ñahui revisando granos durante una visita de campo", position: "center 38%" },
    { src: "/media/people/pedro-03.png", alt: "Pedro Ñahui junto a la tostadora", position: "center 34%" },
  ],
  fortunato: [
    { src: "/media/people/fortunato-01.jpg", alt: "Fortunato durante un encuentro en Ayacucho", position: "center 54%" },
    { src: "/media/people/fortunato-02.png", alt: "Fortunato en el paisaje de su comunidad", position: "left 52%" },
    { src: "/media/people/fortunato-03.png", alt: "Fortunato dentro de su espacio de productos locales", position: "center 42%" },
  ],
  dina: [
    { src: "/media/people/dina-01.png", alt: "Dina durante una visita de Raíces", position: "center 35%" },
    { src: "/media/people/dina-02.png", alt: "Dina en su espacio de trabajo", position: "center 28%" },
    { src: "/media/people/dina-03.png", alt: "Dina mostrando una mazorca de cacao", position: "center 38%" },
  ],
} satisfies Record<string, PersonCardPhoto[]>;

/** Tiempo entre fotografías de una misma card, en milisegundos. */
export const PERSON_CARD_ROTATION_MS = 3600;
