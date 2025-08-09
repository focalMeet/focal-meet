import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-3">Page not found</h1>
        <p className="text-gray-500 mb-6">No match for {location.pathname}</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn btn-secondary">Go Home</Link>
          <Link to="/app/login" className="btn btn-primary">Go to App</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


