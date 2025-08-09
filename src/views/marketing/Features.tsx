import React from 'react';

const Features: React.FC = () => {
  return (
    <>
      <section className="features-hero">
        <div className="container">
          <div className="features-hero-content" data-aos="fade-up">
            <h1 className="page-title">Advanced AI Features</h1>
            <p className="page-subtitle">Discover the full spectrum of our AI-powered tools designed to revolutionize your communication experience.</p>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="features-layout">
            {/* Feature blocks matching static site */}
            <div className="feature-item feature-left" data-aos="fade-right" data-aos-delay="100">
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
                <div className="feature-number">01</div>
                <h3 className="feature-title">Smart Meeting Analytics</h3>
                <p className="feature-description">Get real-time insights and detailed analytics on meeting performance, participant engagement, and actionable recommendations that drive results.</p>
                <div className="feature-stats">
                  <div className="stat-item"><span className="stat-number">40%</span><span className="stat-label">Efficiency Boost</span></div>
                  <div className="stat-item"><span className="stat-number">99%</span><span className="stat-label">Accuracy Rate</span></div>
                </div>
              </div>
            </div>

            <div className="feature-item feature-right" data-aos="fade-left" data-aos-delay="200">
              <div className="feature-content">
                <div className="feature-number">02</div>
                <h3 className="feature-title">AI-Powered Transcription</h3>
                <p className="feature-description">Automatically transcribe meetings with industry-leading accuracy in 40+ languages and generate smart summaries that capture key decisions and action items.</p>
                <div className="feature-highlights">
                  <div className="highlight-item"><span className="highlight-icon">🌐</span><span>40+ Languages</span></div>
                  <div className="highlight-item"><span className="highlight-icon">⚡</span><span>Real-time Processing</span></div>
                </div>
              </div>
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
                <h3 className="feature-title">AI Virtual Environments</h3>
                <p className="feature-description">Professional AI-enhanced virtual backgrounds and real-time video optimization for crystal-clear communication in any environment.</p>
                <div className="feature-tech">
                  <span className="tech-badge">Neural Processing</span>
                  <span className="tech-badge">4K Enhancement</span>
                </div>
              </div>
            </div>

            <div className="feature-item feature-right" data-aos="fade-left" data-aos-delay="400">
              <div className="feature-content">
                <div className="feature-number">04</div>
                <h3 className="feature-title">Intelligent Automation</h3>
                <p className="feature-description">Smart calendar integration with AI-powered scheduling suggestions, automatic conflict resolution, and seamless workflow optimization.</p>
                <div className="automation-flow">
                  <div className="flow-step">Schedule</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">Optimize</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">Execute</div>
                </div>
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
          </div>
        </div>
      </section>

      <section className="advanced-capabilities">
        <div className="container">
          <div className="advanced-header" data-aos="fade-up">
            <h2 className="section-title">Advanced Capabilities</h2>
            <p className="section-subtitle">Unlock the full potential of AI-powered collaboration with our premium enterprise features.</p>
          </div>
          <div className="capabilities-grid">
            {[
              { title: 'SecureAI Shield', desc: 'Enterprise-grade security with end-to-end encryption, compliance monitoring, and advanced threat detection powered by machine learning algorithms.', tags: ['End-to-End Encryption','SOC 2 Compliant','GDPR Ready']},
              { title: 'Collaborative Whiteboard', desc: 'AI-enhanced digital whiteboard with intelligent shape recognition, automatic organization, and real-time collaborative editing for unlimited creativity.', tags: ['Shape Recognition','Real-time Sync','Infinite Canvas']},
              { title: 'Developer API', desc: 'Comprehensive REST API and SDKs for seamless integration with your existing tools, custom workflows, and enterprise applications.', tags: ['REST API','WebHooks','Custom SDKs']},
            ].map((c, i) => (
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


