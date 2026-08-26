import type { Metadata } from "next";
import { CartaSheet } from "../_carta/CartaSheet";

// La carta tal como la ve quien escanea el QR en la mesa: solo los productos y
// sus precios, sin fotografías y sin los botones de descarga, que son
// herramientas del equipo. La versión con fotos vive en /catalogo/imprimir.
//
// noindex + canonical al catálogo: es el mismo contenido que /catalogo, y esa es
// la página que debe posicionar en Google.
export const metadata: Metadata = {
  title: "Carta",
  description: "La carta de Raíces: café de especialidad, chocolatería y productos de origen.",
  alternates: { canonical: "/catalogo" },
  robots: { index: false, follow: true },
};

export default function CartaPage() {
  return <CartaSheet withPhotos={false} showActions={false} />;
}
