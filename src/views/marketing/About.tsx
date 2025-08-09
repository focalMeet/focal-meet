import React from 'react';

const About: React.FC = () => {
  return (
    <>
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content" data-aos="fade-up">
            <h1 className="page-title">About Focal Meet</h1>
            <p className="page-subtitle">
              Pioneering the future of AI-powered communication and collaboration. We're on a mission to transform how teams connect, share ideas, and achieve breakthrough results.
            </p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="team-header" data-aos="fade-up">
            <h2 className="section-title">Meet the Team</h2>
            <p className="section-subtitle">Brilliant minds from diverse backgrounds, united by a shared passion for innovation and excellence.</p>
          </div>
          <div className="team-grid">
            {[
              { badge: 'JS', name: 'Dr. James Sullivan', role: 'Chief Executive Officer', bio: 'Former AI Research Director at Google, PhD in Computer Science from MIT. 15+ years of experience in machine learning and natural language processing.' },
              { badge: 'MC', name: 'Maria Chen', role: 'Chief Technology Officer', bio: 'Previously Lead Engineer at OpenAI, specializing in large language models and real-time processing systems. Stanford Computer Science graduate.' },
              { badge: 'AR', name: 'Alex Rodriguez', role: 'Head of Product Design', bio: 'Award-winning UX designer with 12 years at Apple and Airbnb. Passionate about creating intuitive interfaces that make complex technology feel simple.' },
              { badge: 'SP', name: 'Dr. Sarah Patel', role: 'VP of AI Research', bio: 'Former Principal Scientist at Microsoft Research, PhD in Neural Networks from Carnegie Mellon. Pioneer in conversational AI and speech recognition technologies.' },
            ].map((m, i) => (
              <div className="team-card" key={m.name} data-aos="fade-up" data-aos-delay={(i + 1) * 100}>
                <div className="team-avatar"><div className="avatar-placeholder">{m.badge}</div></div>
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
            <h2 className="section-title">Our Journey</h2>
            <p className="section-subtitle">From a bold idea to transforming how the world communicates.</p>
          </div>
          <div className="timeline">
            {[
              { year: '2019', title: 'The Beginning', desc: 'Founded by Dr. James Sullivan and Maria Chen with a vision to revolutionize remote communication. Initial research begins on real-time AI transcription.' },
              { year: '2020', title: 'First Breakthrough', desc: 'Developed breakthrough neural language processing algorithm achieving 98% accuracy in real-time transcription. Secured Series A funding of $12M.' },
              { year: '2021', title: 'Global Expansion', desc: 'Launched multi-language support for 40+ languages. Expanded team to 50+ employees across 12 countries. First enterprise clients onboarded.' },
              { year: '2022', title: 'AI Innovation', desc: 'Introduced advanced meeting analytics and predictive insights. Won AI Innovation of the Year award. Reached 100,000+ active users worldwide.' },
              { year: '2023', title: 'Market Leadership', desc: 'Achieved market leadership in AI-powered meeting solutions. Launched enterprise-grade security features. Completed Series B funding round of $45M.' },
              { year: '2024', title: 'Future Vision', desc: 'Continuing to push the boundaries of AI communication technology. Building the next generation of intelligent collaboration tools for the future of work.' },
            ].map((e, i) => (
              <div className="timeline-item" key={e.year} data-aos={i % 2 === 0 ? 'fade-right' : 'fade-left'}>
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


