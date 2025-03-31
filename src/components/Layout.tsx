import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, BarChart3, LogOut, Menu, X, ClipboardList, Users, Receipt, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isAdmin = currentUser?.role === 'admin';
  const isCashier = currentUser?.role === 'cashier';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-gray-900">VentaRápida</span>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-4">
                  {currentUser?.name} ({currentUser?.role === 'admin' ? 'Administrador' : 'Cajero'})
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Salir
                </button>
              </div>
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {isCashier && (
                  <>
                    <Link
                      to="/"
                      className={`${
                        isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <ShoppingCart className={`${
                        isActive('/') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`} />
                      Ventas
                    </Link>
                    <Link
                      to="/facturas"
                      className={`${
                        isActive('/facturas') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <Receipt className={`${
                        isActive('/facturas') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`} />
                      Búsqueda de Facturas
                    </Link>
                  </>
                )}
                
                {isAdmin && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`${
                        isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <BarChart3 className={`${
                        isActive('/dashboard') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`} />
                      Dashboard
                    </Link>
                    <Link
                      to="/productos"
                      className={`${
                        isActive('/productos') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <Package className={`${
                        isActive('/productos') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`} />
                      Productos
                    </Link>
                    <Link
                      to="/usuarios"
                      className={`${
                        isActive('/usuarios') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <Users className={`${
                        isActive('/usuarios') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`} />
                      Usuarios
                    </Link>
                    <Link
                      to="/reportes"
                      className={`${
                        isActive('/reportes') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <ClipboardList className={`${
                        isActive('/reportes') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-5 w-5`} />
                      Reportes
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                  <span className="ml-2 text-xl font-bold text-gray-900">VentaRápida</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {isCashier && (
                    <>
                      <Link
                        to="/"
                        className={`${
                          isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShoppingCart className={`${
                          isActive('/') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-6 w-6`} />
                        Ventas
                      </Link>
                      <Link
                        to="/facturas"
                        className={`${
                          isActive('/facturas') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Receipt className={`${
                          isActive('/facturas') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-6 w-6`} />
                        Búsqueda de Facturas
                      </Link>
                    </>
                  )}
                  
                  {isAdmin && (
                    <>
                      <Link
                        to="/dashboard"
                        className={`${
                          isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BarChart3 className={`${
                          isActive('/dashboard') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-6 w-6`} />
                        Dashboard
                      </Link>
                      <Link
                        to="/productos"
                        className={`${
                          isActive('/productos') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Package className={`${
                          isActive('/productos') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-6 w-6`} />
                        Productos
                      </Link>
                      <Link
                        to="/usuarios"
                        className={`${
                          isActive('/usuarios') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Users className={`${
                          isActive('/usuarios') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-6 w-6`} />
                        Usuarios
                      </Link>
                      <Link
                        to="/cierres"
                        className={`${
                          isActive('/cierres') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ClipboardList className={`${
                          isActive('/cierres') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-6 w-6`} />
                        Cierres de Caja
                      </Link>
                    </>
                  )}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                    <p className="text-xs font-medium text-gray-500">{currentUser?.role === 'admin' ? 'Administrador' : 'Cajero'}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto flex-shrink-0 bg-red-600 p-1 rounded-full text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default Layout;