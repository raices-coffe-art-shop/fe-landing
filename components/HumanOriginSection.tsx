import { humanOrigin } from "@/data/social";

export function HumanOriginSection() {
  return (
    <section className="manifesto-section human-origin-section" id="historia">
      <div className="page-shell manifesto-grid">
        <div className="manifesto-label">
          <span>01</span>
          <p>Nuestra razón de ser</p>
        </div>
        <div className="manifesto-copy">
          <p className="eyebrow">{humanOrigin.eyebrow}</p>
          <h2>{humanOrigin.title}</h2>
          <div className="manifesto-body">
            {humanOrigin.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <aside className="founder-note human-origin-note">
          <span className="quote-mark">“</span>
          <p>{humanOrigin.quotes[0].text}</p>
          <small>{humanOrigin.quotes[0].person} · testimonio pendiente</small>
          <div className="human-origin-photo" aria-label={humanOrigin.pendingMediaLabel}>
            <span>{humanOrigin.pendingMediaLabel}</span>
          </div>
          <p className="human-origin-second-quote">{humanOrigin.quotes[1].text}</p>
          <small>{humanOrigin.quotes[1].person} · testimonio pendiente</small>
        </aside>
      </div>
    </section>
  );
}
