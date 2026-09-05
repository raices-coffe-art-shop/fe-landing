// Los relatos que entregó el cliente traen la voz del productor entre comillas
// españolas. Cuando esa frase cierra el relato es una cita en sí misma y se
// puede destacar aparte, como en sus cartas. Cuando va en medio de una oración
// —Café: «¡Adelante hermano, siga con su proyecto!» seguido de "Lo que más
// atesoro…"— sacarla rompería el texto, así que se deja donde está.
//
// La regla es esa: solo se extrae la cita que termina el relato.

export type StoryParts = {
  story: string;
  quote: string | null;
};

// Una cita demasiado corta no justifica su propio bloque; sería un adorno.
const MIN_QUOTE_LENGTH = 24;

export function splitStoryQuote(story: string | null | undefined): StoryParts {
  const text = story?.trim() ?? "";
  if (!text) return { story: "", quote: null };

  // El punto final puede quedar dentro o fuera de la comilla de cierre.
  const closing = /[»”][.]?$/.exec(text);
  if (!closing) return { story: text, quote: null };

  const openingIndex = text.lastIndexOf("«") >= 0 ? text.lastIndexOf("«") : text.lastIndexOf("“");
  if (openingIndex <= 0) return { story: text, quote: null };

  const quote = text.slice(openingIndex).trim();
  const rest = text.slice(0, openingIndex).trim().replace(/[:,;-]$/, "").trim();

  // Sin relato que la acompañe la cita quedaría sola: mejor dejarla como está.
  if (quote.length < MIN_QUOTE_LENGTH || rest.length === 0) {
    return { story: text, quote: null };
  }

  return { story: rest, quote };
}
