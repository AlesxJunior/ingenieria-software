/**
 * BUTTON - Componentes de Botones Unificados
 * 
 * Uso:
 * <Button $variant="primary">Guardar</Button>
 * <Button $variant="danger" disabled>Eliminar</Button>
 * <ActionButton $variant="edit">Editar</ActionButton>
 */

import styled from 'styled-components';
import { TYPOGRAPHY, COLORS, TRANSITIONS, BORDER_RADIUS } from '../../styles/theme';

// ============================================================================
// TIPOS
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
export type ActionButtonVariant = 'view' | 'edit' | 'delete' | 'activate' | 'deactivate' | 'pdf' | 'transition';

export interface ButtonProps {
  $variant?: ButtonVariant;
}

export interface ActionButtonProps {
  $variant?: ActionButtonVariant;
}

// ============================================================================
// BUTTON PRINCIPAL
// ============================================================================

export const Button = styled.button<ButtonProps>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: ${BORDER_RADIUS.medium};
  font-size: ${TYPOGRAPHY.fontSize.body};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: all ${TRANSITIONS.normal};
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${COLORS.primary};
          color: ${COLORS.white};
          &:hover:not(:disabled) {
            background: ${COLORS.primaryHover};
          }
        `;
      case 'success':
        return `
          background: ${COLORS.success};
          color: ${COLORS.white};
          &:hover:not(:disabled) {
            background: #218838;
          }
        `;
      case 'danger':
        return `
          background: ${COLORS.danger};
          color: ${COLORS.white};
          &:hover:not(:disabled) {
            background: #c82333;
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${COLORS.primary};
          border: 1px solid ${COLORS.primary};
          &:hover:not(:disabled) {
            background: ${COLORS.primaryLight};
          }
        `;
      default: // secondary
        return `
          background: ${COLORS.background};
          color: ${COLORS.text};
          border: 1px solid ${COLORS.border};
          &:hover:not(:disabled) {
            background: ${COLORS.borderLight};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ============================================================================
// BUTTON DE ACCIONES (para tablas)
// ============================================================================

export const ActionButton = styled.button<ActionButtonProps>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: ${BORDER_RADIUS.small};
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: all ${TRANSITIONS.normal};
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  ${props => {
    switch (props.$variant) {
      case 'view':
        // Info: #17a2d8, fondo claro #d1ecf1
        return `background: #d1ecf1; color: #17a2d8;`;
      case 'edit':
        // Primary: #3498db
        return `background: #3498db; color: #ffffff;`;
      case 'delete':
        // Danger: #dc3545
        return `background: #dc3545; color: #ffffff;`;
      case 'activate':
        // Success: #28a745
        return `background: #28a745; color: #ffffff;`;
      case 'deactivate':
        // Danger light: fondo #f8d7da, texto #dc3545
        return `background: #f8d7da; color: #dc3545;`;
      case 'pdf':
        // Secondary/gris
        return `background: #6c757d; color: #ffffff;`;
      case 'transition':
        // Success para transiciones de estado
        return `background: #28a745; color: #ffffff;`;
      default:
        return `background: ${COLORS.borderLight}; color: ${COLORS.textLight};`;
    }
  }}

  &:hover:not(:disabled) {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// ============================================================================
// BUTTON GROUP
// ============================================================================

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export default Button;
