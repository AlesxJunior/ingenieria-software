import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);
const formatDMY = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatCurrency = (num: number) => `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TabsContainer = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#2563eb' : '#6b7280'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#2563eb' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? 'white' : '#f3f4f6'};
    color: ${props => props.active ? '#2563eb' : '#1f2937'};
  }
`;

const TabContent = styled.div`
  padding: 1.5rem;
`;

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
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ExportButton = styled(Button)`
  background-color: #10b981;
  
  &:hover:not(:disabled) {
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

const Section = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #1a1a1a;
  border-bottom: 1px solid #e5e7eb;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

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
      }
    } catch (e) {
      console.error('Error cargando reporte ventas', e);
      setReporteData(null);
    } finally {
      setLoading(false);
    }
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
        <Header>
          <div />
          <ExportButton onClick={handleExportar} disabled={!reporteData || loading}>
            📊 Exportar Reporte
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
          </FiltersGrid>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <Button onClick={handleBuscar} disabled={loading}>
              {loading ? 'Generando...' : '🔍 Generar Reporte'}
            </Button>
          </div>
        </FiltersContainer>

        {loading && <EmptyState>Cargando reporte...</EmptyState>}

        {!loading && !reporteData && (
          <EmptyState>No hay datos disponibles. Seleccione un rango de fechas y haga clic en "Generar Reporte".</EmptyState>
        )}

        {!loading && reporteData && (
          <>
            <TabsContainer>
              <TabsHeader>
                <Tab active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                  📊 Resumen General
                </Tab>
                <Tab active={activeTab === 'detalles'} onClick={() => setActiveTab('detalles')}>
                  📋 Detalles por Período
                </Tab>
                <Tab active={activeTab === 'analisis'} onClick={() => setActiveTab('analisis')}>
                  📈 Análisis y Rankings
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
                      <SectionTitle>💳 Distribución por Método de Pago</SectionTitle>
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Método</Th>
                              <Th>Cantidad</Th>
                              <Th>Total</Th>
                              <Th>Porcentaje</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {reporteData.ventasPorMetodoPago.map((m: any, idx: number) => (
                              <tr key={idx}>
                                <Td>{m.metodoPago}</Td>
                                <Td>{m.cantidad}</Td>
                                <Td>{formatCurrency(m.total)}</Td>
                                <Td>
                                  <span style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    background: '#3b82f620', 
                                    color: '#2563eb',
                                    borderRadius: '0.25rem',
                                    fontWeight: 600
                                  }}>
                                    {m.porcentaje.toFixed(1)}%
                                  </span>
                                </Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableContainer>
                    </Section>
                  </>
                )}

                {activeTab === 'detalles' && (
                  <>
                    <Section>
                      <SectionTitle>📅 Ventas por Día</SectionTitle>
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Fecha</Th>
                              <Th>Cantidad</Th>
                              <Th>Total</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {reporteData.ventasPorDia.map((v: any, idx: number) => (
                              <tr key={idx}>
                                <Td>{formatDMY(v.fecha)}</Td>
                                <Td>{v.cantidad}</Td>
                                <Td>{formatCurrency(v.total)}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableContainer>
                    </Section>

                    <Section>
                      <SectionTitle>👤 Ventas por Vendedor</SectionTitle>
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Vendedor</Th>
                              <Th>Cantidad Ventas</Th>
                              <Th>Total Ventas</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {reporteData.ventasPorVendedor.map((v: any, idx: number) => (
                              <tr key={idx}>
                                <Td>{v.nombreVendedor}</Td>
                                <Td>{v.cantidadVentas}</Td>
                                <Td>{formatCurrency(v.totalVentas)}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableContainer>
                    </Section>
                  </>
                )}

                {activeTab === 'analisis' && (
                  <>
                    <Section>
                      <SectionTitle>🏆 Top 10 Productos Más Vendidos</SectionTitle>
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <Th>#</Th>
                              <Th>Producto</Th>
                              <Th>Cantidad</Th>
                              <Th>Total Vendido</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {reporteData.topProductos.map((p: any, idx: number) => (
                              <tr key={idx}>
                                <Td>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '1.5rem',
                                    height: '1.5rem',
                                    borderRadius: '50%',
                                    background: idx < 3 ? '#f59e0b20' : '#e5e7eb',
                                    color: idx < 3 ? '#d97706' : '#6b7280',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}>
                                    {idx + 1}
                                  </span>
                                </Td>
                                <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{p.nombreProducto}</Td>
                                <Td>{p.cantidadVendida}</Td>
                                <Td>{formatCurrency(p.totalVendido)}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableContainer>
                    </Section>

                    <Section>
                      <SectionTitle>👥 Top 10 Clientes</SectionTitle>
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <Th>#</Th>
                              <Th>Cliente</Th>
                              <Th>Cantidad Compras</Th>
                              <Th>Total Compras</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {reporteData.topClientes.map((c: any, idx: number) => (
                              <tr key={idx}>
                                <Td>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '1.5rem',
                                    height: '1.5rem',
                                    borderRadius: '50%',
                                    background: idx < 3 ? '#10b98120' : '#e5e7eb',
                                    color: idx < 3 ? '#059669' : '#6b7280',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}>
                                    {idx + 1}
                                  </span>
                                </Td>
                                <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{c.nombreCliente}</Td>
                                <Td>{c.cantidadCompras}</Td>
                                <Td>{formatCurrency(c.totalCompras)}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableContainer>
                    </Section>
                  </>
                )}
              </TabContent>
            </TabsContainer>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default ReporteVentas;