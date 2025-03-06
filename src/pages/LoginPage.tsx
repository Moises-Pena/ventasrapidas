import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import { useSales } from '../context/SalesContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const { currentRegister, loading: registerLoading } = useSales();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || registerLoading) return;
    
    if (isAuthenticated) {
      if (currentUser?.role === 'admin') {
        navigate('/productos');
      } else if (currentUser?.role === 'cashier') {
        navigate('/');
      }
    }
  }, [isAuthenticated, currentUser, navigate, isLoading, registerLoading]);

  return <LoginForm />;
};

export default LoginPage;