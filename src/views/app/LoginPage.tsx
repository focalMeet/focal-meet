import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../../components/AuthForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AuthForm onAuthSuccess={() => navigate('/app/dashboard')} />
  );
};

export default LoginPage;


