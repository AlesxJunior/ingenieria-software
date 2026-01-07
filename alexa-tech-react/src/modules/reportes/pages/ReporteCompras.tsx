import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button, 
  Input, 
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
  StatusBadge,
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

const formatDMY = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  background: ${props => props.$rank <= 3 ? COLOR_SCALES.warning[100] : COLORS.borderLight};
  color: ${props => props.$rank <= 3 ? COLOR_SCALES.warning[600] : COLORS.textLight};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.xs};
`;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ReporteCompras: React.FC = () => {
  // Usar un rango más amplio para incluir todas las compras (mes de noviembre completo)
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(new Date(2025, 10, 1))); // 01/11/2025
  const [fechaFin, setFechaFin] = useState(formatDateInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'detalles' | 'analisis'>('resumen');

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReporteCompras({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      });

      if (res.success && res.data) {
        setReporteData(res.data);
      }
    } catch (e) {
      console.error('Error cargando reporte compras', e);
      setReporteData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFechaInicio(formatDateInput(new Date(2025, 10, 1))); // 01/11/2025
    setFechaFin(formatDateInput(new Date()));
  };

  const handleExportar = () => {
    if (!reporteData) return;

    const fecha = new Date().toLocaleDateString('es-PE');
    const hora = new Date().toLocaleTimeString('es-PE');
    
    const csvLines = [
      '=================================================================',
      '                    REPORTE DE COMPRAS                           ',
      '=================================================================',
      `Fecha de Generación:\t${fecha}\t${hora}`,
      `Período Analizado:\t${fechaInicio || 'Todas las fechas'}\tal\t${fechaFin || 'Hoy'}`,
      '',
      '=================================================================',
      '                    RESUMEN GENERAL                              ',
      '=================================================================',
      'Indicador\tValor',
      `Total de Compras\t${formatCurrency(reporteData.resumen?.totalCompras)}`,
      `Cantidad de Compras\t${reporteData.resumen?.cantidadCompras || 0}`,
      `Compra Promedio\t${formatCurrency(reporteData.resumen?.compraPromedio)}`,
      `Compra Máxima\t${formatCurrency(reporteData.resumen?.comprasMayor)}`,
      `Compra Mínima\t${formatCurrency(reporteData.resumen?.comprasMenor)}`,
      '',
      '=================================================================',
      '                   COMPRAS POR DÍA                               ',
      '=================================================================',
      'Fecha\tCantidad de Compras\tTotal del Día',
      ...(reporteData.comprasPorDia || []).map((c: any) => 
        `${formatDMY(c.fecha)}\t${c.cantidad || 0}\t${formatCurrency(c.total)}`
      ),
      '',
      '=================================================================',
      '                 COMPRAS POR PROVEEDOR                           ',
      '=================================================================',
      'Proveedor\tCantidad de Compras\tTotal Comprado\tPorcentaje',
      ...(reporteData.comprasPorProveedor || []).map((p: any) => 
        `${p.nombreProveedor || 'Sin nombre'}\t${p.cantidadCompras || 0}\t${formatCurrency(p.totalCompras)}\t${(p.porcentaje || 0).toFixed(2)}%`
      ),
      '',
      '=================================================================',
      '                 COMPRAS POR ALMACÉN                             ',
      '=================================================================',
      'Almacén\tCantidad de Compras\tTotal Comprado',
      ...(reporteData.comprasPorAlmacen || []).map((a: any) => 
        `${a.nombreAlmacen || 'Sin almacén'}\t${a.cantidadCompras || 0}\t${formatCurrency(a.totalCompras)}`
      ),
      '',
      '=================================================================',
      '                 COMPRAS POR ESTADO                              ',
      '=================================================================',
      'Estado\tCantidad\tTotal\tPorcentaje',
      ...(reporteData.comprasPorEstado || []).map((e: any) => 
        `${e.estado}\t${e.cantidad || 0}\t${formatCurrency(e.total)}\t${(e.porcentaje || 0).toFixed(2)}%`
      ),
      '',
      '=================================================================',
      '            TOP 10 PRODUCTOS MÁS COMPRADOS                      ',
      '=================================================================',
      'Ranking\tProducto\tCantidad Comprada\tTotal Invertido',
      ...(reporteData.topProductosComprados || []).map((p: any, idx: number) =>
        `#${idx + 1}\t${p.nombreProducto || 'Sin nombre'}\t${p.cantidadComprada || 0}\t${formatCurrency(p.totalComprado)}`
      ),
      '',
      '=================================================================',
      `Reporte generado por: Sistema de Gestión AlexaTech`,
      '================================================================='
    ];

    const csvContent = '\uFEFF' + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Compras_${fechaInicio || 'completo'}_${fechaFin || new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'Recibida': return 'success';
      case 'Pendiente': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Layout title="Reporte de Compras">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Reporte de Compras</PageTitle>
            <PageSubtitle>Análisis de compras, proveedores y productos más adquiridos</PageSubtitle>
          </div>
          <Button $variant="success" onClick={handleExportar} disabled={!reporteData || loading}>
            Exportar Reporte
          </Button>
        </PageHeader>

        <FiltersCard>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Fecha Inicio</FilterLabel>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Fecha Fin</FilterLabel>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
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
            <EmptyText>Seleccione un rango de fechas y haga clic en "Generar Reporte".</EmptyText>
          </EmptyState>
        )}

        {!loading && reporteData && (
          <TabsContainer>
            <TabsHeader>
              <Tab $active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                Resumen General
              </Tab>
              <Tab $active={activeTab === 'detalles'} onClick={() => setActiveTab('detalles')}>
                Detalles por Período
              </Tab>
              <Tab $active={activeTab === 'analisis'} onClick={() => setActiveTab('analisis')}>
                Top Productos
              </Tab>
            </TabsHeader>

            <TabContent>
              {activeTab === 'resumen' && (
                <>
                  <SummaryCards>
                    <SummaryCard>
                      <CardTitle>Total Compras</CardTitle>
                      <CardValue>{formatCurrency(reporteData.resumen?.totalCompras)}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Cantidad de Compras</CardTitle>
                      <CardValue>{reporteData.resumen?.cantidadCompras || 0}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Compra Promedio</CardTitle>
                      <CardValue>{formatCurrency(reporteData.resumen?.compraPromedio)}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Compra Máxima</CardTitle>
                      <CardValue>{formatCurrency(reporteData.resumen?.comprasMayor)}</CardValue>
                    </SummaryCard>
                  </SummaryCards>
                </>
              )}

              {activeTab === 'detalles' && (
                <>
                  <Section>
                    <SectionTitle>Compras por Día</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Fecha</Th>
                            <Th>Cantidad</Th>
                            <Th>Total</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {(reporteData.comprasPorDia || []).map((c: any, idx: number) => (
                            <Tr key={idx}>
                              <Td>{formatDMY(c.fecha)}</Td>
                              <Td>{c.cantidad || 0}</Td>
                              <Td>{formatCurrency(c.total)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>

                  <Section>
                    <SectionTitle>Compras por Proveedor</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Proveedor</Th>
                            <Th>Cantidad</Th>
                            <Th>Total Comprado</Th>
                            <Th>Porcentaje</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {(reporteData.comprasPorProveedor || []).map((p: any, idx: number) => (
                            <Tr key={idx}>
                              <Td style={{ fontWeight: 500 }}>{p.nombreProveedor || 'Sin nombre'}</Td>
                              <Td>{p.cantidadCompras || 0}</Td>
                              <Td>{formatCurrency(p.totalCompras)}</Td>
                              <Td>
                                <PercentageBadge>{(p.porcentaje || 0).toFixed(1)}%</PercentageBadge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>

                  <Section>
                    <SectionTitle>Compras por Almacén</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Almacén</Th>
                            <Th>Cantidad</Th>
                            <Th>Total</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {(reporteData.comprasPorAlmacen || []).map((a: any, idx: number) => (
                            <Tr key={idx}>
                              <Td>{a.nombreAlmacen || 'Sin almacén'}</Td>
                              <Td>{a.cantidadCompras || 0}</Td>
                              <Td>{formatCurrency(a.totalCompras)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>

                  <Section>
                    <SectionTitle>Compras por Estado</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Estado</Th>
                            <Th>Cantidad</Th>
                            <Th>Total</Th>
                            <Th>Porcentaje</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {(reporteData.comprasPorEstado || []).map((e: any, idx: number) => (
                            <Tr key={idx}>
                              <Td>
                                <StatusBadge variant={getEstadoVariant(e.estado)} dot>
                                  {e.estado}
                                </StatusBadge>
                              </Td>
                              <Td>{e.cantidad || 0}</Td>
                              <Td>{formatCurrency(e.total)}</Td>
                              <Td>{(e.porcentaje || 0).toFixed(1)}%</Td>
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
                    <SectionTitle>Top 10 Productos Más Comprados</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>#</Th>
                            <Th>Producto</Th>
                            <Th>Cantidad</Th>
                            <Th>Total Comprado</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {(reporteData.topProductosComprados || []).map((p: any, idx: number) => (
                            <Tr key={idx}>
                              <Td><RankBadge $rank={idx + 1}>{idx + 1}</RankBadge></Td>
                              <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{p.nombreProducto || 'Sin nombre'}</Td>
                              <Td>{p.cantidadComprada || 0}</Td>
                              <Td>{formatCurrency(p.totalComprado)}</Td>
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

export default ReporteCompras;
