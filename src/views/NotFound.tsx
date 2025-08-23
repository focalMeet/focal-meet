import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LogIn } from 'lucide-react';

const NotFound: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="text-center relative">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">页面未找到</h2>
          <p className="text-gray-400 mb-8">访问的路径 <code className="text-red-400 bg-white/10 px-2 py-1 rounded">{location.pathname}</code> 不存在</p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10 hover:border-white/20"
          >
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Link>
          <Link 
            to="/app/login" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all"
          >
            <LogIn className="w-4 h-4 mr-2" />
            前往应用
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


