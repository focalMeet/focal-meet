import React, { useEffect } from "react";
import { useMarketingI18n } from "../../i18n/MarketingI18n";

const Pricing: React.FC = () => {
  const { t } = useMarketingI18n();
  useEffect(() => {
    const section = document.querySelector('.pricing-plans');
    const toggle = document.getElementById('billing-toggle') as HTMLInputElement | null;
    if (!toggle || !section) return;
    const monthly = section.querySelectorAll('.monthly');
    const annual = section.querySelectorAll('.annual');
    const priceContainers = section.querySelectorAll('.plan-price');
    const update = () => {
      priceContainers.forEach(el => el.classList.add('switching'));
      window.setTimeout(() => {
        if (toggle.checked) {
          monthly.forEach(el => (el as HTMLElement).style.display = 'none');
          annual.forEach(el => (el as HTMLElement).style.display = 'inline');
        } else {
          monthly.forEach(el => (el as HTMLElement).style.display = 'inline');
          annual.forEach(el => (el as HTMLElement).style.display = 'none');
        }
        window.setTimeout(() => priceContainers.forEach(el => el.classList.remove('switching')), 10);
      }, 150);
    };
    toggle.addEventListener('change', update);
    update();
    return () => toggle.removeEventListener('change', update);
  }, []);
  return (
    <>
      <section className="pricing-hero">
        <div className="container">
          <div className="pricing-hero-content" data-aos="fade-up">
            {/* <h1 className="page-title">Find the Plan That's Right for You</h1> */}
            <p className="page-subtitle">{t.pricing.heroSubtitle}</p>
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
            <span className="toggle-label">{t.pricing.billingMonthly}</span>
            <label className="toggle-switch">
              <input type="checkbox" id="billing-toggle" />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">
              {t.pricing.billingAnnual} <span className="discount-badge">{t.pricing.savePercent}</span>
            </span>
          </div>
          <div className="plans-grid">
            {t.pricing.plans.map((plan, i) => (
              <div
                className={`pricing-card ${plan.primary ? "featured" : ""}`}
                key={plan.name}
                data-aos="fade-up"
                data-aos-delay={(i + 1) * 100}
              >
                {plan.primary && (
                  <div className="popular-badge">{t.pricing.mostPopular}</div>
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
                    {plan.name !== "Basic" ? t.pricing.pricePerMonth : ""}
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
                 <button className={`plan-cta btn ${plan.primary ? "btn-primary" : "btn-secondary"}`}>
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
            <h2 className="section-title">{t.pricing.faqTitle}</h2>
            <p className="section-subtitle">{t.pricing.faqSubtitle}</p>
          </div>
          <div className="faq-list" data-aos="fade-up" data-aos-delay="100">
            {t.pricing.faqs.map(({ q, a }) => (
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
                <div className="faq-answer"><p>{a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-cta">
        <div className="container">
          <div className="cta-content" data-aos="fade-up">
            <h2 className="cta-title">{t.pricing.ctaTitle}</h2>
            <p className="cta-subtitle">{t.pricing.ctaSubtitle}</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">{t.pricing.ctaPrimary}</button>
              <button className="btn btn-secondary">{t.pricing.ctaSecondary}</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
