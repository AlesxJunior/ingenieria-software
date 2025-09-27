import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService, tokenUtils } from '../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR' | 'CAJERO';
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un token válido al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenUtils.getAccessToken();
      
      if (token && !tokenUtils.isTokenExpired(token)) {
        try {
          // Verificar el token con el backend
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data as User);
          } else {
            // Token inválido, limpiar
            tokenUtils.clearTokens();
            localStorage.removeItem('alexatech_user');
          }
        } catch (error) {
          console.error('Error validating token:', error);
          tokenUtils.clearTokens();
          localStorage.removeItem('alexatech_user');
        }
      } else {
        // Token expirado o no existe
        tokenUtils.clearTokens();
        localStorage.removeItem('alexatech_user');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Llamada real a la API de autenticación
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;
        
        // Guardar tokens
        tokenUtils.setTokens(accessToken, refreshToken);
        
        // Guardar usuario
        setUser(userData as User);
        localStorage.setItem('alexatech_user', JSON.stringify(userData));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Notificar al backend del logout
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar estado local independientemente del resultado
      setUser(null);
      tokenUtils.clearTokens();
      localStorage.removeItem('alexatech_user');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('alexatech_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;