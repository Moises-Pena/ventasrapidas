import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUserByPin, initializeDemoUsers } from '../firebase/services';

interface AuthContextType {
  currentUser: User | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize demo users
    const initialize = async () => {
      await initializeDemoUsers();
      
      // Check for saved user in localStorage
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };
    
    initialize();
  }, []);

  const login = async (pin: string): Promise<boolean> => {
    try {
      const user = await getUserByPin(pin);
      
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};