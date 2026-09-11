import { redirect } from "next/navigation";

// Compatibilidad con enlaces antiguos: la sección pública ahora se llama y vive en Galería de Arte.
export default function LegacyArtPage() {
  redirect("/galeria-de-arte");
}
