/**
 * COMPONENTE: StatusBadge
 * Badge reutilizable para mostrar estados
 * Fase 6 - Task 15
 * 
 * Características:
 * - Colores dinámicos según status
 * - Soporte para Purchase Orders y Receipts
 * - Variantes: default/success/warning/danger/info
 * - Tamaños: small/medium/large
 * - Iconos opcionales
 * - Responsive design
 */

import React from 'react';
import styled from 'styled-components';
import type { PurchaseOrderStatus, PurchaseReceiptStatus } from '../../types/purchases.types';

// ==================== TIPOS ====================

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'small' | 'medium' | 'large';

interface StatusBadgeProps {
  status: PurchaseOrderStatus | PurchaseReceiptStatus | string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  className?: string;
}

// ==================== MAPEO DE COLORES ====================

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  // Purchase Order Status
  PENDIENTE: 'warning',
  ENVIADA: 'info',
  RECIBIDA: 'success',
  COMPLETADA: 'success',
  ANULADA: 'danger',
  PARCIAL: 'warning',
  
  // Purchase Receipt Status
  CONFIRMADA: 'success',
  
  // Generic
  ACTIVO: 'success',
  INACTIVO: 'default',
  PAGADA: 'success',
  VENCIDA: 'danger',
};

// ==================== STYLED COMPONENTS ====================

const Badge = styled.span<{
  $variant: BadgeVariant;
  $size: BadgeSize;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '0.25rem 0.5rem';
      case 'large': return '0.5rem 1rem';
      default: return '0.375rem 0.75rem';
    }
  }};
  border-radius: 12px;
  font-weight: 500;
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '0.75rem';
      case 'large': return '0.875rem';
      default: return '0.8125rem';
    }
  }};
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  transition: all 0.2s ease;

  ${props => {
    switch (props.$variant) {
      case 'success':
        return `
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'warning':
        return `
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'danger':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'info':
        return `
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
      default:
        return `
          background: #e9ecef;
          color: #495057;
          border: 1px solid #dee2e6;
        `;
    }
  }}

  i {
    font-size: ${props => {
      switch (props.$size) {
        case 'small': return '0.625rem';
        case 'large': return '0.875rem';
        default: return '0.75rem';
      }
    }};
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

// ==================== COMPONENT ====================

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'medium',
  icon,
  className,
}) => {
  // Determinar variante automáticamente si no se proporciona
  const badgeVariant = variant || STATUS_VARIANTS[status] || 'default';

  // Determinar icono por defecto según variante
  const defaultIcon = !icon ? (() => {
    switch (badgeVariant) {
      case 'success': return 'fa-check-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'danger': return 'fa-times-circle';
      case 'info': return 'fa-info-circle';
      default: return undefined;
    }
  })() : icon;

  return (
    <Badge 
      $variant={badgeVariant} 
      $size={size}
      className={className}
    >
      {defaultIcon && <i className={`fas ${defaultIcon}`}></i>}
      <span>{status}</span>
    </Badge>
  );
};

export default StatusBadge;
