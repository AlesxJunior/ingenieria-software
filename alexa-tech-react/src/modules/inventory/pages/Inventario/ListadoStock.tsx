import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../styles/theme';
import Layout from '../../../../components/Layout';
import FiltersStock from '../../components/Inventario/FiltersStock';
import TablaStock from '../../components/Inventario/TablaStock';
import ModalAjuste from '../../components/Inventario/ModalAjuste';
import { useInventarioWithDebounce } from '../../hooks/useInventario';
import type { StockFilters, StockItem, AjusteFormData } from '../../../../types/inventario';
import { exportStock } from '../../../../utils/excelExport';
import { 
  StatCard, 
  StatsGrid, 
  StatValue, 
  StatLabel 
} from '../../../../components/shared';

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
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

const ErrorBanner = styled.div`
  background: ${COLOR_SCALES.danger[50]};
  color: ${COLOR_SCALES.danger[700]};
  border: 1px solid ${COLOR_SCALES.danger[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
`;

const EmptyState = styled.div`
  background: ${COLORS.neutral[100]};
  color: ${COLORS.textLight};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
`;

const ListadoStock: React.FC = () => {
  const { stockItems, loading, error, pagination, clearError, debouncedFetchStock, crearAjuste, canUpdateInventory } = useInventarioWithDebounce();
  const [filters, setFilters] = useState<StockFilters>({ page: 1, limit: 10, sortBy: 'producto', order: 'asc', almacenId: 'WH-PRINCIPAL' });
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [exportando, setExportando] = useState(false);

  // Debounce fetch cuando cambian filtros y evitar doble fetch inicial
  useEffect(() => {
    console.log('Stock filters changed:', filters);
    debouncedFetchStock(filters, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const areFiltersEqual = (a: StockFilters, b: StockFilters) => (
    a.almacenId === b.almacenId &&
    a.q === b.q &&
    a.estado === b.estado &&
    a.page === b.page &&
    a.limit === b.limit &&
    a.sortBy === b.sortBy &&
    a.order === b.order
  );

  const handleFilterChange = (newFilters: StockFilters) => {
    const merged = { ...filters, ...newFilters };
    if (areFiltersEqual(filters, merged)) return; // evitar set sin cambios
    setFilters(merged);
  };

  const handlePageChange = (page: number) => {
    const merged = { ...filters, page };
    if (areFiltersEqual(filters, merged)) return;
    setFilters(merged);
  };

  const handlePageSizeChange = (limit: number) => {
    const merged = { ...filters, limit, page: 1 };
    setFilters(merged);
  };

  const handleOpenAjuste = (item: StockItem) => {
    setSelectedStock(item);
    setAjusteOpen(true);
  };

  const handleCloseAjuste = () => {
    setAjusteOpen(false);
    setSelectedStock(null);
  };
  const handleSubmitAjuste = async (form: AjusteFormData) => {
    if (!selectedStock) return;
    await crearAjuste({
      productId: selectedStock.productId,
      warehouseId: selectedStock.warehouseId ?? filters.almacenId ?? 'WH-PRINCIPAL',
      cantidadAjuste: form.cantidadAjuste,
      reasonId: form.reasonId, // Enviar el ID del motivo
      adjustmentReason: form.adjustmentReason, // Mantener para compatibilidad
      observaciones: form.observaciones || '',
    });
    handleCloseAjuste();
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportStock({
        warehouseId: filters.almacenId,
        productId: filters.productId,
      });
      alert('✅ Stock exportado exitosamente');
    } catch (error: any) {
      console.error('Error exportando:', error);
      alert(`❌ Error al exportar: ${error.message}`);
    } finally {
      setExportando(false);
    }
  };

  // Stats Cards
  const stats = useMemo(() => {
    const total = stockItems.length;
    const normal = stockItems.filter(s => s.estado === 'NORMAL').length;
    const bajo = stockItems.filter(s => s.estado === 'BAJO').length;
    const critico = stockItems.filter(s => s.estado === 'CRITICO').length;
    const totalUnidades = stockItems.reduce((sum, s) => sum + (s.cantidad || 0), 0);
    return { total, normal, bajo, critico, totalUnidades };
  }, [stockItems]);

  return (
    <Layout title="Stock">
      <Container>
        <Header>
          <TitleSection>
            <Title>Gestión de Stock</Title>
            <PageSubtitle>Control de existencias, niveles de inventario y estado de productos por almacén</PageSubtitle>
          </TitleSection>
        </Header>

        {error && (
          <ErrorBanner>
            {error}
            <button style={{ marginLeft: '1rem' }} onClick={clearError}>Cerrar</button>
          </ErrorBanner>
        )}

        {/* Stats Cards */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.total}</StatValue>
            <StatLabel>Total Productos</StatLabel>
          </StatCard>
          <StatCard $color="#27ae60">
            <StatValue $color="#27ae60">{stats.normal}</StatValue>
            <StatLabel>Stock Normal</StatLabel>
          </StatCard>
          <StatCard $color="#f39c12">
            <StatValue $color="#f39c12">{stats.bajo}</StatValue>
            <StatLabel>Stock Bajo</StatLabel>
          </StatCard>
          <StatCard $color="#e74c3c">
            <StatValue $color="#e74c3c">{stats.critico}</StatValue>
            <StatLabel>Stock Crítico</StatLabel>
          </StatCard>
          <StatCard $color="#9b59b6">
            <StatValue $color="#9b59b6">{stats.totalUnidades.toLocaleString()}</StatValue>
            <StatLabel>Total Unidades</StatLabel>
          </StatCard>
        </StatsGrid>

        <FiltersStock 
          onFilterChange={handleFilterChange} 
          loading={loading} 
          defaultWarehouseId="WH-PRINCIPAL"
          onExport={handleExportar}
          exportando={exportando}
        />

        {!loading && stockItems.length === 0 && (
          <EmptyState>No hay stock para los filtros seleccionados</EmptyState>
        )}

        <TablaStock
          stockItems={stockItems}
          pagination={pagination.stock || { page: filters.page || 1, pages: 1, total: stockItems.length, limit: filters.limit || 10 }}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onAjustar={handleOpenAjuste}
          canUpdateInventory={canUpdateInventory}
        />

        <ModalAjuste
          isOpen={ajusteOpen}
          stockItem={selectedStock}
          onClose={handleCloseAjuste}
          onSubmit={handleSubmitAjuste}
        />
      </Container>
    </Layout>
  );
};

export default ListadoStock;