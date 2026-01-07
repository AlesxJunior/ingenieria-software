import React from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../styles/theme';
import { useAuth } from '../../../auth/context/AuthContext';
import { tokenUtils } from '../../../../utils/api';

const DiagnosticContainer = styled.div`
  background: ${COLORS.neutral[50]};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const DiagnosticTitle = styled.h4`
  margin: 0 0 ${SPACING.sm} 0;
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.base};
`;

const DiagnosticItem = styled.div`
  margin-bottom: ${SPACING.xs};
  display: flex;
  justify-content: space-between;
`;

const StatusBadge = styled.span<{ $status: 'success' | 'error' | 'warning' }>`
  padding: ${SPACING.xs} ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  
  ${props => {
    switch (props.$status) {
      case 'success':
        return `background: ${COLOR_SCALES.success[100]}; color: ${COLOR_SCALES.success[700]}; border: 1px solid ${COLOR_SCALES.success[300]};`;
      case 'error':
        return `background: ${COLOR_SCALES.danger[100]}; color: ${COLOR_SCALES.danger[700]}; border: 1px solid ${COLOR_SCALES.danger[300]};`;
      case 'warning':
        return `background: ${COLOR_SCALES.warning[100]}; color: ${COLOR_SCALES.warning[700]}; border: 1px solid ${COLOR_SCALES.warning[300]};`;
      default:
        return `background: ${COLORS.neutral[100]}; color: ${COLORS.neutral[700]}; border: 1px solid ${COLORS.neutral[300]};`;
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

      {user?.role?.permissions && (
        <DiagnosticItem>
          <span>Permisos del usuario:</span>
          <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            {user.role.permissions.join(', ')}
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