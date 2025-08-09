import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router/index';
import './index.css';
import '@styles/index.scss';
import { MarketingI18nProvider } from './i18n/MarketingI18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MarketingI18nProvider>
      <RouterProvider router={router} />
    </MarketingI18nProvider>
  </StrictMode>
);
