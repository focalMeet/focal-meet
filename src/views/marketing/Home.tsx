import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <>
      {/* Directly reuse the marketing static structure inside React */}
      <section className="hero" id="home">
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
              <div className="hero-badge" data-aos="fade-up" data-aos-delay="100">
                <span className="badge-text">🚀 Introducing Next-Gen AI</span>
              </div>
              <h1 className="hero-title">
                <span className="title-line">Unlock the Future Meeting</span>
                <span className="title-line highlight-text">with Focal Meet  AI</span>
              </h1>
              <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
                Transform your business meetings with cutting-edge AI technology. 
                Experience seamless collaboration, intelligent insights, and revolutionary communication.
              </p>
              <div className="hero-buttons" data-aos="fade-up" data-aos-delay="300">
                <Link to="/app/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  <span>Get Started</span>
                  <div className="btn-effect"></div>
                </Link>
                <a href="#features" className="btn btn-secondary">
                  <span>Learn More</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </a>
              </div>
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
          <div className="features-header" data-aos="fade-up">
            <h2 className="section-title">Transform Your Business with Advanced AI Features</h2>
            <p className="section-subtitle">
              Discover powerful AI-driven solutions that revolutionize how you connect, collaborate, and communicate.
            </p>
          </div>
          <div className="features-layout">
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
                <p className="feature-description">
                  Get real-time insights and detailed analytics on meeting performance, 
                  participant engagement, and actionable recommendations that drive results.
                </p>
                <div className="feature-stats">
                  <div className="stat-item">
                    <span className="stat-number">40%</span>
                    <span className="stat-label">Efficiency Boost</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">99%</span>
                    <span className="stat-label">Accuracy Rate</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-item feature-right" data-aos="fade-left" data-aos-delay="200">
              <div className="feature-content">
                <div className="feature-number">02</div>
                <h3 className="feature-title">AI-Powered Transcription</h3>
                <p className="feature-description">
                  Automatically transcribe meetings with industry-leading accuracy in 40+ languages 
                  and generate smart summaries that capture key decisions and action items.
                </p>
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
                <p className="feature-description">
                  Professional AI-enhanced virtual backgrounds and real-time video optimization 
                  for crystal-clear communication in any environment.
                </p>
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
                <p className="feature-description">
                  Smart calendar integration with AI-powered scheduling suggestions, 
                  automatic conflict resolution, and seamless workflow optimization.
                </p>
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

      <section className="innovations" id="innovations">
        <div className="container">
          <div className="innovations-header" data-aos="fade-up">
            <h2 className="section-title">Ignite Your Potential with AI-Driven Innovations</h2>
            <p className="section-subtitle">
              Discover cutting-edge AI technologies that transform the way you work, collaborate, and achieve breakthrough results in your business.
            </p>
          </div>
          <div className="innovations-grid">
            {[1,2,3,4].map((idx) => (
              <div className="innovation-item" key={idx} data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="innovation-number">{String(idx).padStart(2,'0')}</div>
                <h3 className="innovation-title">{idx === 1 ? 'Adaptive Learning Models' : idx === 2 ? 'Real-Time Language Processing' : idx === 3 ? 'Predictive Analytics Engine' : 'Intelligent Automation Suite'}</h3>
                <p className="innovation-description">
                  {idx === 1 && 'Our AI continuously learns from your meeting patterns and preferences, automatically optimizing settings and suggestions to enhance your productivity over time.'}
                  {idx === 2 && 'Advanced natural language processing enables instant translation, sentiment analysis, and intelligent meeting summaries across multiple languages.'}
                  {idx === 3 && 'Leverage machine learning algorithms to predict meeting outcomes, identify potential conflicts, and suggest optimal scheduling strategies.'}
                  {idx === 4 && 'Automate repetitive tasks with smart workflows that adapt to your business needs, from calendar management to follow-up reminders and action item tracking.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;