/**
 * TEMPLATE UI - Guía de Componentes del Proyecto
 * 
 * Esta página sirve como referencia visual para el diseño unificado
 * de todas las páginas del sistema AlexaTech.
 * 
 * Ruta: /template-ui (solo desarrollo)
 */

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Layout from '../components/Layout';

// ============================================================================
// TIPOGRAFÍA DEL SISTEMA
// ============================================================================

const TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  
  // Tamaños
  h1: '2rem',
  h2: '1.5rem',
  h3: '1.25rem',
  body: '0.95rem',
  small: '0.85rem',
  xs: '0.75rem',
  
  // Pesos
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// ============================================================================
// PALETA DE COLORES DEL SISTEMA
// ============================================================================

const COLORS = {
  // Primarios
  primary: '#3498db',
  primaryHover: '#2980b9',
  primaryLight: '#e3f2fd',
  
  // Estados
  success: '#28a745',
  successBg: '#d4edda',
  successText: '#155724',
  
  warning: '#f0ad4e',
  warningBg: '#fff3cd',
  warningText: '#856404',
  
  danger: '#dc3545',
  dangerBg: '#f8d7da',
  dangerText: '#721c24',
  
  info: '#17a2b8',
  infoBg: '#d1ecf1',
  infoText: '#0c5460',
  
  // Neutros
  text: '#2c3e50',
  textLight: '#6c757d',
  textMuted: '#95a5a6',
  border: '#dee2e6',
  borderLight: '#e9ecef',
  background: '#f8f9fa',
  white: '#ffffff',
};

// ============================================================================
// COMPONENTE: StatusBadge (PATRÓN UNIFICADO)
// ============================================================================

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
type BadgeSize = 'small' | 'medium' | 'large';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

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
  font-weight: ${TYPOGRAPHY.medium};
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return TYPOGRAPHY.xs;
      case 'large': return TYPOGRAPHY.body;
      default: return TYPOGRAPHY.small;
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

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
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
// ANIMACIONES
// ============================================================================

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

// ============================================================================
// COMPONENTE: Notification Toast (PATRÓN UNIFICADO)
// ============================================================================

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
}

const NotificationContainer = styled.div<{ $type: NotificationType }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  font-family: ${TYPOGRAPHY.fontFamily};
  min-width: 320px;
  max-width: 420px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease forwards;
  
  ${props => {
    switch (props.$type) {
      case 'success':
        return `
          background: ${COLORS.white};
          border-left: 4px solid ${COLORS.success};
        `;
      case 'error':
        return `
          background: ${COLORS.white};
          border-left: 4px solid ${COLORS.danger};
        `;
      case 'warning':
        return `
          background: ${COLORS.white};
          border-left: 4px solid ${COLORS.warning};
        `;
      case 'info':
        return `
          background: ${COLORS.white};
          border-left: 4px solid ${COLORS.info};
        `;
    }
  }}
`;

const NotificationIcon = styled.div<{ $type: NotificationType }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: ${TYPOGRAPHY.bold};
  
  ${props => {
    switch (props.$type) {
      case 'success':
        return `background: ${COLORS.successBg}; color: ${COLORS.success};`;
      case 'error':
        return `background: ${COLORS.dangerBg}; color: ${COLORS.danger};`;
      case 'warning':
        return `background: ${COLORS.warningBg}; color: ${COLORS.warning};`;
      case 'info':
        return `background: ${COLORS.infoBg}; color: ${COLORS.info};`;
    }
  }}
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: ${TYPOGRAPHY.semibold};
  font-size: ${TYPOGRAPHY.body};
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
`;

const NotificationMessage = styled.div`
  font-size: ${TYPOGRAPHY.small};
  color: ${COLORS.textLight};
  line-height: 1.4;
`;

const NotificationClose = styled.button`
  background: none;
  border: none;
  color: ${COLORS.textMuted};
  cursor: pointer;
  padding: 0;
  font-size: 18px;
  line-height: 1;
  
  &:hover {
    color: ${COLORS.text};
  }
`;

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success': return '✓';
    case 'error': return '✕';
    case 'warning': return '!';
    case 'info': return 'i';
  }
};

const Notification: React.FC<NotificationProps> = ({ type, title, message }) => (
  <NotificationContainer $type={type}>
    <NotificationIcon $type={type}>{getNotificationIcon(type)}</NotificationIcon>
    <NotificationContent>
      <NotificationTitle>{title}</NotificationTitle>
      {message && <NotificationMessage>{message}</NotificationMessage>}
    </NotificationContent>
    <NotificationClose>×</NotificationClose>
  </NotificationContainer>
);

// ============================================================================
// COMPONENTE: Form Validation (PATRÓN UNIFICADO)
// ============================================================================

interface InputProps {
  $hasError?: boolean;
  $isValid?: boolean;
}

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-weight: ${TYPOGRAPHY.medium};
  font-size: ${TYPOGRAPHY.small};
  color: ${COLORS.text};
`;

const RequiredMark = styled.span`
  color: ${COLORS.danger};
  margin-left: 2px;
`;

const Input = styled.input<InputProps>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.75rem 1rem;
  border: 2px solid ${props => {
    if (props.$hasError) return COLORS.danger;
    if (props.$isValid) return COLORS.success;
    return COLORS.border;
  }};
  border-radius: 8px;
  font-size: ${TYPOGRAPHY.body};
  color: ${COLORS.text};
  background: ${COLORS.white};
  transition: all 0.2s ease;
  
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

const Select = styled.select<InputProps>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$hasError ? COLORS.danger : COLORS.border};
  border-radius: 8px;
  font-size: ${TYPOGRAPHY.body};
  color: ${COLORS.text};
  background: ${COLORS.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? COLORS.danger : COLORS.primary};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? COLORS.dangerBg : COLORS.primaryLight};
  }
`;

const ValidationMessage = styled.span<{ $type: 'error' | 'success' | 'hint' }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: ${TYPOGRAPHY.xs};
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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  input {
    width: 100%;
  }
`;

const PasswordToggle = styled.button`
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
  transition: color 0.2s;
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
// STYLED COMPONENTS - LAYOUT BASE
// ============================================================================

const Container = styled.div`
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.text};
  margin: 0;
  font-size: ${TYPOGRAPHY.h1};
  font-weight: ${TYPOGRAPHY.bold};
`;

const PageSubtitle = styled.p`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.textLight};
  margin: 0.5rem 0 0 0;
  font-size: ${TYPOGRAPHY.body};
`;

// ============================================================================
// STYLED COMPONENTS - FILTROS Y BÚSQUEDA
// ============================================================================

const FiltersCard = styled.div`
  background: ${COLORS.white};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${COLORS.border};
  margin-bottom: 1.5rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  flex: 1;
`;

// ============================================================================
// STYLED COMPONENTS - STATS CARDS
// ============================================================================

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $color?: string }>`
  background: ${COLORS.white};
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${COLORS.border};
  border-left: 4px solid ${props => props.$color || COLORS.primary};
  transition: box-shadow 0.2s ease;
  text-align: center;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const StatValue = styled.div<{ $color?: string }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: 2rem;
  font-weight: ${TYPOGRAPHY.bold};
  color: ${props => props.$color || COLORS.text};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: ${TYPOGRAPHY.small};
  color: ${COLORS.textLight};
  font-weight: ${TYPOGRAPHY.medium};
`;

// ============================================================================
// STYLED COMPONENTS - TABLA
// ============================================================================

const TableContainer = styled.div`
  background: ${COLORS.white};
  border-radius: 8px;
  border: 1px solid ${COLORS.border};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const Thead = styled.thead`
  background: ${COLORS.background};
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: ${TYPOGRAPHY.semibold};
  font-size: ${TYPOGRAPHY.small};
  color: ${COLORS.textLight};
  border-bottom: 1px solid ${COLORS.border};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.borderLight};
  }

  &:hover {
    background: ${COLORS.background};
  }
`;

const Td = styled.td`
  padding: 1rem;
  font-size: ${TYPOGRAPHY.body};
  color: ${COLORS.text};
`;

// ============================================================================
// STYLED COMPONENTS - BOTONES
// ============================================================================

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: ${TYPOGRAPHY.body};
  font-weight: ${TYPOGRAPHY.medium};
  cursor: pointer;
  transition: all 0.2s ease;
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
      default:
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

const ActionButton = styled.button<{ $variant?: 'view' | 'edit' | 'delete' | 'activate' | 'deactivate' }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: ${TYPOGRAPHY.small};
  font-weight: ${TYPOGRAPHY.medium};
  cursor: pointer;
  transition: all 0.2s;

  ${props => {
    switch (props.$variant) {
      case 'view':
        return `background: ${COLORS.infoBg}; color: ${COLORS.infoText};`;
      case 'edit':
        return `background: ${COLORS.primary}; color: ${COLORS.white};`;
      case 'delete':
        return `background: ${COLORS.dangerBg}; color: ${COLORS.dangerText};`;
      case 'activate':
        return `background: ${COLORS.successBg}; color: ${COLORS.successText};`;
      case 'deactivate':
        return `background: ${COLORS.warningBg}; color: ${COLORS.warningText};`;
      default:
        return `background: ${COLORS.borderLight}; color: ${COLORS.textLight};`;
    }
  }}

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ============================================================================
// STYLED COMPONENTS - PAGINACIÓN
// ============================================================================

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid ${COLORS.border};
  flex-wrap: wrap;
  gap: 1rem;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const PaginationInfo = styled.span`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.small};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.$active ? COLORS.primary : COLORS.border};
  background: ${props => props.$active ? COLORS.primary : COLORS.white};
  color: ${props => props.$active ? COLORS.white : COLORS.text};
  border-radius: 4px;
  cursor: pointer;
  font-size: ${TYPOGRAPHY.small};
  min-width: 36px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? COLORS.primaryHover : COLORS.background};
    border-color: ${COLORS.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ============================================================================
// STYLED COMPONENTS - EMPTY STATE
// ============================================================================

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: ${COLORS.background};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.textMuted};
  font-size: 24px;
`;

const EmptyTitle = styled.h3`
  color: ${COLORS.text};
  margin: 0 0 0.5rem 0;
  font-weight: ${TYPOGRAPHY.semibold};
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: ${TYPOGRAPHY.body};
  color: ${COLORS.textLight};
`;

// ============================================================================
// STYLED COMPONENTS - SECCIONES DE DOCUMENTACIÓN
// ============================================================================

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.h2};
  font-weight: ${TYPOGRAPHY.semibold};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SectionNumber = styled.span`
  width: 32px;
  height: 32px;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${TYPOGRAPHY.small};
  font-weight: ${TYPOGRAPHY.semibold};
`;

const SectionDescription = styled.p`
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.textLight};
  margin-bottom: 1.5rem;
  font-size: ${TYPOGRAPHY.body};
`;

const ComponentShowcase = styled.div`
  background: ${COLORS.background};
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ShowcaseRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ShowcaseLabel = styled.span`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: ${TYPOGRAPHY.small};
  color: ${COLORS.textLight};
  min-width: 120px;
  font-weight: ${TYPOGRAPHY.medium};
`;

const CodeBlock = styled.pre`
  font-family: 'Consolas', 'Monaco', monospace;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85rem;
  margin: 1rem 0;
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.$color};
  border-radius: 6px;
  border: 1px solid ${COLORS.border};
`;

const ColorLabel = styled.span`
  font-family: 'Consolas', monospace;
  font-size: ${TYPOGRAPHY.xs};
  color: ${COLORS.textLight};
`;

const NotificationStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// ============================================================================
// DATOS DE EJEMPLO
// ============================================================================

const SAMPLE_USERS = [
  { id: '1', name: 'Juan Pérez', email: 'juan@example.com', role: 'Administrador', status: 'activo', lastAccess: 'Hace 2 horas' },
  { id: '2', name: 'María García', email: 'maria@example.com', role: 'Vendedor', status: 'activo', lastAccess: 'Hace 1 día' },
  { id: '3', name: 'Carlos López', email: 'carlos@example.com', role: 'Almacenero', status: 'inactivo', lastAccess: 'Hace 1 semana' },
  { id: '4', name: 'Ana Torres', email: 'ana@example.com', role: 'Contador', status: 'suspendido', lastAccess: 'Hace 3 días' },
];

const getStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case 'activo': return 'success';
    case 'inactivo': return 'danger';
    case 'suspendido': return 'warning';
    case 'pendiente': return 'warning';
    case 'completado': return 'success';
    case 'cancelado': return 'danger';
    default: return 'default';
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const TemplateUI: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    nombre: '',
    email: 'correo-invalido',
    password: 'abc123',
  });

  return (
    <Layout title="Template UI - Guía de Componentes">
      <Container>
        {/* Header */}
        <PageHeader>
          <div>
            <PageTitle>Template UI - Guía de Componentes</PageTitle>
            <PageSubtitle>
              Referencia visual para mantener consistencia en todo el proyecto AlexaTech
            </PageSubtitle>
          </div>
          <ButtonGroup>
            <Button $variant="outline">Exportar</Button>
            <Button $variant="primary">Nuevo Elemento</Button>
          </ButtonGroup>
        </PageHeader>

        {/* ========================================= */}
        {/* SECCIÓN 1: BADGES/ETIQUETAS */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>1</SectionNumber>
            StatusBadge - Etiquetas de Estado
          </SectionTitle>
          <SectionDescription>
            Componente unificado para mostrar estados en todo el sistema. 
            Usar siempre este patrón para mantener consistencia visual.
          </SectionDescription>

          <ComponentShowcase>
            <ShowcaseRow>
              <ShowcaseLabel>Variantes:</ShowcaseLabel>
              <StatusBadge variant="success">Activo</StatusBadge>
              <StatusBadge variant="warning">Pendiente</StatusBadge>
              <StatusBadge variant="danger">Inactivo</StatusBadge>
              <StatusBadge variant="info">En proceso</StatusBadge>
              <StatusBadge variant="default">Sin estado</StatusBadge>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Con indicador:</ShowcaseLabel>
              <StatusBadge variant="success" dot>Activo</StatusBadge>
              <StatusBadge variant="warning" dot>Pendiente</StatusBadge>
              <StatusBadge variant="danger" dot>Inactivo</StatusBadge>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Tamaños:</ShowcaseLabel>
              <StatusBadge variant="success" size="small">Small</StatusBadge>
              <StatusBadge variant="success" size="medium">Medium</StatusBadge>
              <StatusBadge variant="success" size="large">Large</StatusBadge>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Usuarios:</ShowcaseLabel>
              <StatusBadge variant="success" dot>Activo</StatusBadge>
              <StatusBadge variant="danger" dot>Inactivo</StatusBadge>
              <StatusBadge variant="warning" dot>Suspendido</StatusBadge>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Inventario:</ShowcaseLabel>
              <StatusBadge variant="success">Stock normal</StatusBadge>
              <StatusBadge variant="warning">Stock bajo</StatusBadge>
              <StatusBadge variant="danger">Stock crítico</StatusBadge>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Compras:</ShowcaseLabel>
              <StatusBadge variant="warning">Pendiente</StatusBadge>
              <StatusBadge variant="info">Enviada</StatusBadge>
              <StatusBadge variant="success">Recibida</StatusBadge>
              <StatusBadge variant="success">Completada</StatusBadge>
              <StatusBadge variant="danger">Anulada</StatusBadge>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Ventas:</ShowcaseLabel>
              <StatusBadge variant="warning">Pendiente</StatusBadge>
              <StatusBadge variant="success">Pagada</StatusBadge>
              <StatusBadge variant="danger">Cancelada</StatusBadge>
              <StatusBadge variant="info">Cotización</StatusBadge>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Roles:</ShowcaseLabel>
              <StatusBadge variant="info">Sistema</StatusBadge>
              <StatusBadge variant="default">Personalizado</StatusBadge>
            </ShowcaseRow>
          </ComponentShowcase>

          <CodeBlock>{`// Uso del StatusBadge
<StatusBadge variant="success">Activo</StatusBadge>
<StatusBadge variant="warning" dot>Pendiente</StatusBadge>
<StatusBadge variant="danger" size="small">Cancelado</StatusBadge>`}</CodeBlock>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 2: NOTIFICACIONES */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>2</SectionNumber>
            Notificaciones Toast
          </SectionTitle>
          <SectionDescription>
            Sistema de notificaciones para feedback al usuario. 
            Aparecen en la esquina superior derecha y se cierran automáticamente.
          </SectionDescription>

          <ComponentShowcase>
            <NotificationStack>
              <Notification 
                type="success" 
                title="Operación exitosa" 
                message="El usuario ha sido creado correctamente."
              />
              <Notification 
                type="error" 
                title="Error al guardar" 
                message="No se pudo conectar con el servidor. Intente nuevamente."
              />
              <Notification 
                type="warning" 
                title="Atención requerida" 
                message="El stock de algunos productos está por debajo del mínimo."
              />
              <Notification 
                type="info" 
                title="Información" 
                message="Se han actualizado los precios de los productos."
              />
            </NotificationStack>
          </ComponentShowcase>

          <CodeBlock>{`// Uso de notificaciones
showNotification('success', 'Operación exitosa', 'Usuario creado correctamente');
showNotification('error', 'Error', 'No se pudo guardar');
showNotification('warning', 'Atención', 'Stock bajo');
showNotification('info', 'Info', 'Datos actualizados');`}</CodeBlock>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 3: VALIDACIONES DE FORMULARIO */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>3</SectionNumber>
            Validaciones de Formulario
          </SectionTitle>
          <SectionDescription>
            Patrones de validación para campos de formulario con estados de error, éxito y ayuda.
          </SectionDescription>

          <ComponentShowcase>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Campo con error */}
              <FormGroup>
                <Label>
                  Email <RequiredMark>*</RequiredMark>
                </Label>
                <InputWrapper>
                  <Input 
                    type="email" 
                    placeholder="correo@ejemplo.com"
                    value={formValues.email}
                    $hasError={true}
                    onChange={(e) => setFormValues({...formValues, email: e.target.value})}
                  />
                </InputWrapper>
                <ValidationMessage $type="error">
                  El formato del correo electrónico no es válido
                </ValidationMessage>
              </FormGroup>

              {/* Campo válido */}
              <FormGroup>
                <Label>
                  Nombre completo <RequiredMark>*</RequiredMark>
                </Label>
                <InputWrapper>
                  <Input 
                    type="text" 
                    placeholder="Ingrese su nombre"
                    value="Juan Pérez"
                    $isValid={true}
                    readOnly
                  />
                </InputWrapper>
                <ValidationMessage $type="success">
                  Campo válido
                </ValidationMessage>
              </FormGroup>

              {/* Campo de contraseña con toggle de visibilidad */}
              <FormGroup>
                <Label>Contraseña</Label>
                <InputWrapper>
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese contraseña"
                    value={formValues.password}
                    onChange={(e) => setFormValues({...formValues, password: e.target.value})}
                    style={{ paddingRight: '40px' }}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </PasswordToggle>
                </InputWrapper>
                <ValidationMessage $type="hint">
                  Mínimo 8 caracteres, incluir mayúsculas y números
                </ValidationMessage>
              </FormGroup>

              {/* Select con error */}
              <FormGroup>
                <Label>
                  Rol <RequiredMark>*</RequiredMark>
                </Label>
                <Select $hasError={true} defaultValue="">
                  <option value="" disabled>Seleccione un rol</option>
                  <option value="admin">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                </Select>
                <ValidationMessage $type="error">
                  Debe seleccionar un rol
                </ValidationMessage>
              </FormGroup>

              {/* Campo deshabilitado */}
              <FormGroup>
                <Label>Usuario (automático)</Label>
                <Input 
                  type="text" 
                  value="USR-001234"
                  disabled
                />
                <ValidationMessage $type="hint">
                  Generado automáticamente por el sistema
                </ValidationMessage>
              </FormGroup>
            </div>
          </ComponentShowcase>

          <CodeBlock>{`// Validación de campos
<Input $hasError={true} />
<ValidationMessage $type="error">Mensaje de error</ValidationMessage>

<Input $isValid={true} />
<ValidationMessage $type="success">Campo válido</ValidationMessage>

<Input />
<ValidationMessage $type="hint">Texto de ayuda</ValidationMessage>`}</CodeBlock>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 4: STATS CARDS */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>4</SectionNumber>
            Stats Cards - Tarjetas de Estadísticas
          </SectionTitle>
          <SectionDescription>
            Usadas en la parte superior de las páginas para mostrar KPIs y métricas importantes.
          </SectionDescription>

          <StatsGrid>
            <StatCard $color={COLORS.primary}>
              <StatValue $color={COLORS.primary}>1,234</StatValue>
              <StatLabel>Total Usuarios</StatLabel>
            </StatCard>
            <StatCard $color={COLORS.success}>
              <StatValue $color={COLORS.success}>856</StatValue>
              <StatLabel>Activos</StatLabel>
            </StatCard>
            <StatCard $color={COLORS.warning}>
              <StatValue $color={COLORS.warning}>328</StatValue>
              <StatLabel>Pendientes</StatLabel>
            </StatCard>
            <StatCard $color={COLORS.danger}>
              <StatValue $color={COLORS.danger}>50</StatValue>
              <StatLabel>Inactivos</StatLabel>
            </StatCard>
          </StatsGrid>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 5: FILTROS */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>5</SectionNumber>
            Filtros y Búsqueda
          </SectionTitle>
          <SectionDescription>
            Componentes de filtrado estándar para todas las listas del sistema.
          </SectionDescription>

          <FiltersCard>
            <FiltersRow>
              <FilterGroup>
                <Label>Buscar</Label>
                <Input 
                  type="text" 
                  placeholder="Nombre, email, código..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <Label>Estado</Label>
                <Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="pendiente">Pendiente</option>
                </Select>
              </FilterGroup>
              <FilterGroup>
                <Label>Fecha</Label>
                <Input type="date" />
              </FilterGroup>
              <ButtonGroup style={{ alignSelf: 'flex-end' }}>
                <Button>Limpiar</Button>
                <Button $variant="primary">Buscar</Button>
              </ButtonGroup>
            </FiltersRow>
          </FiltersCard>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 6: TABLA */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>6</SectionNumber>
            Tabla con Acciones
          </SectionTitle>
          <SectionDescription>
            Estructura estándar de tablas con badges de estado, acciones y paginación.
          </SectionDescription>

          <TableContainer>
            <Table>
              <Thead>
                <tr>
                  <Th>Usuario</Th>
                  <Th>Email</Th>
                  <Th>Rol</Th>
                  <Th>Estado</Th>
                  <Th>Último Acceso</Th>
                  <Th>Acciones</Th>
                </tr>
              </Thead>
              <Tbody>
                {SAMPLE_USERS.map(user => (
                  <Tr key={user.id}>
                    <Td><strong>{user.name}</strong></Td>
                    <Td>{user.email}</Td>
                    <Td>{user.role}</Td>
                    <Td>
                      <StatusBadge variant={getStatusVariant(user.status)} dot>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </StatusBadge>
                    </Td>
                    <Td>{user.lastAccess}</Td>
                    <Td>
                      <ButtonGroup>
                        <ActionButton $variant="view">Ver</ActionButton>
                        <ActionButton $variant="edit">Editar</ActionButton>
                        {user.status === 'activo' ? (
                          <ActionButton $variant="deactivate">Desactivar</ActionButton>
                        ) : (
                          <ActionButton $variant="activate">Activar</ActionButton>
                        )}
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {/* Paginación */}
            <PaginationContainer>
              <PaginationInfo>Mostrando 1-4 de 128 resultados</PaginationInfo>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Select style={{ width: 'auto', padding: '0.5rem' }}>
                  <option value="10">10 por página</option>
                  <option value="20">20 por página</option>
                  <option value="50">50 por página</option>
                </Select>
                
                <PaginationButtons>
                  <PageButton disabled>Anterior</PageButton>
                  <PageButton $active>1</PageButton>
                  <PageButton>2</PageButton>
                  <PageButton>3</PageButton>
                  <PageButton>Siguiente</PageButton>
                </PaginationButtons>
              </div>
            </PaginationContainer>
          </TableContainer>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 7: BOTONES */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>7</SectionNumber>
            Botones
          </SectionTitle>
          <SectionDescription>
            Variantes de botones para diferentes acciones en el sistema.
          </SectionDescription>

          <ComponentShowcase>
            <ShowcaseRow>
              <ShowcaseLabel>Principales:</ShowcaseLabel>
              <Button $variant="primary">Primary</Button>
              <Button $variant="success">Success</Button>
              <Button $variant="danger">Danger</Button>
              <Button>Secondary</Button>
              <Button $variant="outline">Outline</Button>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Acciones tabla:</ShowcaseLabel>
              <ActionButton $variant="view">Ver</ActionButton>
              <ActionButton $variant="edit">Editar</ActionButton>
              <ActionButton $variant="delete">Eliminar</ActionButton>
              <ActionButton $variant="activate">Activar</ActionButton>
              <ActionButton $variant="deactivate">Desactivar</ActionButton>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Deshabilitados:</ShowcaseLabel>
              <Button $variant="primary" disabled>Primary</Button>
              <ActionButton $variant="edit" disabled>Editar</ActionButton>
            </ShowcaseRow>
          </ComponentShowcase>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 8: EMPTY STATE */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>8</SectionNumber>
            Empty State
          </SectionTitle>
          <SectionDescription>
            Estado vacío cuando no hay datos para mostrar.
          </SectionDescription>

          <TableContainer>
            <EmptyState>
              <EmptyIcon>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13,2 13,9 20,9"/>
                </svg>
              </EmptyIcon>
              <EmptyTitle>No se encontraron resultados</EmptyTitle>
              <EmptyText>
                No hay elementos que coincidan con tu búsqueda. Intenta con otros filtros.
              </EmptyText>
              <Button $variant="primary" style={{ marginTop: '1rem' }}>
                Limpiar Filtros
              </Button>
            </EmptyState>
          </TableContainer>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 9: PALETA DE COLORES */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>9</SectionNumber>
            Paleta de Colores
          </SectionTitle>
          <SectionDescription>
            Colores estándar del sistema para mantener consistencia.
          </SectionDescription>

          <ComponentShowcase>
            <ShowcaseRow>
              <ShowcaseLabel>Primary:</ShowcaseLabel>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.primary} />
                <ColorLabel>#3498db</ColorLabel>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.primaryHover} />
                <ColorLabel>#2980b9</ColorLabel>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.primaryLight} />
                <ColorLabel>#e3f2fd</ColorLabel>
              </div>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Success:</ShowcaseLabel>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.success} />
                <ColorLabel>#28a745</ColorLabel>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.successBg} />
                <ColorLabel>#d4edda</ColorLabel>
              </div>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Warning:</ShowcaseLabel>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.warning} />
                <ColorLabel>#f0ad4e</ColorLabel>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.warningBg} />
                <ColorLabel>#fff3cd</ColorLabel>
              </div>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Danger:</ShowcaseLabel>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.danger} />
                <ColorLabel>#dc3545</ColorLabel>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.dangerBg} />
                <ColorLabel>#f8d7da</ColorLabel>
              </div>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Info:</ShowcaseLabel>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.info} />
                <ColorLabel>#17a2b8</ColorLabel>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.infoBg} />
                <ColorLabel>#d1ecf1</ColorLabel>
              </div>
            </ShowcaseRow>

            <ShowcaseRow>
              <ShowcaseLabel>Texto:</ShowcaseLabel>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.text} />
                <ColorLabel>#2c3e50</ColorLabel>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.textLight} />
                <ColorLabel>#6c757d</ColorLabel>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ColorSwatch $color={COLORS.textMuted} />
                <ColorLabel>#95a5a6</ColorLabel>
              </div>
            </ShowcaseRow>
          </ComponentShowcase>
        </Section>

        {/* ========================================= */}
        {/* SECCIÓN 10: TIPOGRAFÍA */}
        {/* ========================================= */}
        <Section>
          <SectionTitle>
            <SectionNumber>10</SectionNumber>
            Tipografía
          </SectionTitle>
          <SectionDescription>
            Sistema tipográfico unificado para todo el proyecto.
          </SectionDescription>

          <ComponentShowcase>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ minWidth: '100px', color: COLORS.textLight, fontSize: TYPOGRAPHY.small }}>H1 (2rem):</span>
                <span style={{ fontSize: TYPOGRAPHY.h1, fontWeight: TYPOGRAPHY.bold, color: COLORS.text }}>Título Principal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ minWidth: '100px', color: COLORS.textLight, fontSize: TYPOGRAPHY.small }}>H2 (1.5rem):</span>
                <span style={{ fontSize: TYPOGRAPHY.h2, fontWeight: TYPOGRAPHY.semibold, color: COLORS.text }}>Título de Sección</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ minWidth: '100px', color: COLORS.textLight, fontSize: TYPOGRAPHY.small }}>H3 (1.25rem):</span>
                <span style={{ fontSize: TYPOGRAPHY.h3, fontWeight: TYPOGRAPHY.semibold, color: COLORS.text }}>Subtítulo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ minWidth: '100px', color: COLORS.textLight, fontSize: TYPOGRAPHY.small }}>Body (0.95rem):</span>
                <span style={{ fontSize: TYPOGRAPHY.body, color: COLORS.text }}>Texto de cuerpo principal para contenido general.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ minWidth: '100px', color: COLORS.textLight, fontSize: TYPOGRAPHY.small }}>Small (0.85rem):</span>
                <span style={{ fontSize: TYPOGRAPHY.small, color: COLORS.textLight }}>Texto secundario y etiquetas</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ minWidth: '100px', color: COLORS.textLight, fontSize: TYPOGRAPHY.small }}>XS (0.75rem):</span>
                <span style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted }}>Texto muy pequeño para detalles</span>
              </div>
            </div>
          </ComponentShowcase>

          <CodeBlock>{`// Sistema tipográfico
const TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, sans-serif",
  h1: '2rem',      // Títulos principales
  h2: '1.5rem',    // Títulos de sección
  h3: '1.25rem',   // Subtítulos
  body: '0.95rem', // Texto general
  small: '0.85rem', // Etiquetas
  xs: '0.75rem',   // Detalles
};`}</CodeBlock>
        </Section>

      </Container>
    </Layout>
  );
};

export default TemplateUI;
