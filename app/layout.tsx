import type { Metadata } from "next";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raíces — Café y Cultura",
  description:
    "Raíces Coffee-Art Shop conecta Ayacucho con Lima a través del café, el arte, los alimentos y las historias de las personas que los hacen posibles.",
  metadataBase: new URL("https://raices-cafe-cultura.example"),
  openGraph: {
    title: "Raíces — Café y Cultura",
    description:
      "Café, arte, alimentos y archivo documental para conectar Ayacucho con Lima a través de las personas.",
    type: "website",
    locale: "es_PE"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600&family=Montserrat:wght@900&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
