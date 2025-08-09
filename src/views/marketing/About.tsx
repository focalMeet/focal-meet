import React from "react";
import { useMarketingI18n } from "../../i18n/MarketingI18n";
import type { Messages } from "../../i18n/marketingDict";

const About: React.FC = () => {
  const { t } = useMarketingI18n();
  return (
    <>
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content" data-aos="fade-up">
            <h1 className="page-title">{t.about.title}</h1>
            <p className="page-subtitle">{t.about.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="team-header" data-aos="fade-up">
            <h2 className="section-title">{t.about.teamTitle}</h2>
            <p className="section-subtitle">{t.about.teamSubtitle}</p>
          </div>
          <div className="team-grid">
            {t.about.team.map((m: Messages['about']['team'][number], i: number) => (
              <div
                className="team-card"
                key={m.name}
                data-aos="fade-up"
                data-aos-delay={(i + 1) * 100}
              >
                <div className="team-avatar">
                  <div className="avatar-placeholder">{m.badge}</div>
                </div>
                <div className="team-info">
                  <h4 className="team-name">{m.name}</h4>
                  <p className="team-position">{m.role}</p>
                  <p className="team-bio">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="journey-section">
        <div className="container">
          <div className="journey-header" data-aos="fade-up">
            <h2 className="section-title">{t.about.journeyTitle}</h2>
            <p className="section-subtitle">{t.about.journeySubtitle}</p>
          </div>
          <div className="timeline">
            {t.about.journey.map((e: Messages['about']['journey'][number], i: number) => (
              <div
                className="timeline-item"
                key={e.year}
                data-aos={i % 2 === 0 ? "fade-right" : "fade-left"}
              >
                <div className="timeline-marker">{e.year}</div>
                <div className="timeline-content">
                  <h4>{e.title}</h4>
                  <p>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
