import type { Metadata } from "next";
import { baseOpenGraph } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { CulturalSplitShowcase } from "@/components/CulturalSplitShowcase";

export const metadata: Metadata = {
  title: "Arte",
  description: "La obra de Lized y el lugar del arte dentro de Raíces.",
  alternates: { canonical: "/arte" },
  openGraph: { ...baseOpenGraph, url: "/arte", title: "Arte en Raíces — Café y Cultura" },
};

export default function ArtePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="art-section standalone-art-page" id="arte">
          <div className="art-intro page-shell">
            <div>
              <p className="eyebrow light">Arte en Raíces</p>
              <h1>La mirada de Lized también forma parte de la historia de Raíces.</h1>
            </div>
            <div>
              <p>Los cuadros de Lized ocupan un lugar central dentro del espacio. En ellos aparecen ideas, memorias y una forma personal de acercarse a Ayacucho.</p>
              <p>Raíces también podrá recibir obras invitadas de otros creadores, identificando siempre su autoría. Sin embargo, esta sección comienza con el trabajo de Lized.</p>
            </div>
          </div>
          <CulturalSplitShowcase />
        </section>
      </main>
      <Footer />
    </>
  );
}
