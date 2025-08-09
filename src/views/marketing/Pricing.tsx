import React from "react";

const Pricing: React.FC = () => {
  return (
    <>
      <section className="pricing-hero">
        <div className="container">
          <div className="pricing-hero-content" data-aos="fade-up">
            {/* <h1 className="page-title">Find the Plan That's Right for You</h1> */}
            <p className="page-subtitle">
              Choose from our flexible pricing plans designed to scale with your
              team's needs. Start free and upgrade as you grow.
            </p>
            {/* 移动到价格列表上方 */}
          </div>
        </div>
      </section>

      <section className="pricing-plans">
        <div className="container">
          <div
            className="billing-toggle"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <span className="toggle-label">Monthly</span>
            <label className="toggle-switch">
              <input type="checkbox" id="billing-toggle" />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">
              Annual <span className="discount-badge">Save 20%</span>
            </span>
          </div>
          <div className="plans-grid">
            {[
              {
                name: "Basic",
                desc: "Perfect for small teams getting started",
                monthly: "Free",
                annual: "Free",
                features: [
                  "40-minute meeting limit",
                  "Basic AI transcription",
                  "1GB cloud storage",
                  "Email support",
                ],
                cta: "Get Started Free",
                primary: false,
              },
              {
                name: "Pro",
                desc: "Ideal for growing teams and businesses",
                monthly: "$17.99",
                annual: "$14.99",
                features: [
                  "3 hours meeting duration",
                  "Advanced AI analytics & insights",
                  "Multi-language transcription",
                  "10GB cloud storage",
                  "Priority support",
                ],
                cta: "Start Pro Trial",
                primary: true,
              },
              {
                name: "Enterprise",
                desc: "For large organizations with advanced needs",
                monthly: "$99",
                annual: "$79",
                features: [
                  "Unlimited meeting duration",
                  "Custom AI model training",
                  "Unlimited cloud storage",
                  "Dedicated account manager",
                  "24/7 phone & chat support",
                ],
                cta: "Contact Sales",
                primary: false,
              },
            ].map((plan, i) => (
              <div
                className={`pricing-card ${plan.primary ? "featured" : ""}`}
                key={plan.name}
                data-aos="fade-up"
                data-aos-delay={(i + 1) * 100}
              >
                {plan.primary && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-description">{plan.desc}</p>
                  <div className="plan-price">
                    <span className="price-amount monthly">{plan.monthly}</span>
                    <span
                      className="price-amount annual"
                      style={{ display: "none" }}
                    >
                      {plan.annual}
                    </span>
                    <span className="price-period">
                    {plan.name !== "Basic" ? "/month" : ""}
                    </span>
                  </div>
                </div>
                <div className="plan-features">
                  <ul className="feature-list">
                    {plan.features.map((f) => (
                      <li className="feature-item" key={f}>
                        <svg
                          className="feature-icon"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className={`plan-cta btn ${plan.primary ? "btn-primary" : "btn-secondary"}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <div className="faq-header" data-aos="fade-up">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about our pricing and features
            </p>
          </div>
          <div className="faq-list" data-aos="fade-up" data-aos-delay="100">
            {[
              [
                "Can I switch between plans anytime?",
                "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences.",
              ],
              [
                "Is there a free trial for paid plans?",
                "Yes! We offer a 14-day free trial for both Pro and Enterprise plans. No credit card required to start your trial.",
              ],
              [
                "What payment methods do you accept?",
                "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans.",
              ],
              [
                "How does the AI transcription work?",
                "Our AI transcription uses advanced neural networks to convert speech to text in real-time with 95%+ accuracy. It supports 40+ languages and can identify different speakers.",
              ],
              [
                "Is my data secure and private?",
                "Absolutely. We use end-to-end encryption, comply with GDPR and SOC 2 standards, and never use your data to train our AI models without explicit consent.",
              ],
              [
                "Can I integrate Focal Meet with other tools?",
                "Yes! We offer integrations with popular tools like Slack, Microsoft Teams, Google Calendar, Zoom, and many more. Enterprise plans include API access for custom integrations.",
              ],
            ].map(([q, a]) => (
              <div className="faq-item" key={q}>
                <button className="faq-question">
                  <span>{q}</span>
                  <svg
                    className="faq-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-cta">
        <div className="container">
          <div className="cta-content" data-aos="fade-up">
            <h2 className="cta-title">Ready to Transform Your Meetings?</h2>
            <p className="cta-subtitle">
              Join thousands of teams already using Focal Meet to enhance their
              communication
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Start Free Trial</button>
              <button className="btn btn-secondary">Schedule Demo</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
