import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import FiltersStock from '../../components/Inventario/FiltersStock';
import TablaStock from '../../components/Inventario/TablaStock';
import ModalAjuste from '../../components/Inventario/ModalAjuste';
import { useInventarioWithDebounce } from '../../hooks/useInventario';
import type { StockFilters, StockItem, AjusteFormData } from '../../types/inventario';
import { exportStock } from '../../utils/excelExport';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../styles/theme';
import { 
  StatCard as SharedStatCard,
  StatsGrid as SharedStatsGrid,
  StatValue,
  StatLabel as SharedStatLabel
} from '../../components/shared';

const Container = styled.div`
  padding: ${SPACING.lg};
`;

const Header = styled.div`
  margin-bottom: ${SPACING.xl};
`;

const Title = styled.h1`
  color: ${COLORS.text};
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const ErrorBanner = styled.div`
  background: ${COLOR_SCALES.danger[50]};
  color: ${COLOR_SCALES.danger[700]};
  border: 1px solid ${COLOR_SCALES.danger[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
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

  // Calcular estadísticas de stock
  const stats = useMemo(() => {
    const totalProductos = pagination.stock?.total || stockItems.length;
    const stockNormal = stockItems.filter(item => item.estado === 'NORMAL').length;
    const stockBajo = stockItems.filter(item => item.estado === 'BAJO').length;
    const stockCritico = stockItems.filter(item => item.estado === 'CRITICO').length;
    
    return {
      totalProductos,
      stockNormal,
      stockBajo,
      stockCritico
    };
  }, [stockItems, pagination.stock]);

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

  return (
    <Layout title="Stock">
      <Container>
        <Header>
          <Title>Listado de Stock</Title>
        </Header>

        {error && (
          <ErrorBanner>
            {error}
            <button style={{ marginLeft: '1rem' }} onClick={clearError}>Cerrar</button>
          </ErrorBanner>
        )}

        {/* Stats Cards con patrón Template UI */}
        <SharedStatsGrid>
          <SharedStatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.totalProductos}</StatValue>
            <SharedStatLabel>Total Productos</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color={COLOR_SCALES.success[500]}>
            <StatValue $color={COLOR_SCALES.success[500]}>{stats.stockNormal}</StatValue>
            <SharedStatLabel>Stock Normal</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color="#f39c12">
            <StatValue $color="#f39c12">{stats.stockBajo}</StatValue>
            <SharedStatLabel>Stock Bajo</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color={COLOR_SCALES.danger[500]}>
            <StatValue $color={COLOR_SCALES.danger[500]}>{stats.stockCritico}</StatValue>
            <SharedStatLabel>Stock Crítico</SharedStatLabel>
          </SharedStatCard>
        </SharedStatsGrid>

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