import { redirect } from "next/navigation";

// Compatibilidad con QR y enlaces antiguos de la Carta.
export default function LegacyCartaPage() {
  redirect("/carta");
}
