import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Delete } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const LoginForm: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
    setError('');
  };
  
  const handleNumberClick = (number: number) => {
    if (pin.length < 6) {
      setPin(prev => prev + number);
      setError('');
    }
  };
  
  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };
  
  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(pin);
      if (success) {
        navigate('/');
      } else {
        setError('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      }
    } catch (error) {
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <ShoppingCart className="h-16 w-16 text-blue-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Ventas Rápidas
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu PIN para acceder
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="pin" className="sr-only">
                PIN
              </label>
              <div className="relative">
                <input
                  id="pin"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-lg text-center"
                  placeholder="Ingresa tu PIN"
                  value={pin}
                  onChange={handlePinChange}
                  maxLength={6}
                  disabled={isLoggingIn}
                />
              </div>
            
              {/* Numeric Keypad */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => handleNumberClick(number)}
                    disabled={isLoggingIn}
                    className="inline-flex justify-center items-center px-4 py-4 border border-gray-300 shadow-sm text-xl font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoggingIn}
                  className="inline-flex justify-center items-center px-4 py-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleNumberClick(0)}
                  disabled={isLoggingIn}
                  className="inline-flex justify-center items-center px-4 py-4 border border-gray-300 shadow-sm text-xl font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoggingIn}
                  className="inline-flex justify-center items-center px-4 py-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <LoadingSpinner size="small" color="text-white" />
              ) : (
                'Ingresar'
              )}
            </button>
          </div>
          
          <div className="text-sm text-center text-gray-500">
            <p>PIN de demostración:</p>
            <p>Admin: 1234 | Cajero: 5678</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;