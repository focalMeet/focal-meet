import React from 'react';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, clearToken, getToken } from '../lib/auth';
import { me } from '../lib/api';
import { Sparkles } from 'lucide-react';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState<{ id: string; email: string } | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [currentToken, setCurrentToken] = React.useState<string | null>(getToken());

  // 监听token变化
  React.useEffect(() => {
    const checkTokenChange = () => {
      const newToken = getToken();
      if (newToken !== currentToken) {
        setCurrentToken(newToken);
        setAuthChecked(false);
        if (!newToken && location.pathname !== '/app/login') {
          navigate('/app/login', { replace: true });
        }
      }
    };

    const interval = setInterval(checkTokenChange, 1000);
    return () => clearInterval(interval);
  }, [currentToken, location.pathname, navigate]);

  React.useEffect(() => {
    let cancelled = false;
    
    const checkAuth = async () => {
      // 如果是登录页面，直接跳过认证检查
      if (location.pathname === '/app/login') {
        setAuthChecked(true);
        setLoadingUser(false);
        return;
      }

      // 检查是否有token
      if (!isAuthenticated()) {
        if (!cancelled) {
          setUser(null);
          setAuthChecked(true);
          setLoadingUser(false);
          navigate('/app/login', { replace: true });
        }
        return;
      }

      // 验证token是否有效
      setLoadingUser(true);
      try {
        const u = await me();
        if (!cancelled) {
          setUser(u);
          setAuthChecked(true);
        }
      } catch (error) {
        if (!cancelled) {
          // Token无效，清除并跳转到登录页
          clearToken();
          setUser(null);
          setAuthChecked(true);
          navigate('/app/login', { replace: true });
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, [location.pathname, navigate, currentToken]);

  // 如果正在加载认证状态，显示loading界面
  if (!authChecked || (loadingUser && location.pathname !== '/app/login')) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      <header role="banner" className="flex-none bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Sparkles className="w-8 h-8 text-red-400" />
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
              {/* {isAuthenticated() && (
                <button
                  onClick={() => { clearToken(); navigate('/app/login'); }}
                  className="ml-4 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-200"
                >Sign Out</button>
              )} */}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;


