import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button, 
  Select, 
  FiltersCard, 
  SummaryCard, 
  SummaryCards, 
  CardTitle, 
  CardValue,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';

// Helpers
const formatCurrency = (num: number | undefined) => {
  if (num === undefined || num === null || isNaN(num)) return 'S/ 0.00';
  return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ============================================================================
// ESTILOS ESPECÍFICOS DE REPORTES
// ============================================================================

const Container = styled.div`
  padding: ${SPACING['2xl']};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
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

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.textLight};
`;

const FilterButtonsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.md};
  margin-top: ${SPACING.lg};
`;

const TabsContainer = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${COLORS.border};
  background-color: ${COLORS.background};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${SPACING.md} ${SPACING.xl};
  border: none;
  background: ${props => props.$active ? COLORS.white : 'transparent'};
  color: ${props => props.$active ? COLORS.primary : COLORS.textLight};
  font-weight: ${props => props.$active ? TYPOGRAPHY.fontWeight.semibold : TYPOGRAPHY.fontWeight.medium};
  font-size: ${TYPOGRAPHY.fontSize.small};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? COLORS.primary : 'transparent'};
  transition: ${TRANSITIONS.normal};
  margin-bottom: -1px;
  
  &:hover {
    background-color: ${props => props.$active ? COLORS.white : COLORS.borderLight};
    color: ${props => props.$active ? COLORS.primary : COLORS.text};
  }
`;

const TabContent = styled.div`
  padding: ${SPACING.xl};
`;

const Section = styled.div`
  background: ${COLORS.white};
  padding: ${SPACING.xl};
  border-radius: ${BORDER_RADIUS.large};
  border: 1px solid ${COLORS.border};
  margin-bottom: ${SPACING.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${TYPOGRAPHY.fontSize.h3};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.lg} 0;
`;

const PercentageBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${COLORS.primaryLight};
  color: ${COLORS.primary};
  border-radius: ${BORDER_RADIUS.small};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const RankBadge = styled.span<{ $rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: ${props => props.$rank <= 3 ? COLOR_SCALES.success[100] : COLORS.borderLight};
  color: ${props => props.$rank <= 3 ? COLOR_SCALES.success[600] : COLORS.textLight};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.xs};
`;

const AlertValue = styled.span<{ $isZero?: boolean }>`
  color: ${props => props.$isZero ? COLOR_SCALES.danger[600] : COLOR_SCALES.warning[600]};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const DifferenceValue = styled.span`
  color: ${COLOR_SCALES.danger[600]};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ReporteInventario: React.FC = () => {
  const [almacenId, setAlmacenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'stock' | 'analisis'>('resumen');
  const [almacenes, setAlmacenes] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    loadAlmacenes();
    handleBuscar();
  }, []);

  const loadAlmacenes = async () => {
    try {
      const res = await apiService.getWarehouses();
      const data = res.data as any;
      let warehouses = [];
      
      if (data?.data?.rows) {
        warehouses = data.data.rows;
      } else if (data?.rows) {
        warehouses = data.rows;
      } else if (Array.isArray(data)) {
        warehouses = data;
      }
      
      setAlmacenes(warehouses.filter((w: any) => w.activo !== false));
    } catch (error) {
      console.error('Error cargando almacenes:', error);
    }
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReporteInventario({
        almacenId: almacenId || undefined,
      });

      if (res.success && res.data) {
        setReporteData(res.data);
      }
    } catch (e) {
      console.error('Error cargando reporte inventario', e);
      setReporteData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setAlmacenId('');
  };

  const handleExportar = () => {
    if (!reporteData) return;

    const fecha = new Date().toLocaleDateString('es-PE');
    const hora = new Date().toLocaleTimeString('es-PE');
    
    const csvLines = [
      '=================================================================',
      '                  REPORTE DE INVENTARIO                          ',
      '=================================================================',
      `Fecha de Generación:\t${fecha}\t${hora}`,
      `Almacén Filtrado:\t${almacenId || 'Todos los almacenes'}`,
      '',
      '=================================================================',
      '                    RESUMEN GENERAL                              ',
      '=================================================================',
      'Indicador\tValor',
      `Valor Total del Inventario\t${formatCurrency(reporteData.resumen?.valorTotalInventario)}`,
      `Total de Almacenes\t${(reporteData.stockPorAlmacen || []).length}`,
      `Productos en Alerta\t${reporteData.resumen?.productosEnAlerta || 0}`,
      '',
      '=================================================================',
      '                  STOCK POR ALMACÉN                              ',
      '=================================================================',
      'Almacén\tCantidad Total de Productos\tValor Total del Stock',
      ...(reporteData.stockPorAlmacen || []).map((a: any) =>
        `${a.nombreAlmacen || a.almacen || 'Sin nombre'}\t${a.cantidadProductos || a._sum?.cantidad || 0}\t${formatCurrency(a.valorInventario || a._sum?.valor)}`
      ),
      '',
      '=================================================================',
      '               VALOR POR CATEGORÍA                               ',
      '=================================================================',
      'Categoría\tValor Total\tParticipación %',
      ...(reporteData.valorPorCategoria || []).map((c: any) => {
        const porcentaje = reporteData.valorTotalInventario > 0 
          ? (c.valorTotal / reporteData.valorTotalInventario * 100).toFixed(2)
          : '0.00';
        return `${c.categoria || 'Sin categoría'}\t${formatCurrency(c.valorTotal)}\t${porcentaje}%`;
      }),
      '',
      '=================================================================',
      '          PRODUCTOS CON MAYOR ROTACIÓN                          ',
      '=================================================================',
      'Ranking\tProducto\tCantidad de Movimientos',
      ...(reporteData.productosMasRotacion || []).map((p: any, idx: number) =>
        `#${idx + 1}\t${p.nombreProducto || 'Sin nombre'}\t${p.cantidadMovimientos || 0}`
      ),
      '',
    ];

    // Agregar productos en alerta si existen
    if ((reporteData.productosEnAlerta || []).length > 0) {
      csvLines.push(
        '=================================================================',
        '          PRODUCTOS EN ALERTA (STOCK BAJO)                      ',
        '=================================================================',
        'Producto\tStock Actual\tStock Mínimo Requerido\tDiferencia',
        ...(reporteData.productosEnAlerta || []).map((p: any) => {
          const diferencia = (p.stockMinimo || 0) - (p.stockActual || 0);
          return `${p.nombreProducto || 'Sin nombre'}\t${p.stockActual || 0}\t${p.stockMinimo || 0}\t${diferencia}`;
        }),
        ''
      );
    }

    csvLines.push(
      '=================================================================',
      `Reporte generado por: Sistema de Gestión AlexaTech`,
      '================================================================='
    );

    const csvContent = '\uFEFF' + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Inventario_${almacenId ? 'Almacen_' + almacenId : 'Todos'}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Reporte de Inventario">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Reporte de Inventario</PageTitle>
            <PageSubtitle>Análisis de stock, valorización y productos con alertas</PageSubtitle>
          </div>
          <Button $variant="success" onClick={handleExportar} disabled={!reporteData || loading}>
            Exportar Reporte
          </Button>
        </PageHeader>

        <FiltersCard>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Almacén</FilterLabel>
              <Select
                value={almacenId}
                onChange={(e) => setAlmacenId(e.target.value)}
              >
                <option value="">Todos los almacenes</option>
                {almacenes.map(alm => (
                  <option key={alm.id} value={alm.id}>{alm.nombre}</option>
                ))}
              </Select>
            </FilterGroup>
          </FiltersGrid>
          <FilterButtonsRow>
            <Button $variant="secondary" onClick={handleLimpiar}>
              Limpiar
            </Button>
            <Button $variant="primary" onClick={handleBuscar} disabled={loading}>
              {loading ? 'Generando...' : 'Generar Reporte'}
            </Button>
          </FilterButtonsRow>
        </FiltersCard>

        {loading && (
          <EmptyState>
            <EmptyIcon>⏳</EmptyIcon>
            <EmptyTitle>Cargando reporte...</EmptyTitle>
          </EmptyState>
        )}

        {!loading && !reporteData && (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyTitle>Sin datos disponibles</EmptyTitle>
            <EmptyText>Haga clic en "Generar Reporte" para ver el análisis de inventario.</EmptyText>
          </EmptyState>
        )}

        {!loading && reporteData && (
          <TabsContainer>
            <TabsHeader>
              <Tab $active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                Resumen General
              </Tab>
              <Tab $active={activeTab === 'stock'} onClick={() => setActiveTab('stock')}>
                Stock por Almacén
              </Tab>
              <Tab $active={activeTab === 'analisis'} onClick={() => setActiveTab('analisis')}>
                Análisis de Rotación
              </Tab>
            </TabsHeader>

            <TabContent>
              {activeTab === 'resumen' && (
                <>
                  <SummaryCards>
                    <SummaryCard>
                      <CardTitle>Valor Total Inventario</CardTitle>
                      <CardValue>{formatCurrency(reporteData.resumen?.valorTotalInventario)}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Total Almacenes</CardTitle>
                      <CardValue>{(reporteData.stockPorAlmacen || []).length}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Productos en Alerta</CardTitle>
                      <CardValue style={{ color: reporteData.resumen?.productosEnAlerta > 0 ? COLOR_SCALES.danger[600] : 'inherit' }}>
                        {reporteData.resumen?.productosEnAlerta || 0}
                      </CardValue>
                    </SummaryCard>
                  </SummaryCards>

                  <Section>
                    <SectionTitle>Valor por Categoría</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Categoría</Th>
                            <Th>Valor Total</Th>
                            <Th>Participación</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {(reporteData.valorPorCategoria || []).map((c: any, idx: number) => {
                            return (
                              <Tr key={idx}>
                                <Td>{c.categoria || 'Sin categoría'}</Td>
                                <Td>{formatCurrency(c.valorTotal)}</Td>
                                <Td>
                                  <PercentageBadge>{(c.porcentaje || 0).toFixed(1)}%</PercentageBadge>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>

                  {(reporteData.productosEnAlerta || []).length > 0 && (
                    <Section>
                      <SectionTitle>Productos en Alerta (Stock Bajo)</SectionTitle>
                      <TableContainer>
                        <Table>
                          <Thead>
                            <tr>
                              <Th>Producto</Th>
                              <Th>Stock Actual</Th>
                              <Th>Stock Mínimo</Th>
                              <Th>Diferencia</Th>
                            </tr>
                          </Thead>
                          <Tbody>
                            {(reporteData.productosEnAlerta || []).map((p: any, idx: number) => (
                              <Tr key={idx}>
                                <Td style={{ fontWeight: 500 }}>{p.nombreProducto || 'Sin nombre'}</Td>
                                <Td>
                                  <AlertValue $isZero={p.stockActual === 0}>
                                    {p.stockActual || 0}
                                  </AlertValue>
                                </Td>
                                <Td>{p.stockMinimo || 0}</Td>
                                <Td>
                                  <DifferenceValue>
                                    {(p.stockMinimo || 0) - (p.stockActual || 0)}
                                  </DifferenceValue>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Section>
                  )}
                </>
              )}

              {activeTab === 'stock' && (
                <>
                  <Section>
                    <SectionTitle>Stock por Almacén</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Almacén</Th>
                            <Th>Cantidad Total</Th>
                            <Th>Valor Total</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {(reporteData.stockPorAlmacen || []).map((a: any, idx: number) => (
                            <Tr key={idx}>
                              <Td style={{ fontWeight: 500 }}>{a.nombreAlmacen || a.almacen || 'Sin nombre'}</Td>
                              <Td>{a.cantidadProductos || a._sum?.cantidad || 0}</Td>
                              <Td>{formatCurrency(a.valorInventario || a._sum?.valor)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>
                </>
              )}

              {activeTab === 'analisis' && (
                <>
                  <Section>
                    <SectionTitle>Productos con Mayor Rotación</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>#</Th>
                            <Th>Producto</Th>
                            <Th>Cantidad de Movimientos</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {(reporteData.productosMasRotacion || []).map((p: any, idx: number) => (
                            <Tr key={idx}>
                              <Td><RankBadge $rank={idx + 1}>{idx + 1}</RankBadge></Td>
                              <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{p.nombreProducto || 'Sin nombre'}</Td>
                              <Td>{p.cantidadMovimientos || 0}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>
                </>
              )}
            </TabContent>
          </TabsContainer>
        )}
      </Container>
    </Layout>
  );
};

export default ReporteInventario;
