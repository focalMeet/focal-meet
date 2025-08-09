import React from 'react';
import { useMarketingI18n } from '../../i18n/MarketingI18n';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { t } = useMarketingI18n();
  return (
    <>
      {/* Directly reuse the marketing static structure inside React */}
      <section className="hero" id="home">
        {(() => { /* ensure hook used at top of component */ return null; })()}
        <div className="hero-background-effects">
          <div className="floating-elements">
            <div className="floating-circle circle-1"></div>
            <div className="floating-circle circle-2"></div>
            <div className="floating-circle circle-3"></div>
          </div>
        </div>
        <div className="container">
          <div className="hero-wrapper text-only">
            <div className="hero-content" data-aos="fade-up">
              <HomeHeroTexts t={t} />
            </div>
            <div className="hero-visual" data-aos="fade-left" data-aos-delay="400">
              <div className="visual-container">
                <div className="geometric-design">
                  <div className="geo-circle geo-1"></div>
                  <div className="geo-circle geo-2"></div>
                  <div className="geo-circle geo-3"></div>
                  <div className="geo-line line-1"></div>
                  <div className="geo-line line-2"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="trusted-by" data-aos="fade-up" data-aos-delay="500">
            <p className="trusted-title">Trusted by leading companies</p>
            <div className="company-logos">
              <div className="logo-item">Google</div>
              <div className="logo-item">Microsoft</div>
              <div className="logo-item">Amazon</div>
              <div className="logo-item">Tesla</div>
              <div className="logo-item">Apple</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
      <HomeFeaturesHeader t={t} />
          <div className="features-layout">
            {/* Core 01: Transcript */}
            <div className="feature-item feature-left" data-aos="fade-right" data-aos-delay="100">
              <div className="feature-visual">
                <div className="feature-graphic transcription">
                  <div className="transcription-lines">
                    <div className="line line-1"></div>
                    <div className="line line-2"></div>
                    <div className="line line-3"></div>
                  </div>
                  <div className="language-indicators">
                    <span className="lang-badge">EN</span>
                    <span className="lang-badge">中文</span>
                    <span className="lang-badge">ES</span>
                  </div>
                </div>
              </div>
              <div className="feature-content">
                <div className="feature-number">01</div>
                <h3 className="feature-title">{t.home.features.core.transcript.title}</h3>
                <p className="feature-description">{t.home.features.core.transcript.desc}</p>
                <div className="feature-highlights">
                  <div className="highlight-item"><span className="highlight-icon">🌐</span><span>{t.home.features.extras.transcript.languages}</span></div>
                  <div className="highlight-item"><span className="highlight-icon">🗣️</span><span>{t.home.features.extras.transcript.diarization}</span></div>
                  <div className="highlight-item"><span className="highlight-icon">⚡</span><span>{t.home.features.extras.transcript.realtimeBatch}</span></div>
                </div>
              </div>
            </div>

            {/* Core 02: Summary */}
            <div className="feature-item feature-right" data-aos="fade-left" data-aos-delay="200">
              <div className="feature-content">
                <div className="feature-number">02</div>
                <h3 className="feature-title">{t.home.features.core.summary.title}</h3>
                <p className="feature-description">{t.home.features.core.summary.desc}</p>
                <div className="feature-stats">
                  <div className="stat-item"><span className="stat-number">↑</span><span className="stat-label">{t.home.features.extras.summary.clarity}</span></div>
                  <div className="stat-item"><span className="stat-number">↓</span><span className="stat-label">{t.home.features.extras.summary.timeSpent}</span></div>
                </div>
              </div>
              <div className="feature-visual">
                <div className="feature-graphic analytics">
                  <div className="chart-bars">
                    <div className="bar bar-1"></div>
                    <div className="bar bar-2"></div>
                    <div className="bar bar-3"></div>
                    <div className="bar bar-4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core 03: Enriched Notes */}
            <div className="feature-item feature-left" data-aos="fade-right" data-aos-delay="300">
              <div className="feature-visual">
                <div className="feature-graphic backgrounds">
                  <div className="bg-preview">
                    <div className="bg-layer layer-1"></div>
                    <div className="bg-layer layer-2"></div>
                    <div className="bg-layer layer-3"></div>
                  </div>
                </div>
              </div>
              <div className="feature-content">
                <div className="feature-number">03</div>
                <h3 className="feature-title">{t.home.features.core.notes.title}</h3>
                <p className="feature-description">{t.home.features.core.notes.desc}</p>
                <div className="feature-tech">
                  <span className="tech-badge">{t.home.features.extras.notes.contextLinking}</span>
                  <span className="tech-badge">{t.home.features.extras.notes.semanticSearch}</span>
                  <span className="tech-badge">{t.home.features.extras.notes.traceability}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="innovations" id="innovations">
        <div className="container">
          <div className="innovations-header" data-aos="fade-up">
            <h2 className="section-title">{t.home.innovations.title}</h2>
            <p className="section-subtitle">{t.home.innovations.subtitle}</p>
          </div>
          <div className="innovations-grid">
            {t.home.innovations.items.map((it, idx) => (
              <div className="innovation-item" key={it.title} data-aos="fade-up" data-aos-delay={(idx + 1) * 100}>
                <div className="innovation-number">{String(idx + 1).padStart(2,'0')}</div>
                <h3 className="innovation-title">{it.title}</h3>
                <p className="innovation-description">{it.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

// Local presentational components for i18n texts
import type { Messages } from '../../i18n/marketingDict';

const HomeHeroTexts: React.FC<{ t: Messages }> = ({ t }) => (
  <>
    <div className="hero-badge" data-aos="fade-up" data-aos-delay="100">
      <span className="badge-text">{t.home.hero.badge}</span>
    </div>
    <h1 className="hero-title">
      <span className="title-line">{t.home.hero.title1}</span>
      <span className="title-line highlight-text">{t.home.hero.title2}</span>
    </h1>
    <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
      {t.home.hero.subtitle}
    </p>
    <div className="hero-buttons" data-aos="fade-up" data-aos-delay="300">
      <Link to="/app/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
        <span>{t.home.hero.getStarted}</span>
        <div className="btn-effect"></div>
      </Link>
      <a href="#features" className="btn btn-secondary">
        <span>{t.home.hero.learnMore}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M7 17L17 7M17 7H7M17 7V17"/>
        </svg>
      </a>
    </div>
  </>
);

const HomeFeaturesHeader: React.FC<{ t: Messages }> = ({ t }) => (
  <div className="features-header" data-aos="fade-up">
    <h2 className="section-title">{t.home.features.sectionTitle}</h2>
    <p className="section-subtitle">{t.home.features.sectionSubtitle}</p>
  </div>
);