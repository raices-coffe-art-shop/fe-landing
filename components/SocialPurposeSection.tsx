import { communitySection } from "@/data/social";

export function SocialPurposeSection() {
  return (
    <section className="impact-section" id="comunidad">
      <div className="page-shell impact-layout">
        <div>
          <p className="eyebrow light">{communitySection.eyebrow}</p>
          <h2>{communitySection.title}</h2>
          <p>{communitySection.body}</p>
          <p>{communitySection.future}</p>
          <a className="text-link light-link" href="/comunidad">Ver comunidad <span>↗</span></a>
        </div>
        <div className="impact-list">
          <span>{communitySection.statusLabel}</span>
          {communitySection.points.map((point, index) => (
            <p key={point}><i>{String(index + 1).padStart(2, "0")}</i>{point}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
