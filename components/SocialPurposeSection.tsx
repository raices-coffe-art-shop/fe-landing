import { impactVision } from "@/data/social";

export function SocialPurposeSection() {
  return (
    <section className="impact-section" id="proposito">
      <div className="page-shell impact-layout">
        <div>
          <p className="eyebrow light">{impactVision.eyebrow}</p>
          <h2>{impactVision.title}</h2>
          <p>{impactVision.body}</p>
          <a className="text-link light-link" href="/links">Seguir el desarrollo del proyecto <span>↗</span></a>
        </div>
        <div className="impact-list">
          <span>{impactVision.statusLabel}</span>
          {impactVision.points.map((point, index) => (
            <p key={point}><i>{String(index + 1).padStart(2, "0")}</i>{point}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
