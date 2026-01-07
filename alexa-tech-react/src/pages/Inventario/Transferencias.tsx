import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Layout from '../../components/Layout';
import { media } from '../../styles/breakpoints';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../styles/theme';
import ModalNuevaTransferencia from '../../components/Inventario/ModalNuevaTransferencia';
import { exportTransferencias } from '../../utils/excelExport';
import { 
  StatCard as SharedStatCard,
  StatsGrid as SharedStatsGrid,
  StatValue,
  StatLabel as SharedStatLabel,
  Button as SharedButton,
  StatusBadge,
  ActionButton,
  ButtonGroup as ActionsGroup
} from '../../components/shared';

// ============================================
// TIPOS
// ============================================

type TransferStatus = 'PENDIENTE' | 'APROBADO' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO';

interface Transfer {
  id: string;
  codigo: string;
  product: {
    id: string;
    codigo: string;
    nombre: string;
  };
  cantidad: number;
  warehouseFrom: {
    id: string;
    codigo: string;
    nombre: string;
  };
  warehouseTo: {
    id: string;
    codigo: string;
    nombre: string;
  };
  estado: TransferStatus;
  motivoTransferencia?: string;
  observaciones?: string;
  solicitante: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  aprobador?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
  fechaAprobacion?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TransferFilters {
  estado?: TransferStatus | 'ALL';
  q?: string;
  page: number;
  limit: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Transferencias: React.FC = () => {
  const [transferencias, setTransferencias] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [filters, setFilters] = useState<TransferFilters>({
    estado: 'ALL',
    q: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0
  });

  // Calcular estadísticas de transferencias
  const stats = useMemo(() => {
    const pendientes = transferencias.filter(t => t.estado === 'PENDIENTE').length;
    const recibidas = transferencias.filter(t => t.estado === 'RECIBIDO').length;
    const canceladas = transferencias.filter(t => t.estado === 'CANCELADO').length;
    const enProceso = transferencias.filter(t => t.estado === 'ENVIADO' || t.estado === 'APROBADO').length;
    
    return {
      total: pagination.total || transferencias.length,
      pendientes,
      recibidas,
      canceladas,
      enProceso
    };
  }, [transferencias, pagination.total]);

  useEffect(() => {
    loadTransferencias();
  }, [filters]);

  const loadTransferencias = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const params: any = {
        page: filters.page,
        limit: filters.limit
      };

      if (filters.estado && filters.estado !== 'ALL') {
        params.estado = filters.estado;
      }

      if (filters.q) {
        params.q = filters.q;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/inventory/transfers`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      const data = response.data.data;
      setTransferencias(data.rows || []);
      setPagination({
        total: data.total || 0,
        pages: data.pages || 0
      });
      setError(null);
    } catch (err: any) {
      console.error('Error loading transferencias:', err);
      setError(err.response?.data?.message || 'Error al cargar transferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportTransferencias({
        estado: filters.estado === 'ALL' ? undefined : (filters.estado as any),
      });
      alert('✅ Transferencias exportadas exitosamente');
    } catch (error: any) {
      console.error('Error exportando:', error);
      alert(`❌ Error al exportar: ${error.message}`);
    } finally {
      setExportando(false);
    }
  };

  const handleAprobar = async (transferId: string) => {
    if (!confirm('¿Está seguro de aprobar esta transferencia? Esta acción actualizará el stock en ambos almacenes.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/inventory/transfers/${transferId}/aprobar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Transferencia aprobada y ejecutada exitosamente');
      loadTransferencias();
    } catch (err: any) {
      console.error('Error aprobando transferencia:', err);
      alert(`❌ Error: ${err.response?.data?.message || 'No se pudo aprobar la transferencia'}`);
    }
  };

  const handleCancelar = async (transferId: string) => {
    if (!confirm('¿Está seguro de cancelar esta transferencia?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/inventory/transfers/${transferId}/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Transferencia cancelada');
      loadTransferencias();
    } catch (err: any) {
      console.error('Error cancelando transferencia:', err);
      alert(`❌ Error: ${err.response?.data?.message || 'No se pudo cancelar la transferencia'}`);
    }
  };

  const getEstadoVariant = (estado: TransferStatus): 'warning' | 'info' | 'success' | 'danger' => {
    const variants: Record<TransferStatus, 'warning' | 'info' | 'success' | 'danger'> = {
      PENDIENTE: 'warning',
      APROBADO: 'info',
      ENVIADO: 'info',
      RECIBIDO: 'success',
      CANCELADO: 'danger'
    };
    return variants[estado];
  };

  const getEstadoText = (estado: TransferStatus): string => {
    const texts: Record<TransferStatus, string> = {
      PENDIENTE: 'Pendiente',
      APROBADO: 'Aprobado',
      ENVIADO: 'Enviado',
      RECIBIDO: 'Recibido',
      CANCELADO: 'Cancelado'
    };
    return texts[estado];
  };

  if (loading && transferencias.length === 0) {
    return (
      <Layout title="Transferencias entre Almacenes">
        <LoadingMessage>Cargando transferencias...</LoadingMessage>
      </Layout>
    );
  }

  // Handler para limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      estado: 'ALL',
      q: '',
      page: 1,
      limit: 10
    });
  };

  return (
    <Layout title="Transferencias entre Almacenes">
      <Container>
        {error && (
          <ErrorBanner>
            {error}
            <button style={{ marginLeft: '1rem' }} onClick={() => setError(null)}>Cerrar</button>
          </ErrorBanner>
        )}

        {/* Header con título y botón Nueva Transferencia */}
        <Header>
          <TitleSection>
            <Title>Gestión de Transferencias</Title>
            <PageSubtitle>Control de movimientos de productos entre almacenes y ubicaciones</PageSubtitle>
          </TitleSection>
          <SharedButton $variant="primary" onClick={() => setModalOpen(true)}>
            Nueva Transferencia
          </SharedButton>
        </Header>

        {/* Stats Cards con patrón Template UI */}
        <SharedStatsGrid>
          <SharedStatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.total}</StatValue>
            <SharedStatLabel>Total Transferencias</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color="#f39c12">
            <StatValue $color="#f39c12">{stats.pendientes}</StatValue>
            <SharedStatLabel>Pendientes</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color={COLOR_SCALES.success[500]}>
            <StatValue $color={COLOR_SCALES.success[500]}>{stats.recibidas}</StatValue>
            <SharedStatLabel>Completadas</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color={COLOR_SCALES.danger[500]}>
            <StatValue $color={COLOR_SCALES.danger[500]}>{stats.canceladas}</StatValue>
            <SharedStatLabel>Canceladas</SharedStatLabel>
          </SharedStatCard>
        </SharedStatsGrid>

        {/* Modal Nueva Transferencia */}
        <ModalNuevaTransferencia
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            loadTransferencias();
            alert('✅ Transferencia creada exitosamente');
          }}
        />

        {/* Filtros Inline */}
        <FiltersCard>
          <FiltersGrid>
            <FormGroup>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                type="text"
                placeholder="Código o producto..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="estado">Estado</Label>
              <Select
                id="estado"
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value as TransferFilters['estado'], page: 1 })}
              >
                <option value="ALL">Todas</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="RECIBIDO">Recibido</option>
                <option value="CANCELADO">Cancelado</option>
              </Select>
            </FormGroup>
          </FiltersGrid>

          <ButtonGroup>
            <SharedButton onClick={handleClearFilters}>Limpiar</SharedButton>
            <SharedButton $variant="primary" onClick={loadTransferencias} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </SharedButton>
            <SharedButton 
              $variant="primary" 
              onClick={handleExportar} 
              disabled={exportando || loading}
              style={{ background: '#28a745' }}
            >
              {exportando ? 'Exportando...' : 'Exportar a Excel'}
            </SharedButton>
          </ButtonGroup>
      </FiltersCard>

      {/* Tabla de Transferencias */}
      {transferencias.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📦</EmptyIcon>
          <EmptyTitle>No hay transferencias</EmptyTitle>
          <EmptyText>
            {filters.q || filters.estado !== 'ALL'
              ? 'No se encontraron transferencias con los filtros aplicados'
              : 'Crea tu primera transferencia entre almacenes'}
          </EmptyText>
        </EmptyState>
      ) : (
        <>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Código</Th>
                  <Th>Producto</Th>
                  <Th>Origen → Destino</Th>
                  <Th>Cantidad</Th>
                  <Th>Estado</Th>
                  <Th>Solicitante</Th>
                  <Th>Fecha</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {transferencias.map((transfer) => {
                  return (
                    <tr key={transfer.id}>
                      <Td>
                        <strong>{transfer.codigo}</strong>
                      </Td>
                      <Td>
                        <ProductInfo>
                          <ProductCode>{transfer.product.codigo}</ProductCode>
                          <ProductName>{transfer.product.nombre}</ProductName>
                        </ProductInfo>
                      </Td>
                      <Td>
                        <RouteInfo>
                          <WarehouseName>{transfer.warehouseFrom.nombre}</WarehouseName>
                          <Arrow>→</Arrow>
                          <WarehouseName>{transfer.warehouseTo.nombre}</WarehouseName>
                        </RouteInfo>
                      </Td>
                      <Td>
                        <Quantity>{transfer.cantidad} unidades</Quantity>
                      </Td>
                      <Td>
                        <StatusBadge variant={getEstadoVariant(transfer.estado)} dot>
                          {getEstadoText(transfer.estado)}
                        </StatusBadge>
                      </Td>
                      <Td>
                        {transfer.solicitante.firstName} {transfer.solicitante.lastName}
                      </Td>
                      <Td>
                        <DateText>{new Date(transfer.createdAt).toLocaleDateString('es-ES')}</DateText>
                        <TimeText>{new Date(transfer.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</TimeText>
                      </Td>
                      <Td>
                        <ActionsGroup>
                          {transfer.estado === 'PENDIENTE' && (
                            <>
                              <ActionButton
                                $variant="activate"
                                onClick={() => handleAprobar(transfer.id)}
                                title="Aprobar transferencia"
                              >
                                Aprobar
                              </ActionButton>
                              <ActionButton
                                $variant="deactivate"
                                onClick={() => handleCancelar(transfer.id)}
                                title="Cancelar transferencia"
                              >
                                Cancelar
                              </ActionButton>
                            </>
                          )}
                          {transfer.estado === 'RECIBIDO' && (
                            <InfoText>Completada</InfoText>
                          )}
                          {transfer.estado === 'CANCELADO' && (
                            <InfoText>Cancelada</InfoText>
                          )}
                        </ActionsGroup>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          <Pagination>
            <PaginationInfo>
              Mostrando {transferencias.length > 0 ? ((filters.page - 1) * filters.limit) + 1 : 0} - {Math.min(filters.page * filters.limit, pagination.total)} de {pagination.total} transferencias
            </PaginationInfo>
            {pagination.pages > 1 && (
              <PaginationButtons>
                <PageButton
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                >
                  Anterior
                </PageButton>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <PageButton 
                    key={page} 
                    $active={page === filters.page}
                    onClick={() => setFilters({ ...filters, page })}
                  >
                    {page}
                  </PageButton>
                ))}
                <PageButton
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page >= pagination.pages}
                >
                  Siguiente
                </PageButton>
              </PaginationButtons>
            )}
          </Pagination>
        </>
      )}
      </Container>
    </Layout>
  );
};

// ============================================
// STYLED COMPONENTS
// ============================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg};
`;

const LoadingMessage = styled.div`
  background: ${COLORS.neutral[100]};
  color: ${COLORS.textLight};
  padding: ${SPACING.xxl};
  text-align: center;
  border-radius: ${BORDER_RADIUS.lg};
  font-size: ${TYPOGRAPHY.fontSize.md};
`;

const ErrorBanner = styled.div`
  background: ${COLOR_SCALES.danger[100]};
  color: ${COLOR_SCALES.danger[700]};
  border: 1px solid ${COLOR_SCALES.danger[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.sm} ${SPACING.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${SPACING.lg};
  flex-wrap: wrap;
  
  ${media.tablet} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${SPACING.md};
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
`;

const PageSubtitle = styled.p`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

// Filtros Inline - Estándar del proyecto
const FiltersCard = styled.div`
  background: ${COLORS.background};
  padding: ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.lg};
  border: 1px solid ${COLORS.neutral[200]};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const Label = styled.label`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const Input = styled.input`
  padding: ${SPACING.sm};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }

  &::placeholder {
    color: ${COLORS.textLight};
  }
`;

const Select = styled.select`
  padding: ${SPACING.sm};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  background: ${COLORS.background};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
  margin-top: ${SPACING.lg};

  @media (max-width: 768px) {
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

const TableContainer = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  overflow: hidden;
  border: 1px solid ${COLORS.neutral[200]};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: ${COLORS.background};
  padding: ${SPACING.md};
  text-align: left;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: ${SPACING.md};
  border-bottom: 1px solid ${COLORS.neutral[100]};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProductCode = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
  font-family: 'Courier New', monospace;
`;

const ProductName = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
`;

const WarehouseName = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
`;

const Arrow = styled.span`
  color: ${COLOR_SCALES.primary[500]};
  font-size: ${TYPOGRAPHY.fontSize.lg};
`;

const Quantity = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
`;

const DateText = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
`;

const TimeText = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
`;

const InfoText = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
  font-style: italic;
`;

const EmptyState = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.xxl} ${SPACING.xl};
  text-align: center;
  border: 1px solid ${COLORS.neutral[200]};
`;

const EmptyIcon = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  margin-bottom: ${SPACING.md};
`;

const EmptyTitle = styled.h2`
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.xs} 0;
  font-size: ${TYPOGRAPHY.fontSize.lg};
`;

const EmptyText = styled.p`
  color: ${COLORS.textLight};
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.base};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.md} 0;

  ${media.mobile} {
    flex-direction: column;
    gap: ${SPACING.md};
  }
`;

const PaginationInfo = styled.div`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: ${SPACING.xs};
  align-items: center;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: ${SPACING.xs} ${SPACING.sm};
  background: ${props => props.$active ? COLORS.background : 'transparent'};
  color: ${props => props.$active ? COLORS.text : COLORS.textLight};
  border: 1px solid ${props => props.$active ? COLORS.neutral[300] : 'transparent'};
  border-radius: ${BORDER_RADIUS.sm};
  cursor: pointer;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${COLORS.neutral[100]};
    border-color: ${COLORS.neutral[300]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Transferencias;
