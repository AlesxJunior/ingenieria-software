import React from 'react';
import styled from 'styled-components';
import type { MovimientoKardex, PaginationData } from '../../types/inventario';
import { getWarehouseLabel } from '../../constants/warehouses';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
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
  background: #f1f3f5;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  white-space: nowrap;
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

const MovementBadge = styled.span<{ $type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$type) {
      case 'ENTRADA':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'SALIDA':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      case 'AJUSTE':
        return `
          background: #d1ecf1;
          color: #0c5460;
        `;
      default:
        return `
          background: #e2e3e5;
          color: #383d41;
        `;
    }
  }}
`;

const QuantityCell = styled.div<{ $type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' }>`
  font-weight: 500;
  color: ${props => {
    switch (props.$type) {
      case 'ENTRADA': return '#28a745';
      case 'SALIDA': return '#dc3545';
      case 'AJUSTE': return '#17a2b8';
      default: return '#2c3e50';
    }
  }};
`;

const StockCell = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

const DocumentLink = styled.a`
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
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

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.2rem;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const EmptyActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const SuggestionButton = styled.button`
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`;

const SkeletonRow = styled.tr`
  &:hover {
    background: transparent;
  }
`;

const SkeletonCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const SkeletonBar = styled.div<{ width?: string }>`
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

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
                <Th>Documento</Th>
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
              <Th>Documento</Th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento) => (
              <Tr key={movimiento.id} data-testid={`kardex-row-${movimiento.id}`}>
                <Td>{formatDate(movimiento.fecha)}</Td>
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
                <Td>
                  {movimiento.documentoReferencia ? (
                    <DocumentLink 
                      href={`#/documento/${movimiento.documentoReferencia}`}
                      title="Ver documento"
                      data-testid="kardex-doc-link"
                    >
                      {movimiento.documentoReferencia}
                    </DocumentLink>
                  ) : (
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>-</span>
                  )}
                </Td>
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