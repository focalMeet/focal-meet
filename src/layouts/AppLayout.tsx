import React from 'react';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
      <div role="banner" className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img src={logoMark} className="w-8 h-8 mr-2" alt="logo" />
              <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
                Focal Meet
              </span>
            </Link>
            <nav className="hidden md:flex space-x-4 text-sm text-gray-300 items-center">
              <NavLink
                to="/app/dashboard"
                className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/app/meetings"
                className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Meetings
              </NavLink>
              <NavLink
                to="/app/live"
                className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Live
              </NavLink>
              <NavLink
                to="/app/upload"
                className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Upload
              </NavLink>
              <NavLink
                to="/app/templates"
                className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Templates
              </NavLink>
              <NavLink
                to="/app/account"
                className={({ isActive }) => `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Account
              </NavLink>
              {user && (
                <Link to="/app/account" className="text-xs text-gray-300 hover:text-white underline/0 hover:underline">
                  {loadingUser ? 'Loading...' : user.email}
                </Link>
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


