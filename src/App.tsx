import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { SalesProvider, useSales } from './context/SalesContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SalesPage from './pages/SalesPage';
import ProductsPage from './pages/ProductsPage';
import ClosingsPage from './pages/ReportsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import LoadingSpinner from './components/LoadingSpinner';

// Protected route component for any authenticated user
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin-only route component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Cashier-only route component
const CashierRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();
  const { currentRegister, loading: registerLoading } = useSales();
  
  if (isLoading || registerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser?.role !== 'cashier') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <SalesProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={
                  <CashierRoute>
                    <SalesPage />
                  </CashierRoute>
                } />
                <Route path="facturas" element={
                  <ProtectedRoute>
                    <ReceiptsPage />
                  </ProtectedRoute>
                } />
                <Route path="productos" element={
                  <AdminRoute>
                    <ProductsPage />
                  </AdminRoute>
                } />
                <Route path="dashboard" element={
                  <AdminRoute>
                    <DashboardPage />
                  </AdminRoute>
                } />
                <Route path="usuarios" element={
                  <AdminRoute>
                    <UsersPage />
                  </AdminRoute>
                } />
                <Route path="cierres" element={
                  <AdminRoute>
                    <ClosingsPage />
                  </AdminRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SalesProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;