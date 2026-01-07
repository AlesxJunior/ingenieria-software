/**
 * TABLE - Componentes de Tabla Unificados
 * 
 * Uso:
 * <TableContainer>
 *   <Table>
 *     <Thead>
 *       <tr><Th>Columna</Th></tr>
 *     </Thead>
 *     <Tbody>
 *       <Tr><Td>Valor</Td></Tr>
 *     </Tbody>
 *   </Table>
 *   <PaginationContainer>...</PaginationContainer>
 * </TableContainer>
 */

import styled from 'styled-components';
import { TYPOGRAPHY, COLORS, TRANSITIONS, BORDER_RADIUS } from '../../styles/theme';

// ============================================================================
// TABLE CONTAINER
// ============================================================================

export const TableContainer = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
`;

// ============================================================================
// TABLE
// ============================================================================

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

// ============================================================================
// TABLE HEAD
// ============================================================================

export const Thead = styled.thead`
  background: ${COLORS.background};
`;

// ============================================================================
// TABLE BODY
// ============================================================================

export const Tbody = styled.tbody``;

// ============================================================================
// TABLE ROW
// ============================================================================

export const Tr = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.borderLight};
  }

  &:hover {
    background: ${COLORS.background};
  }
`;

// ============================================================================
// TABLE HEADER CELL
// ============================================================================

export const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.textLight};
  border-bottom: 1px solid ${COLORS.border};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ============================================================================
// TABLE DATA CELL
// ============================================================================

export const Td = styled.td`
  padding: 1rem;
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text};
`;

// ============================================================================
// PAGINATION
// ============================================================================

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid ${COLORS.border};
  flex-wrap: wrap;
  gap: 1rem;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

export const PaginationInfo = styled.span`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

export const PaginationButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  font-family: ${TYPOGRAPHY.fontFamily};
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.$active ? COLORS.primary : COLORS.border};
  background: ${props => props.$active ? COLORS.primary : COLORS.white};
  color: ${props => props.$active ? COLORS.white : COLORS.text};
  border-radius: ${BORDER_RADIUS.small};
  cursor: pointer;
  font-size: ${TYPOGRAPHY.fontSize.small};
  min-width: 36px;
  transition: all ${TRANSITIONS.normal};

  &:hover:not(:disabled) {
    background: ${props => props.$active ? COLORS.primaryHover : COLORS.background};
    border-color: ${COLORS.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
