import React from 'react';
import { useMarketingI18n } from '../../i18n/MarketingI18n';

const Features: React.FC = () => {
  const { t } = useMarketingI18n();
  return (
    <>
      <section className="features-hero">
        <div className="container">
          <div className="features-hero-content" data-aos="fade-up">
            <FeaturesHeroTexts t={t} />
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="features-layout">
            {/* Core features */}
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
                <h3 className="feature-title"><FeatureTitle which="transcript" /></h3>
                <p className="feature-description"><FeatureDesc which="transcript" /></p>
                <div className="feature-highlights">
                  <div className="highlight-item"><span className="highlight-icon">🌐</span><span>40+ Languages</span></div>
                  <div className="highlight-item"><span className="highlight-icon">🗣️</span><span>Speaker Diarization</span></div>
                  <div className="highlight-item"><span className="highlight-icon">⚡</span><span>Real-time & Batch</span></div>
                </div>
              </div>
            </div>

            <div className="feature-item feature-right" data-aos="fade-left" data-aos-delay="200">
              <div className="feature-content">
                <div className="feature-number">02</div>
                <h3 className="feature-title"><FeatureTitle which="summary" /></h3>
                <p className="feature-description"><FeatureDesc which="summary" /></p>
                <div className="feature-stats">
                  <div className="stat-item"><span className="stat-number">↑</span><span className="stat-label">Clarity</span></div>
                  <div className="stat-item"><span className="stat-number">↓</span><span className="stat-label">Time Spent</span></div>
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
                <h3 className="feature-title"><FeatureTitle which="notes" /></h3>
                <p className="feature-description"><FeatureDesc which="notes" /></p>
                <div className="feature-tech">
                  <span className="tech-badge">Context Linking</span>
                  <span className="tech-badge">Semantic Search</span>
                  <span className="tech-badge">Traceability</span>
                </div>
              </div>
            </div>

            {/* Extended features (upcoming) */}
            <div className="feature-item feature-right" data-aos="fade-left" data-aos-delay="400">
              <div className="feature-content">
                <div className="feature-number">04</div>
                <h3 className="feature-title"><ExtendedTitle which="templates" /></h3>
                <p className="feature-description"><ExtendedDesc which="templates" /></p>
                <div className="automation-flow">
                  <div className="flow-step">Select</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">Customize</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">Run</div>
                </div>
                <div className="feature-tech"><span className="tech-badge"><ComingSoon /></span></div>
              </div>
              <div className="feature-visual">
                <div className="feature-graphic automation">
                  <div className="automation-nodes">
                    <div className="auto-node node-1"></div>
                    <div className="auto-node node-2"></div>
                    <div className="auto-node node-3"></div>
                    <div className="connection-line"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-item feature-left" data-aos="fade-right" data-aos-delay="500">
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
              <div className="feature-content">
                <div className="feature-number">05</div>
                <h3 className="feature-title"><ExtendedTitle which="chat" /></h3>
                <p className="feature-description"><ExtendedDesc which="chat" /></p>
                <div className="feature-highlights">
                  <div className="highlight-item"><span className="highlight-icon">💬</span><span>Follow-ups</span></div>
                  <div className="highlight-item"><span className="highlight-icon">🔎</span><span>Cross-meeting Context</span></div>
                  <div className="highlight-item"><span className="highlight-icon">✅</span><span>Action Tracking</span></div>
                </div>
                <div className="feature-tech"><span className="tech-badge"><ComingSoon /></span></div>
              </div>
            </div>

            <div className="feature-item feature-right" data-aos="fade-left" data-aos-delay="600">
              <div className="feature-content">
                <div className="feature-number">06</div>
                <h3 className="feature-title"><ExtendedTitle which="knowledge" /></h3>
                <p className="feature-description"><ExtendedDesc which="knowledge" /></p>
                <div className="feature-tech">
                  <span className="tech-badge">Knowledge Graph</span>
                  <span className="tech-badge">Recommendations</span>
                  <span className="tech-badge">Privacy-first</span>
                  <span className="tech-badge"><ComingSoon /></span>
                </div>
              </div>
              <div className="feature-visual">
                <div className="feature-graphic backgrounds">
                  <div className="bg-preview">
                    <div className="bg-layer layer-1"></div>
                    <div className="bg-layer layer-2"></div>
                    <div className="bg-layer layer-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="advanced-capabilities">
        <div className="container">
          <div className="advanced-header" data-aos="fade-up">
            <h2 className="section-title">{t.featuresPage.capabilities.title}</h2>
            <p className="section-subtitle">{t.featuresPage.capabilities.subtitle}</p>
          </div>
          <div className="capabilities-grid">
            {t.featuresPage.capabilities.items.map((c, i) => (
              <div className="capability-card" key={c.title} data-aos="fade-up" data-aos-delay={(i + 1) * 100}>
                <div className="capability-icon" />
                <h3 className="capability-title">{c.title}</h3>
                <p className="capability-description">{c.desc}</p>
                <div className="capability-features">
                  {c.tags.map(tag => (<span className="feature-tag" key={tag}>{tag}</span>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;

// Local presentational helpers for i18n
import type { Messages } from '../../i18n/marketingDict';

const FeaturesHeroTexts: React.FC<{ t: Messages }> = ({ t }) => (
  <>
    <h1 className="page-title">{t.featuresPage.title}</h1>
    <p className="page-subtitle">{t.featuresPage.subtitle}</p>
  </>
);

const FeatureTitle: React.FC<{ which: 'transcript' | 'summary' | 'notes' }> = ({ which }) => {
  const { t } = useMarketingI18n();
  return <>{t.featuresPage.core[which].title}</>;
};

const FeatureDesc: React.FC<{ which: 'transcript' | 'summary' | 'notes' }> = ({ which }) => {
  const { t } = useMarketingI18n();
  return <>{t.featuresPage.core[which].desc}</>;
};

const ExtendedTitle: React.FC<{ which: 'templates' | 'chat' | 'knowledge' }> = ({ which }) => {
  const { t } = useMarketingI18n();
  return <>{t.featuresPage.extended[which].title}</>;
};

const ExtendedDesc: React.FC<{ which: 'templates' | 'chat' | 'knowledge' }> = ({ which }) => {
  const { t } = useMarketingI18n();
  return <>{t.featuresPage.extended[which].desc}</>;
};

const ComingSoon: React.FC = () => {
  const { t } = useMarketingI18n();
  return <>{t.featuresPage.extended.comingSoon}</>;
};


