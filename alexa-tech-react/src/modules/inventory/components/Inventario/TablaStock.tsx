import React from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../../styles/theme';
import { 
  Button as SharedButton,
  Table as SharedTable,
  Thead as SharedThead,
  Th as SharedTh,
  Tbody as SharedTbody,
  Tr as SharedTr,
  Td as SharedTd,
  PaginationContainer as SharedPaginationContainer,
  PaginationInfo as SharedPaginationInfo,
  PaginationButtons as SharedPaginationButtons,
  PageButton,
  StatusBadge
} from '../../../../components/shared';
import type { StockItem, PaginationData } from '../../../../types/inventario';
import { getWarehouseLabel } from '../../../../constants/warehouses';

const TableContainer = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  overflow: hidden;
`;

// Helper para obtener variant del StatusBadge según estado de stock
const getStatusVariant = (status: 'NORMAL' | 'BAJO' | 'CRITICO'): 'success' | 'warning' | 'danger' => {
  const variants: Record<string, 'success' | 'warning' | 'danger'> = {
    NORMAL: 'success',
    BAJO: 'warning',
    CRITICO: 'danger'
  };
  return variants[status] || 'success';
};

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLight};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${SPACING.lg};
  opacity: 0.5;
`;

const QuantityCell = styled.div<{ $isLow?: boolean; $isCritical?: boolean }>`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${props => {
    if (props.$isCritical) return COLOR_SCALES.danger[500];
    if (props.$isLow) return COLOR_SCALES.warning[500];
    return COLORS.text;
  }};
`;

const PageSizeSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.background};
  cursor: pointer;
  transition: ${TRANSITIONS.default};

  &:hover {
    border-color: ${COLOR_SCALES.primary[300]};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
`;

interface TablaStockProps {
  stockItems: StockItem[];
  pagination: PaginationData;
  loading?: boolean;
  canUpdateInventory?: boolean;
  onAjustar: (stock: StockItem) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const TablaStock: React.FC<TablaStockProps> = ({
  stockItems,
  pagination,
  loading = false,
  canUpdateInventory = false,
  onAjustar,
  onPageChange,
  onPageSizeChange
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
      <SharedPaginationContainer>
        <SharedPaginationInfo>
          Mostrando {startItem} - {endItem} de {total} elementos
        </SharedPaginationInfo>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onPageSizeChange && (
            <PageSizeSelect
              value={limit}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </PageSizeSelect>
          )}

          <SharedPaginationButtons>
            <PageButton
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </PageButton>

            {pageNumbers.map(pageNum => (
              <PageButton
                key={pageNum}
                $active={pageNum === page}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </PageButton>
            ))}

            <PageButton
              onClick={() => onPageChange(page + 1)}
              disabled={page === pages}
            >
              Siguiente
            </PageButton>
          </SharedPaginationButtons>
        </div>
      </SharedPaginationContainer>
    );
  };

  // Mostrar estado de carga solo si no hay items (primera carga)
  if (loading && stockItems.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <EmptyIcon>⏳</EmptyIcon>
          <div>Cargando inventario...</div>
        </EmptyState>
      </TableContainer>
    );
  }

  if (!loading && stockItems.length === 0) {
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
      <SharedTable data-testid="stock-table">
        <SharedThead>
          <tr>
            <SharedTh>Código</SharedTh>
            <SharedTh>Producto</SharedTh>
            <SharedTh>Almacén</SharedTh>
            <SharedTh>Cantidad</SharedTh>
            <SharedTh>Stock Mín.</SharedTh>
            <SharedTh>Estado</SharedTh>
            <SharedTh>Última Act.</SharedTh>
            {canUpdateInventory && <SharedTh>Acciones</SharedTh>}
          </tr>
        </SharedThead>
        <SharedTbody>
          {stockItems.map((item) => (
            <SharedTr key={item.stockByWarehouseId} data-testid={`stock-row-${item.codigo}-${item.warehouseId}`}>
              <SharedTd>
                <strong>{item.codigo}</strong>
              </SharedTd>
              <SharedTd>{item.nombre}</SharedTd>
              <SharedTd>{getWarehouseLabel(item.warehouseId)}</SharedTd>
              <SharedTd>
                <QuantityCell
                  $isLow={item.estado === 'BAJO'}
                  $isCritical={item.estado === 'CRITICO'}
                  data-testid="stock-quantity"
                >
                  {item.cantidad.toLocaleString()}
                </QuantityCell>
              </SharedTd>
              <SharedTd>{item.stockMinimo != null ? item.stockMinimo.toLocaleString() : 'N/A'}</SharedTd>
              <SharedTd>
                <StatusBadge variant={getStatusVariant(item.estado)} dot data-testid={`stock-status-${item.estado.toLowerCase()}`}>
                  {getStatusLabel(item.estado)}
                </StatusBadge>
              </SharedTd>
              <SharedTd>{formatDate(item.updatedAt)}</SharedTd>
              {canUpdateInventory && (
                <SharedTd>
                  <SharedButton
                    $variant="primary"
                    onClick={() => onAjustar(item)}
                    disabled={loading}
                    data-testid={`stock-ajustar-${item.codigo}-${item.warehouseId}`}
                  >
                    Ajustar
                  </SharedButton>
                </SharedTd>
              )}
            </SharedTr>
          ))}
        </SharedTbody>
      </SharedTable>
      
      {pagination.total > 0 && renderPagination()}
    </TableContainer>
  );
};

export default TablaStock;