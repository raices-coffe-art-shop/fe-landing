"use client";

import Link from "next/link";
import { people } from "@/data/site";

function Portrait({ initials, tone }: { initials: string; tone: string }) {
  return (
    <div className={`portrait-placeholder tone-${tone}`}>
      <span className="portrait-sun" />
      <span className="portrait-mountain one" />
      <span className="portrait-mountain two" />
      <span className="portrait-body" />
      <strong>{initials}</strong>
      <small>Retrato pendiente</small>
    </div>
  );
}

export function PeopleMasonry() {
  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--rx", `${(-y * 4.5).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(x * 4.5).toFixed(2)}deg`);
    card.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };

  const onLeave = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <section className="people-section" id="personas">
      <div className="page-shell">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Personas antes que productos</p>
            <h2>El origen tiene rostro,<br />nombre y memoria.</h2>
          </div>
          <p>
            Cada historia tendrá su propia página. Las fichas incompletas no se disfrazan: quedan abiertas hasta conversar con sus protagonistas.
          </p>
        </div>

        <div className="people-masonry">
          {people.map((person, index) => (
            <article
              key={person.slug}
              className={`person-card person-card-${index + 1}`}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              <Link href={`/personas/${person.slug}`} aria-label={`Conocer la historia de ${person.name}`}>
                <div className="person-visual">
                  <Portrait initials={person.initials} tone={person.portraitTone} />
                  <div className="person-status">{person.status === "documentada" ? "Historia base documentada" : "Entrevista pendiente"}</div>
                </div>
                <div className="person-info">
                  <div className="person-meta"><span>{person.category}</span><span>{person.region}</span></div>
                  <h3>{person.name}</h3>
                  <p>{person.summary}</p>
                  <div className="person-link">Abrir su historia <span>↗</span></div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
