import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../../styles/theme';
import Layout from '../../../../components/Layout';
import FiltersKardex from '../../components/Inventario/FiltersKardex';
import TablaKardex from '../../components/Inventario/TablaKardex';
import { useInventarioWithDebounce } from '../../hooks/useInventario';
import type { KardexFilters } from '../../../../types/inventario';
import { exportKardex } from '../../../../utils/excelExport';
import { 
  StatCard as SharedStatCard,
  StatsGrid as SharedStatsGrid,
  StatValue,
  StatLabel as SharedStatLabel
} from '../../../../components/shared';

const Container = styled.div`
  padding: ${SPACING.lg};
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

const ErrorContainer = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  padding: ${SPACING['3xl']};
  text-align: center;
  margin: ${SPACING.xl} 0;
`;

const ErrorIcon = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  margin-bottom: ${SPACING.lg};
`;

const ErrorTitle = styled.h2`
  color: ${COLOR_SCALES.danger[500]};
  margin: 0 0 ${SPACING.lg} 0;
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const ErrorMessage = styled.p`
  color: ${COLORS.text.secondary};
  margin: 0 0 ${SPACING.xl} 0;
  font-size: ${TYPOGRAPHY.fontSize.base};
  line-height: 1.5;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const RetryButton = styled.button`
  background: ${COLOR_SCALES.primary[500]};
  color: ${COLORS.neutral.white};
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.xl};
  font-size: ${TYPOGRAPHY.fontSize.base};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: ${TRANSITIONS.default};

  &:hover {
    background: ${COLOR_SCALES.primary[600]};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: ${COLORS.text.secondary};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.xl};
  font-size: ${TYPOGRAPHY.fontSize.base};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: ${TRANSITIONS.default};

  &:hover {
    background: ${COLORS.neutral[50]};
    border-color: ${COLORS.neutral[400]};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const EmptyState = styled.div`
  background: #f1f3f5;
  color: #6c757d;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
`;

const Kardex: React.FC = () => {
  const { movimientos, loading, error, pagination, clearError, debouncedFetchKardex } = useInventarioWithDebounce();
  const [filters, setFilters] = useState<KardexFilters>({ page: 1, pageSize: 20, sortBy: 'fecha', order: 'desc', warehouseId: 'WH-PRINCIPAL' });
  const [exportando, setExportando] = useState(false);

  // Calcular estadísticas de movimientos
  const stats = useMemo(() => {
    const entradas = movimientos.filter(m => m.tipo === 'ENTRADA');
    const salidas = movimientos.filter(m => m.tipo === 'SALIDA');
    const ajustes = movimientos.filter(m => m.tipo === 'AJUSTE');
    
    return {
      totalMovimientos: pagination.kardex?.total || movimientos.length,
      countEntradas: entradas.length,
      countSalidas: salidas.length,
      countAjustes: ajustes.length
    };
  }, [movimientos, pagination.kardex]);

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

  const handlePageSizeChange = (pageSize: number) => {
    const merged = { ...filters, pageSize, page: 1 };
    setFilters(merged);
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportKardex({
        warehouseId: filters.warehouseId,
        productId: filters.productId,
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

  // Renderizar estado de error mejorado
  if (error) {
    return (
      <Layout title="Kardex">
        <Container>
          <Header>
            <TitleSection>
              <Title>Kardex de Inventario</Title>
              <PageSubtitle>Historial detallado de movimientos de inventario, entradas, salidas y ajustes</PageSubtitle>
            </TitleSection>
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
          <TitleSection>
            <Title>Kardex de Inventario</Title>
            <PageSubtitle>Historial detallado de movimientos de inventario, entradas, salidas y ajustes</PageSubtitle>
          </TitleSection>
        </Header>

        {/* Stats Cards con patrón Template UI */}
        <SharedStatsGrid>
          <SharedStatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.totalMovimientos}</StatValue>
            <SharedStatLabel>Total Movimientos</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color="#27ae60">
            <StatValue $color="#27ae60">{stats.countEntradas}</StatValue>
            <SharedStatLabel>Entradas</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color="#e74c3c">
            <StatValue $color="#e74c3c">{stats.countSalidas}</StatValue>
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
          onPageSizeChange={handlePageSizeChange}
        />
      </Container>
    </Layout>
  );
};

export default Kardex;