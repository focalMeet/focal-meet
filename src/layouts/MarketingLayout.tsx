import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useMarketingI18n } from '../i18n/MarketingI18n';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/marketing.scss';

const MarketingLayout: React.FC = () => {
  const { t, toggle } = useMarketingI18n();
  const location = useLocation();

  useEffect(() => {
    // Fonts
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(pre1);
    document.head.appendChild(pre2);
    document.head.appendChild(font);

    // AOS
    (window as unknown as { AOS?: typeof AOS }).AOS = AOS;
    AOS.init({ duration: 1000, easing: 'ease-out-cubic', once: true, offset: 100 });

    // Header scroll effect
    const onScroll = () => {
      const header = document.querySelector('header');
      const scrolled = window.pageYOffset;
      if (scrolled > 50) header?.classList.add('scrolled');
      else header?.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll);
    onScroll();

    // Smooth scroll for internal anchors (within same page)
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute('href')?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    document.addEventListener('click', onClick);

    // Button ripple effect
    const onButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.btn, .btn-contact') as HTMLElement | null;
      if (!button) return;
      if (button.classList.contains('btn-no-ripple')) return;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = (e as MouseEvent).clientX - rect.left - size / 2;
      const y = (e as MouseEvent).clientY - rect.top - size / 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add('ripple');
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };
    document.addEventListener('click', onButtonClick);

    // Pricing toggle
    const toggleBilling = () => {
      const toggle = document.getElementById('billing-toggle') as HTMLInputElement | null;
      const monthly = document.querySelectorAll('.monthly');
      const annual = document.querySelectorAll('.annual');
      if (!toggle) return;
      const update = () => {
        if (toggle.checked) {
          monthly.forEach((el) => ((el as HTMLElement).style.display = 'none'));
          annual.forEach((el) => ((el as HTMLElement).style.display = 'inline'));
        } else {
          monthly.forEach((el) => ((el as HTMLElement).style.display = 'inline'));
          annual.forEach((el) => ((el as HTMLElement).style.display = 'none'));
        }
      };
      toggle.addEventListener('change', update);
      update();
    };
    toggleBilling();

    // FAQ accordion
    const setupFaq = () => {
      const items = Array.from(document.querySelectorAll('.faq-item'));
      items.forEach((item) => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          items.forEach((it) => it.classList.remove('active'));
          if (!isActive) item.classList.add('active');
        });
      });
    };
    setupFaq();

    // Blog filters and search
    const setupBlog = () => {
      const filterTags = document.querySelectorAll('.filter-tag');
      const blogCards = document.querySelectorAll('.blog-card');
      const searchInput = document.querySelector('.search-input') as HTMLInputElement | null;
      const searchBtn = document.querySelector('.search-btn');
      if (filterTags.length) {
        filterTags.forEach((tag) => {
          tag.addEventListener('click', (ev) => {
            filterTags.forEach((t) => t.classList.remove('active'));
            const self = ev.currentTarget as HTMLElement;
            self.classList.add('active');
            const value = self.textContent?.trim() || 'All';
            blogCards.forEach((card) => {
              const cat = card.querySelector('.article-category')?.textContent?.trim();
              (card as HTMLElement).style.display = value === 'All' || cat === value ? 'block' : 'none';
            });
          });
        });
      }
      const performSearch = () => {
        if (!searchInput) return;
        const term = searchInput.value.toLowerCase();
        blogCards.forEach((card) => {
          const title = card.querySelector('.blog-title')?.textContent?.toLowerCase() || '';
          const excerpt = card.querySelector('.blog-excerpt')?.textContent?.toLowerCase() || '';
          (card as HTMLElement).style.display = title.includes(term) || excerpt.includes(term) ? 'block' : 'none';
        });
      };
      searchBtn?.addEventListener('click', performSearch);
      searchInput?.addEventListener('keypress', (e) => {
        if ((e as KeyboardEvent).key === 'Enter') performSearch();
      });
    };
    setupBlog();

    // Loaded state
    const onLoad = () => document.body.classList.add('loaded');
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      document.removeEventListener('click', onButtonClick);
      try { document.head.removeChild(pre1); } catch { /* noop */ }
      try { document.head.removeChild(pre2); } catch { /* noop */ }
      try { document.head.removeChild(font); } catch { /* noop */ }
    };
  }, []);

  // Scroll to top on route change (for Home/About/Features/Blog/Pricing)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="marketing">
      <header>
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <div className="nav-left">
                <Link to="/" className="logo"><span>Focal Meet</span></Link>
                <ul className="nav-links">
                  <li><Link to="/">{t.nav.home}</Link></li>
                  <li><Link to="/about">{t.nav.about}</Link></li>
                  <li><Link to="/features">{t.nav.features}</Link></li>
                  <li><Link to="/blog">{t.nav.blog}</Link></li>
                  <li><Link to="/pricing">{t.nav.pricing}</Link></li>
                </ul>
              </div>
              <div className="nav-right">
                <button className="btn btn-secondary btn-no-ripple" onClick={toggle} aria-label="switch-language">
                  {t.nav.switch}
                </button>
                <Link to="/app/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>{t.nav.signIn}</Link>
                {/* <button className="btn-contact">Contact Us</button> */}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-container">
            <div className="footer-logo" data-aos="fade-up">
              <span className="logo-text">Focal Meet</span>
              <p className="footer-tagline">{t.footer.tagline}</p>
            </div>

            <div className="footer-links" data-aos="fade-up" data-aos-delay="100">
              <div className="footer-column">
                <h4 className="footer-column-title">{t.footer.columns.exploreTitle}</h4>
                <ul className="footer-link-list">
                  <li><a href="#home">{t.footer.columns.explore.home}</a></li>
                  <li><a href="#about">{t.footer.columns.explore.about}</a></li>
                  <li><a href="#features">{t.footer.columns.explore.features}</a></li>
                  <li><a href="#pricing">{t.footer.columns.explore.pricing}</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4 className="footer-column-title">{t.footer.columns.supportTitle}</h4>
                <ul className="footer-link-list">
                  <li><a href="#contact">{t.footer.columns.support.contact}</a></li>
                  <li><a href="#faq">{t.footer.columns.support.faq}</a></li>
                  <li><a href="#help">{t.footer.columns.support.help}</a></li>
                  <li><a href="#documentation">{t.footer.columns.support.docs}</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4 className="footer-column-title">{t.footer.columns.othersTitle}</h4>
                <ul className="footer-link-list">
                  <li><a href="#style-guide">{t.footer.columns.others.styleGuide}</a></li>
                  <li><a href="#blog">{t.footer.columns.others.blog}</a></li>
                  <li><a href="#instructions">{t.footer.columns.others.instructions}</a></li>
                  <li><a href="#changelog">{t.footer.columns.others.changelog}</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4 className="footer-column-title">{t.footer.columns.utilityTitle}</h4>
                <ul className="footer-link-list">
                  <li><a href="#password">{t.footer.columns.utility.password}</a></li>
                  <li><a href="#license">{t.footer.columns.utility.license}</a></li>
                  <li><a href="#privacy">{t.footer.columns.utility.privacy}</a></li>
                  <li><a href="#terms">{t.footer.columns.utility.terms}</a></li>
                </ul>
              </div>
            </div>

            <div className="footer-social" data-aos="fade-up" data-aos-delay="200">
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
                <a href="#" className="social-link" aria-label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom" data-aos="fade-up" data-aos-delay="300">
            <div className="footer-bottom-content">
              <p className="copyright">Copyright © {new Date().getFullYear()} Design & Developed by <span className="highlight">Focal Meet Team</span></p>
              <div className="footer-bottom-links">
                <a href="#privacy">{t.footer.bottom.privacy}</a>
                <a href="#terms">{t.footer.bottom.terms}</a>
                <a href="#cookies">{t.footer.bottom.cookies}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;


