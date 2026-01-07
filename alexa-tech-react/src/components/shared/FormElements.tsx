/**
 * FORM ELEMENTS - Componentes de Formulario Unificados
 * 
 * Uso:
 * <FormGroup>
 *   <Label>Email <RequiredMark>*</RequiredMark></Label>
 *   <Input type="email" $hasError={true} />
 *   <ValidationMessage $type="error">Email inválido</ValidationMessage>
 * </FormGroup>
 */

import styled, { keyframes, css } from 'styled-components';
import { TYPOGRAPHY, COLORS, TRANSITIONS, BORDER_RADIUS } from '../../styles/theme';

// ============================================================================
// ANIMACIONES
// ============================================================================

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

// ============================================================================
// TIPOS
// ============================================================================

export interface InputProps {
  $hasError?: boolean;
  $isValid?: boolean;
}

export interface ValidationMessageProps {
  $type: 'error' | 'success' | 'hint';
}

// ============================================================================
// FORM GROUP
// ============================================================================

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

// ============================================================================
// LABEL
// ============================================================================

export const Label = styled.label`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.text};
`;

export const RequiredMark = styled.span`
  color: ${COLORS.danger};
  margin-left: 2px;
`;

// ============================================================================
// INPUT
// ============================================================================

export const Input = styled.input<InputProps>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.75rem 1rem;
  border: 2px solid ${props => {
    if (props.$hasError) return COLORS.danger;
    if (props.$isValid) return COLORS.success;
    return COLORS.border;
  }};
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text};
  background: ${COLORS.white};
  transition: all ${TRANSITIONS.normal};
  
  ${props => props.$hasError && css`
    animation: ${shake} 0.3s ease;
  `}

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.$hasError) return COLORS.danger;
      if (props.$isValid) return COLORS.success;
      return COLORS.primary;
    }};
    box-shadow: 0 0 0 3px ${props => {
      if (props.$hasError) return COLORS.dangerBg;
      if (props.$isValid) return COLORS.successBg;
      return COLORS.primaryLight;
    }};
  }

  &::placeholder {
    color: ${COLORS.textMuted};
  }

  &:disabled {
    background: ${COLORS.background};
    cursor: not-allowed;
  }
`;

// ============================================================================
// SELECT
// ============================================================================

export interface SelectProps extends InputProps, React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = styled.select<SelectProps>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$hasError ? COLORS.danger : COLORS.border};
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text};
  background: ${COLORS.white};
  cursor: pointer;
  transition: all ${TRANSITIONS.normal};

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? COLORS.danger : COLORS.primary};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? COLORS.dangerBg : COLORS.primaryLight};
  }
`;

// ============================================================================
// VALIDATION MESSAGE
// ============================================================================

export const ValidationMessage = styled.span<ValidationMessageProps>`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  ${props => {
    switch (props.$type) {
      case 'error':
        return `color: ${COLORS.danger};`;
      case 'success':
        return `color: ${COLORS.success};`;
      case 'hint':
        return `color: ${COLORS.textMuted};`;
    }
  }}
`;

// ============================================================================
// INPUT WRAPPER (para iconos, password toggle, etc.)
// ============================================================================

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  input {
    width: 100%;
  }
`;

// ============================================================================
// PASSWORD TOGGLE
// ============================================================================

export const PasswordToggle = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${COLORS.textMuted};
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color ${TRANSITIONS.normal};
  z-index: 1;
  
  &:hover {
    color: ${COLORS.text};
  }
  
  &:focus {
    outline: none;
    color: ${COLORS.primary};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// ============================================================================
// TEXTAREA
// ============================================================================

export const Textarea = styled.textarea<InputProps>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.75rem 1rem;
  border: 2px solid ${props => {
    if (props.$hasError) return COLORS.danger;
    if (props.$isValid) return COLORS.success;
    return COLORS.border;
  }};
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text};
  background: ${COLORS.white};
  transition: all ${TRANSITIONS.normal};
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => {
      if (props.$hasError) return COLORS.danger;
      if (props.$isValid) return COLORS.success;
      return COLORS.primary;
    }};
    box-shadow: 0 0 0 3px ${props => {
      if (props.$hasError) return COLORS.dangerBg;
      if (props.$isValid) return COLORS.successBg;
      return COLORS.primaryLight;
    }};
  }

  &::placeholder {
    color: ${COLORS.textMuted};
  }

  &:disabled {
    background: ${COLORS.background};
    cursor: not-allowed;
  }
`;
