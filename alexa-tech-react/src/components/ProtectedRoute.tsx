import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../utils/api';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #e3e3e3;
  border-top: 5px solid #0047b3;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 20px;
  color: #666;
  font-size: 16px;
`;

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermissions 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  // Verificar permisos específicos cuando se requieren
  useEffect(() => {
    const checkPermissions = async () => {
      if (!requiredPermissions || !user || user.role === 'ADMIN') {
    // Si no se requieren permisos específicos, o el usuario es admin, permitir acceso
        setHasPermission(true);
        return;
      }

      setPermissionLoading(true);
      try {
        // Verificar cada permiso requerido haciendo peticiones específicas
        let hasAllPermissions = true;
        
        for (const permission of requiredPermissions) {
          let endpoint = '';
          
          // Mapear permisos a endpoints específicos
          if (permission === 'Auditoría y Logs') {
            endpoint = '/audit/logs';
          } else {
            // Para otros permisos, usar el endpoint genérico
            endpoint = '/users/permissions';
          }
          
          try {
            await apiService.get(endpoint);
          } catch (error: any) {
            if (error.response?.status === 403) {
              hasAllPermissions = false;
              break;
            }
          }
        }
        
        setHasPermission(hasAllPermissions);
      } catch (error: any) {
        // Para errores generales, asumir que no tiene permisos
        setHasPermission(false);
      } finally {
        setPermissionLoading(false);
      }
    };

    if (isAuthenticated && !isLoading) {
      checkPermissions();
    }
  }, [requiredPermissions, user, isAuthenticated, isLoading]);

  // Mostrar loading mientras se verifica la autenticación o permisos
  if (isLoading || permissionLoading) {
    return (
      <LoadingContainer>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner />
          <LoadingText>
            {isLoading ? 'Verificando autenticación...' : 'Verificando permisos...'}
          </LoadingText>
        </div>
      </LoadingContainer>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <LoadingContainer>
        <div style={{ textAlign: 'center' }}>
          <LoadingText style={{ color: '#dc3545' }}>
            No tienes permisos para acceder a esta página.
          </LoadingText>
        </div>
      </LoadingContainer>
    );
  }

  // Verificar permisos específicos si son requeridos
  if (requiredPermissions && !hasPermission && user?.role !== 'ADMIN') {
    return (
      <LoadingContainer>
        <div style={{ textAlign: 'center' }}>
          <LoadingText style={{ color: '#dc3545' }}>
            No tienes los permisos necesarios para acceder a esta página.
          </LoadingText>
        </div>
      </LoadingContainer>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;