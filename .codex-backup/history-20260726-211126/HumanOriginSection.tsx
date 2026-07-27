import { humanOrigin } from "@/data/social";

export function HumanOriginSection() {
  const [introParagraph, ...bodyParagraphs] = humanOrigin.paragraphs;

  return (
    <section className="manifesto-section human-origin-section" id="historia">
      <div className="page-shell manifesto-grid human-origin-grid">
        <div className="manifesto-label">
          <span>01</span>
          <p>Nuestra razón de ser</p>
        </div>

        <div className="manifesto-copy human-origin-heading">
          <p className="eyebrow">{humanOrigin.eyebrow}</p>
          <h2>{humanOrigin.title}</h2>
        </div>

        <p className="human-origin-intro">{introParagraph}</p>

        <aside className="founder-note human-origin-note founders-media">
          <figure className="human-origin-figure">
            <img
              className="human-origin-photo"
              src={humanOrigin.foundersPhoto}
              alt={humanOrigin.foundersPhotoAlt}
              width={773}
              height={639}
              loading="lazy"
            />
            <figcaption>
              <p>{humanOrigin.notes[0].text}</p>
              <small>{humanOrigin.notes[0].label}</small>
            </figcaption>
          </figure>

          <div className="founders-language-note">
            <p>{humanOrigin.notes[1].text}</p>
            <span>{humanOrigin.notes[1].label}</span>
          </div>
        </aside>

        <div className="manifesto-body human-origin-body">
          {bodyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}
