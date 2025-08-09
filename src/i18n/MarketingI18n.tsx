import React, { createContext, useContext, useMemo, useState } from 'react';
import { Locale, marketingMessages, Messages } from './marketingDict';

type MarketingI18nContextValue = {
  locale: Locale;
  t: Messages;
  setLocale: (l: Locale) => void;
  toggle: () => void;
};

const MarketingI18nContext = createContext<MarketingI18nContextValue | null>(null);

export const MarketingI18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>((() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('marketing_locale') : null;
    if (saved === 'zh' || saved === 'en') return saved;
    const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
    return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  })());

  const t = useMemo(() => marketingMessages[locale], [locale]);

  const api = useMemo<MarketingI18nContextValue>(() => ({
    locale,
    t,
    setLocale: (l) => {
      setLocale(l);
      try { window.localStorage.setItem('marketing_locale', l); } catch {}
    },
    toggle: () => {
      const next = locale === 'en' ? 'zh' : 'en';
      setLocale(next);
      try { window.localStorage.setItem('marketing_locale', next); } catch {}
    },
  }), [locale, t]);

  return (
    <MarketingI18nContext.Provider value={api}>
      {children}
    </MarketingI18nContext.Provider>
  );
};

export const useMarketingI18n = () => {
  const ctx = useContext(MarketingI18nContext);
  if (!ctx) throw new Error('useMarketingI18n must be used within MarketingI18nProvider');
  return ctx;
};


