import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  requiredPermission?: string;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredPermissions 
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <LoadingContainer>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner />
          <LoadingText>Verificando autenticación...</LoadingText>
        </div>
      </LoadingContainer>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permiso específico si es requerido
  if (requiredPermission && !hasPermission(requiredPermission)) {
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

  // Verificar permisos múltiples si se especifican (requiere TODOS los permisos)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
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
  }

  return <>{children}</>;
};

export default ProtectedRoute;