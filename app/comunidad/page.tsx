import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { communitySection } from "@/data/social";

const blocks = [
  {
    title: "Visitas",
    text: "Fotografías autorizadas de clientes, familias e invitados que llegan al local."
  },
  {
    title: "Voces de la comunidad",
    text: "Testimonios breves, fotografías, audios o videos autorizados por sus protagonistas."
  },
  {
    title: "Actividades",
    text: "Degustaciones, conversatorios, presentaciones, muestras y reuniones dentro del espacio."
  },
  {
    title: "Feria de artesanos",
    text: "Se mostrará con fecha, participantes, productos u obras y forma de participar cuando esté confirmada."
  }
];

export const metadata: Metadata = {
  title: "Comunidad — Raíces Café y Cultura",
  description: "Personas, visitas, actividades y encuentros que ocurren dentro de Raíces."
};

export default function ComunidadPage() {
  return (
    <>
      <SiteHeader />
      <main className="community-page">
        <section className="impact-section community-hero" id="comunidad">
          <div className="page-shell impact-layout">
            <div>
              <p className="eyebrow light">{communitySection.eyebrow}</p>
              <h1>{communitySection.title}</h1>
              <p>{communitySection.body}</p>
              <p>{communitySection.future}</p>
            </div>
            <div className="impact-list">
              <span>{communitySection.statusLabel}</span>
              {blocks.map((block, index) => (
                <article key={block.title}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <h2>{block.title}</h2>
                  <p>{block.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
