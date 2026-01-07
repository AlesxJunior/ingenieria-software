/**
 * COMPONENTE: ActionButtons
 * Botones de acción reutilizables
 * Fase 6 - Task 16
 * 
 * Características:
 * - Tooltips informativos
 * - Estados disabled
 * - Iconos Font Awesome
 * - Variantes: primary/secondary/danger/success/warning
 * - Loading states con spinner
 * - Tamaños: small/medium/large
 * - Responsive design
 */

import React from 'react';
import styled from 'styled-components';

// ==================== TIPOS ====================

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
type ButtonSize = 'small' | 'medium' | 'large';

interface ActionButtonProps {
  label: string;
  icon?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

interface ActionButtonsGroupProps {
  buttons: ActionButtonProps[];
  align?: 'left' | 'center' | 'right';
  gap?: string;
  className?: string;
}

// ==================== STYLED COMPONENTS ====================

const Button = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $loading?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${props => {
    switch (props.$size) {
      case 'small': return '0.375rem 0.75rem';
      case 'large': return '0.75rem 1.5rem';
      default: return '0.5rem 1rem';
    }
  }};
  border: none;
  border-radius: 6px;
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '0.8125rem';
      case 'large': return '1rem';
      default: return '0.875rem';
    }
  }};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  outline: none;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #0047b3;
          color: white;
          &:hover:not(:disabled) {
            background: #003d99;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 71, 179, 0.2);
          }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover:not(:disabled) {
            background: #5a6268;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(108, 117, 125, 0.2);
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover:not(:disabled) {
            background: #c82333;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(220, 53, 69, 0.2);
          }
        `;
      case 'success':
        return `
          background: #28a745;
          color: white;
          &:hover:not(:disabled) {
            background: #218838;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(40, 167, 69, 0.2);
          }
        `;
      case 'warning':
        return `
          background: #ffc107;
          color: #212529;
          &:hover:not(:disabled) {
            background: #e0a800;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(255, 193, 7, 0.2);
          }
        `;
      case 'info':
        return `
          background: #17a2b8;
          color: white;
          &:hover:not(:disabled) {
            background: #138496;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(23, 162, 184, 0.2);
          }
        `;
      default:
        return `
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          &:hover:not(:disabled) {
            background: #e9ecef;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  i {
    font-size: ${props => {
      switch (props.$size) {
        case 'small': return '0.875rem';
        case 'large': return '1.125rem';
        default: return '1rem';
      }
    }};
  }

  ${props => props.$loading && `
    pointer-events: none;
    opacity: 0.7;
  `}
`;

const LoadingSpinner = styled.i`
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;

  &:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`;

const TooltipText = styled.span`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  transition: opacity 0.2s;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #333;
  }
`;

const ButtonsGroup = styled.div<{ $align?: string; $gap?: string }>`
  display: flex;
  align-items: center;
  justify-content: ${props => {
    switch (props.$align) {
      case 'center': return 'center';
      case 'right': return 'flex-end';
      default: return 'flex-start';
    }
  }};
  gap: ${props => props.$gap || '0.75rem'};
  flex-wrap: wrap;
`;

// ==================== COMPONENTS ====================

/**
 * Botón de acción individual
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  variant = 'secondary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  tooltip,
  className,
  type = 'button',
}) => {
  const buttonContent = (
    <Button
      $variant={variant}
      $size={size}
      $loading={loading}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      type={type}
    >
      {loading ? (
        <>
          <LoadingSpinner className="fas fa-spinner" />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          {icon && <i className={`fas ${icon}`}></i>}
          <span>{label}</span>
        </>
      )}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipWrapper>
        {buttonContent}
        <TooltipText className="tooltip-text">{tooltip}</TooltipText>
      </TooltipWrapper>
    );
  }

  return buttonContent;
};

/**
 * Grupo de botones de acción
 */
export const ActionButtonsGroup: React.FC<ActionButtonsGroupProps> = ({
  buttons,
  align = 'left',
  gap,
  className,
}) => {
  return (
    <ButtonsGroup $align={align} $gap={gap} className={className}>
      {buttons.map((button, index) => (
        <ActionButton key={index} {...button} />
      ))}
    </ButtonsGroup>
  );
};

export default ActionButton;
