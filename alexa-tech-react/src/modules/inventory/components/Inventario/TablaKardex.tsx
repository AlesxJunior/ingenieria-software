import React from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../../styles/theme';
import type { MovimientoKardex, PaginationData } from '../../../../types/inventario';
import { getWarehouseLabel } from '../../../../constants/warehouses';
import { formatDateToLocal } from '../../../../utils/dateFormatter';
import { StatusBadge } from '../../../../components/shared';

const TableContainer = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  border: 1px solid ${COLORS.neutral[200]};
  overflow: hidden;
`;

const Table = styled.table.attrs({
  className: 'kardex-table'
})`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Th = styled.th`
  text-align: left;
  background: ${COLORS.background};
  padding: ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.neutral[100]};
  color: ${COLORS.text.primary};
  vertical-align: middle;
`;

const Tr = styled.tr`
  transition: ${TRANSITIONS.fast};
  
  &:hover {
    background: ${COLORS.neutral[50]};
  }
`;

// Helper para obtener variant del StatusBadge según tipo de movimiento
const getTipoVariant = (tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'): 'success' | 'danger' | 'info' => {
  const variants: Record<string, 'success' | 'danger' | 'info'> = {
    ENTRADA: 'success',
    SALIDA: 'danger',
    AJUSTE: 'info'
  };
  return variants[tipo] || 'info';
};

const QuantityCell = styled.div<{ $type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' }>`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${props => {
    switch (props.$type) {
      case 'ENTRADA': return COLOR_SCALES.success[500];
      case 'SALIDA': return COLOR_SCALES.danger[500];
      case 'AJUSTE': return COLOR_SCALES.info[500];
      default: return COLORS.text.primary;
    }
  }};
`;

const StockCell = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.text.secondary};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${SPACING.lg};
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${SPACING.sm} 0;
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const EmptyDescription = styled.p`
  margin: 0 0 ${SPACING.xl} 0;
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.base};
  line-height: 1.5;
`;

const EmptyActions = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const SuggestionButton = styled.button`
  background: ${COLORS.neutral[50]};
  color: ${COLORS.text.secondary};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.sm} ${SPACING.lg};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  cursor: pointer;
  transition: ${TRANSITIONS.default};

  &:hover {
    background: ${COLORS.neutral[100]};
    border-color: ${COLORS.neutral[300]};
  }
`;

const SkeletonRow = styled.tr`
  &:hover {
    background: transparent;
  }
`;

const SkeletonCell = styled.td`
  padding: ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.neutral[100]};
`;

const SkeletonBar = styled.div<{ width?: string }>`
  height: 1rem;
  background: linear-gradient(90deg, ${COLORS.neutral[100]} 25%, ${COLORS.neutral[200]} 50%, ${COLORS.neutral[100]} 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: ${BORDER_RADIUS.sm};
  width: ${props => props.width || '100%'};

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const LoadingContainer = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  border: 1px solid ${COLORS.neutral[200]};
  overflow: hidden;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.lg};
  border-top: 1px solid ${COLORS.neutral[200]};
  flex-wrap: wrap;
  gap: ${SPACING.lg};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${SPACING.sm};
  }
`;

const PaginationInfo = styled.div`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${props => props.$active ? COLOR_SCALES.primary[500] : COLORS.neutral[200]};
  background: ${props => props.$active ? COLOR_SCALES.primary[500] : COLORS.neutral.white};
  color: ${props => props.$active ? COLORS.neutral.white : COLORS.text.primary};
  border-radius: ${BORDER_RADIUS.sm};
  cursor: pointer;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  min-width: 36px;
  transition: ${TRANSITIONS.default};

  &:hover:not(:disabled) {
    background: ${props => props.$active ? COLOR_SCALES.primary[600] : COLORS.neutral[100]};
    border-color: ${COLOR_SCALES.primary[500]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageSizeSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  background: ${COLORS.neutral.white};
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

interface TablaKardexProps {
  movimientos: MovimientoKardex[];
  pagination: PaginationData;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const TablaKardex: React.FC<TablaKardexProps> = ({
  movimientos,
  pagination,
  loading = false,
  onPageChange,
  onPageSizeChange
}) => {
  const getMovementLabel = (type: 'ENTRADA' | 'SALIDA' | 'AJUSTE') => {
    switch (type) {
      case 'ENTRADA': return 'ENTRADA';
      case 'SALIDA': return 'SALIDA';
      case 'AJUSTE': return 'AJUSTE';
      default: return type;
    }
  };

  const formatQuantity = (cantidad: number, tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE') => {
    if (tipo === 'AJUSTE') {
      // Para ajustes, mostrar el signo real de la cantidad
      return cantidad.toLocaleString();
    }
    const sign = tipo === 'ENTRADA' ? '+' : '-';
    return `${sign}${Math.abs(cantidad).toLocaleString()}`;
  };

  const renderPagination = () => {
    const { page, pages, total, limit } = pagination;
    
    // No mostrar paginación si no hay elementos
    if (total === 0) return null;
    
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    // Calcular páginas a mostrar - simplificado para mostrar todas las páginas cuando son pocas
    const pageNumbers = [];
    if (pages <= 5) {
      // Si hay 5 páginas o menos, mostrar todas
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Lógica compleja solo para muchas páginas
      const maxPagesToShow = 5;
      let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(pages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return (
      <PaginationContainer>
        <PaginationInfo>
          Mostrando {startItem} - {endItem} de {total} movimientos
        </PaginationInfo>
        
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

          <PaginationButtons>
            <PageButton
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              data-testid="kardex-prev-page"
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
              data-testid="kardex-next-page"
            >
              Siguiente
            </PageButton>
          </PaginationButtons>
        </div>
      </PaginationContainer>
    );
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <SkeletonRow key={index}>
        <SkeletonCell><SkeletonBar width="80%" /></SkeletonCell>
        <SkeletonCell>
          <SkeletonBar width="60%" style={{ marginBottom: '0.5rem' }} />
          <SkeletonBar width="90%" />
        </SkeletonCell>
        <SkeletonCell><SkeletonBar width="70%" /></SkeletonCell>
        <SkeletonCell><SkeletonBar width="50%" /></SkeletonCell>
        <SkeletonCell><SkeletonBar width="40%" /></SkeletonCell>
        <SkeletonCell><SkeletonBar width="30%" /></SkeletonCell>
        <SkeletonCell><SkeletonBar width="30%" /></SkeletonCell>
        <SkeletonCell><SkeletonBar width="85%" /></SkeletonCell>
        <SkeletonCell><SkeletonBar width="60%" /></SkeletonCell>
        <SkeletonCell><SkeletonBar width="45%" /></SkeletonCell>
      </SkeletonRow>
    ));
  };

  // Mostrar skeleton solo en primera carga (cuando no hay datos previos)
  if (loading && movimientos.length === 0) {
    return (
      <LoadingContainer>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Producto</Th>
                <Th>Almacén</Th>
                <Th>Tipo</Th>
                <Th>Cantidad</Th>
                <Th>Stock Antes</Th>
                <Th>Stock Después</Th>
                <Th>Motivo</Th>
                <Th>Usuario</Th>
              </tr>
            </thead>
            <tbody>
              {renderSkeletonRows()}
            </tbody>
          </Table>
        </TableWrapper>
      </LoadingContainer>
    );
  }

  if (!loading && movimientos.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <EmptyIcon>📋</EmptyIcon>
          <EmptyTitle>No hay movimientos de kardex</EmptyTitle>
          <EmptyDescription>
            No se encontraron movimientos que coincidan con los filtros aplicados.
            <br />
            Intenta ajustar los filtros o verifica que existan movimientos en el sistema.
          </EmptyDescription>
          <EmptyActions>
            <SuggestionButton onClick={() => window.location.reload()}>
              🔄 Actualizar página
            </SuggestionButton>
            <SuggestionButton onClick={() => {
              // Limpiar filtros - esto debería ser manejado por el componente padre
              console.log('Limpiar filtros solicitado');
            }}>
              🗑️ Limpiar filtros
            </SuggestionButton>
          </EmptyActions>
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <TableWrapper>
        <Table data-testid="kardex-table">
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Producto</Th>
              <Th>Almacén</Th>
              <Th>Tipo</Th>
              <Th>Cantidad</Th>
              <Th>Stock Antes</Th>
              <Th>Stock Después</Th>
              <Th>Motivo</Th>
              <Th>Usuario</Th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento) => (
              <Tr key={movimiento.id} data-testid={`kardex-row-${movimiento.id}`}>
                <Td>{formatDateToLocal(movimiento.fecha)}</Td>
                <Td>
                  <div>
                    <strong>{movimiento.codigo}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                      {movimiento.nombre}
                    </div>
                  </div>
                </Td>
                <Td>{getWarehouseLabel(movimiento.almacen)}</Td>
                <Td>
                  <StatusBadge variant={getTipoVariant(movimiento.tipo)} data-testid={`kardex-type-${movimiento.tipo}-${movimiento.id}`}>
                    {getMovementLabel(movimiento.tipo)}
                  </StatusBadge>
                </Td>
                <Td>
                  <QuantityCell $type={movimiento.tipo} data-testid="kardex-quantity">
                    {formatQuantity(movimiento.cantidad, movimiento.tipo)}
                  </QuantityCell>
                </Td>
                <Td>
                  <StockCell data-testid="kardex-stock-antes">{movimiento.stockAntes.toLocaleString()}</StockCell>
                </Td>
                <Td>
                  <StockCell data-testid="kardex-stock-despues">{movimiento.stockDespues.toLocaleString()}</StockCell>
                </Td>
                <Td>
                  <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                    {movimiento.motivo}
                  </div>
                </Td>
                <Td>{movimiento.usuario}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
      
      {renderPagination()}
    </TableContainer>
  );
};

export default TablaKardex;