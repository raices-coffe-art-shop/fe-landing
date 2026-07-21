import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { StoryPath } from "@/components/StoryPath";
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
import { RootsNetworkSection } from "@/components/RootsNetworkSection";
import { DocumentaryArchive } from "@/components/DocumentaryArchive";
import { SocialPurposeSection } from "@/components/SocialPurposeSection";
import { contactChannels } from "@/data/social";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <div className="narrative-wrap">
          <StoryPath />

          <HumanOriginSection />
          <AyacuchoLexicon />
          <RootsNetworkSection />
          <PeopleStack />

          <section className="territory-section" id="territorio">
            <div className="territory-photo">
              <EditorialImage
                src="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=2000&q=88"
                alt="Paisaje de los Andes peruanos"
                position="center 46%"
              />
              <div className="territory-word" aria-hidden="true">TERRITORIO</div>
            </div>
            <div className="page-shell territory-content">
              <div>
                <p className="eyebrow">Ayacucho en Lima</p>
                <h2>El territorio no aparece como fondo. Aparece en el idioma, los alimentos, los oficios y las personas.</h2>
              </div>
              <div className="territory-text">
                <p>Ayacucho no es una decoración ni una procedencia comercial aislada. Es el lugar desde donde se escuchan lenguas, procesos, familias y formas de trabajo.</p>
                <p>El mapa conserva dos puntos centrales: Ayacucho como origen y Lima como lugar de encuentro.</p>
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
                <p className="eyebrow light">Art Shop</p>
                <h2>El arte no acompaña al espacio. También le da voz.</h2>
              </div>
              <p>Pinturas, retablos, nacimientos y piezas ayacuchanas presentadas como obra: con autoría, técnica y procedencia.</p>
            </div>

            <CulturalSplitShowcase />
          </section>

          <CatalogPreview />
          <SocialPurposeSection />

          <section className="visit-section" id="visita">
            <div className="visit-image">
              <EditorialImage src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1800&q=86" alt="Interior cálido de una cafetería cultural" />
            </div>
            <div className="visit-card">
              <p className="eyebrow">Ven a conocer el origen</p>
              <h2>Raíces se entiende mejor alrededor de una mesa.</h2>
              <div className="visit-details">
                <div><span>Dirección</span><p>Pendiente de confirmar<br />Lima, Perú</p></div>
                <div><span>Horario</span><p>Pendiente de confirmar</p></div>
              </div>
              <div className="visit-actions">
                <a className="button button-dark" href="https://maps.google.com" target="_blank" rel="noreferrer">Cómo llegar</a>
                <a className="text-link" href={contactChannels.whatsappHref} target="_blank" rel="noreferrer">Confirmar visita ↗</a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
