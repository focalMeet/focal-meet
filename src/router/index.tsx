import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MarketingLayout from '../layouts/MarketingLayout';
import AppLayout from '../layouts/AppLayout';
import Home from '../views/marketing/Home';
import About from '../views/marketing/About';
import Features from '../views/marketing/Features';
import Pricing from '../views/marketing/Pricing';
import Blog from '../views/marketing/Blog';
import BlogDetail from '../views/marketing/BlogDetail';
import NotFound from '../views/NotFound';
import LoginPage from '../views/app/LoginPage';
import DashboardPage from '../views/app/DashboardPage';
import MeetingDetailPage from '../views/app/MeetingDetailPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'features', element: <Features /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <BlogDetail /> },
    ],
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'meetings/:id', element: <MeetingDetailPage /> },
    ],
  },
]);

// Fallback route
router.routes.push({ path: '*', element: <NotFound /> } as any);

export default router;


