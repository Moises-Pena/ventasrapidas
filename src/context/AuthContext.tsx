import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUserByPin, initializeDemoUsers } from '../firebase/services';

interface AuthContextType {
  currentUser: User | null; // Usuario actualmente autenticado
  login: (pin: string) => Promise<boolean>; // Función de inicio de sesión
  logout: () => void; // Función de cierre de sesión
  isAuthenticated: boolean; // Indicador de si el usuario está autenticado
  isLoading: boolean; // Indicador de si los datos están cargando
}

// Creación del contexto para la autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor que envuelve la aplicación y proporciona el contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Estado para el usuario actual
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado que indica si el usuario está autenticado
  const [isLoading, setIsLoading] = useState(true); // Estado que indica si los datos de autenticación están cargando

  useEffect(() => {
    // Función de inicialización que se ejecuta una vez al montar el componente
    const initialize = async () => {
      // Inicializa los usuarios demo, si es necesario
      await initializeDemoUsers();
      
      // Intenta recuperar el usuario guardado en sessionStorage
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser)); // Establece el usuario en el estado
        setIsAuthenticated(true); // Marca que el usuario está autenticado
      }
      
      setIsLoading(false); // Termina el proceso de carga
    };
    
    initialize(); // Llama a la función de inicialización
  }, []); // Se ejecuta solo una vez al montar el componente

  // Función de login que intenta obtener el usuario usando el PIN proporcionado
  const login = async (pin: string): Promise<boolean> => {
    try {
      const user = await getUserByPin(pin); // Busca al usuario por el PIN

      if (user) {
        setCurrentUser(user); // Establece el usuario en el estado
        setIsAuthenticated(true); // Marca que el usuario está autenticado
        sessionStorage.setItem('currentUser', JSON.stringify(user)); // Guarda al usuario en sessionStorage
        return true; // Devuelve verdadero si el login fue exitoso
      }

      return false; // Devuelve falso si no se encontró el usuario
    } catch (error) {
      console.error('Error during login:', error); // Manejo de errores
      return false; // Devuelve falso si ocurrió un error
    }
  };

  // Función de logout que elimina al usuario del estado y sessionStorage
  const logout = () => {
    setCurrentUser(null); // Elimina al usuario del estado
    setIsAuthenticated(false); // Marca que el usuario no está autenticado
    sessionStorage.removeItem('currentUser'); // Elimina al usuario de sessionStorage
  };

  return (
    // Proveedor del contexto que envuelve los hijos y proporciona el estado y funciones de autenticación
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated, isLoading }}>
      {children} {/* Los hijos del proveedor recibirán el contexto */}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext); // Obtiene el contexto

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider'); // Error si el hook se usa fuera del proveedor
  }

  return context; // Devuelve el contexto con los valores y funciones disponibles
};
