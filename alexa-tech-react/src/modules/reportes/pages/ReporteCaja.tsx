import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';

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
  id: string;
  fecha: string;
  hora: string;
  tipo: 'INGRESO' | 'EGRESO' | 'APERTURA' | 'CIERRE';
  concepto: string;
  monto: number;
  saldo: number;
  usuario: string;
  comprobante?: string;
  metodoPago: string;
  observaciones?: string;
}

const ReporteCaja: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'movimientos' | 'analisis'>('resumen');
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [fechaFin, setFechaFin] = useState(formatDateInput(new Date()));
  const [tipo, setTipo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [concepto, setConcepto] = useState('');
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - esto será reemplazado con datos reales del backend
  const mockMovimientos: MovimientoCaja[] = [
    {
      id: '1',
      fecha: '2024-01-15',
      hora: '09:00',
      tipo: 'APERTURA',
      concepto: 'Apertura de caja del día',
      monto: 500,
      saldo: 500,
      usuario: 'Juan Pérez',
      metodoPago: 'EFECTIVO',
      observaciones: 'Caja inicial'
    },
    {
      id: '2',
      fecha: '2024-01-15',
      hora: '10:30',
      tipo: 'INGRESO',
      concepto: 'Venta de productos',
      monto: 150,
      saldo: 650,
      usuario: 'Juan Pérez',
      comprobante: 'B001-0001',
      metodoPago: 'EFECTIVO',
      observaciones: 'Venta al contado'
    },
    {
      id: '3',
      fecha: '2024-01-15',
      hora: '11:15',
      tipo: 'EGRESO',
      concepto: 'Compra de insumos',
      monto: -75,
      saldo: 575,
      usuario: 'Juan Pérez',
      comprobante: 'F001-0001',
      metodoPago: 'EFECTIVO',
      observaciones: 'Pago a proveedor'
    },
    {
      id: '4',
      fecha: '2024-01-15',
      hora: '14:20',
      tipo: 'INGRESO',
      concepto: 'Venta de servicios',
      monto: 200,
      saldo: 775,
      usuario: 'María García',
      comprobante: 'B001-0002',
      metodoPago: 'TARJETA',
      observaciones: 'Servicio técnico'
    },
    {
      id: '5',
      fecha: '2024-01-15',
      hora: '18:00',
      tipo: 'CIERRE',
      concepto: 'Cierre de caja del día',
      monto: 0,
      saldo: 775,
      usuario: 'Juan Pérez',
      metodoPago: 'EFECTIVO',
      observaciones: 'Caja cuadrada'
    }
  ];

  useEffect(() => {
    // Cargar datos iniciales
    setMovimientos(mockMovimientos);
  }, []);

  const handleBuscar = () => {
    setLoading(true);
    // Simular búsqueda - en producción esto llamaría al backend
    setTimeout(() => {
      setMovimientos(mockMovimientos);
      setLoading(false);
    }, 1000);
  };

  const handleExportar = () => {
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
    header += `Total Ingresos\tTotal Egresos\tSaldo Final\tTotal Movimientos\n`;
    header += `S/ ${resumen.totalIngresos.toFixed(2)}\tS/ ${resumen.totalEgresos.toFixed(2)}\tS/ ${resumen.saldoFinal.toFixed(2)}\t${resumen.totalMovimientos}\n\n`;

    // Análisis por Tipo
    const movimientosPorTipo = calcularMovimientosPorTipo();
    header += `=== MOVIMIENTOS POR TIPO ===\n`;
    header += `Tipo\tCantidad\tMonto Total\tPorcentaje\n`;
    movimientosPorTipo.forEach(t => {
      header += `${t.tipo}\t${t.cantidad}\tS/ ${t.total.toFixed(2)}\t${t.porcentaje.toFixed(2)}%\n`;
    });
    header += `\n`;

    // Análisis por Usuario
    const movimientosPorUsuario = calcularMovimientosPorUsuario();
    header += `=== TOP 10 USUARIOS CON MÁS MOVIMIENTOS ===\n`;
    header += `Posición\tUsuario\tTotal Movimientos\tMonto Total\n`;
    movimientosPorUsuario.slice(0, 10).forEach((u, idx) => {
      header += `#${idx + 1}\t${u.usuario}\t${u.cantidad}\tS/ ${u.total.toFixed(2)}\n`;
    });
    header += `\n`;

    // Análisis por Método de Pago
    const movimientosPorMetodo = calcularMovimientosPorMetodoPago();
    header += `=== DISTRIBUCIÓN POR MÉTODO DE PAGO ===\n`;
    header += `Método\tCantidad\tMonto Total\tPorcentaje\n`;
    movimientosPorMetodo.forEach(m => {
      header += `${m.metodo}\t${m.cantidad}\tS/ ${m.total.toFixed(2)}\t${m.porcentaje.toFixed(2)}%\n`;
    });
    header += `\n`;

    // Detalle de movimientos
    header += `=== DETALLE DE MOVIMIENTOS ===\n`;
    const csvContent = [
      'Fecha\tHora\tTipo\tConcepto\tMonto\tSaldo\tUsuario\tComprobante\tMétodo Pago\tObservaciones',
      ...movimientos.map(m => 
        `${m.fecha}\t${m.hora}\t${m.tipo}\t${m.concepto}\tS/ ${m.monto.toFixed(2)}\tS/ ${m.saldo.toFixed(2)}\t${m.usuario}\t${m.comprobante || '-'}\t${m.metodoPago}\t${m.observaciones || '-'}`
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
    const totalIngresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + m.monto, 0);
    const totalEgresos = Math.abs(movimientos.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + m.monto, 0));
    const saldoFinal = movimientos.length > 0 ? movimientos[movimientos.length - 1].saldo : 0;
    const totalMovimientos = movimientos.length;

    return {
      totalIngresos,
      totalEgresos,
      saldoFinal,
      totalMovimientos
    };
  };

  const calcularMovimientosPorTipo = () => {
    const tipos = ['INGRESO', 'EGRESO', 'APERTURA', 'CIERRE'];
    const totalMonto = movimientos.reduce((sum, m) => sum + Math.abs(m.monto), 0);
    
    return tipos.map(tipo => {
      const movs = movimientos.filter(m => m.tipo === tipo);
      const cantidad = movs.length;
      const total = movs.reduce((sum, m) => sum + Math.abs(m.monto), 0);
      const porcentaje = totalMonto > 0 ? (total / totalMonto) * 100 : 0;
      
      return { tipo, cantidad, total, porcentaje };
    }).filter(t => t.cantidad > 0);
  };

  const calcularMovimientosPorUsuario = () => {
    const usuariosMap = new Map<string, { cantidad: number; total: number }>();
    
    movimientos.forEach(m => {
      const current = usuariosMap.get(m.usuario) || { cantidad: 0, total: 0 };
      usuariosMap.set(m.usuario, {
        cantidad: current.cantidad + 1,
        total: current.total + Math.abs(m.monto)
      });
    });

    return Array.from(usuariosMap.entries())
      .map(([usuario, data]) => ({ usuario, ...data }))
      .sort((a, b) => b.cantidad - a.cantidad);
  };

  const calcularMovimientosPorMetodoPago = () => {
    const metodos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE'];
    const totalMonto = movimientos.reduce((sum, m) => sum + Math.abs(m.monto), 0);
    
    return metodos.map(metodo => {
      const movs = movimientos.filter(m => m.metodoPago === metodo);
      const cantidad = movs.length;
      const total = movs.reduce((sum, m) => sum + Math.abs(m.monto), 0);
      const porcentaje = totalMonto > 0 ? (total / totalMonto) * 100 : 0;
      
      return { metodo, cantidad, total, porcentaje };
    }).filter(m => m.cantidad > 0);
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
                    <ChartBar key={metodo.metodo} percentage={metodo.porcentaje} color="#6366f1">
                      <span className="label">{metodo.metodo}</span>
                      <div className="bar-container">
                        <div className="bar-fill"></div>
                      </div>
                      <span className="value">S/ {metodo.total.toFixed(2)} ({metodo.porcentaje.toFixed(1)}%)</span>
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
                      <TableHeader>Fecha</TableHeader>
                      <TableHeader>Hora</TableHeader>
                      <TableHeader>Tipo</TableHeader>
                      <TableHeader>Concepto</TableHeader>
                      <TableHeader>Monto</TableHeader>
                      <TableHeader>Saldo</TableHeader>
                      <TableHeader>Usuario</TableHeader>
                      <TableHeader>Comprobante</TableHeader>
                      <TableHeader>Método Pago</TableHeader>
                      <TableHeader>Observaciones</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((movimiento) => (
                      <tr key={movimiento.id}>
                        <TableCell>{formatDMY(movimiento.fecha)}</TableCell>
                        <TableCell>{movimiento.hora}</TableCell>
                        <TableCell>
                          <TypeBadge type={movimiento.tipo}>
                            {movimiento.tipo === 'INGRESO' ? 'Ingreso' :
                              movimiento.tipo === 'EGRESO' ? 'Egreso' :
                                movimiento.tipo === 'APERTURA' ? 'Apertura' : 'Cierre'}
                          </TypeBadge>
                        </TableCell>
                        <TableCell>{movimiento.concepto}</TableCell>
                        <TableCell style={{ color: movimiento.monto >= 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>
                          S/ {movimiento.monto.toFixed(2)}
                        </TableCell>
                        <TableCell style={{ fontWeight: 600 }}>S/ {movimiento.saldo.toFixed(2)}</TableCell>
                        <TableCell>{movimiento.usuario}</TableCell>
                        <TableCell>{movimiento.comprobante || '-'}</TableCell>
                        <TableCell>{movimiento.metodoPago}</TableCell>
                        <TableCell>{movimiento.observaciones || '-'}</TableCell>
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
                          <TableHeader>Cantidad</TableHeader>
                          <TableHeader>Monto Total</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {calcularMovimientosPorMetodoPago().map((metodo) => (
                          <tr key={metodo.metodo}>
                            <TableCell style={{ fontWeight: 500 }}>{metodo.metodo}</TableCell>
                            <TableCell>{metodo.cantidad}</TableCell>
                            <TableCell style={{ fontWeight: 600 }}>S/ {metodo.total.toFixed(2)}</TableCell>
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