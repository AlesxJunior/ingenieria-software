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
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';

// Helpers
const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);
const formatDMY = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatCurrency = (num: number) => `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const ReporteVentas: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
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
      const res = await apiService.getReporteVentas({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      });

      if (res.success && res.data) {
        setReporteData(res.data);
      } else {
        setReporteData(null);
      }
    } catch (e) {
      console.error('Error cargando reporte ventas:', e);
      setReporteData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFechaInicio(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    setFechaFin(formatDateInput(new Date()));
  };

  const handleExportar = () => {
    if (!reporteData) return;

    const fecha = new Date().toLocaleDateString('es-PE');
    const hora = new Date().toLocaleTimeString('es-PE');
    
    const csvLines = [
      '=================================================================',
      '                    REPORTE DE VENTAS                           ',
      '=================================================================',
      `Fecha de Generación:\t${fecha}\t${hora}`,
      `Período Analizado:\t${fechaInicio || 'Todas las fechas'}\tal\t${fechaFin || 'Hoy'}`,
      '',
      '=================================================================',
      '                    RESUMEN GENERAL                              ',
      '=================================================================',
      'Indicador\tValor',
      `Total de Ventas\t${formatCurrency(reporteData.resumen.totalVentas)}`,
      `Cantidad de Ventas\t${reporteData.resumen.cantidadVentas}`,
      `Ticket Promedio\t${formatCurrency(reporteData.resumen.ticketPromedio)}`,
      `Venta Máxima\t${formatCurrency(reporteData.resumen.ventasMayor)}`,
      `Venta Mínima\t${formatCurrency(reporteData.resumen.ventasMenor)}`,
      '',
      '=================================================================',
      '              DISTRIBUCIÓN POR MÉTODO DE PAGO                   ',
      '=================================================================',
      'Método de Pago\tCantidad\tMonto Total\tPorcentaje',
      ...reporteData.ventasPorMetodoPago.map((m: any) => 
        `${m.metodoPago}\t${m.cantidad}\t${formatCurrency(m.total)}\t${m.porcentaje.toFixed(2)}%`
      ),
      '',
      '=================================================================',
      '                   VENTAS POR DÍA                                ',
      '=================================================================',
      'Fecha\tCantidad de Ventas\tTotal del Día',
      ...reporteData.ventasPorDia.map((v: any) => 
        `${formatDMY(v.fecha)}\t${v.cantidad}\t${formatCurrency(v.total)}`
      ),
      '',
      '=================================================================',
      '            TOP 10 PRODUCTOS MÁS VENDIDOS                       ',
      '=================================================================',
      'Ranking\tProducto\tCantidad Vendida\tTotal Vendido',
      ...reporteData.topProductos.map((p: any, idx: number) => 
        `#${idx + 1}\t${p.nombreProducto}\t${p.cantidadVendida}\t${formatCurrency(p.totalVendido)}`
      ),
      '',
      '=================================================================',
      '                  TOP 10 MEJORES CLIENTES                        ',
      '=================================================================',
      'Ranking\tCliente\tCantidad de Compras\tTotal Gastado',
      ...reporteData.topClientes.map((c: any, idx: number) => 
        `#${idx + 1}\t${c.nombreCliente}\t${c.cantidadCompras}\t${formatCurrency(c.totalCompras)}`
      ),
      '',
      '=================================================================',
      '                 VENTAS POR VENDEDOR                             ',
      '=================================================================',
      'Vendedor\tCantidad de Ventas\tTotal Vendido',
      ...reporteData.ventasPorVendedor.map((v: any) => 
        `${v.nombreVendedor}\t${v.cantidadVentas}\t${formatCurrency(v.totalVentas)}`
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
    a.download = `Reporte_Ventas_${fechaInicio || 'completo'}_${fechaFin || new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Reporte de Ventas">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Reporte de Ventas</PageTitle>
            <PageSubtitle>Análisis detallado de ventas, productos más vendidos y clientes</PageSubtitle>
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
            <EmptyIcon>📊</EmptyIcon>
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
                Análisis y Rankings
              </Tab>
            </TabsHeader>

            <TabContent>
              {activeTab === 'resumen' && (
                <>
                  <SummaryCards>
                    <SummaryCard>
                      <CardTitle>Total Ventas</CardTitle>
                      <CardValue>{formatCurrency(reporteData.resumen.totalVentas)}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Cantidad de Ventas</CardTitle>
                      <CardValue>{reporteData.resumen.cantidadVentas}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Ticket Promedio</CardTitle>
                      <CardValue>{formatCurrency(reporteData.resumen.ticketPromedio)}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Venta Máxima</CardTitle>
                      <CardValue>{formatCurrency(reporteData.resumen.ventasMayor)}</CardValue>
                    </SummaryCard>
                  </SummaryCards>

                  <Section>
                    <SectionTitle>Distribución por Método de Pago</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Método</Th>
                            <Th>Cantidad</Th>
                            <Th>Total</Th>
                            <Th>Porcentaje</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {reporteData.ventasPorMetodoPago.map((m: any, idx: number) => (
                            <Tr key={idx}>
                              <Td>{m.metodoPago}</Td>
                              <Td>{m.cantidad}</Td>
                              <Td>{formatCurrency(m.total)}</Td>
                              <Td>
                                <PercentageBadge>{m.porcentaje.toFixed(1)}%</PercentageBadge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>
                </>
              )}

              {activeTab === 'detalles' && (
                <>
                  <Section>
                    <SectionTitle>Ventas por Día</SectionTitle>
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
                          {reporteData.ventasPorDia.map((v: any, idx: number) => (
                            <Tr key={idx}>
                              <Td>{formatDMY(v.fecha)}</Td>
                              <Td>{v.cantidad}</Td>
                              <Td>{formatCurrency(v.total)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>

                  <Section>
                    <SectionTitle>Ventas por Vendedor</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Vendedor</Th>
                            <Th>Cantidad Ventas</Th>
                            <Th>Total Ventas</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {reporteData.ventasPorVendedor.map((v: any, idx: number) => (
                            <Tr key={idx}>
                              <Td>{v.nombreVendedor}</Td>
                              <Td>{v.cantidadVentas}</Td>
                              <Td>{formatCurrency(v.totalVentas)}</Td>
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
                    <SectionTitle>Top 10 Productos Más Vendidos</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>#</Th>
                            <Th>Producto</Th>
                            <Th>Cantidad</Th>
                            <Th>Total Vendido</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {reporteData.topProductos.map((p: any, idx: number) => (
                            <Tr key={idx}>
                              <Td><RankBadge $rank={idx + 1}>{idx + 1}</RankBadge></Td>
                              <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{p.nombreProducto}</Td>
                              <Td>{p.cantidadVendida}</Td>
                              <Td>{formatCurrency(p.totalVendido)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>

                  <Section>
                    <SectionTitle>Top 10 Clientes</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>#</Th>
                            <Th>Cliente</Th>
                            <Th>Cantidad Compras</Th>
                            <Th>Total Compras</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {reporteData.topClientes.map((c: any, idx: number) => (
                            <Tr key={idx}>
                              <Td><RankBadge $rank={idx + 1}>{idx + 1}</RankBadge></Td>
                              <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{c.nombreCliente}</Td>
                              <Td>{c.cantidadCompras}</Td>
                              <Td>{formatCurrency(c.totalCompras)}</Td>
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

export default ReporteVentas;
