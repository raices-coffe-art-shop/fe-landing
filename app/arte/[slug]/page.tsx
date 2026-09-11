import { redirect } from "next/navigation";

// Las antiguas URLs /arte/<capítulo> eran bloques editoriales, no fichas de piezas.
// Se conservan enviándolas a la nueva Galería de Arte en lugar de dejar un 404.
export default function LegacyArtDetailPage() {
  redirect("/galeria-de-arte");
}
