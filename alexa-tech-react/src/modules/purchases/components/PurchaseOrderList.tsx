/**
 * COMPONENTE: PurchaseOrderList
 * Lista de órdenes de compra con filtros, búsqueda y paginación
 * Fase 2 - Task 4
 * 
 * OPTIMIZADO: Filtros mejorados con iconos y contadores,
 * Botones de transición de estado claros (→ Enviar, → Confirmar, → Crear Recepción)
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { purchaseOrderService } from '../services';
import type { PurchaseOrder, FilterPurchaseOrderDto, PurchaseOrderStatus } from '../types/purchases.types';
import { 
  PURCHASE_ORDER_STATUS_LABELS, 
  PURCHASE_ORDER_STATUS_COLORS 
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { media } from '../../../styles/breakpoints';
import { 
  FiPackage, FiSend, FiCheck, FiTruck, FiAlertCircle, 
  FiCheckCircle, FiLock, FiXCircle, FiArrowRight 
} from 'react-icons/fi';

// ==================== TIPOS ====================

interface PurchaseOrderListProps {
  onEdit?: (orderId: string) => void;
  onView?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
  onRefresh?: () => void;
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
  margin-bottom: 20px;
  flex-wrap: wrap;
  overflow-x: auto;
  padding-bottom: 4px;
  
  ${media.mobile} {
    flex-wrap: nowrap;
    gap: 8px;
    padding-bottom: 8px;
    
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }
  }
`;

const FilterBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: ${props => props.color || '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#333'};
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid ${props => props.$active ? '#007bff' : '#e0e0e0'};
  background: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#555'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: ${props => props.$active ? '0 3px 8px rgba(0, 123, 255, 0.25)' : '0 2px 4px rgba(0,0,0,0.05)'};
  position: relative;

  svg {
    font-size: 16px;
  }

  &:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
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

const StatusBadge = styled.span<{ $status: PurchaseOrderStatus }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => PURCHASE_ORDER_STATUS_COLORS[props.$status] || '#6c757d'};
  color: ${props => {
    // Usar texto oscuro para colores claros (amarillo, naranja)
    const lightColors = ['PENDIENTE', 'PARCIAL'];
    return lightColors.includes(props.$status) ? '#333' : 'white';
  }};
  white-space: nowrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  
  ${media.mobile} {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button<{ $variant?: 'view' | 'edit' | 'delete' | 'pdf' | 'transition' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: ${props => props.$variant === 'transition' ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  svg {
    font-size: 14px;
  }
  
  background-color: ${props => {
    switch (props.$variant) {
      case 'view': return '#17a2b8';
      case 'edit': return '#ffc107';
      case 'delete': return '#dc3545';
      case 'pdf': return '#6c757d';
      case 'transition': return '#28a745';
      default: return '#007bff';
    }
  }};
  color: ${props => props.$variant === 'edit' ? '#333' : 'white'};

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

// ==================== COMPONENTE ====================

const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  onEdit,
  onView,
  onDelete,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState<FilterPurchaseOrderDto>({
    page: 1,
    limit: 10,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estado de filtros seleccionados
  const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Contadores por estado
  const [statusCounts, setStatusCounts] = useState<Record<PurchaseOrderStatus | 'ALL', number>>({
    ALL: 0,
    PENDIENTE: 0,
    ENVIADA: 0,
    CONFIRMADA: 0,
    EN_RECEPCION: 0,
    PARCIAL: 0,
    COMPLETADA: 0,
    CERRADA: 0,
    CANCELADA: 0,
  });

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchOrders();
  }, [filters]);
  
  useEffect(() => {
    fetchStatusCounts();
  }, []);

  // ==================== FUNCIONES ====================
  
  const fetchStatusCounts = async () => {
    try {
      // Obtener conteo total
      const allResponse = await purchaseOrderService.getPurchaseOrders({ limit: 1 });
      const totalCount = allResponse.pagination.total;
      
      // Obtener conteos por estado
      const states: PurchaseOrderStatus[] = [
        'PENDIENTE', 'ENVIADA', 'CONFIRMADA', 'EN_RECEPCION',
        'PARCIAL', 'COMPLETADA', 'CERRADA', 'CANCELADA'
      ];
      
      const counts: Record<PurchaseOrderStatus | 'ALL', number> = {
        ALL: totalCount,
        PENDIENTE: 0,
        ENVIADA: 0,
        CONFIRMADA: 0,
        EN_RECEPCION: 0,
        PARCIAL: 0,
        COMPLETADA: 0,
        CERRADA: 0,
        CANCELADA: 0,
      };
      
      for (const state of states) {
        const response = await purchaseOrderService.getPurchaseOrders({ estado: state, limit: 1 });
        counts[state] = response.pagination.total;
      }
      
      setStatusCounts(counts);
    } catch (err) {
      console.error('Error al obtener conteos:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await purchaseOrderService.getPurchaseOrders(filters);

      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar órdenes de compra';
      setError(errorMessage);
      showNotification('error', 'Error de carga', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: PurchaseOrderStatus | 'ALL') => {
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

  const handleView = (order: PurchaseOrder) => {
    if (onView) {
      onView(order.id);
    }
  };

  const handleEdit = (order: PurchaseOrder) => {
    if (onEdit) {
      onEdit(order.id);
    }
  };
  
  // Función para cambiar estado de orden
  const handleChangeStatus = async (orderId: string, newStatus: PurchaseOrderStatus, observaciones?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const statusLabel = PURCHASE_ORDER_STATUS_LABELS[newStatus];
    
    if (!confirm(`¿Cambiar estado de la orden ${order.codigo} a "${statusLabel}"?`)) {
      return;
    }
    
    try {
      await purchaseOrderService.updatePurchaseOrderStatus(orderId, {
        estado: newStatus,
        observaciones: observaciones || `Cambio automático de estado a ${statusLabel}`,
      });
      showNotification('success', 'Estado Actualizado', `Orden ${order.codigo} cambió a ${statusLabel}`);
      fetchOrders();
      fetchStatusCounts();
    } catch (err: any) {
      const errorMessage = err.message || 'No se pudo actualizar el estado';
      showNotification('error', 'Error al actualizar', errorMessage);
    }
  };
  
  // Obtener icono según estado
  const getStatusIcon = (status: PurchaseOrderStatus | 'ALL') => {
    switch (status) {
      case 'ALL': return <FiPackage />;
      case 'PENDIENTE': return <FiAlertCircle />;
      case 'ENVIADA': return <FiSend />;
      case 'CONFIRMADA': return <FiCheck />;
      case 'EN_RECEPCION': return <FiTruck />;
      case 'PARCIAL': return <FiAlertCircle />;
      case 'COMPLETADA': return <FiCheckCircle />;
      case 'CERRADA': return <FiLock />;
      case 'CANCELADA': return <FiXCircle />;
      default: return <FiPackage />;
    }
  };
  
  // Obtener próxima transición de estado válida
  const getNextStateTransition = (currentStatus: PurchaseOrderStatus): { status: PurchaseOrderStatus; label: string } | null => {
    switch (currentStatus) {
      case 'PENDIENTE':
        return { status: 'ENVIADA', label: 'Enviar a Proveedor' };
      case 'ENVIADA':
        return { status: 'CONFIRMADA', label: 'Confirmar Orden' };
      // CONFIRMADA → No hay transición manual, debe crear recepción
      // EN_RECEPCION y PARCIAL → Se actualizan automáticamente al confirmar recepciones
      case 'COMPLETADA':
        return { status: 'CERRADA', label: 'Cerrar Orden' };
      default:
        return null;
    }
  };

  // Verificar si la orden puede crear una recepción
  const canCreateReceipt = (status: PurchaseOrderStatus): boolean => {
    return ['CONFIRMADA', 'EN_RECEPCION', 'PARCIAL'].includes(status);
  };

  // Navegar a crear recepción
  const handleCreateReceipt = (orderId: string) => {
    navigate(`/compras/recepciones/crear?ordenId=${orderId}`);
  };

  const handleDelete = async (orderId: string) => {
    // Encontrar la orden para validar
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      showNotification('error', 'Error', 'No se encontró la orden especificada');
      return;
    }
    
    // Validar estados permitidos
    const estadosPermitidos = ['PENDIENTE', 'ENVIADA'];
    if (!estadosPermitidos.includes(order.estado)) {
      showNotification(
        'warning',
        'Acción no permitida',
        `No se puede cancelar una orden en estado ${PURCHASE_ORDER_STATUS_LABELS[order.estado as PurchaseOrderStatus]}. Solo se permiten órdenes PENDIENTE o ENVIADA.`
      );
      return;
    }
    
    if (!confirm(`¿Está seguro de CANCELAR la orden ${order.codigo}?\n\nEsta acción cambiará el estado a ANULADA y no se podrá revertir.`)) {
      return;
    }

    try {
      await purchaseOrderService.deletePurchaseOrder(orderId);
      showNotification('success', 'Orden Cancelada', `La orden ${order.codigo} fue cancelada exitosamente`);
      fetchOrders();
      
      if (onDelete) {
        onDelete(orderId);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'No se pudo cancelar la orden de compra';
      showNotification('error', 'Error al cancelar', errorMessage);
    }
  };

  const handleDownloadPDF = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    const orderCode = order?.codigo || 'N/A';
    
    try {
      showNotification('info', 'Generando PDF', `Preparando documento de la orden ${orderCode}`);
      
      await purchaseOrderService.downloadPDF(orderId);
      
      showNotification('success', 'PDF Descargado', `Orden ${orderCode} descargada exitosamente`);
    } catch (err: any) {
      console.error('Error al descargar PDF:', err);
      const errorMessage = err.message || 'No se pudo generar el PDF. Intente nuevamente.';
      showNotification('error', 'Error al descargar PDF', errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  // ==================== RENDER ====================

  return (
    <Container>
      <Header>
        <Title>Órdenes de Compra</Title>
      </Header>

      {/* Filtros con iconos y contadores */}
      <FilterContainer>
        <FilterButton
          $active={selectedStatus === 'ALL'}
          onClick={() => handleStatusFilter('ALL')}
        >
          {getStatusIcon('ALL')}
          <span>Todos</span>
          <FilterBadge color={selectedStatus === 'ALL' ? 'rgba(255,255,255,0.3)' : '#e0e0e0'} theme={selectedStatus === 'ALL' ? 'dark' : 'light'}>
            {statusCounts.ALL}
          </FilterBadge>
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'PENDIENTE'}
          onClick={() => handleStatusFilter('PENDIENTE')}
        >
          {getStatusIcon('PENDIENTE')}
          <span>Pendientes</span>
          <FilterBadge color={selectedStatus === 'PENDIENTE' ? 'rgba(255,255,255,0.3)' : '#ffc107'} theme={selectedStatus === 'PENDIENTE' ? 'dark' : 'light'}>
            {statusCounts.PENDIENTE}
          </FilterBadge>
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'ENVIADA'}
          onClick={() => handleStatusFilter('ENVIADA')}
        >
          {getStatusIcon('ENVIADA')}
          <span>Enviadas</span>
          <FilterBadge color={selectedStatus === 'ENVIADA' ? 'rgba(255,255,255,0.3)' : '#17a2b8'} theme={selectedStatus === 'ENVIADA' ? 'dark' : 'light'}>
            {statusCounts.ENVIADA}
          </FilterBadge>
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'CONFIRMADA'}
          onClick={() => handleStatusFilter('CONFIRMADA')}
        >
          {getStatusIcon('CONFIRMADA')}
          <span>Confirmadas</span>
          <FilterBadge color={selectedStatus === 'CONFIRMADA' ? 'rgba(255,255,255,0.3)' : '#007bff'} theme={selectedStatus === 'CONFIRMADA' ? 'dark' : 'light'}>
            {statusCounts.CONFIRMADA}
          </FilterBadge>
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'EN_RECEPCION'}
          onClick={() => handleStatusFilter('EN_RECEPCION')}
        >
          {getStatusIcon('EN_RECEPCION')}
          <span>En Recepción</span>
          <FilterBadge color={selectedStatus === 'EN_RECEPCION' ? 'rgba(255,255,255,0.3)' : '#6f42c1'} theme={selectedStatus === 'EN_RECEPCION' ? 'dark' : 'light'}>
            {statusCounts.EN_RECEPCION}
          </FilterBadge>
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'PARCIAL'}
          onClick={() => handleStatusFilter('PARCIAL')}
        >
          {getStatusIcon('PARCIAL')}
          <span>Parcial</span>
          <FilterBadge color={selectedStatus === 'PARCIAL' ? 'rgba(255,255,255,0.3)' : '#fd7e14'} theme={selectedStatus === 'PARCIAL' ? 'dark' : 'light'}>
            {statusCounts.PARCIAL}
          </FilterBadge>
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'COMPLETADA'}
          onClick={() => handleStatusFilter('COMPLETADA')}
        >
          {getStatusIcon('COMPLETADA')}
          <span>Completadas</span>
          <FilterBadge color={selectedStatus === 'COMPLETADA' ? 'rgba(255,255,255,0.3)' : '#28a745'} theme={selectedStatus === 'COMPLETADA' ? 'dark' : 'light'}>
            {statusCounts.COMPLETADA}
          </FilterBadge>
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'CERRADA'}
          onClick={() => handleStatusFilter('CERRADA')}
        >
          {getStatusIcon('CERRADA')}
          <span>Cerradas</span>
          <FilterBadge color={selectedStatus === 'CERRADA' ? 'rgba(255,255,255,0.3)' : '#6c757d'} theme={selectedStatus === 'CERRADA' ? 'dark' : 'light'}>
            {statusCounts.CERRADA}
          </FilterBadge>
          {getStatusIcon('CERRADA')}
          <span>Cerradas</span>
          <FilterBadge color={selectedStatus === 'CERRADA' ? 'rgba(255,255,255,0.3)' : '#6c757d'} theme={selectedStatus === 'CERRADA' ? 'dark' : 'light'}>
            {statusCounts.CERRADA}
          </FilterBadge>
        </FilterButton>
        <FilterButton
          $active={selectedStatus === 'CANCELADA'}
          onClick={() => handleStatusFilter('CANCELADA')}
        >
          {getStatusIcon('CANCELADA')}
          <span>Canceladas</span>
          <FilterBadge color={selectedStatus === 'CANCELADA' ? 'rgba(255,255,255,0.3)' : '#dc3545'} theme={selectedStatus === 'CANCELADA' ? 'dark' : 'light'}>
            {statusCounts.CANCELADA}
          </FilterBadge>
        </FilterButton>
      </FilterContainer>

      {/* Búsqueda */}
      <HeaderActions>
        <SearchBar
          type="text"
          placeholder="Buscar por código, proveedor..."
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
      {loading && <LoadingState>Cargando órdenes de compra...</LoadingState>}
      {error && <ErrorState>{error}</ErrorState>}
      
      {/* Tabla */}
      {!loading && !error && orders.length === 0 && (
        <EmptyState>No se encontraron órdenes de compra</EmptyState>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <Table>
            <Thead>
              <tr>
                <Th>Código</Th>
                <Th>Fecha</Th>
                <Th>Proveedor</Th>
                <Th>Almacén</Th>
                <Th>Estado</Th>
                <Th>Total</Th>
                <Th>Acciones</Th>
              </tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td data-label="Código">{order.codigo}</Td>
                  <Td data-label="Fecha">{formatDate(order.fechaEmision)}</Td>
                  <Td data-label="Proveedor">
                    {order.proveedor?.razonSocial || 'N/A'}
                  </Td>
                  <Td data-label="Almacén">
                    {order.almacenDestino?.nombre || 'N/A'}
                  </Td>
                  <Td data-label="Estado">
                    <StatusBadge $status={order.estado}>
                      {PURCHASE_ORDER_STATUS_LABELS[order.estado]}
                    </StatusBadge>
                  </Td>
                  <Td data-label="Total">{formatCurrency(order.total)}</Td>
                  <Td data-label="Acciones">
                    <ActionButtons>
                      {/* Botón de transición de estado (si aplica) */}
                      {(() => {
                        const nextTransition = getNextStateTransition(order.estado);
                        if (nextTransition) {
                          return (
                            <ActionButton
                              $variant="transition"
                              onClick={() => handleChangeStatus(order.id, nextTransition.status)}
                              title={`Cambiar estado a ${PURCHASE_ORDER_STATUS_LABELS[nextTransition.status]}`}
                            >
                              <FiArrowRight />
                              {nextTransition.label}
                            </ActionButton>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Botón Crear Recepción (solo para estados válidos) */}
                      {canCreateReceipt(order.estado) && (
                        <ActionButton
                          $variant="success"
                          onClick={() => handleCreateReceipt(order.id)}
                          title="Crear recepción de productos"
                        >
                          <FiPackage />
                          Crear Recepción
                        </ActionButton>
                      )}
                      
                      <ActionButton
                        $variant="view"
                        onClick={() => handleView(order)}
                        title="Ver detalle"
                      >
                        Ver
                      </ActionButton>
                      <ActionButton
                        $variant="edit"
                        onClick={() => handleEdit(order)}
                        disabled={order.estado === 'COMPLETADA' || order.estado === 'CERRADA' || order.estado === 'CANCELADA'}
                        title="Editar orden"
                      >
                        Editar
                      </ActionButton>
                      <ActionButton
                        $variant="pdf"
                        onClick={() => handleDownloadPDF(order.id)}
                        title="Descargar PDF"
                      >
                        PDF
                      </ActionButton>
                      <ActionButton
                        $variant="delete"
                        onClick={() => handleDelete(order.id)}
                        disabled={order.estado === 'COMPLETADA'}
                        title="Eliminar orden"
                      >
                        Cancelar
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
              Mostrando {(filters.page! - 1) * filters.limit! + 1} - {Math.min(filters.page! * filters.limit!, totalItems)} de {totalItems} órdenes
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

export default PurchaseOrderList;
