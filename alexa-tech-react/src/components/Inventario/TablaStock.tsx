import React from 'react';
import styled from 'styled-components';
import type { StockItem, PaginationData } from '../../types/inventario';
import { getWarehouseLabel } from '../../constants/warehouses';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../styles/theme';

const TableContainer = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  background: ${COLORS.neutral[100]};
  padding: ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.border};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  color: ${COLORS.text};
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:hover {
    background: ${COLORS.neutral[50]};
  }
`;

const StatusBadge = styled.span<{ $status: 'NORMAL' | 'BAJO' | 'CRITICO' }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: 20px;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status) {
      case 'NORMAL':
        return `
          background: ${COLOR_SCALES.success[100]};
          color: ${COLOR_SCALES.success[700]};
        `;
      case 'BAJO':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'CRITICO':
        return `
          background: ${COLOR_SCALES.danger[100]};
          color: ${COLOR_SCALES.danger[700]};
        `;
      default:
        return `
          background: ${COLORS.neutral[200]};
          color: ${COLORS.neutral[700]};
        `;
    }
  }}
`;

const ActionButton = styled.button`
  padding: ${SPACING.sm} ${SPACING.md};
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  background: ${COLORS.primary};
  color: white;
  cursor: pointer;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  transition: background-color 0.2s;

  &:hover {
    background: ${COLORS.primaryHover};
  }

  &:disabled {
    background: ${COLORS.neutral[400]};
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING.xxl};
  color: ${COLORS.textLight};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${SPACING.md};
  opacity: 0.5;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.lg};
  background: ${COLORS.neutral[100]};
  border-top: 1px solid ${COLORS.border};
  gap: ${SPACING.md};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${SPACING.sm};
  }
`;

const PaginationInfo = styled.div`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const PaginationControls = styled.div`
  display: flex;
  gap: ${SPACING.xs};
  align-items: center;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  background: ${props => props.$active ? COLORS.primary : COLORS.background};
  color: ${props => props.$active ? 'white' : COLORS.text};
  border-radius: ${BORDER_RADIUS.sm};
  cursor: pointer;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? COLORS.primaryHover : COLORS.neutral[100]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityCell = styled.div<{ $isLow?: boolean; $isCritical?: boolean }>`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${props => {
    if (props.$isCritical) return COLOR_SCALES.danger[600];
    if (props.$isLow) return '#f39c12';
    return COLORS.text;
  }};
`;

interface TablaStockProps {
  stockItems: StockItem[];
  pagination: PaginationData;
  loading?: boolean;
  canUpdateInventory?: boolean;
  onAjustar: (stock: StockItem) => void;
  onPageChange: (page: number) => void;
}

const TablaStock: React.FC<TablaStockProps> = ({
  stockItems,
  pagination,
  loading = false,
  canUpdateInventory = false,
  onAjustar,
  onPageChange
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: 'NORMAL' | 'BAJO' | 'CRITICO') => {
    switch (status) {
      case 'NORMAL': return 'Normal';
      case 'BAJO': return 'Bajo';
      case 'CRITICO': return 'Crítico';
      default: return status;
    }
  };

  const renderPagination = () => {
    const { page, pages, total, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    // Calcular páginas a mostrar
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <PaginationContainer>
        <PaginationInfo>
          Mostrando {startItem} - {endItem} de {total} elementos
        </PaginationInfo>
        
        <PaginationControls>
          <PaginationButton
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            ««
          </PaginationButton>
          
          <PaginationButton
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            ‹
          </PaginationButton>

          {pageNumbers.map(pageNum => (
            <PaginationButton
              key={pageNum}
              $active={pageNum === page}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </PaginationButton>
          ))}

          <PaginationButton
            onClick={() => onPageChange(page + 1)}
            disabled={page === pages}
          >
            ›
          </PaginationButton>
          
          <PaginationButton
            onClick={() => onPageChange(pages)}
            disabled={page === pages}
          >
            »»
          </PaginationButton>
        </PaginationControls>
      </PaginationContainer>
    );
  };

  if (loading) {
    return (
      <TableContainer>
        <EmptyState>
          <EmptyIcon>⏳</EmptyIcon>
          <div>Cargando inventario...</div>
        </EmptyState>
      </TableContainer>
    );
  }

  if (stockItems.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <EmptyIcon>📦</EmptyIcon>
          <div>No se encontraron productos en el inventario</div>
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table data-testid="stock-table">
        <thead>
          <tr>
            <Th>Código</Th>
            <Th>Producto</Th>
            <Th>Almacén</Th>
            <Th>Cantidad</Th>
            <Th>Stock Mín.</Th>
            <Th>Estado</Th>
            <Th>Última Act.</Th>
            {canUpdateInventory && <Th>Acciones</Th>}
          </tr>
        </thead>
        <tbody>
          {stockItems.map((item) => (
            <Tr key={item.stockByWarehouseId} data-testid={`stock-row-${item.codigo}-${item.warehouseId}`}>
              <Td>
                <strong>{item.codigo}</strong>
              </Td>
              <Td>{item.nombre}</Td>
              <Td>{getWarehouseLabel(item.warehouseId)}</Td>
              <Td>
                <QuantityCell
                  $isLow={item.estado === 'BAJO'}
                  $isCritical={item.estado === 'CRITICO'}
                  data-testid="stock-quantity"
                >
                  {item.cantidad.toLocaleString()}
                </QuantityCell>
              </Td>
              <Td>{item.stockMinimo != null ? item.stockMinimo.toLocaleString() : 'N/A'}</Td>
              <Td>
                <StatusBadge $status={item.estado} data-testid={`stock-status-${item.estado.toLowerCase()}`}>
                  {getStatusLabel(item.estado)}
                </StatusBadge>
              </Td>
              <Td>{formatDate(item.updatedAt)}</Td>
              {canUpdateInventory && (
                <Td>
                  <ActionButton
                    onClick={() => onAjustar(item)}
                    disabled={loading}
                    data-testid={`stock-ajustar-${item.codigo}-${item.warehouseId}`}
                  >
                    Ajustar
                  </ActionButton>
                </Td>
              )}
            </Tr>
          ))}
        </tbody>
      </Table>
      
      {pagination.pages > 1 && renderPagination()}
    </TableContainer>
  );
};

export default TablaStock;