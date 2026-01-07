import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button, 
  Input, 
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
  StatusBadge,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';

// Helpers
const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);
const formatDMY = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

const RankBadge = styled.span<{ $rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if (props.$rank === 2) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
    if (props.$rank === 3) return 'linear-gradient(135deg, #CD7F32, #B87333)';
    return COLORS.borderLight;
  }};
  color: ${props => props.$rank <= 3 ? 'white' : COLORS.textLight};
  box-shadow: ${props => props.$rank <= 3 ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'};
`;

const ChartContainer = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  padding: ${SPACING.xl};
  border: 1px solid ${COLORS.border};
  margin-bottom: ${SPACING.lg};
`;

const ChartTitle = styled.h4`
  font-size: ${TYPOGRAPHY.fontSize.body};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.lg} 0;
`;

const ChartBar = styled.div<{ $percentage: number; $color: string }>`
  display: flex;
  align-items: center;
  margin-bottom: ${SPACING.md};

  .label {
    width: 120px;
    font-size: ${TYPOGRAPHY.fontSize.small};
    color: ${COLORS.text};
    font-weight: ${TYPOGRAPHY.fontWeight.medium};
  }

  .bar-container {
    flex: 1;
    height: 24px;
    background: ${COLORS.background};
    border-radius: ${BORDER_RADIUS.small};
    overflow: hidden;
    position: relative;
  }

  .bar-fill {
    height: 100%;
    width: ${props => props.$percentage}%;
    background: ${props => props.$color};
    transition: width 0.3s ease;
    border-radius: ${BORDER_RADIUS.small};
  }

  .value {
    margin-left: ${SPACING.md};
    font-size: ${TYPOGRAPHY.fontSize.small};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    color: ${COLORS.text};
    min-width: 100px;
    text-align: right;
  }
`;

const GridTwo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const IngresosValue = styled.span`
  color: ${COLOR_SCALES.success[600]};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const EgresosValue = styled.span`
  color: ${COLOR_SCALES.danger[600]};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

// ============================================================================
// INTERFACES
// ============================================================================

interface MovimientoCaja {
  cajaId: string;
  nombreCaja: string;
  usuarioId: string;
  nombreUsuario: string;
  montoApertura: number;
  totalIngresos: number;
  totalEgresos: number;
  montoCierre: number;
  estado: string;
  fechaApertura: string;
  fechaCierre?: string;
}

interface CajaReporte {
  resumen: {
    cajasAbiertas: number;
    cajasCerradas: number;
    totalEfectivo: number;
    totalTarjeta: number;
    totalTransferencia: number;
    totalOtros: number;
    totalGeneral: number;
  };
  movimientosPorCaja: MovimientoCaja[];
  movimientosPorMetodo: {
    metodoPago: string;
    cantidadTransacciones: number;
    montoTotal: number;
    porcentaje: number;
  }[];
  ventasPorHora: {
    hora: number;
    cantidadVentas: number;
    montoTotal: number;
  }[];
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ReporteCaja: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'movimientos' | 'analisis'>('resumen');
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(new Date(2025, 11, 1))); // Diciembre 2025
  const [fechaFin, setFechaFin] = useState(formatDateInput(new Date(2025, 11, 31)));
  const [tipo, setTipo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [concepto, setConcepto] = useState('');
  const [reporteData, setReporteData] = useState<CajaReporte | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReporteCaja({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      });

      if (res.success && res.data) {
        setReporteData(res.data);
      }
    } catch (e) {
      console.error('Error cargando reporte caja', e);
      setReporteData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFechaInicio(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    setFechaFin(formatDateInput(new Date()));
    setTipo('');
    setUsuario('');
    setMetodoPago('');
    setConcepto('');
  };

  const handleExportar = () => {
    if (!reporteData) return;

    const BOM = '\uFEFF';
    
    let header = `Reporte de Movimientos de Caja\n`;
    header += `Período Analizado:\t${fechaInicio || 'Todas las fechas'}\tal\t${fechaFin || 'Hoy'}\n`;
    if (tipo) header += `Tipo de Movimiento:\t${tipo}\n`;
    if (usuario) header += `Usuario Filtrado:\t${usuario}\n`;
    if (metodoPago) header += `Método de Pago:\t${metodoPago}\n`;
    if (concepto) header += `Concepto Filtrado:\t${concepto}\n`;
    header += `Fecha de Generación:\t${new Date().toLocaleString('es-PE')}\n\n`;

    header += `=== RESUMEN GENERAL ===\n`;
    header += `Total Efectivo\tTotal Tarjeta\tTotal Transferencia\tTotal Otros\tTotal General\n`;
    header += `S/ ${reporteData.resumen.totalEfectivo.toFixed(2)}\tS/ ${reporteData.resumen.totalTarjeta.toFixed(2)}\tS/ ${reporteData.resumen.totalTransferencia.toFixed(2)}\tS/ ${reporteData.resumen.totalOtros.toFixed(2)}\tS/ ${reporteData.resumen.totalGeneral.toFixed(2)}\n\n`;

    header += `=== ESTADO DE CAJAS ===\n`;
    header += `Cajas Abiertas\tCajas Cerradas\n`;
    header += `${reporteData.resumen.cajasAbiertas}\t${reporteData.resumen.cajasCerradas}\n\n`;

    const movimientosPorUsuario = calcularMovimientosPorUsuario();
    header += `=== TOP 10 USUARIOS CON MÁS MOVIMIENTOS ===\n`;
    header += `Posición\tUsuario\tTotal Movimientos\tMonto Total\n`;
    movimientosPorUsuario.slice(0, 10).forEach((u, idx) => {
      header += `#${idx + 1}\t${u.usuario}\t${u.cantidad}\tS/ ${u.total.toFixed(2)}\n`;
    });
    header += `\n`;

    header += `=== DISTRIBUCIÓN POR MÉTODO DE PAGO ===\n`;
    header += `Método\tTransacciones\tMonto Total\tPorcentaje\n`;
    reporteData.movimientosPorMetodo.forEach(m => {
      header += `${m.metodoPago}\t${m.cantidadTransacciones}\tS/ ${m.montoTotal.toFixed(2)}\t${m.porcentaje.toFixed(2)}%\n`;
    });
    header += `\n`;

    header += `=== DETALLE DE MOVIMIENTOS POR CAJA ===\n`;
    const csvContent = [
      'Caja\tUsuario\tApertura\tIngresos\tEgresos\tCierre\tEstado\tFecha Apertura\tFecha Cierre',
      ...reporteData.movimientosPorCaja.map(m => 
        `${m.nombreCaja}\t${m.nombreUsuario}\tS/ ${m.montoApertura.toFixed(2)}\tS/ ${m.totalIngresos.toFixed(2)}\tS/ ${m.totalEgresos.toFixed(2)}\tS/ ${m.montoCierre.toFixed(2)}\t${m.estado}\t${formatDMY(m.fechaApertura)}\t${m.fechaCierre ? formatDMY(m.fechaCierre) : '-'}`
      )
    ].join('\n');

    const fullContent = BOM + header + csvContent;
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Caja_${fechaInicio || 'completo'}_${fechaFin || new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calcularResumen = () => {
    if (!reporteData) {
      return {
        totalIngresos: 0,
        totalEgresos: 0,
        saldoFinal: 0,
        totalMovimientos: 0
      };
    }

    const totalIngresos = reporteData.resumen.totalEfectivo + 
                         reporteData.resumen.totalTarjeta + 
                         reporteData.resumen.totalTransferencia + 
                         reporteData.resumen.totalOtros;
    
    return {
      totalIngresos,
      totalEgresos: 0,
      saldoFinal: reporteData.resumen.totalGeneral,
      totalMovimientos: reporteData.movimientosPorCaja.length
    };
  };

  const calcularMovimientosPorTipo = () => {
    if (!reporteData || !reporteData.movimientosPorCaja) return [];
    
    const totalMonto = reporteData.movimientosPorCaja.reduce((sum, m) => sum + m.totalIngresos, 0);
    
    return [
      {
        tipo: 'INGRESO',
        cantidad: reporteData.movimientosPorCaja.filter(m => m.estado === 'Cerrada').length,
        total: totalMonto,
        porcentaje: 100
      }
    ];
  };

  const calcularMovimientosPorUsuario = () => {
    if (!reporteData || !reporteData.movimientosPorCaja) return [];
    
    const usuariosMap = new Map<string, { cantidad: number; total: number }>();
    
    reporteData.movimientosPorCaja.forEach(m => {
      const current = usuariosMap.get(m.nombreUsuario) || { cantidad: 0, total: 0 };
      usuariosMap.set(m.nombreUsuario, {
        cantidad: current.cantidad + 1,
        total: current.total + m.totalIngresos
      });
    });

    return Array.from(usuariosMap.entries())
      .map(([usuario, data]) => ({ usuario, ...data }))
      .sort((a, b) => b.cantidad - a.cantidad);
  };

  const calcularMovimientosPorMetodoPago = () => {
    if (!reporteData || !reporteData.movimientosPorMetodo) return [];
    return reporteData.movimientosPorMetodo;
  };

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'Abierta': return 'info';
      case 'Cerrada': return 'success';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'INGRESO': return COLOR_SCALES.success[500];
      case 'EGRESO': return COLOR_SCALES.danger[500];
      case 'APERTURA': return COLOR_SCALES.primary[500];
      case 'CIERRE': return COLOR_SCALES.info[500];
      default: return COLORS.textLight;
    }
  };

  const resumen = calcularResumen();

  return (
    <Layout title="Reporte de Caja">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Reporte de Caja</PageTitle>
            <PageSubtitle>Análisis de movimientos de caja, ingresos y egresos</PageSubtitle>
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
            <FilterGroup>
              <FilterLabel>Tipo de Movimiento</FilterLabel>
              <Select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
                <option value="APERTURA">Apertura</option>
                <option value="CIERRE">Cierre</option>
              </Select>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Usuario</FilterLabel>
              <Input
                type="text"
                placeholder="Buscar por usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Método de Pago</FilterLabel>
              <Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CHEQUE">Cheque</option>
              </Select>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Concepto</FilterLabel>
              <Input
                type="text"
                placeholder="Buscar por concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
              />
            </FilterGroup>
          </FiltersGrid>
          <FilterButtonsRow>
            <Button $variant="secondary" onClick={handleLimpiar}>
              Limpiar
            </Button>
            <Button $variant="primary" onClick={handleBuscar} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
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
            <EmptyIcon>💰</EmptyIcon>
            <EmptyTitle>Sin datos disponibles</EmptyTitle>
            <EmptyText>Seleccione los filtros y haga clic en "Buscar".</EmptyText>
          </EmptyState>
        )}

        {!loading && reporteData && (
          <TabsContainer>
            <TabsHeader>
              <Tab $active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                Resumen General
              </Tab>
              <Tab $active={activeTab === 'movimientos'} onClick={() => setActiveTab('movimientos')}>
                Movimientos Detallados
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
                      <CardTitle>Total Ingresos</CardTitle>
                      <CardValue style={{ color: COLOR_SCALES.success[600] }}>
                        S/ {resumen.totalIngresos.toFixed(2)}
                      </CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Total Egresos</CardTitle>
                      <CardValue style={{ color: COLOR_SCALES.danger[600] }}>
                        S/ {resumen.totalEgresos.toFixed(2)}
                      </CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Saldo Final</CardTitle>
                      <CardValue style={{ color: COLORS.primary }}>
                        S/ {resumen.saldoFinal.toFixed(2)}
                      </CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Total Movimientos</CardTitle>
                      <CardValue>{resumen.totalMovimientos}</CardValue>
                    </SummaryCard>
                  </SummaryCards>

                  <ChartContainer>
                    <ChartTitle>Distribución de Movimientos por Tipo</ChartTitle>
                    {calcularMovimientosPorTipo().map((t) => (
                      <ChartBar key={t.tipo} $percentage={t.porcentaje} $color={getTipoColor(t.tipo)}>
                        <span className="label">{t.tipo}</span>
                        <div className="bar-container">
                          <div className="bar-fill"></div>
                        </div>
                        <span className="value">S/ {t.total.toFixed(2)} ({t.porcentaje.toFixed(1)}%)</span>
                      </ChartBar>
                    ))}
                  </ChartContainer>

                  <ChartContainer>
                    <ChartTitle>Distribución por Método de Pago</ChartTitle>
                    {calcularMovimientosPorMetodoPago().map((metodo) => (
                      <ChartBar key={metodo.metodoPago} $percentage={metodo.porcentaje} $color={COLOR_SCALES.primary[500]}>
                        <span className="label">{metodo.metodoPago}</span>
                        <div className="bar-container">
                          <div className="bar-fill"></div>
                        </div>
                        <span className="value">S/ {metodo.montoTotal.toFixed(2)} ({metodo.porcentaje.toFixed(1)}%)</span>
                      </ChartBar>
                    ))}
                  </ChartContainer>
                </>
              )}

              {activeTab === 'movimientos' && (
                <TableContainer>
                  <Table>
                    <Thead>
                      <tr>
                        <Th>Caja</Th>
                        <Th>Usuario</Th>
                        <Th>Apertura</Th>
                        <Th>Ingresos</Th>
                        <Th>Egresos</Th>
                        <Th>Cierre</Th>
                        <Th>Estado</Th>
                        <Th>Fecha Apertura</Th>
                        <Th>Fecha Cierre</Th>
                      </tr>
                    </Thead>
                    <Tbody>
                      {reporteData?.movimientosPorCaja.map((movimiento) => (
                        <Tr key={movimiento.cajaId}>
                          <Td style={{ fontWeight: 600 }}>{movimiento.nombreCaja}</Td>
                          <Td>{movimiento.nombreUsuario}</Td>
                          <Td>S/ {movimiento.montoApertura.toFixed(2)}</Td>
                          <Td>
                            <IngresosValue>S/ {movimiento.totalIngresos.toFixed(2)}</IngresosValue>
                          </Td>
                          <Td>
                            <EgresosValue>S/ {movimiento.totalEgresos.toFixed(2)}</EgresosValue>
                          </Td>
                          <Td style={{ fontWeight: 600 }}>S/ {movimiento.montoCierre.toFixed(2)}</Td>
                          <Td>
                            <StatusBadge variant={getEstadoVariant(movimiento.estado)} dot>
                              {movimiento.estado}
                            </StatusBadge>
                          </Td>
                          <Td>{formatDMY(movimiento.fechaApertura)}</Td>
                          <Td>{movimiento.fechaCierre ? formatDMY(movimiento.fechaCierre) : '-'}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}

              {activeTab === 'analisis' && (
                <>
                  <Section>
                    <SectionTitle>Top 10 Usuarios con Más Movimientos</SectionTitle>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th style={{ width: '80px' }}>Posición</Th>
                            <Th>Usuario</Th>
                            <Th>Total Movimientos</Th>
                            <Th>Monto Total</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {calcularMovimientosPorUsuario().slice(0, 10).map((usuario, idx) => (
                            <Tr key={usuario.usuario}>
                              <Td>
                                <RankBadge $rank={idx + 1}>#{idx + 1}</RankBadge>
                              </Td>
                              <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{usuario.usuario}</Td>
                              <Td>{usuario.cantidad}</Td>
                              <Td style={{ fontWeight: 600 }}>S/ {usuario.total.toFixed(2)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Section>

                  <GridTwo>
                    <ChartContainer>
                      <ChartTitle>Resumen por Tipo de Movimiento</ChartTitle>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Tipo</Th>
                            <Th>Cantidad</Th>
                            <Th>Monto Total</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {calcularMovimientosPorTipo().map((t) => (
                            <Tr key={t.tipo}>
                              <Td>
                                <StatusBadge 
                                  variant={t.tipo === 'INGRESO' ? 'success' : t.tipo === 'EGRESO' ? 'danger' : 'info'} 
                                  dot
                                >
                                  {t.tipo}
                                </StatusBadge>
                              </Td>
                              <Td>{t.cantidad}</Td>
                              <Td style={{ fontWeight: 600 }}>S/ {t.total.toFixed(2)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </ChartContainer>

                    <ChartContainer>
                      <ChartTitle>Resumen por Método de Pago</ChartTitle>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Método</Th>
                            <Th>Transacciones</Th>
                            <Th>Monto Total</Th>
                            <Th>%</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {calcularMovimientosPorMetodoPago().map((metodo) => (
                            <Tr key={metodo.metodoPago}>
                              <Td style={{ fontWeight: 500 }}>{metodo.metodoPago}</Td>
                              <Td>{metodo.cantidadTransacciones}</Td>
                              <Td style={{ fontWeight: 600 }}>S/ {metodo.montoTotal.toFixed(2)}</Td>
                              <Td>{metodo.porcentaje.toFixed(1)}%</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </ChartContainer>
                  </GridTwo>
                </>
              )}
            </TabContent>
          </TabsContainer>
        )}
      </Container>
    </Layout>
  );
};

export default ReporteCaja;
