import React from 'react';
import styled from 'styled-components';
import type { MovimientoKardex, PaginationData } from '../../types/inventario';
import { getWarehouseLabel } from '../../constants/warehouses';
import { formatDateToLocal } from '../../utils/dateFormatter';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../styles/theme';

const TableContainer = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const MovementBadge = styled.span<{ $type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: 20px;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  text-transform: uppercase;
  
  ${props => {
    switch (props.$type) {
      case 'ENTRADA':
        return `
          background: ${COLOR_SCALES.success[100]};
          color: ${COLOR_SCALES.success[700]};
        `;
      case 'SALIDA':
        return `
          background: ${COLOR_SCALES.danger[100]};
          color: ${COLOR_SCALES.danger[700]};
        `;
      case 'AJUSTE':
        return `
          background: ${COLOR_SCALES.primary[100]};
          color: ${COLOR_SCALES.primary[700]};
        `;
      default:
        return `
          background: ${COLORS.neutral[200]};
          color: ${COLORS.neutral[700]};
        `;
    }
  }}
`;

const QuantityCell = styled.div<{ $type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' }>`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${props => {
    switch (props.$type) {
      case 'ENTRADA': return COLOR_SCALES.success[600];
      case 'SALIDA': return COLOR_SCALES.danger[600];
      case 'AJUSTE': return COLOR_SCALES.primary[600];
      default: return COLORS.text;
    }
  }};
`;

const StockCell = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 ${SPACING.sm} 0;
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const EmptyDescription = styled.p`
  margin: 0 0 ${SPACING.lg} 0;
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.md};
  line-height: 1.5;
`;

const EmptyActions = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const SuggestionButton = styled.button`
  background: ${COLORS.neutral[100]};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.neutral[200]};
    border-color: ${COLORS.neutral[400]};
  }
`;

const SkeletonRow = styled.tr`
  &:hover {
    background: transparent;
  }
`;

const SkeletonCell = styled.td`
  padding: ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.neutral[200]};
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
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

interface TablaKardexProps {
  movimientos: MovimientoKardex[];
  pagination: PaginationData;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

const TablaKardex: React.FC<TablaKardexProps> = ({
  movimientos,
  pagination,
  loading = false,
  onPageChange
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
            data-testid="kardex-prev-page"
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
            data-testid="kardex-next-page"
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

  if (loading) {
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

  if (movimientos.length === 0) {
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
                  <MovementBadge $type={movimiento.tipo} data-testid={`kardex-type-${movimiento.tipo}-${movimiento.id}`}>
                    {getMovementLabel(movimiento.tipo)}
                  </MovementBadge>
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