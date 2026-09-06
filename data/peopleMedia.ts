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
    { src: "/media/people/pedro-01.webp", alt: "Pedro Ñahui Atao junto a productos de Café Ayacuchano en una feria", position: "center 42%" },
    { src: "/media/people/pedro-02.webp", alt: "Pedro Ñahui Atao frente a un espacio de Café Ayacuchano", position: "center 44%" },
    { src: "/media/people/pedro-03.webp", alt: "Pedro Ñahui Atao junto a Lized Huamán Ramírez y Francisco Arica Cruz durante un encuentro en una zona de cultivo de café", position: "center 48%" },
    { src: "/media/people/pedro-04.webp", alt: "Pedro Ñahui Atao junto a una tostadora de café", position: "center 42%" },
  ],
  fortunato: [
    { src: "/media/people/fortunato-01.webp", alt: "Fortunato Melgar Rojas junto a frascos de miel", position: "center 42%" },
    { src: "/media/people/fortunato-02.webp", alt: "Fortunato Melgar Rojas en un espacio vinculado con su trabajo apícola", position: "center 48%" },
    { src: "/media/people/fortunato-03.webp", alt: "Fortunato Melgar Rojas durante un encuentro de Raíces en Ayacucho", position: "center 48%" },
    { src: "/media/people/fortunato-04.webp", alt: "Fortunato Melgar Rojas dentro de su espacio de productos de miel", position: "center 42%" },
  ],
  dina: [
    { src: "/media/people/dina-01.webp", alt: "Dina Torres presentada por su trabajo con cacao", position: "center 38%" },
    { src: "/media/people/dina-02.webp", alt: "Francisco Arica Cruz, un productor, Dina Torres y Lized Huamán Ramírez durante una visita vinculada con la producción de cacao", position: "center 45%" },
    { src: "/media/people/dina-03.webp", alt: "Dina Torres mostrando productos elaborados con cacao", position: "center 36%" },
  ],
  karen: [
    { src: "/media/people/karen-01.webp", alt: "Proceso artesanal de elaboración de pan chapla en Ayacucho", position: "center 46%" },
    { src: "/media/people/karen-02.webp", alt: "Trabajo de panadería durante la elaboración de pan chapla", position: "center 48%" },
  ],
} satisfies Record<string, PersonCardPhoto[]>;

/** Tiempo entre fotografías de una misma card, en milisegundos. */
export const PERSON_CARD_ROTATION_MS = 3600;
