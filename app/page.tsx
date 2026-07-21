import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { StoryPath } from "@/components/StoryPath";
import { CulturalMap } from "@/components/CulturalMap";
import { OriginJourney } from "@/components/OriginJourney";
import { PeopleStack } from "@/components/PeopleStack";
import { AyacuchoLexicon } from "@/components/AyacuchoLexicon";
import { CulturalSplitShowcase } from "@/components/CulturalSplitShowcase";
import { VerticalStorySlider } from "@/components/VerticalStorySlider";
import { HorizontalParallaxGallery } from "@/components/HorizontalParallaxGallery";
import { LayeredRevealGallery } from "@/components/LayeredRevealGallery";
import { CatalogPreview } from "@/components/CatalogPreview";
import { EditorialImage } from "@/components/EditorialImage";
import { Footer } from "@/components/Footer";
import { TerritoryAtmosphere } from "@/components/TerritoryAtmosphere";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <div className="narrative-wrap">
          <StoryPath />

          <section className="manifesto-section" id="historia">
            <div className="page-shell manifesto-grid">
              <div className="manifesto-label">
                <span>01</span>
                <p>Nuestra razón de ser</p>
              </div>
              <div className="manifesto-copy">
                <p className="eyebrow">Una idea nacida lejos de casa</p>
                <h2>Las raíces no son un lugar al que se vuelve. Son algo que viaja con nosotros.</h2>
                <div className="manifesto-body">
                  <p>Después de vivir en distintos países, el fundador comprendió que la distancia no borra el origen. Lo vuelve más visible.</p>
                  <p>Raíces nace para compartir esa memoria mediante sabores, objetos y personas que conectan Ayacucho con Lima.</p>
                </div>
              </div>
              <div className="founder-note">
                <span className="quote-mark">“</span>
                <p>Queremos que cada cosa que llegue a la mesa pueda decir de dónde viene y quién la hizo posible.</p>
                <small>Relato del fundador · nombre y retrato por confirmar</small>
              </div>
            </div>
          </section>

          <VerticalStorySlider />

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
                <h2>No usamos una región como decoración. La presentamos a través de sus voces.</h2>
              </div>
              <div className="territory-text">
                <p>El café es una de las puertas de entrada. También lo son la miel, el cacao, los quesos, la pintura, los nacimientos y las pequeñas esculturas.</p>
                <p>El sitio está pensado para crecer: primero Ayacucho; después, una región invitada de la sierra peruana cada temporada.</p>
              </div>
              <TerritoryAtmosphere />
              <CulturalMap />
            </div>
          </section>

          <AyacuchoLexicon />
          <OriginJourney />
          <PeopleStack />

          <HorizontalParallaxGallery />

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

          <LayeredRevealGallery />

          <CatalogPreview />

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
                <a className="text-link" href="https://wa.me/51999999999" target="_blank" rel="noreferrer">Confirmar visita ↗</a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
