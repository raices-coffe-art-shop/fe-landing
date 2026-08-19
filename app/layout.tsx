import type { Metadata } from "next";
import { RaicesPreloader } from "@/components/RaicesPreloader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: {
    default: "Raíces — Café y Cultura | Café ayacuchano y arte en Lima",
    template: "%s | Raíces — Café y Cultura",
  },
  description:
    "Raíces conecta Ayacucho con Lima a través de productos, alimentos, arte e historias de las personas que los hacen posibles.",
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "180x180" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    siteName: "Raíces — Café y Cultura",
    title: "Raíces — Café y Cultura | Café ayacuchano y arte en Lima",
    description:
      "Productos, alimentos, arte e historias para compartir Ayacucho en Lima a través de las personas.",
    type: "website",
    locale: "es_PE",
    url: "/",
    images: [
      {
        url: "/media/raices/raices-local-entrada.webp",
        alt: "Local de Raíces Café y Cultura en Lima",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
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
        <noscript>
          <style>{".raices-preloader{display:none!important}"}</style>
        </noscript>
        <RaicesPreloader />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
