import { contactChannels } from "@/data/social";
import { FooterRoot } from "@/components/FooterRoot";

export function Footer() {
  return (
    <footer className="site-footer">
      <FooterRoot />
      <div className="footer-top page-shell">
        <div className="footer-brand">
          <img className="footer-logo" src="/raices-logo-lg.png" alt="Raíces" width={150} height={150} loading="lazy" />
          <p className="footer-tag">Café y cultura</p>
        </div>
        <blockquote>Raíces reúne productos, alimentos, obras y relatos vinculados con Ayacucho.</blockquote>
      </div>
      <div className="footer-grid page-shell">
        <div><span>Visita</span><p>Lima, Perú<br /><a href="#visita">Cómo llegar</a></p></div>
        <div><span>Contacto</span><p><a href={contactChannels.whatsappHref}>{contactChannels.whatsappDisplay}</a><br /><a href={`mailto:${contactChannels.email}`}>{contactChannels.email}</a></p></div>
        <div><span>Explora</span><p><a href="/#personas">Personas</a><br /><a href="/catalogo">Catálogo</a><br /><a href="/arte">Arte</a><br /><a href="/comunidad">Comunidad</a></p></div>
        <div><span>Reconocimiento</span><p>A productores, artistas y artesanos cuyas historias sostienen este espacio.</p></div>
      </div>
      <div className="footer-bottom page-shell"><span>© 2026 Raíces</span><span>Ayacucho presente en Lima</span><span>Café y cultura</span></div>
    </footer>
  );
}
