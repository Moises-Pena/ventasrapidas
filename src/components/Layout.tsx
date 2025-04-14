import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, BarChart3, LogOut, Menu, X, ClipboardList, Users, Receipt, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente principal de layout que gestiona la estructura de la aplicación:
 * navegación superior, menú lateral (responsive), y el contenido principal.
 */
const Layout: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para controlar si el menú móvil está abierto o cerrado
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  /**
   * Maneja el cierre de sesión del usuario.
   * Llama a la función de logout del contexto de autenticación y redirige al login.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Si el usuario no está autenticado, simplemente renderiza el contenido sin layout (Outlet directo)
  if (!isAuthenticated) {
    return <Outlet />;
  }

  /**
   * Verifica si una ruta específica coincide con la ruta actual del navegador.
   * Esto se utiliza para marcar como activa una opción del menú.
   */
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Determina si el usuario autenticado es administrador
  const isAdmin = currentUser?.role === 'admin';

  // Determina si el usuario autenticado es cajero
  const isCashier = currentUser?.role === 'cashier';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm">
        ...
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        ...
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        ...
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
