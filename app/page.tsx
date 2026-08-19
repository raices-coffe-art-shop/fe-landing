import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { CulturalMap } from "@/components/CulturalMap";
import { OriginJourney } from "@/components/OriginJourney";
import { PeopleStack } from "@/components/PeopleStack";
import { AyacuchoLexicon } from "@/components/AyacuchoLexicon";
import { CulturalSplitShowcase } from "@/components/CulturalSplitShowcase";
import { CatalogPreview } from "@/components/CatalogPreview";
import { EditorialImage } from "@/components/EditorialImage";
import { Footer } from "@/components/Footer";
import { TerritoryAtmosphere } from "@/components/TerritoryAtmosphere";
import { HumanOriginSection } from "@/components/HumanOriginSection";
import { ContinuousRoots } from "@/components/ContinuousRoots";
import { SocialPurposeSection } from "@/components/SocialPurposeSection";
import { contactChannels } from "@/data/social";
import { getPrimarySocialHref, getSiteSettings } from "@/sanity/lib/siteSettings";

export const metadata: Metadata = {
  title: { absolute: "Raíces — Café y Cultura | Café ayacuchano y arte en Lima" },
  description:
    "Cafetería y tienda cultural en Lima: café ayacuchano de origen, cacao, alimentos, arte y las historias de las personas que los hacen posibles.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Raíces — Café y Cultura | Café ayacuchano y arte en Lima",
    description:
      "Café ayacuchano de origen, alimentos, arte e historias para compartir Ayacucho en Lima.",
  },
};

function VisitSocialIcon({ platform }: { platform: "whatsapp" | "instagram" | "facebook" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {platform === "whatsapp" && (
        <>
          <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.2a8.5 8.5 0 1 1 15.6-4.6Z" />
          <path d="M8.2 7.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.6.7c-.2.2-.1.4 0 .6.5.9 1.3 1.7 2.2 2.2.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.8.9c.3.1.4.3.4.5 0 .3-.2 1.4-.9 1.9-.6.5-1.4.7-2.3.5-1-.2-2.4-.8-4-2.2-1.2-1.2-2-2.6-2.2-3.6-.2-.8 0-1.6.4-2.1l.8-.6Z" />
        </>
      )}
      {platform === "instagram" && (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.4" cy="6.8" r="1" className="visit-social-icon-dot" />
        </>
      )}
      {platform === "facebook" && (
        <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4V10H7.5v3h2.7v8h3.4Z" />
      )}
    </svg>
  );
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const whatsappHref = getPrimarySocialHref(settings, "whatsapp", contactChannels.whatsappHref);
  const instagramHref = getPrimarySocialHref(settings, "instagram", contactChannels.instagram);
  const facebookHref = getPrimarySocialHref(settings, "facebook", contactChannels.facebook);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <div className="narrative-wrap">
          <ContinuousRoots />

          <HumanOriginSection />
          <AyacuchoLexicon />
          <PeopleStack />

          <section className="territory-section" id="territorio">
            <div className="territory-photo">
              <EditorialImage
                src="/ayacucho-sacsamarca.webp"
                alt="Paisaje de Sacsamarca, Ayacucho"
                position="center 48%"
              />
              <div className="territory-word" aria-hidden="true">TERRITORIO</div>
            </div>
            <div className="page-shell territory-content">
              <div className="territory-manifest">
                <div className="territory-manifest-heading">
                  <span aria-hidden="true">01</span>
                  <i />
                </div>
                <p className="eyebrow">Ayacucho presente en Lima</p>
                <h2>Ayacucho no está aquí como decoración. Es origen vivo dentro de Raíces.</h2>
              </div>
              <div className="territory-text" aria-label="Territorio como origen vivo">
                <p>Todo lo que llega al local debe poder responder de dónde viene, quién lo hizo y qué relación sostiene su proceso.</p>
                <ul className="territory-highlights">
                  <li><b>Procedencia</b><span>lugares, cultivos y oficios reconocibles.</span></li>
                  <li><b>Memoria</b><span>lengua, recetas y relatos que no se separan del producto.</span></li>
                  <li><b>Encuentro</b><span>Lima como mesa donde Ayacucho se comparte sin perder origen.</span></li>
                </ul>
              </div>
              <TerritoryAtmosphere />
              <CulturalMap />
            </div>
          </section>

          <OriginJourney />
          <span className="narrative-anchor" id="archivo" aria-hidden="true" />

          <section className="art-section" id="arte">
            <div className="art-intro page-shell">
              <div>
                <p className="eyebrow light">Arte en Raíces</p>
                <h2>La mirada de Lized también forma parte de la historia de Raíces.</h2>
              </div>
              <p>Los cuadros de Lized ocupan un lugar central dentro del espacio. En ellos aparecen ideas, memorias y una forma personal de acercarse a Ayacucho.</p>
            </div>

            <CulturalSplitShowcase />
          </section>

          <CatalogPreview />
          <SocialPurposeSection />

          <section className="visit-section" id="visita">
            <div className="visit-image">
              <EditorialImage
                src="/media/raices/raices-local-entrada.webp"
                alt="Entrada e interior del local de Raíces Café y Cultura"
                position="center center"
              />
            </div>
            <div className="visit-card">
              <p className="eyebrow">Visítanos</p>
              <h2>Ven a conocer Raíces en persona.</h2>
              <p>Descubre los productos, las obras y las historias que forman parte del espacio.</p>
              <div className="visit-details">
                <div><span>Dirección</span><p>Lima, Perú</p></div>
                <div className="visit-contact-detail">
                  <span>Contacto</span>
                  <div className="visit-social-links" aria-label="Redes y contacto de Raíces">
                    <a className="visit-social-link" href={whatsappHref} target="_blank" rel="noreferrer" aria-label="Escribir a Raíces por WhatsApp">
                      <VisitSocialIcon platform="whatsapp" />
                      <span>WhatsApp</span>
                    </a>
                    <a className="visit-social-link" href={instagramHref} target="_blank" rel="noreferrer" aria-label="Visitar Instagram de Raíces">
                      <VisitSocialIcon platform="instagram" />
                      <span>Instagram</span>
                    </a>
                    <a className="visit-social-link" href={facebookHref} target="_blank" rel="noreferrer" aria-label="Visitar Facebook de Raíces">
                      <VisitSocialIcon platform="facebook" />
                      <span>Facebook</span>
                    </a>
                  </div>
                </div>
                <div><span>Métodos de pago</span><p>Consulta medios disponibles en el local.</p></div>
              </div>
              <div className="visit-map">
                <iframe
                  src={contactChannels.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Raíces Café y Cultura en Google Maps"
                />
              </div>
              <div className="visit-actions">
                <a className="button button-dark" href={contactChannels.maps} target="_blank" rel="noreferrer">Cómo llegar</a>
                <a className="text-link" href={whatsappHref} target="_blank" rel="noreferrer">Escribir por WhatsApp ↗</a>
                <a className="text-link" href="/catalogo">Ver catálogo ↗</a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
