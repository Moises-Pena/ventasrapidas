import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import { useSales } from '../context/SalesContext';

const LoginPage: React.FC = () => {
  // Desestructura los valores necesarios desde el contexto de autenticación (AuthContext) y ventas (SalesContext)
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const { currentRegister, loading: registerLoading } = useSales();
  
  // Hook para navegar entre rutas
  const navigate = useNavigate();

  /**
   * Hook de efecto que se ejecuta al cargar el componente.
   * Realiza la redirección basada en el estado de autenticación y rol del usuario.
   * Si el usuario está autenticado, redirige a la página correspondiente según su rol ('admin' o 'cashier').
   */
  useEffect(() => {
    // Si los datos de autenticación o registro están cargándose, no realiza nada
    if (isLoading || registerLoading) return;
    
    // Si el usuario está autenticado, redirige a la página correspondiente según su rol
    if (isAuthenticated) {
      if (currentUser?.role === 'admin') {
        // Redirige al admin a la página de productos
        navigate('/productos');
      } else if (currentUser?.role === 'cashier') {
        // Redirige al cajero a la página principal
        navigate('/');
      }
    }
  }, [isAuthenticated, currentUser, navigate, isLoading, registerLoading]);

  // Renderiza el formulario de inicio de sesión
  return <LoginForm />;
};

export default LoginPage;
