/**
 * COMPONENTE: PurchaseReceiptList
 * Lista de recepciones de compra con filtros, búsqueda y paginación
 * Fase 3 - Task 7
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { purchaseReceiptService } from '../services';
import type { PurchaseReceipt, FilterPurchaseReceiptDto, PurchaseReceiptStatus } from '../types/purchases.types';
import { 
  PURCHASE_RECEIPT_STATUS_LABELS, 
  PURCHASE_RECEIPT_STATUS_COLORS 
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { media } from '../../../styles/breakpoints';

// ==================== TIPOS ====================

interface PurchaseReceiptListProps {
  onView?: (receiptId: string) => void;
  onConfirm?: (receipt: PurchaseReceipt) => void;
  onCancel?: (receipt: PurchaseReceipt) => void;
  onRefresh?: () => void;
  orderFilter?: string; // ID de orden para filtrar recepciones
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  ${media.mobile} {
    padding: 16px;
    border-radius: 6px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
  
  ${media.mobile} {
    margin-bottom: 16px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0;
  
  ${media.mobile} {
    font-size: 18px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  
  ${media.mobile} {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  ${media.mobile} {
    flex-direction: column;
    gap: 8px;
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$active ? '#007bff' : '#ddd'};
  background: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
    color: ${props => props.$active ? 'white' : '#007bff'};
  }
  
  ${media.mobile} {
    flex: 1;
  }
`;

const SearchBar = styled.input`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  min-width: 250px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  ${media.mobile} {
    width: 100%;
    min-width: unset;
  }
`;

const Select = styled.select`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  ${media.mobile} {
    width: 100%;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  ${media.mobile} {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const Thead = styled.thead`
  background-color: #f8f9fa;
  
  ${media.mobile} {
    display: none;
  }
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid #dee2e6;

  &:hover {
    background-color: #f8f9fa;
  }
  
  ${media.mobile} {
    display: block;
    margin-bottom: 16px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 12px;
  }
`;

const Td = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #333;
  
  ${media.mobile} {
    display: block;
    padding: 8px 0;
    border-bottom: none;
    
    &:before {
      content: attr(data-label);
      font-weight: 600;
      display: inline-block;
      width: 120px;
      color: #666;
    }
  }
`;

const StatusBadge = styled.span<{ $status: PurchaseReceiptStatus }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => PURCHASE_RECEIPT_STATUS_COLORS[props.$status] || '#6c757d'};
  color: white;
  white-space: nowrap;
  opacity: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  
  ${media.mobile} {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button<{ $variant?: 'view' | 'confirm' | 'cancel' | 'pdf' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => {
    switch (props.$variant) {
      case 'view': return '#17a2b8';
      case 'confirm': return '#28a745';
      case 'cancel': return '#dc3545';
      case 'pdf': return '#6c757d';
      default: return '#007bff';
    }
  }};
  color: white;

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${media.mobile} {
    flex: 1;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
  
  ${media.mobile} {
    flex-direction: column;
    gap: 12px;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #666;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  
  ${media.mobile} {
    width: 100%;
    justify-content: center;
  }
`;

const PaginationButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 16px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #007bff;
  font-size: 16px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #dc3545;
  font-size: 16px;
`;

const OrderLink = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

// ==================== COMPONENTE ====================

const PurchaseReceiptList: React.FC<PurchaseReceiptListProps> = ({
  onView,
  onConfirm,
  onCancel,
  onRefresh,
  orderFilter,
}) => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState<FilterPurchaseReceiptDto>({
    page: 1,
    limit: 10,
    ordenCompraId: orderFilter,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estado de filtros seleccionados
  const [selectedStatus, setSelectedStatus] = useState<PurchaseReceiptStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchReceipts();
  }, [filters]);

  useEffect(() => {
    if (orderFilter) {
      setFilters(prev => ({ ...prev, ordenCompraId: orderFilter }));
    }
  }, [orderFilter]);

  // ==================== FUNCIONES ====================

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await purchaseReceiptService.getPurchaseReceipts(filters);

      setReceipts(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar recepciones';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: PurchaseReceiptStatus | 'ALL') => {
    setSelectedStatus(status);
    setFilters(prev => ({
      ...prev,
      estado: status === 'ALL' ? undefined : status,
      page: 1,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: value || undefined,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (receipt: PurchaseReceipt) => {
    if (onView) {
      onView(receipt.id);
    }
  };

  const handleConfirm = async (receipt: PurchaseReceipt) => {
    if (receipt.estado !== 'PENDIENTE') {
      showNotification('Solo se pueden confirmar recepciones pendientes', 'error');
      return;
    }

    if (!user?.id) {
      showNotification('Error: Usuario no autenticado', 'error');
      return;
    }

    if (!confirm(`¿Confirmar recepción ${receipt.codigo}? Esto actualizará el inventario.`)) {
      return;
    }

    try {
      await purchaseReceiptService.confirmPurchaseReceipt(receipt.id, {
        inspeccionadoPorId: user.id,
        items: []
      });
      showNotification(`Recepción ${receipt.codigo} confirmada. El inventario ha sido actualizado.`, 'success');
      fetchReceipts();
      
      if (onConfirm) {
        onConfirm(receipt);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al confirmar recepción';
      showNotification(errorMessage, 'error');
    }
  };

  const handleCancelReceipt = async (receipt: PurchaseReceipt) => {
    if (receipt.estado === 'CANCELADA') {
      showNotification('La recepción ya está cancelada', 'error');
      return;
    }

    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) {
      return;
    }

    try {
      await purchaseReceiptService.cancelPurchaseReceipt(receipt.id, motivo);
      showNotification(`Recepción ${receipt.codigo} anulada correctamente.`, 'success');
      fetchReceipts();
      
      if (onCancel) {
        onCancel(receipt);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al anular recepción';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDownloadPDF = async (receiptId: string) => {
    try {
      await purchaseReceiptService.downloadPDF(receiptId);
      showNotification('PDF de recepción descargado correctamente', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al descargar PDF';
      showNotification(errorMessage, 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // ==================== RENDER ====================

  return (
    <Container>
      <Header>
        <Title>Recepciones de Compra</Title>
      </Header>

      {/* Filtros */}
      <FilterContainer>
        <FilterButton
          $active={selectedStatus === 'ALL'}
          onClick={() => handleStatusFilter('ALL')}
        >
          Todos
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'PENDIENTE'}
          onClick={() => handleStatusFilter('PENDIENTE')}
        >
          Pendientes
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'INSPECCION'}
          onClick={() => handleStatusFilter('INSPECCION')}
        >
          En Inspección
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'CONFIRMADA'}
          onClick={() => handleStatusFilter('CONFIRMADA')}
        >
          Confirmadas
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'CANCELADA'}
          onClick={() => handleStatusFilter('CANCELADA')}
        >
          Canceladas
        </FilterButton>
      </FilterContainer>

      {/* Búsqueda */}
      <HeaderActions>
        <SearchBar
          type="text"
          placeholder="Buscar por código..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          value={filters.limit}
          onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
        >
          <option value={10}>10 por página</option>
          <option value={25}>25 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </Select>
      </HeaderActions>

      {/* Estados */}
      {loading && <LoadingState>Cargando recepciones...</LoadingState>}
      {error && <ErrorState>{error}</ErrorState>}
      
      {/* Tabla */}
      {!loading && !error && receipts.length === 0 && (
        <EmptyState>No se encontraron recepciones</EmptyState>
      )}

      {!loading && !error && receipts.length > 0 && (
        <>
          <Table>
            <Thead>
              <tr>
                <Th>Código</Th>
                <Th>Fecha Recepción</Th>
                <Th>Orden Compra</Th>
                <Th>Items</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </Thead>
            <Tbody>
              {receipts.map((receipt) => (
                <Tr key={receipt.id}>
                  <Td data-label="Código">{receipt.codigo}</Td>
                  <Td data-label="Fecha">{formatDate(receipt.fechaRecepcion)}</Td>
                  <Td data-label="Orden Compra">
                    {receipt.ordenCompra?.codigo ? (
                      <OrderLink href={`#orden-${receipt.ordenCompraId}`}>
                        {receipt.ordenCompra.codigo}
                      </OrderLink>
                    ) : (
                      'N/A'
                    )}
                  </Td>
                  <Td data-label="Items">{receipt.items.length} productos</Td>
                  <Td data-label="Estado">
                    <StatusBadge $status={receipt.estado}>
                      {PURCHASE_RECEIPT_STATUS_LABELS[receipt.estado]}
                    </StatusBadge>
                  </Td>
                  <Td data-label="Acciones">
                    <ActionButtons>
                      <ActionButton
                        $variant="view"
                        onClick={() => handleView(receipt)}
                        title="Ver detalle"
                      >
                        Ver
                      </ActionButton>
                      <ActionButton
                        $variant="confirm"
                        onClick={() => handleConfirm(receipt)}
                        disabled={receipt.estado !== 'PENDIENTE'}
                        title="Confirmar recepción"
                      >
                        Confirmar
                      </ActionButton>
                      <ActionButton
                        $variant="pdf"
                        onClick={() => handleDownloadPDF(receipt.id)}
                        title="Descargar PDF"
                      >
                        PDF
                      </ActionButton>
                      <ActionButton
                        $variant="cancel"
                        onClick={() => handleCancelReceipt(receipt)}
                        disabled={receipt.estado === 'CANCELADA'}
                        title="Anular recepción"
                      >
                        Anular
                      </ActionButton>
                    </ActionButtons>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {/* Paginación */}
          <Pagination>
            <PaginationInfo>
              Mostrando {(filters.page! - 1) * filters.limit! + 1} - {Math.min(filters.page! * filters.limit!, totalItems)} de {totalItems} recepciones
            </PaginationInfo>
            <PaginationButtons>
              <PaginationButton
                onClick={() => handlePageChange(1)}
                disabled={filters.page === 1}
              >
                Primera
              </PaginationButton>
              <PaginationButton
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
              >
                Anterior
              </PaginationButton>
              <PaginationButton disabled>
                Página {filters.page} de {totalPages}
              </PaginationButton>
              <PaginationButton
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page === totalPages}
              >
                Siguiente
              </PaginationButton>
              <PaginationButton
                onClick={() => handlePageChange(totalPages)}
                disabled={filters.page === totalPages}
              >
                Última
              </PaginationButton>
            </PaginationButtons>
          </Pagination>
        </>
      )}
    </Container>
  );
};

export default PurchaseReceiptList;
