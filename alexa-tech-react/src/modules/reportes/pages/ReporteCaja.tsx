import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);
const formatDMY = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 2rem;
`;

// Tabs
const TabsContainer = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  background-color: #f9fafb;
  border-radius: 0.5rem 0.5rem 0 0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border-bottom: 3px solid ${props => props.$active ? '#2563eb' : 'transparent'};
  color: ${props => props.$active ? '#2563eb' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: ${props => props.$active ? '0' : '3px'};

  &:hover {
    background: ${props => props.$active ? 'white' : '#f3f4f6'};
  }
`;

const TabContent = styled.div`
  padding: 1.5rem;
`;

// Título se renderiza desde Layout

const FiltersContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.125);
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.125);
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1d4ed8;
  }
`;

const ExportButton = styled(Button)`
  background-color: #10b981;
  
  &:hover {
    background-color: #059669;
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const CardValue = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
`;

const TableHeader = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #1a1a1a;
  border-bottom: 1px solid #e5e7eb;
`;

const TypeBadge = styled.span<{ type: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.type) {
      case 'INGRESO': return '#10B98120';
      case 'EGRESO': return '#EF444420';
      case 'APERTURA': return '#3B82F620';
      case 'CIERRE': return '#8B5CF620';
      default: return '#6B728020';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'INGRESO': return '#059669';
      case 'EGRESO': return '#DC2626';
      case 'APERTURA': return '#2563EB';
      case 'CIERRE': return '#7C3AED';
      default: return '#374151';
    }
  }};
`;

const RankBadge = styled.span<{ rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.75rem;
  background: ${props => {
    if (props.rank === 1) return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if (props.rank === 2) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
    if (props.rank === 3) return 'linear-gradient(135deg, #CD7F32, #B87333)';
    return '#e5e7eb';
  }};
  color: ${props => props.rank <= 3 ? 'white' : '#6b7280'};
  box-shadow: ${props => props.rank <= 3 ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'};
  margin-right: 0.5rem;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const ChartTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
`;

const ChartBar = styled.div<{ percentage: number; color: string }>`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;

  .label {
    width: 120px;
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
  }

  .bar-container {
    flex: 1;
    height: 24px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .bar-fill {
    height: 100%;
    width: ${props => props.percentage}%;
    background: ${props => props.color};
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .value {
    margin-left: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    min-width: 80px;
    text-align: right;
  }
`;

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

const ReporteCaja: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'movimientos' | 'analisis'>('resumen');
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [fechaFin, setFechaFin] = useState(formatDateInput(new Date()));
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

  const handleExportar = () => {
    if (!reporteData) return;

    const BOM = '\uFEFF';
    
    // Preparar encabezado con filtros aplicados
    let header = `Reporte de Movimientos de Caja\n`;
    header += `Período Analizado:\t${fechaInicio || 'Todas las fechas'}\tal\t${fechaFin || 'Hoy'}\n`;
    if (tipo) header += `Tipo de Movimiento:\t${tipo}\n`;
    if (usuario) header += `Usuario Filtrado:\t${usuario}\n`;
    if (metodoPago) header += `Método de Pago:\t${metodoPago}\n`;
    if (concepto) header += `Concepto Filtrado:\t${concepto}\n`;
    header += `Fecha de Generación:\t${new Date().toLocaleString('es-PE')}\n\n`;

    // Resumen
    header += `=== RESUMEN GENERAL ===\n`;
    header += `Total Efectivo\tTotal Tarjeta\tTotal Transferencia\tTotal Otros\tTotal General\n`;
    header += `S/ ${reporteData.resumen.totalEfectivo.toFixed(2)}\tS/ ${reporteData.resumen.totalTarjeta.toFixed(2)}\tS/ ${reporteData.resumen.totalTransferencia.toFixed(2)}\tS/ ${reporteData.resumen.totalOtros.toFixed(2)}\tS/ ${reporteData.resumen.totalGeneral.toFixed(2)}\n\n`;

    // Estado de cajas
    header += `=== ESTADO DE CAJAS ===\n`;
    header += `Cajas Abiertas\tCajas Cerradas\n`;
    header += `${reporteData.resumen.cajasAbiertas}\t${reporteData.resumen.cajasCerradas}\n\n`;

    // Análisis por Usuario
    const movimientosPorUsuario = calcularMovimientosPorUsuario();
    header += `=== TOP 10 USUARIOS CON MÁS MOVIMIENTOS ===\n`;
    header += `Posición\tUsuario\tTotal Movimientos\tMonto Total\n`;
    movimientosPorUsuario.slice(0, 10).forEach((u, idx) => {
      header += `#${idx + 1}\t${u.usuario}\t${u.cantidad}\tS/ ${u.total.toFixed(2)}\n`;
    });
    header += `\n`;

    // Análisis por Método de Pago
    header += `=== DISTRIBUCIÓN POR MÉTODO DE PAGO ===\n`;
    header += `Método\tTransacciones\tMonto Total\tPorcentaje\n`;
    reporteData.movimientosPorMetodo.forEach(m => {
      header += `${m.metodoPago}\t${m.cantidadTransacciones}\tS/ ${m.montoTotal.toFixed(2)}\t${m.porcentaje.toFixed(2)}%\n`;
    });
    header += `\n`;

    // Detalle de movimientos por caja
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
      totalEgresos: 0, // Backend no proporciona egresos detallados aún
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

  const resumen = calcularResumen();

  return (
    <Layout title="Reportes: Caja">
      <Container>
        <Header>
          <ExportButton onClick={handleExportar}>
            Exportar Reporte
          </ExportButton>
        </Header>

        <FiltersContainer>
          <FiltersGrid>
            <FormGroup>
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Tipo de Movimiento</Label>
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
            </FormGroup>
            <FormGroup>
              <Label>Usuario</Label>
              <Input
                type="text"
                placeholder="Buscar por usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Método de Pago</Label>
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
            </FormGroup>
            <FormGroup>
              <Label>Concepto</Label>
              <Input
                type="text"
                placeholder="Buscar por concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
              />
            </FormGroup>
          </FiltersGrid>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <Button onClick={handleBuscar} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </FiltersContainer>

        <TabsContainer>
          <TabsHeader>
            <Tab $active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
              📊 Resumen General
            </Tab>
            <Tab $active={activeTab === 'movimientos'} onClick={() => setActiveTab('movimientos')}>
              📋 Movimientos Detallados
            </Tab>
            <Tab $active={activeTab === 'analisis'} onClick={() => setActiveTab('analisis')}>
              📈 Análisis y Rankings
            </Tab>
          </TabsHeader>

          <TabContent>
            {activeTab === 'resumen' && (
              <>
                <SummaryCards>
                  <SummaryCard>
                    <CardTitle>Total Ingresos</CardTitle>
                    <CardValue style={{ color: '#059669' }}>S/ {resumen.totalIngresos.toFixed(2)}</CardValue>
                  </SummaryCard>
                  <SummaryCard>
                    <CardTitle>Total Egresos</CardTitle>
                    <CardValue style={{ color: '#DC2626' }}>S/ {resumen.totalEgresos.toFixed(2)}</CardValue>
                  </SummaryCard>
                  <SummaryCard>
                    <CardTitle>Saldo Final</CardTitle>
                    <CardValue style={{ color: '#2563eb' }}>S/ {resumen.saldoFinal.toFixed(2)}</CardValue>
                  </SummaryCard>
                  <SummaryCard>
                    <CardTitle>Total Movimientos</CardTitle>
                    <CardValue>{resumen.totalMovimientos}</CardValue>
                  </SummaryCard>
                </SummaryCards>

                <ChartContainer>
                  <ChartTitle>Distribución de Movimientos por Tipo</ChartTitle>
                  {calcularMovimientosPorTipo().map((tipo) => (
                    <ChartBar key={tipo.tipo} percentage={tipo.porcentaje} color={
                      tipo.tipo === 'INGRESO' ? '#10B981' :
                      tipo.tipo === 'EGRESO' ? '#EF4444' :
                      tipo.tipo === 'APERTURA' ? '#3B82F6' : '#8B5CF6'
                    }>
                      <span className="label">{tipo.tipo}</span>
                      <div className="bar-container">
                        <div className="bar-fill"></div>
                      </div>
                      <span className="value">S/ {tipo.total.toFixed(2)} ({tipo.porcentaje.toFixed(1)}%)</span>
                    </ChartBar>
                  ))}
                </ChartContainer>

                <ChartContainer>
                  <ChartTitle>Distribución por Método de Pago</ChartTitle>
                  {calcularMovimientosPorMetodoPago().map((metodo) => (
                    <ChartBar key={metodo.metodoPago} percentage={metodo.porcentaje} color="#6366f1">
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
                  <thead>
                    <tr>
                      <TableHeader>Caja</TableHeader>
                      <TableHeader>Usuario</TableHeader>
                      <TableHeader>Apertura</TableHeader>
                      <TableHeader>Ingresos</TableHeader>
                      <TableHeader>Egresos</TableHeader>
                      <TableHeader>Cierre</TableHeader>
                      <TableHeader>Estado</TableHeader>
                      <TableHeader>Fecha Apertura</TableHeader>
                      <TableHeader>Fecha Cierre</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {reporteData?.movimientosPorCaja.map((movimiento) => (
                      <tr key={movimiento.cajaId}>
                        <TableCell style={{ fontWeight: 600 }}>{movimiento.nombreCaja}</TableCell>
                        <TableCell>{movimiento.nombreUsuario}</TableCell>
                        <TableCell>S/ {movimiento.montoApertura.toFixed(2)}</TableCell>
                        <TableCell style={{ color: '#059669', fontWeight: 600 }}>
                          S/ {movimiento.totalIngresos.toFixed(2)}
                        </TableCell>
                        <TableCell style={{ color: '#DC2626', fontWeight: 600 }}>
                          S/ {movimiento.totalEgresos.toFixed(2)}
                        </TableCell>
                        <TableCell style={{ fontWeight: 600 }}>S/ {movimiento.montoCierre.toFixed(2)}</TableCell>
                        <TableCell>
                          <TypeBadge type={movimiento.estado === 'Abierta' ? 'APERTURA' : 'CIERRE'}>
                            {movimiento.estado}
                          </TypeBadge>
                        </TableCell>
                        <TableCell>{formatDMY(movimiento.fechaApertura)}</TableCell>
                        <TableCell>{movimiento.fechaCierre ? formatDMY(movimiento.fechaCierre) : '-'}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 'analisis' && (
              <>
                <ChartContainer>
                  <ChartTitle>🏆 Top 10 Usuarios con Más Movimientos</ChartTitle>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader style={{ width: '80px' }}>Posición</TableHeader>
                        <TableHeader>Usuario</TableHeader>
                        <TableHeader>Total Movimientos</TableHeader>
                        <TableHeader>Monto Total</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {calcularMovimientosPorUsuario().slice(0, 10).map((usuario, idx) => (
                        <tr key={usuario.usuario}>
                          <TableCell>
                            <RankBadge rank={idx + 1}>#{idx + 1}</RankBadge>
                          </TableCell>
                          <TableCell style={{ fontWeight: idx < 3 ? 600 : 400 }}>{usuario.usuario}</TableCell>
                          <TableCell>{usuario.cantidad}</TableCell>
                          <TableCell style={{ fontWeight: 600 }}>S/ {usuario.total.toFixed(2)}</TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </ChartContainer>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <ChartContainer>
                    <ChartTitle>Resumen por Tipo de Movimiento</ChartTitle>
                    <Table>
                      <thead>
                        <tr>
                          <TableHeader>Tipo</TableHeader>
                          <TableHeader>Cantidad</TableHeader>
                          <TableHeader>Monto Total</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {calcularMovimientosPorTipo().map((tipo) => (
                          <tr key={tipo.tipo}>
                            <TableCell>
                              <TypeBadge type={tipo.tipo}>{tipo.tipo}</TypeBadge>
                            </TableCell>
                            <TableCell>{tipo.cantidad}</TableCell>
                            <TableCell style={{ fontWeight: 600 }}>S/ {tipo.total.toFixed(2)}</TableCell>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </ChartContainer>

                  <ChartContainer>
                    <ChartTitle>Resumen por Método de Pago</ChartTitle>
                    <Table>
                      <thead>
                        <tr>
                          <TableHeader>Método</TableHeader>
                          <TableHeader>Transacciones</TableHeader>
                          <TableHeader>Monto Total</TableHeader>
                          <TableHeader>Porcentaje</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {calcularMovimientosPorMetodoPago().map((metodo) => (
                          <tr key={metodo.metodoPago}>
                            <TableCell style={{ fontWeight: 500 }}>{metodo.metodoPago}</TableCell>
                            <TableCell>{metodo.cantidadTransacciones}</TableCell>
                            <TableCell style={{ fontWeight: 600 }}>S/ {metodo.montoTotal.toFixed(2)}</TableCell>
                            <TableCell>{metodo.porcentaje.toFixed(1)}%</TableCell>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </ChartContainer>
                </div>
              </>
            )}
          </TabContent>
        </TabsContainer>
      </Container>
    </Layout>
  );
};

export default ReporteCaja;