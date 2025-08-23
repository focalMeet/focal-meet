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
import MeetingsPage from '../views/app/MeetingsPage';
import MeetingDetailPage from '../views/app/MeetingDetailPage';
import LiveRecord from '../components/LiveRecord';
import UploadPage from '../views/app/UploadPage';
import TemplatesPage from '../views/app/TemplatesPage';
import TemplateDetailPage from '../views/app/TemplateDetailPage';
import TemplateCreatePage from '../views/app/TemplateCreatePage';
import AccountPage from '../views/app/AccountPage';

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
    path: '/app/login',
    element: <LoginPage />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'meetings', element: <MeetingsPage /> },
      { path: 'meetings/:id', element: <MeetingDetailPage /> },
      { path: 'live', element: <LiveRecord /> },
      { path: 'upload', element: <UploadPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'templates/new', element: <TemplateCreatePage /> },
      { path: 'templates/:id', element: <TemplateDetailPage /> },
      { path: 'account/*', element: <AccountPage /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export default router;


