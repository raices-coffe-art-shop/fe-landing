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
import { DocumentaryArchive } from "@/components/DocumentaryArchive";
import { ContinuousRoots } from "@/components/ContinuousRoots";
import { SocialPurposeSection } from "@/components/SocialPurposeSection";
import { contactChannels } from "@/data/social";

export default function HomePage() {
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
                src="/ayacucho-sacsamarca.jpg"
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
          <DocumentaryArchive />

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
              <EditorialImage src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1800&q=86" alt="Interior cálido de un espacio de café y cultura" />
            </div>
            <div className="visit-card">
              <p className="eyebrow">Visítanos</p>
              <h2>Ven a conocer Raíces en persona.</h2>
              <p>Descubre los productos, las obras y las historias que forman parte del espacio.</p>
              <div className="visit-details">
                <div><span>Dirección</span><p>Lima, Perú</p></div>
                <div><span>Contacto</span><p>{contactChannels.whatsappDisplay}<br />Instagram de Raíces</p></div>
                <div><span>Métodos de pago</span><p>Consulta medios disponibles en el local.</p></div>
              </div>
              {contactChannels.googleMapsEmbedUrl && (
                <div className="visit-map">
                  <iframe
                    src={contactChannels.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de Raíces en Google Maps"
                  />
                </div>
              )}
              <div className="visit-actions">
                <a className="button button-dark" href={contactChannels.maps} target="_blank" rel="noreferrer">Cómo llegar</a>
                <a className="text-link" href={contactChannels.whatsappHref} target="_blank" rel="noreferrer">Escribir por WhatsApp ↗</a>
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
