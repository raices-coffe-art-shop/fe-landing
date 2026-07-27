import { humanOrigin } from "@/data/social";

export function HumanOriginSection() {
  const [introParagraph, ...bodyParagraphs] = humanOrigin.paragraphs;

  return (
    <section className="history-section" id="historia">
      <div className="history-shell">
        <aside className="history-index">
          <span className="history-number">01</span>
          <span className="history-vertical-label">Nuestra razón de ser</span>
        </aside>

        <div className="history-root-rail" aria-hidden="true">
          <span className="history-seed" />
          <span className="history-root-line" />
        </div>

        <div className="history-heading">
          <p className="history-eyebrow">{humanOrigin.eyebrow}</p>
          <h2>{humanOrigin.title}</h2>
        </div>

        <div className="history-intro">
          <p>{introParagraph}</p>
        </div>

        <div className="history-media">
          <figure>
            <img
              className="history-photo"
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

          <div className="history-language-note">
            <p>{humanOrigin.notes[1].text}</p>
            <span>{humanOrigin.notes[1].label}</span>
          </div>
        </div>

        <div className="history-body">
          {bodyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}
