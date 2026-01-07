/**
 * EMPTY STATE - Componente para estados vacíos
 * 
 * Uso:
 * <EmptyState>
 *   <EmptyIcon>📋</EmptyIcon>
 *   <EmptyTitle>No se encontraron resultados</EmptyTitle>
 *   <EmptyText>Intenta con otros filtros</EmptyText>
 * </EmptyState>
 */

import styled from 'styled-components';
import { TYPOGRAPHY, COLORS } from '../../styles/theme';

// ============================================================================
// EMPTY STATE CONTAINER
// ============================================================================

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

// ============================================================================
// EMPTY ICON
// ============================================================================

export const EmptyIcon = styled.div`
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

// ============================================================================
// EMPTY TITLE
// ============================================================================

export const EmptyTitle = styled.h3`
  color: ${COLORS.text};
  margin: 0 0 0.5rem 0;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

// ============================================================================
// EMPTY TEXT
// ============================================================================

export const EmptyText = styled.p`
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.textLight};
`;
