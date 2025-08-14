import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { isAuthenticated } from '../../lib/auth';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!isAuthenticated()) navigate('/app/login');
  }, [navigate]);
  return (
    <Dashboard />
  );
};

export default DashboardPage;


