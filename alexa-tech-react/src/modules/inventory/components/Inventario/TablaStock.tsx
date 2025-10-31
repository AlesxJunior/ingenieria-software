import React from 'react';
import styled from 'styled-components';
import type { StockItem, PaginationData } from '../../../../types/inventario';
import { getWarehouseLabel } from '../../../../constants/warehouses';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  background: #f1f3f5;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #333;
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const StatusBadge = styled.span<{ $status: 'NORMAL' | 'BAJO' | 'CRITICO' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status) {
      case 'NORMAL':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'BAJO':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'CRITICO':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      default:
        return `
          background: #e2e3e5;
          color: #383d41;
        `;
    }
  }}
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const PaginationInfo = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  background: ${props => props.$active ? '#3498db' : 'white'};
  color: ${props => props.$active ? 'white' : '#495057'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#2980b9' : '#f8f9fa'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityCell = styled.div<{ $isLow?: boolean; $isCritical?: boolean }>`
  font-weight: 500;
  color: ${props => {
    if (props.$isCritical) return '#e74c3c';
    if (props.$isLow) return '#f39c12';
    return '#2c3e50';
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