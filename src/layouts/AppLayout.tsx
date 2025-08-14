import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, isAuthenticated } from '../lib/auth';
import { me } from '../lib/api';
import logoMark from '../assets/logo-mark.svg';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState<{ id: string; email: string } | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isAuthenticated()) { setUser(null); return; }
      setLoadingUser(true);
      try {
        const u = await me();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [location.pathname]);

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
            <nav className="hidden md:flex space-x-4 text-sm text-gray-300 items-center">
              <Link to="/app/dashboard" className="hover:text-white">Dashboard</Link>
              <Link to="/app/live" className="hover:text-white">Live</Link>
                <Link to="/app/upload" className="hover:text-white">Upload</Link>
                <Link to="/app/templates" className="hover:text-white">Templates</Link>
              {user && (
                <span className="text-xs text-gray-400">{loadingUser ? 'Loading...' : user.email}</span>
              )}
              {isAuthenticated() && (
                <button
                  onClick={() => { clearToken(); navigate('/app/login'); }}
                  className="ml-4 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-200"
                >Sign Out</button>
              )}
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


