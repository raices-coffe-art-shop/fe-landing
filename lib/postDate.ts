// Fecha en el formato que usa el resto del sitio (es-PE), estable entre
// servidor y cliente: se fuerza UTC para que la hidratación no difiera según
// la zona horaria del visitante.
export function formatPostDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
