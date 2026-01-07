/**
 * STATUS BADGE - Componente Unificado de Etiquetas de Estado
 * 
 * Uso:
 * <StatusBadge variant="success">Activo</StatusBadge>
 * <StatusBadge variant="warning" dot>Pendiente</StatusBadge>
 * <StatusBadge variant="danger" size="small">Cancelado</StatusBadge>
 */

import React from 'react';
import styled from 'styled-components';
import { TYPOGRAPHY, COLORS } from '../../styles/theme';

// ============================================================================
// TIPOS
// ============================================================================

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Badge = styled.span<{ $variant: BadgeVariant; $size: BadgeSize; $dot?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '0.2rem 0.5rem';
      case 'large': return '0.5rem 1rem';
      default: return '0.35rem 0.75rem';
    }
  }};
  border-radius: 4px;
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return TYPOGRAPHY.fontSize.xs;
      case 'large': return TYPOGRAPHY.fontSize.body;
      default: return TYPOGRAPHY.fontSize.small;
    }
  }};
  white-space: nowrap;
  text-transform: capitalize;
  letter-spacing: 0.025em;

  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: ${COLORS.successBg};
          color: ${COLORS.successText};
        `;
      case 'warning':
        return `
          background: ${COLORS.warningBg};
          color: ${COLORS.warningText};
        `;
      case 'danger':
        return `
          background: ${COLORS.dangerBg};
          color: ${COLORS.dangerText};
        `;
      case 'info':
        return `
          background: ${COLORS.infoBg};
          color: ${COLORS.infoText};
        `;
      default:
        return `
          background: ${COLORS.borderLight};
          color: ${COLORS.textLight};
        `;
    }
  }}
`;

const BadgeDot = styled.span<{ $variant: BadgeVariant }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'danger': return COLORS.danger;
      case 'info': return COLORS.info;
      default: return COLORS.textLight;
    }
  }};
`;

// ============================================================================
// COMPONENTE
// ============================================================================

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'medium',
  dot = false
}) => (
  <Badge $variant={variant} $size={size} $dot={dot}>
    {dot && <BadgeDot $variant={variant} />}
    {children}
  </Badge>
);

// ============================================================================
// HELPER - Mapeo de estados a variantes
// ============================================================================

export const getStatusVariant = (status: string): BadgeVariant => {
  const statusMap: Record<string, BadgeVariant> = {
    // Estados generales
    activo: 'success',
    active: 'success',
    inactivo: 'danger',
    inactive: 'danger',
    suspendido: 'warning',
    suspended: 'warning',
    pendiente: 'warning',
    pending: 'warning',
    
    // Estados de compras/ventas
    completado: 'success',
    completed: 'success',
    cancelado: 'danger',
    cancelled: 'danger',
    anulado: 'danger',
    enviada: 'info',
    sent: 'info',
    recibida: 'success',
    received: 'success',
    pagada: 'success',
    paid: 'success',
    
    // Estados de inventario
    'stock normal': 'success',
    'stock bajo': 'warning',
    'stock crítico': 'danger',
    
    // Estados de cotización
    cotización: 'info',
    quote: 'info',
    
    // Roles
    sistema: 'info',
    personalizado: 'default',
  };
  
  return statusMap[status.toLowerCase()] || 'default';
};

export default StatusBadge;
