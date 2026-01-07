/**
 * COMPONENTE: PurchaseOrderList
 * Lista de órdenes de compra con filtros, búsqueda y paginación
 * Fase 2 - Task 4
 * 
 * OPTIMIZADO: Filtros mejorados con iconos y contadores,
 * Botones de transición de estado claros (→ Enviar, → Confirmar, → Crear Recepción)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button,
  Input as SharedInput, 
  Select as SharedSelect,
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
  StatCard,
  StatsGrid,
  StatValue,
  StatLabel,
  StatusBadge,
  ActionButton,
  ButtonGroup as ActionsGroup
} from '../../../components/shared';
import { purchaseOrderService } from '../services';
import type { PurchaseOrder, FilterPurchaseOrderDto, PurchaseOrderStatus } from '../types/purchases.types';
import { 
  PURCHASE_ORDER_STATUS_LABELS, 
  PURCHASE_ORDER_STATUS_COLORS 
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { useClients } from '../../../context/ClientContext';
import { almacenesApi } from '../../../services/almacenesApi';
import { media } from '../../../styles/breakpoints';
import { FiPackage, FiArrowRight } from 'react-icons/fi';

// ==================== TIPOS ====================

interface PurchaseOrderListProps {
  onEdit?: (order: PurchaseOrder) => void;
  onView?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
  onRefresh?: () => void;
  onCreate?: () => void;
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
  
  ${media.mobile} {
    padding: ${SPACING.md};
    border-radius: ${BORDER_RADIUS.sm};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
  gap: ${SPACING.lg};
  
  ${media.mobile} {
    margin-bottom: ${SPACING.md};
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: ${SPACING.xs} 0 0 0;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.lg};
  padding: ${SPACING.lg};
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.md};
  border: 1px solid ${COLORS.border};
  
  ${media.mobile} {
    flex-direction: column;
    gap: ${SPACING.sm};
  }
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  margin-bottom: 4px;
  display: block;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 180px;
  flex: 1;
  
  ${media.mobile} {
    min-width: 100%;
  }
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.body};
  transition: all ${TRANSITIONS.normal};
  
  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 0.2rem ${COLORS.primary}25;
  }
  
  &::placeholder {
    color: ${COLORS.textLight};
  }
`;

const Select = styled.select`
  padding: 8px 16px;
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.body};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
  
  ${media.mobile} {
    width: 100%;
  }
`;

// Helper para obtener variant del StatusBadge según estado de orden
const getEstadoVariant = (status: PurchaseOrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
  const variants: Record<PurchaseOrderStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    PENDIENTE: 'warning',
    ENVIADA: 'info',
    CONFIRMADA: 'info',
    PARCIAL: 'warning',
    COMPLETADA: 'success',
    CANCELADA: 'danger'
  };
  return variants[status] || 'default';
};

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.body};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${COLORS.primary};
  font-size: ${TYPOGRAPHY.fontSize.body};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${COLORS.error};
  font-size: ${TYPOGRAPHY.fontSize.body};
`;

// ==================== COMPONENTE ====================

const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  onEdit,
  onView,
  onDelete,
  onRefresh,
  onCreate,
}) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { clients, loadClients } = useClients();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDeletingRef = useRef<boolean>(false); // ✅ Ref para bloqueo inmediato (sin re-render)
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // ✅ State para UI (con re-render)

  // Filtros
  const [filters, setFilters] = useState<FilterPurchaseOrderDto>({
    page: 1,
    limit: 10,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estado de filtros seleccionados
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [almacenId, setAlmacenId] = useState('');
  
  // Datos para selects
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [almacenes, setAlmacenes] = useState<any[]>([]);

  // ==================== ESTADÍSTICAS ====================
  
  const stats = useMemo(() => {
    const pendientes = orders.filter(o => o.estado === 'PENDIENTE').length;
    const enProceso = orders.filter(o => ['ENVIADA', 'CONFIRMADA', 'EN_RECEPCION', 'PARCIAL'].includes(o.estado)).length;
    const completadas = orders.filter(o => o.estado === 'COMPLETADA').length;
    const canceladas = orders.filter(o => o.estado === 'CANCELADA').length;
    
    return {
      total: totalItems,
      pendientes,
      enProceso,
      completadas,
      canceladas
    };
  }, [orders, totalItems]);

  // ==================== FUNCIONES ====================
  
  const loadInitialData = async () => {
    try {
      // Cargar proveedores
      if (clients.length === 0) {
        await loadClients({ tipoEntidad: 'Proveedor' });
      }
      const suppliers = clients.filter(c => 
        (c.tipoEntidad === 'Proveedor' || c.tipoEntidad === 'Ambos') && c.isActive
      );
      setProveedores(suppliers);
      
      // Cargar almacenes
      const warehousesData = await almacenesApi.getAlmacenes({ activo: true });
      setAlmacenes(warehousesData);
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
    }
  };

  const fetchOrders = useCallback(async (silent: boolean = false) => {
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
      // Solo mostrar notificación si no es recarga silenciosa
      if (!silent) {
        showNotification('error', 'Error de carga', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  const applyFilters = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      estado: selectedStatus || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      proveedorId: proveedorId || undefined,
      almacenId: almacenId || undefined,
      page: 1,
    }));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setFechaDesde('');
    setFechaHasta('');
    setProveedorId('');
    setAlmacenId('');
    setFilters({
      page: 1,
      limit: filters.limit,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleView = (order: PurchaseOrder) => {
    if (onView) {
      onView(order.id);
    }
  };

  const handleEdit = (order: PurchaseOrder) => {
    console.log('🔧 [PurchaseOrderList] handleEdit called:', { orderId: order.id, estado: order.estado, onEdit: !!onEdit });
    if (onEdit) {
      onEdit(order);  // ✅ Pasar orden completa
    } else {
      console.warn('⚠️ [PurchaseOrderList] onEdit prop not provided');
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
      fetchOrders(true);  // ← Recarga silenciosa
    } catch (err: any) {
      const errorMessage = err.message || 'No se pudo actualizar el estado';
      showNotification('error', 'Error al actualizar', errorMessage);
    }
  };
  
  // Obtener próxima transición de estado válida
  const getNextStateTransition = (currentStatus: PurchaseOrderStatus): { status: PurchaseOrderStatus; label: string } | null => {
    switch (currentStatus) {
      case 'PENDIENTE':
        return { status: 'ENVIADA', label: 'Enviar a Proveedor' };
      case 'ENVIADA':
        return { status: 'CONFIRMADA', label: 'Confirmar Orden' };
      // CONFIRMADA → NO permite transición manual, DEBE crear recepción
      // EN_RECEPCION y PARCIAL → Se actualizan automáticamente al confirmar/crear recepciones
      case 'COMPLETADA':
        return null; // No hay siguiente estado después de COMPLETADA
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
    // ✅ Prevenir ejecución múltiple con ref (inmediato, no espera re-render)
    if (isDeletingRef.current) {
      console.log('⚠️ Ya hay una eliminación en progreso, ignorando...');
      return;
    }
    
    // ✅ Bloquear INMEDIATAMENTE (sin esperar re-render)
    isDeletingRef.current = true;
    setIsDeleting(true); // Para el UI (deshabilitar botón)
    
    try {
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
      
      // ✅ Confirmación DESPUÉS de bloquear
      const confirmResult = confirm(`¿Está seguro de CANCELAR la orden ${order.codigo}?\n\nEsta acción cambiará el estado a ANULADA y no se podrá revertir.`);
      
      if (!confirmResult) {
        return;
      }

      // Ejecutar la eliminación
      await purchaseOrderService.deletePurchaseOrder(orderId);
      showNotification('success', 'Orden Cancelada', `La orden ${order.codigo} fue cancelada exitosamente`);
      
      // ✅ Remover la orden de la lista local inmediatamente
      setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
      
      // Llamar al callback para que el padre también actualice
      if (onDelete) {
        onDelete(orderId);
      }
      
      // ✅ SOLO recargar si el filtro actual EXCLUYE órdenes canceladas
      // Si estás filtrando por PENDIENTE/ENVIADA, no hace falta recargar
      // Si estás viendo TODAS o filtrando por CANCELADA, la orden aparecería de nuevo
      const shouldRefetch = !filters.estado || filters.estado === 'CANCELADA';
      if (shouldRefetch) {
        fetchOrders(true);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'No se pudo cancelar la orden de compra';
      showNotification('error', 'Error al cancelar', errorMessage);
    } finally {
      // ✅ Liberar locks SIEMPRE (éxito, error o cancelación)
      isDeletingRef.current = false;
      setIsDeleting(false);
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

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  useEffect(() => {
    loadInitialData();
  }, []);

  // ==================== RENDER ====================

  return (
    <Container>
      {/* Header con título y botón */}
      <Header>
        <TitleSection>
          <Title>Gestión de Órdenes de Compra</Title>
          <PageSubtitle>Gestión de órdenes de compra a proveedores y seguimiento de pedidos</PageSubtitle>
        </TitleSection>
        {onCreate && (
          <Button $variant="primary" onClick={onCreate}>
            <i className="fas fa-plus"></i>
            Nueva Orden
          </Button>
        )}
      </Header>

      {/* Tarjetas de Estadísticas */}
      <StatsGrid>
        <StatCard $color="#3498db">
          <StatValue $color="#3498db">{stats.total}</StatValue>
          <StatLabel>Total Órdenes</StatLabel>
        </StatCard>
        <StatCard $color="#f0ad4e">
          <StatValue $color="#f0ad4e">{stats.pendientes}</StatValue>
          <StatLabel>Pendientes</StatLabel>
        </StatCard>
        <StatCard $color="#17a2b8">
          <StatValue $color="#17a2b8">{stats.enProceso}</StatValue>
          <StatLabel>En Proceso</StatLabel>
        </StatCard>
        <StatCard $color="#28a745">
          <StatValue $color="#28a745">{stats.completadas}</StatValue>
          <StatLabel>Completadas</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Filtros compactos */}
      <FilterContainer>
        <FilterGroup>
          <FilterLabel>Buscar</FilterLabel>
          <FilterInput
            type="text"
            placeholder="Código, proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Estado</FilterLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PurchaseOrderStatus | '')}
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ENVIADA">Enviada</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="EN_RECEPCION">En Recepción</option>
            <option value="PARCIAL">Parcial</option>
            <option value="COMPLETADA">Completada</option>

            <option value="CANCELADA">Cancelada</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Fecha Desde</FilterLabel>
          <FilterInput
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Fecha Hasta</FilterLabel>
          <FilterInput
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Proveedor</FilterLabel>
          <Select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.razonSocial}
              </option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Almacén</FilterLabel>
          <Select
            value={almacenId}
            onChange={(e) => setAlmacenId(e.target.value)}
          >
            <option value="">Todos los almacenes</option>
            {almacenes.map((almacen) => (
              <option key={almacen.id} value={almacen.id}>
                {almacen.nombre}
              </option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup style={{ alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={clearFilters}>
              Limpiar
            </Button>
            <Button $variant="primary" onClick={applyFilters}>
              Buscar
            </Button>
          </div>
        </FilterGroup>
      </FilterContainer>

      {/* Estados */}
      {loading && orders.length === 0 && <LoadingState>Cargando órdenes de compra...</LoadingState>}
      {error && <ErrorState>{error}</ErrorState>}
      
      {/* Tabla */}
      {!error && orders.length === 0 && !loading && (
        <EmptyState>No se encontraron órdenes de compra</EmptyState>
      )}

      {!error && orders.length > 0 && (
        <>
          <SharedTable>
            <SharedThead>
              <tr>
                <SharedTh>Código</SharedTh>
                <SharedTh>Fecha</SharedTh>
                <SharedTh>Proveedor</SharedTh>
                <SharedTh>Almacén</SharedTh>
                <SharedTh>Estado</SharedTh>
                <SharedTh>Total</SharedTh>
                <SharedTh>Acciones</SharedTh>
              </tr>
            </SharedThead>
            <SharedTbody>
              {orders.map((order) => (
                <SharedTr key={order.id}>
                  <SharedTd data-label="Código">{order.codigo}</SharedTd>
                  <SharedTd data-label="Fecha">{formatDate(order.fechaEmision)}</SharedTd>
                  <SharedTd data-label="Proveedor">
                    {order.proveedor?.razonSocial || 'N/A'}
                  </SharedTd>
                  <SharedTd data-label="Almacén">
                    {order.almacenDestino?.nombre || 'N/A'}
                  </SharedTd>
                  <SharedTd data-label="Estado">
                    <StatusBadge variant={getEstadoVariant(order.estado)} dot>
                      {PURCHASE_ORDER_STATUS_LABELS[order.estado]}
                    </StatusBadge>
                  </SharedTd>
                  <SharedTd data-label="Total">{formatCurrency(order.total)}</SharedTd>
                  <SharedTd data-label="Acciones">
                    <ActionsGroup>
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
                          $variant="transition"
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
                        disabled={order.estado === 'COMPLETADA' || order.estado === 'CANCELADA'}
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
                        $variant="deactivate"
                        onClick={() => handleDelete(order.id)}
                        disabled={order.estado === 'COMPLETADA' || order.estado === 'CANCELADA' || isDeleting}
                        title={order.estado === 'CANCELADA' ? 'Orden cancelada' : isDeleting ? 'Cancelando...' : 'Cancelar orden'}
                      >
                        {isDeleting ? 'Cancelando...' : 'Cancelar'}
                      </ActionButton>
                    </ActionsGroup>
                  </SharedTd>
                </SharedTr>
              ))}
            </SharedTbody>
          </SharedTable>

          {/* Paginación */}
          <SharedPaginationContainer>
            <SharedPaginationInfo>
              Mostrando {(filters.page! - 1) * filters.limit! + 1}-{Math.min(filters.page! * filters.limit!, totalItems)} de {totalItems} resultados
            </SharedPaginationInfo>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
              <Select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                style={{ width: 'auto' }}
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
              </Select>
              
              <div style={{ display: 'flex', gap: SPACING.xs }}>
                <PageButton
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                >
                  Anterior
                </PageButton>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (filters.page! <= 2) {
                    pageNum = i + 1;
                  } else if (filters.page! >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = filters.page! - 1 + i;
                  }
                  return (
                    <PageButton
                      key={pageNum}
                      $active={filters.page === pageNum}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  );
                })}
                <PageButton
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page === totalPages || totalPages === 0}
                >
                  Siguiente
                </PageButton>
              </div>
            </div>
          </SharedPaginationContainer>
        </>
      )}
    </Container>
  );
};

export default PurchaseOrderList;
