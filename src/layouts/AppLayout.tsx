import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import logoMark from '../assets/logo-mark.svg';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div role="banner" className="relative bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src={logoMark} className="w-8 h-8 mr-2" alt="logo" />
              <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
                Focal Meet
              </span>
            </Link>
            <nav className="hidden md:flex space-x-4 text-sm text-gray-300">
              <Link to="/app/dashboard" className="hover:text-white">Dashboard</Link>
            </nav>
          </div>
        </div>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;


