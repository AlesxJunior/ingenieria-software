import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService, tokenUtils } from '../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  permissions?: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
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
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;
        
        tokenUtils.setTokens(accessToken, refreshToken);
        setUser(userData as User);
        localStorage.setItem('alexatech_user', JSON.stringify(userData));
        
        return true;
      }
      
      // Si la API devuelve un error, pero no es una excepción (ej: 401 Unauthorized)
      throw new Error(response.message || 'Usuario o contraseña incorrectos');
    } catch (error: any) {
      console.error('Login error:', error);
      // Re-lanzar el error para que el componente de UI pueda manejarlo
      throw new Error(error.message || 'Error al conectar con el servidor. Inténtalo de nuevo.');
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

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;

    const perms = user.permissions;

    if (perms.includes(permission)) return true;

    // Compatibilidad de alias entre clients.* y commercial_entities.*
    const legacyAliases: Record<string, string> = {
      'commercial_entities.read': 'clients.read',
      'commercial_entities.create': 'clients.create',
      'commercial_entities.update': 'clients.update',
    };

    const legacy = legacyAliases[permission];
    if (legacy && perms.includes(legacy)) return true;

    const reverse = Object.entries(legacyAliases).find(([, old]) => old === permission);
    if (reverse && perms.includes(reverse[0])) return true;

    return false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    hasPermission
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