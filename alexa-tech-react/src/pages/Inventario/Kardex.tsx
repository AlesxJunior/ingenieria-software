import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import FiltersKardex from '../../components/Inventario/FiltersKardex';
import TablaKardex from '../../components/Inventario/TablaKardex';
import { useInventarioWithDebounce } from '../../hooks/useInventario';
import type { KardexFilters } from '../../types/inventario';
import { exportKardex } from '../../utils/excelExport';
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

const ErrorContainer = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: ${SPACING.xxl};
  text-align: center;
  margin: ${SPACING.xl} 0;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${SPACING.lg};
`;

const ErrorTitle = styled.h2`
  color: ${COLORS.danger};
  margin: 0 0 ${SPACING.lg} 0;
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const ErrorMessage = styled.p`
  color: ${COLORS.textLight};
  margin: 0 0 ${SPACING.xl} 0;
  font-size: ${TYPOGRAPHY.fontSize.md};
  line-height: 1.5;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const RetryButton = styled.button`
  background: ${COLORS.primary};
  color: white;
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.lg};
  font-size: ${TYPOGRAPHY.fontSize.md};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${COLORS.primaryHover};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: ${COLORS.textLight};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.lg};
  font-size: ${TYPOGRAPHY.fontSize.md};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.neutral[100]};
    border-color: ${COLORS.neutral[400]};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const EmptyState = styled.div`
  background: ${COLORS.neutral[100]};
  color: ${COLORS.textLight};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
`;



const Kardex: React.FC = () => {
  const { movimientos, loading, error, pagination, clearError, debouncedFetchKardex } = useInventarioWithDebounce();
  const [filters, setFilters] = useState<KardexFilters>({ page: 1, pageSize: 20, sortBy: 'fecha', order: 'desc', warehouseId: 'WH-PRINCIPAL' });
  const [exportando, setExportando] = useState(false);

  // Buscar cuando cambian filtros (debounced) y evitar doble fetch inicial
  useEffect(() => {
    console.log('filters changed:', filters);
    debouncedFetchKardex(filters, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters: KardexFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
  };

  const handlePageChange = (page: number) => {
    const merged = { ...filters, page };
    setFilters(merged);
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportKardex({
        productId: filters.productId,
        warehouseId: filters.warehouseId,
        tipoMovimiento: filters.tipoMovimiento,
        fechaDesde: filters.fechaDesde,
        fechaHasta: filters.fechaHasta,
      });
      alert('✅ Kardex exportado exitosamente');
    } catch (error: any) {
      console.error('Error exportando:', error);
      alert(`❌ Error al exportar: ${error.message}`);
    } finally {
      setExportando(false);
    }
  };

  // Calcular estadísticas de movimientos
  const stats = useMemo(() => {
    const entradas = movimientos.filter(m => m.tipo === 'ENTRADA');
    const salidas = movimientos.filter(m => m.tipo === 'SALIDA');
    const ajustes = movimientos.filter(m => m.tipo === 'AJUSTE');
    
    const totalEntradas = entradas.reduce((sum, m) => sum + Math.abs(m.cantidad), 0);
    const totalSalidas = salidas.reduce((sum, m) => sum + Math.abs(m.cantidad), 0);
    
    return {
      totalMovimientos: pagination.kardex?.total || movimientos.length,
      countEntradas: entradas.length,
      countSalidas: salidas.length,
      countAjustes: ajustes.length,
      totalEntradas,
      totalSalidas
    };
  }, [movimientos, pagination.kardex]);

  // Renderizar estado de error mejorado
  if (error) {
    return (
      <Layout title="Kardex">
        <Container>
          <Header>
            <Title>Kardex de Inventario</Title>
          </Header>
          
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Error al cargar los datos</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <ErrorActions>
              <RetryButton onClick={() => {
                clearError();
                debouncedFetchKardex(filters, 0);
              }}>
                Reintentar
              </RetryButton>
              <SecondaryButton onClick={() => {
                clearError();
                setFilters({
                  page: 1,
                  pageSize: 20,
                  sortBy: 'fecha',
                  order: 'desc',
                  warehouseId: 'WH-PRINCIPAL'
                });
              }}>
                Limpiar filtros
              </SecondaryButton>
            </ErrorActions>
          </ErrorContainer>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Kardex">
      <Container>
        <Header>
          <Title>Kardex de Inventario</Title>
        </Header>

        {/* Stats Cards con patrón Template UI */}
        <SharedStatsGrid>
          <SharedStatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.totalMovimientos}</StatValue>
            <SharedStatLabel>Total Movimientos</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color={COLOR_SCALES.success[500]}>
            <StatValue $color={COLOR_SCALES.success[500]}>{stats.countEntradas}</StatValue>
            <SharedStatLabel>Entradas</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color={COLOR_SCALES.danger[500]}>
            <StatValue $color={COLOR_SCALES.danger[500]}>{stats.countSalidas}</StatValue>
            <SharedStatLabel>Salidas</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color="#9b59b6">
            <StatValue $color="#9b59b6">{stats.countAjustes}</StatValue>
            <SharedStatLabel>Ajustes</SharedStatLabel>
          </SharedStatCard>
        </SharedStatsGrid>

        <FiltersKardex 
          onFilterChange={handleFilterChange} 
          loading={loading} 
          defaultWarehouseId="WH-PRINCIPAL"
          onExport={handleExportar}
          exportando={exportando}
        />

        {!loading && movimientos.length === 0 && (
          <EmptyState>No hay movimientos</EmptyState>
        )}

        <TablaKardex
          movimientos={movimientos}
          pagination={pagination.kardex || { page: filters.page || 1, pages: 1, total: movimientos.length, limit: filters.pageSize || 20 }}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </Container>
    </Layout>
  );
};

export default Kardex;