import React from 'react';
import { useMarketingI18n } from '../../i18n/MarketingI18n';

type BlogMeta = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: { name: string; role: string };
  sections: Array<{ type: string; text?: string; items?: string[]; title?: string; id?: string }>;
};

// Vite import-glob does not support tsconfig path aliases; keep relative path here
const contentModules = import.meta.glob('../../content/blog/*.json', { eager: true }) as Record<string, { default: BlogMeta }>;
const entries: BlogMeta[] = Object.values(contentModules).map((m) => m.default);

function firstParagraphExcerpt(sections: BlogMeta['sections']): string {
  const p = sections.find((s) => s.type === 'p');
  return p?.text || '';
}

const categories = ['All', ...Array.from(new Set(entries.map((e) => e.category)))];

const Blog: React.FC = () => {
  const { t } = useMarketingI18n();
  const featured = entries[0];
  return (
    <>
      <section className="blog-hero">
        <div className="container">
          <div className="blog-hero-content" data-aos="fade-up">
            <h1 className="page-title">{t.blog.title}</h1>
            <p className="page-subtitle">{t.blog.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="blog-content">
        <div className="container">
          <div className="blog-filters" data-aos="fade-up">
            <div className="search-container">
              <input type="text" placeholder={t.blog.searchPlaceholder} className="search-input" />
              <button className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
              </button>
            </div>
            <div className="filter-tags">
              {categories.map((tag, idx) => (
                <button key={tag} className={`filter-tag ${idx === 0 ? 'active' : ''}`}>{tag}</button>
              ))}
            </div>
          </div>

          {featured && (
            <div className="featured-article" data-aos="fade-up" data-aos-delay="100">
              <div className="featured-content">
                <div className="featured-image">
                  <div className="image-placeholder">{t.blog.featuredImagePlaceholder}</div>
                  <span className="featured-badge">{t.blog.featuredBadge}</span>
                </div>
                <div className="featured-text">
                  <div className="article-meta">
                    <span className="article-category">{featured.category}</span>
                    <span className="article-date">{featured.date}</span>
                  </div>
                  <h2 className="featured-title">{featured.title}</h2>
                  <p className="featured-excerpt">{firstParagraphExcerpt(featured.sections)}</p>
                  <a href={`/blog/${featured.slug}`} className="read-more-btn">{t.blog.readFull}</a>
                </div>
              </div>
            </div>
          )}

          <div className="blog-grid">
            {entries.slice(1).map((a, i) => (
              <article className="blog-card" data-aos="fade-up" data-aos-delay={(i % 3 + 1) * 100} key={a.slug}>
                <div className="blog-image"><div className="image-placeholder">Article Image</div></div>
                <div className="blog-content-area">
                  <div className="article-meta">
                    <span className="article-category">{a.category}</span>
                    <span className="article-date">{a.date}</span>
                  </div>
                  <h3 className="blog-title">{a.title}</h3>
                  <p className="blog-excerpt">{firstParagraphExcerpt(a.sections)}</p>
                  <a href={`/blog/${a.slug}`} className="blog-read-more">{t.blog.readMore}</a>
                </div>
              </article>
            ))}
          </div>

          <div className="load-more-container" data-aos="fade-up">
            <button className="btn btn-secondary">{t.blog.loadMore}</button>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content" data-aos="fade-up">
            <h2 className="newsletter-title">{t.blog.newsletterTitle}</h2>
            <p className="newsletter-subtitle">{t.blog.newsletterSubtitle}</p>
            <div className="newsletter-form">
              <input type="email" placeholder={t.blog.newsletterEmailPlaceholder} className="newsletter-input" />
              <button className="btn btn-primary newsletter-btn">{t.blog.newsletterSubscribe}</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;


