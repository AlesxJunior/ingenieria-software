/**
 * STAT CARD - Tarjetas de Estadísticas Unificadas
 * 
 * Uso:
 * <StatsGrid>
 *   <StatCard $color={COLORS.primary}>
 *     <StatValue $color={COLORS.primary}>1,234</StatValue>
 *     <StatLabel>Total Usuarios</StatLabel>
 *   </StatCard>
 * </StatsGrid>
 */

import styled from 'styled-components';
import { TYPOGRAPHY, COLORS, SHADOWS, TRANSITIONS, BORDER_RADIUS } from '../../styles/theme';

// ============================================================================
// TIPOS
// ============================================================================

export interface StatCardProps {
  $color?: string;
}

// ============================================================================
// STATS GRID
// ============================================================================

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

// ============================================================================
// STAT CARD
// ============================================================================

export const StatCard = styled.div<StatCardProps>`
  background: ${COLORS.white};
  padding: 1.5rem;
  border-radius: ${BORDER_RADIUS.large};
  border: 1px solid ${COLORS.border};
  border-left: 4px solid ${props => props.$color || COLORS.primary};
  transition: box-shadow ${TRANSITIONS.normal};
  text-align: center;

  &:hover {
    box-shadow: ${SHADOWS.large};
  }
`;

// ============================================================================
// STAT VALUE
// ============================================================================

export const StatValue = styled.div<{ $color?: string }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: 2rem;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${props => props.$color || COLORS.text};
  margin-bottom: 0.25rem;
`;

// ============================================================================
// STAT LABEL
// ============================================================================

export const StatLabel = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.textLight};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

// ============================================================================
// STAT CHANGE (opcional, para mostrar incrementos/decrementos)
// ============================================================================

export const StatChange = styled.span<{ $positive?: boolean }>`
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${props => props.$positive ? COLORS.success : COLORS.danger};
  margin-left: 0.5rem;
`;

export default StatCard;
