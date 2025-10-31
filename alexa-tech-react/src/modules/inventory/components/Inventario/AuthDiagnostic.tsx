import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../../auth/context/AuthContext';
import { tokenUtils } from '../../../../utils/api';

const DiagnosticContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const DiagnosticTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1rem;
`;

const DiagnosticItem = styled.div`
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: space-between;
`;

const StatusBadge = styled.span<{ $status: 'success' | 'error' | 'warning' }>`
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${props => {
    switch (props.$status) {
      case 'success':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'error':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'warning':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      default:
        return 'background: #e2e3e5; color: #383d41; border: 1px solid #d6d8db;';
    }
  }}
`;

const AuthDiagnostic: React.FC = () => {
  const { user, isAuthenticated, hasPermission } = useAuth();
  const token = tokenUtils.getAccessToken();
  const isTokenExpired = token ? tokenUtils.isTokenExpired(token) : true;

  // Mostrar siempre para diagnosticar el problema
  // if (import.meta.env.PROD) {
  //   return null;
  // }

  return (
    <DiagnosticContainer>
      <DiagnosticTitle>🔍 Diagnóstico de Autenticación</DiagnosticTitle>
      
      <DiagnosticItem>
        <span>Estado de autenticación:</span>
        <StatusBadge $status={isAuthenticated ? 'success' : 'error'}>
          {isAuthenticated ? 'Autenticado' : 'No autenticado'}
        </StatusBadge>
      </DiagnosticItem>

      <DiagnosticItem>
        <span>Usuario:</span>
        <span>{user ? `${user.firstName} ${user.lastName} (${user.email})` : 'No disponible'}</span>
      </DiagnosticItem>

      <DiagnosticItem>
        <span>Token presente:</span>
        <StatusBadge $status={token ? 'success' : 'error'}>
          {token ? 'Sí' : 'No'}
        </StatusBadge>
      </DiagnosticItem>

      <DiagnosticItem>
        <span>Token válido:</span>
        <StatusBadge $status={!isTokenExpired ? 'success' : 'error'}>
          {!isTokenExpired ? 'Válido' : 'Expirado/Inválido'}
        </StatusBadge>
      </DiagnosticItem>

      <DiagnosticItem>
        <span>Permiso inventory.read:</span>
        <StatusBadge $status={hasPermission('inventory.read') ? 'success' : 'error'}>
          {hasPermission('inventory.read') ? 'Sí' : 'No'}
        </StatusBadge>
      </DiagnosticItem>

      <DiagnosticItem>
        <span>Permiso inventory.update:</span>
        <StatusBadge $status={hasPermission('inventory.update') ? 'success' : 'warning'}>
          {hasPermission('inventory.update') ? 'Sí' : 'No'}
        </StatusBadge>
      </DiagnosticItem>

      {user?.permissions && (
        <DiagnosticItem>
          <span>Permisos del usuario:</span>
          <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            {user.permissions.join(', ')}
          </span>
        </DiagnosticItem>
      )}

      <DiagnosticItem>
        <span>API Base URL:</span>
        <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
          {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
        </span>
      </DiagnosticItem>
    </DiagnosticContainer>
  );
};

export default AuthDiagnostic;