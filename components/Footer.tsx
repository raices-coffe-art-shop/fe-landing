import { contactChannels } from "@/data/social";
import { FooterRoot } from "@/components/FooterRoot";
import { getPrimarySocialHref, getSiteSettings, type SocialLink, type SocialPlatform } from "@/sanity/lib/siteSettings";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const label = platform === "other" ? "link" : platform;
  return <span aria-hidden="true">{label.slice(0, 2).toUpperCase()}</span>;
}

function isExternalLink(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function FooterSocialLinks({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="footer-social-links" aria-label="Redes sociales">
      {links.map((link) => (
        <a
          key={`${link.platform}-${link.url}`}
          href={link.url}
          target={isExternalLink(link.url) ? "_blank" : undefined}
          rel={isExternalLink(link.url) ? "noreferrer" : undefined}
          aria-label={link.label}
        >
          <SocialIcon platform={link.platform} />
          {link.label}
        </a>
      ))}
    </div>
  );
}

export async function Footer() {
  const settings = await getSiteSettings();
  const whatsappHref = getPrimarySocialHref(settings, "whatsapp", contactChannels.whatsappHref);
  const emailHref = getPrimarySocialHref(settings, "email", `mailto:${contactChannels.email}`);

  return (
    <footer className="site-footer">
      <FooterRoot />
      <div className="footer-top page-shell">
        <div className="footer-brand">
          <img className="footer-logo" src={settings.brandLogo.src} alt={settings.brandLogo.alt} width={150} height={150} loading="lazy" />
          <p className="footer-tag">Café y cultura</p>
        </div>
        <blockquote>Raíces reúne productos, alimentos, obras y relatos vinculados con Ayacucho.</blockquote>
      </div>
      <div className="footer-grid page-shell">
        <div><span>Visita</span><p>Lima, Perú<br /><a href="#visita">Cómo llegar</a></p></div>
        <div>
          <span>Contacto</span>
          <p><a href={whatsappHref}>{contactChannels.whatsappDisplay}</a><br /><a href={emailHref}>{contactChannels.email}</a></p>
          <FooterSocialLinks links={settings.socialLinks} />
        </div>
        <div><span>Explora</span><p><a href="/#personas">Personas</a><br /><a href="/catalogo">Catálogo</a><br /><a href="/arte">Arte</a><br /><a href="/comunidad">Comunidad</a></p></div>
        <div><span>Reconocimiento</span><p>A productores, artistas y artesanos cuyas historias sostienen este espacio.</p></div>
      </div>
      <div className="footer-bottom page-shell"><span>© 2026 Raíces</span><span>Ayacucho presente en Lima</span><span>Café y cultura</span></div>
    </footer>
  );
}
