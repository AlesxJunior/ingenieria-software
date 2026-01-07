/**
 * SHARED COMPONENTS - Exportaciones centralizadas
 * 
 * Uso:
 * import { StatusBadge, Button, Input, StatCard, Card, SummaryCard } from '../components/shared';
 */

// Componentes de UI
export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, BadgeVariant, BadgeSize } from './StatusBadge';

export { Button, ActionButton, ButtonGroup } from './Button';
export type { ButtonProps, ActionButtonProps } from './Button';

export { Input, Select, FormGroup, Label, RequiredMark, ValidationMessage, InputWrapper, PasswordToggle } from './FormElements';
export type { InputProps, ValidationMessageProps } from './FormElements';

// Cards de estadísticas (con borde de color)
export { StatCard, StatsGrid, StatValue, StatLabel } from './StatCard';
export type { StatCardProps } from './StatCard';

// Cards genéricas (para contenedores y reportes)
export { Card, FiltersCard, SummaryCard, SummaryCards, CardTitle, CardValue } from './Cards';

export { 
  TableContainer, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td,
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  PageButton 
} from './Table';

export { EmptyState, EmptyIcon, EmptyTitle, EmptyText } from './EmptyState';
