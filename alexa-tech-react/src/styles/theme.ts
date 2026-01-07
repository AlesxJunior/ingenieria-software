/**
 * THEME - Sistema de Diseño Unificado AlexaTech
 * 
 * Este archivo centraliza todas las constantes de diseño del proyecto.
 * Basado en el TemplateUI para mantener consistencia visual.
 * 
 * Uso:
 * import { TYPOGRAPHY, COLORS, SHADOWS, SPACING } from '../styles/theme';
 */

// ============================================================================
// TIPOGRAFÍA DEL SISTEMA
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  
  // Tamaños de fuente
  fontSize: {
    h1: '2rem',
    h2: '1.5rem',
    h3: '1.25rem',
    body: '0.95rem',
    base: '1rem',     // base font size
    small: '0.85rem',
    xs: '0.75rem',
    // Aliases adicionales para compatibilidad
    '2xl': '2rem',    // quoted key for bracket access
    xxl: '2rem',      // = h1
    xl: '1.5rem',     // = h2
    lg: '1.25rem',    // = h3
    md: '0.95rem',    // = body
    sm: '0.85rem',    // = small
  },
  
  // Pesos de fuente
  fontWeight: {
    regular: 400,
    normal: 400,      // alias for regular
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// PALETA DE COLORES DEL SISTEMA
// ============================================================================

// Escalas de colores para uso avanzado
export const COLOR_SCALES = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#3498db',
    600: '#2980b9',
    700: '#1e6ba8',
    800: '#1565c0',
    900: '#0d47a1',
  },
  success: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#28a745',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#f0ad4e',
    600: '#ffa726',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  danger: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#dc3545',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  info: {
    50: '#e1f5fe',
    100: '#b3e5fc',
    200: '#81d4fa',
    300: '#4fc3f7',
    400: '#29b6f6',
    500: '#17a2b8',
    600: '#039be5',
    700: '#0288d1',
    800: '#0277bd',
    900: '#01579b',
  },
  neutral: {
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#6c757d',
    600: '#495057',
    700: '#343a40',
    800: '#212529',
    900: '#000000',
    white: '#ffffff',
  },
} as const;

// Colores principales del sistema (uso directo en componentes)
export const COLORS = {
  // Colores primarios - valores directos
  primary: '#3498db',
  primaryHover: '#2980b9',
  primaryLight: '#e3f2fd',
  
  // Success
  success: '#28a745',
  successBg: '#d4edda',
  successText: '#155724',
  
  // Warning
  warning: '#f0ad4e',
  warningBg: '#fff3cd',
  warningText: '#856404',
  
  // Danger
  danger: '#dc3545',
  dangerBg: '#f8d7da',
  dangerText: '#721c24',
  
  // Info
  info: '#17a2b8',
  infoBg: '#d1ecf1',
  infoText: '#0c5460',
  
  // Purple (para componentes que lo necesitan)
  purple: {
    500: '#8b5cf6',
    700: '#7c3aed',
  },
  
  // Text colors (objeto para compatibilidad con COLORS.text.primary)
  text: {
    primary: '#2c3e50',
    secondary: '#6c757d',
    muted: '#95a5a6',
  },
  textLight: '#6c757d',
  textMuted: '#95a5a6',
  
  // Status colors (para compatibilidad)
  status: {
    success: '#28a745',
    successLight: '#d4edda',
    danger: '#dc3545',
    warning: '#f0ad4e',
  },
  
  // Borders
  border: '#dee2e6',
  borderLight: '#e9ecef',
  
  // Background
  background: '#f8f9fa',
  white: '#ffffff',
  
  // Neutral - referencia a la escala
  neutral: COLOR_SCALES.neutral,
} as const;

// ============================================================================
// SOMBRAS
// ============================================================================

export const SHADOWS = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 12px rgba(0, 0, 0, 0.08)',
  xl: '0 4px 12px rgba(0, 0, 0, 0.15)',
  // Aliases para compatibilidad
  small: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
  large: '0 4px 12px rgba(0, 0, 0, 0.08)',
} as const;

// ============================================================================
// ESPACIADO
// ============================================================================

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  '4xl': '4rem',
  // Aliases para compatibilidad
  xxl: '3rem',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
  // Aliases para compatibilidad
  small: '4px',
  medium: '6px',
  large: '8px',
  round: '50%',
  pill: '9999px',
} as const;

// ============================================================================
// TRANSICIONES
// ============================================================================

export const TRANSITIONS = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
  // Alias para compatibilidad
  default: '0.2s ease',
} as const;

// ============================================================================
// BREAKPOINTS (Mobile First)
// ============================================================================

export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px',
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
} as const;

// ============================================================================
// THEME OBJECT COMPLETO (para styled-components ThemeProvider si se necesita)
// ============================================================================

export const theme = {
  typography: TYPOGRAPHY,
  colors: COLORS,
  shadows: SHADOWS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  transitions: TRANSITIONS,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
} as const;

export type Theme = typeof theme;

export default theme;
