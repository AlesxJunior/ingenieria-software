/**
 * COMPONENTE: PurchaseReceiptList
 * Lista de recepciones de compra con filtros, búsqueda y paginación
 * Fase 3 - Task 7
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS, COLOR_SCALES } from '../../../styles/theme';
import { 
  Button,
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
  Select,
  StatusBadge,
  ActionButton,
  ButtonGroup as ActionsGroup
} from '../../../components/shared';
import { purchaseReceiptService } from '../services';
import type { PurchaseReceipt, FilterPurchaseReceiptDto, PurchaseReceiptStatus } from '../types/purchases.types';
import { 
  PURCHASE_RECEIPT_STATUS_LABELS, 
  PURCHASE_RECEIPT_STATUS_COLORS 
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { almacenesApi } from '../../../services/almacenesApi';
import { media } from '../../../styles/breakpoints';

// ==================== TIPOS ====================

interface PurchaseReceiptListProps {
  onView?: (receiptId: string) => void;
  onConfirm?: (receipt: PurchaseReceipt) => void;
  onCancel?: (receipt: PurchaseReceipt) => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  orderFilter?: string; // ID de orden para filtrar recepciones
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
  
  ${media.mobile} {
    padding: ${SPACING.md};
    border-radius: ${BORDER_RADIUS.md};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
  
  ${media.mobile} {
    margin-bottom: ${SPACING.md};
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
  
  ${media.mobile} {
    font-size: ${TYPOGRAPHY.fontSize.lg};
  }
`;

const PageSubtitle = styled.p`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${SPACING.sm};
  align-items: center;
  flex-wrap: wrap;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.lg};
  flex-wrap: wrap;
  padding: ${SPACING.lg};
  background: ${COLORS.neutral[50]};
  border-radius: ${BORDER_RADIUS.md};
  
  ${media.mobile} {
    flex-direction: column;
    gap: ${SPACING.md};
    padding: ${SPACING.md};
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
  min-width: 150px;
  flex: 1;
  
  ${media.mobile} {
    min-width: unset;
  }
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FilterInput = styled.input`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  transition: ${TRANSITIONS.fast};
  
  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primary}20;
  }
`;

const FilterSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  cursor: pointer;
  background: white;
  transition: ${TRANSITIONS.fast};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primary}20;
  }
  
  ${media.mobile} {
    width: 100%;
  }
`;

// Helper para obtener variant del StatusBadge según estado de recepción
const getEstadoVariant = (status: PurchaseReceiptStatus): 'success' | 'warning' | 'danger' | 'info' => {
  const variants: Record<PurchaseReceiptStatus, 'success' | 'warning' | 'danger' | 'info'> = {
    PENDIENTE: 'warning',
    INSPECCION: 'info',
    CONFIRMADA: 'success',
    CANCELADA: 'danger'
  };
  return variants[status] || 'info';
};

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING.xxl} ${SPACING.xl};
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.md};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${SPACING.xxl} ${SPACING.xl};
  color: ${COLORS.primary};
  font-size: ${TYPOGRAPHY.fontSize.md};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${SPACING.xxl} ${SPACING.xl};
  color: ${COLOR_SCALES.danger[500]};
  font-size: ${TYPOGRAPHY.fontSize.md};
`;

const OrderLink = styled.a`
  color: ${COLORS.primary};
  text-decoration: none;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  
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
  onCreate,
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

  // Estado de filtros compactos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PurchaseReceiptStatus | ''>('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [ordenCompraId, setOrdenCompraId] = useState(orderFilter || '');
  const [almacenId, setAlmacenId] = useState('');
  const [almacenes, setAlmacenes] = useState<Array<{id: string; nombre: string}>>([]);

  // ==================== FUNCIONES ====================

  const loadInitialData = async () => {
    try {
      const almacenesData = await almacenesApi.getAlmacenes({ activo: true });
      setAlmacenes(almacenesData);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  const applyFilters = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      estado: selectedStatus || undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      ordenCompraId: ordenCompraId || undefined,
      almacenId: almacenId || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setFechaDesde('');
    setFechaHasta('');
    setOrdenCompraId(orderFilter || '');
    setAlmacenId('');
    setFilters({
      page: 1,
      limit: filters.limit,
      ordenCompraId: orderFilter,
    });
  };

  const fetchReceipts = useCallback(async () => {
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
      showNotification('error', 'Error de Carga', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleView = (receipt: PurchaseReceipt) => {
    if (onView) {
      onView(receipt.id);
    }
  };

  /**
   * Verificar si una recepción está completa (todos los items con cantidades recibidas)
   */
  const isReceiptComplete = (receipt: PurchaseReceipt): boolean => {
    if (!receipt.items || receipt.items.length === 0) return false;
    
    // Para recepciones PENDIENTES: validar que ingresaste cantidades
    // Para recepciones CONFIRMADAS: siempre están completas
    if (receipt.estado !== 'PENDIENTE') return true;
    
    // Todos los items deben tener cantidadRecibida > 0
    return receipt.items.every(item => {
      const recibida = item.cantidadRecibida || 0;
      return recibida > 0;
    });
  };

  const handleConfirm = async (receipt: PurchaseReceipt) => {
    // Validaciones de negocio
    if (receipt.estado !== 'PENDIENTE') {
      showNotification('error', 'Acción No Permitida', 'Solo se pueden confirmar recepciones con estado PENDIENTE');
      return;
    }

    if (!user?.id) {
      showNotification('error', 'Sesión Requerida', 'Debe iniciar sesión para confirmar recepciones');
      return;
    }

    // Validar que la recepción tenga items con cantidades
    if (!receipt.items || receipt.items.length === 0) {
      showNotification('error', 'Recepción Incompleta', 'La recepción no tiene items. Edite la recepción para agregar los productos recibidos.');
      return;
    }

    // Validar que TODOS los items tengan cantidad recibida (recepción completa)
    const recepcionCompleta = isReceiptComplete(receipt);
    if (!recepcionCompleta) {
      showNotification('error', 'Recepción Incompleta', 'Todos los productos deben tener cantidades recibidas. Use "Ver" para completar los detalles de la recepción.');
      return;
    }

    if (!confirm(`¿Confirmar recepción ${receipt.codigo}?\n\nEsto actualizará el inventario y NO se podrá revertir.`)) {
      return;
    }

    try {
      await purchaseReceiptService.confirmPurchaseReceipt(receipt.id, {
        inspeccionadoPorId: user.id,
        items: []
      });
      showNotification('success', 'Recepción Confirmada', `${receipt.codigo} confirmada. El inventario se ha actualizado correctamente.`);
      fetchReceipts();
      
      if (onConfirm) {
        onConfirm(receipt);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al confirmar recepción';
      showNotification('error', 'Error al Confirmar', errorMessage);
    }
  };

  const handleCancelReceipt = async (receipt: PurchaseReceipt) => {
    if (receipt.estado === 'CANCELADA') {
      showNotification('warning', 'Ya Cancelada', 'Esta recepción ya se encuentra en estado CANCELADA');
      return;
    }

    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) {
      return;
    }

    try {
      await purchaseReceiptService.cancelPurchaseReceipt(receipt.id, motivo);
      showNotification('success', 'Recepción Anulada', `${receipt.codigo} se ha anulado correctamente`);
      fetchReceipts();
      
      if (onCancel) {
        onCancel(receipt);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al anular recepción';
      showNotification('error', 'Error al Anular', errorMessage);
    }
  };

  const handleDownloadPDF = async (receiptId: string) => {
    try {
      await purchaseReceiptService.downloadPDF(receiptId);
      showNotification('success', 'PDF Descargado', 'El documento se ha descargado correctamente');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al descargar PDF';
      showNotification('error', 'Error al Descargar', errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Stats Cards
  const stats = useMemo(() => {
    const pendientes = receipts.filter(r => r.estado === 'PENDIENTE').length;
    const inspeccion = receipts.filter(r => r.estado === 'INSPECCION').length;
    const confirmadas = receipts.filter(r => r.estado === 'CONFIRMADA').length;
    const canceladas = receipts.filter(r => r.estado === 'CANCELADA').length;
    return { total: totalItems, pendientes, inspeccion, confirmadas, canceladas };
  }, [receipts, totalItems]);

  // ==================== EFECTOS ====================

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  useEffect(() => {
    if (orderFilter) {
      setOrdenCompraId(orderFilter);
      setFilters(prev => ({ ...prev, ordenCompraId: orderFilter }));
    }
  }, [orderFilter]);

  // ==================== RENDER ====================

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Gestión de Recepciones de Compra</Title>
          <PageSubtitle>Control de recepciones de mercadería y verificación de entregas</PageSubtitle>
        </TitleSection>
        <HeaderActions>
          {onCreate && (
            <Button $variant="primary" onClick={onCreate}>
              <i className="fas fa-plus"></i>
              Nueva Recepción
            </Button>
          )}
        </HeaderActions>
      </Header>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard $color="#3498db">
          <StatValue $color="#3498db">{stats.total}</StatValue>
          <StatLabel>Total Recepciones</StatLabel>
        </StatCard>
        <StatCard $color="#f39c12">
          <StatValue $color="#f39c12">{stats.pendientes}</StatValue>
          <StatLabel>Pendientes</StatLabel>
        </StatCard>
        <StatCard $color="#9b59b6">
          <StatValue $color="#9b59b6">{stats.inspeccion}</StatValue>
          <StatLabel>En Inspección</StatLabel>
        </StatCard>
        <StatCard $color="#27ae60">
          <StatValue $color="#27ae60">{stats.confirmadas}</StatValue>
          <StatLabel>Confirmadas</StatLabel>
        </StatCard>
        <StatCard $color="#e74c3c">
          <StatValue $color="#e74c3c">{stats.canceladas}</StatValue>
          <StatLabel>Canceladas</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Filtros compactos */}
      <FilterContainer>
        <FilterGroup>
          <FilterLabel>Buscar</FilterLabel>
          <FilterInput
            type="text"
            placeholder="Código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Estado</FilterLabel>
          <FilterSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as PurchaseReceiptStatus | '')}
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="INSPECCION">En Inspección</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="CANCELADA">Cancelada</option>
          </FilterSelect>
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
          <FilterLabel>Almacén</FilterLabel>
          <FilterSelect
            value={almacenId}
            onChange={(e) => setAlmacenId(e.target.value)}
          >
            <option value="">Todos los almacenes</option>
            {almacenes.map((almacen) => (
              <option key={almacen.id} value={almacen.id}>
                {almacen.nombre}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup style={{ alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={clearFilters}>Limpiar</Button>
            <Button $variant="primary" onClick={applyFilters}>Buscar</Button>
          </div>
        </FilterGroup>
      </FilterContainer>

      {/* Estados */}
      {loading && receipts.length === 0 && <LoadingState>Cargando recepciones...</LoadingState>}
      {error && <ErrorState>{error}</ErrorState>}
      
      {/* Tabla */}
      {!error && receipts.length === 0 && !loading && (
        <EmptyState>No se encontraron recepciones</EmptyState>
      )}

      {!error && receipts.length > 0 && (
        <>
          <SharedTable>
            <SharedThead>
              <tr>
                <SharedTh>Código</SharedTh>
                <SharedTh>Fecha Recepción</SharedTh>
                <SharedTh>Orden Compra</SharedTh>
                <SharedTh>Items</SharedTh>
                <SharedTh>Estado</SharedTh>
                <SharedTh>Acciones</SharedTh>
              </tr>
            </SharedThead>
            <SharedTbody>
              {receipts.map((receipt) => (
                <SharedTr key={receipt.id}>
                  <SharedTd data-label="Código">{receipt.codigo}</SharedTd>
                  <SharedTd data-label="Fecha">{formatDate(receipt.fechaRecepcion)}</SharedTd>
                  <SharedTd data-label="Orden Compra">
                    {receipt.ordenCompra?.codigo ? (
                      <OrderLink href={`#orden-${receipt.ordenCompraId}`}>
                        {receipt.ordenCompra.codigo}
                      </OrderLink>
                    ) : (
                      'N/A'
                    )}
                  </SharedTd>
                  <SharedTd data-label="Items">
                    {receipt.items.length} productos
                    {receipt.estado === 'PENDIENTE' && (
                      <span style={{ marginLeft: '8px', fontSize: '0.85em', color: isReceiptComplete(receipt) ? '#10b981' : '#f59e0b' }}>
                        {isReceiptComplete(receipt) ? '✓ Completa' : '⚠ Incompleta'}
                      </span>
                    )}
                  </SharedTd>
                  <SharedTd data-label="Estado">
                    <StatusBadge variant={getEstadoVariant(receipt.estado)} dot>
                      {PURCHASE_RECEIPT_STATUS_LABELS[receipt.estado]}
                    </StatusBadge>
                  </SharedTd>
                  <SharedTd data-label="Acciones">
                    <ActionsGroup>
                      <ActionButton
                        $variant="view"
                        onClick={() => handleView(receipt)}
                        title="Ver detalle"
                      >
                        Ver
                      </ActionButton>
                      {receipt.estado === 'PENDIENTE' && isReceiptComplete(receipt) && (
                        <ActionButton
                          $variant="activate"
                          onClick={() => handleConfirm(receipt)}
                          title="Confirmar recepción (actualiza inventario)"
                        >
                          Confirmar
                        </ActionButton>
                      )}
                      <ActionButton
                        $variant="pdf"
                        onClick={() => handleDownloadPDF(receipt.id)}
                        title="Descargar PDF"
                      >
                        PDF
                      </ActionButton>
                      <ActionButton
                        $variant="deactivate"
                        onClick={() => handleCancelReceipt(receipt)}
                        disabled={receipt.estado === 'CANCELADA'}
                        title="Anular recepción"
                      >
                        Anular
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
                <option value="10">10 por página</option>
                <option value="25">25 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
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

export default PurchaseReceiptList;
