import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Dashboard onLogout={() => navigate('/app/login')} />
  );
};

export default DashboardPage;


