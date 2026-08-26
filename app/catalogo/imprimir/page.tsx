import type { Metadata } from "next";
import { CartaSheet } from "../_carta/CartaSheet";

// Vista interna: la que usa el equipo para descargar el PDF o imprimir copias.
// La que ve el comensal al escanear el QR es /catalogo/carta.
export const metadata: Metadata = {
  title: "Carta para imprimir",
  robots: { index: false, follow: false },
};

type ImprimirPageProps = {
  searchParams: Promise<{ fotos?: string | string[] }>;
};

export default async function ImprimirCartaPage({ searchParams }: ImprimirPageProps) {
  const resolvedSearchParams = await searchParams;
  const fotosParam = Array.isArray(resolvedSearchParams.fotos)
    ? resolvedSearchParams.fotos[0]
    : resolvedSearchParams.fotos;

  return <CartaSheet withPhotos={fotosParam !== "no"} showActions />;
}
