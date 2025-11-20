import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';

const formatCurrency = (num: number | undefined) => {
  if (num === undefined || num === null || isNaN(num)) return 'S/ 0.00';
  return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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
  overflow-x: auto;
`;

const ReporteInventario: React.FC = () => {
  const [almacenId, setAlmacenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'stock' | 'analisis'>('resumen');

  useEffect(() => {
    handleBuscar();
  }, []);

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
      `Valor Total del Inventario\t${formatCurrency(reporteData.valorTotalInventario)}`,
      `Total de Almacenes\t${(reporteData.stockPorAlmacen || []).length}`,
      `Productos en Alerta\t${(reporteData.productosEnAlerta || []).length}`,
      '',
      '=================================================================',
      '                  STOCK POR ALMACÉN                              ',
      '=================================================================',
      'Almacén\tCantidad Total de Productos\tValor Total del Stock',
      ...(reporteData.stockPorAlmacen || []).map((a: any) =>
        `${a.almacen || 'Sin nombre'}\t${a._sum?.cantidad || 0}\t${formatCurrency(a._sum?.valor)}`
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
        '          ⚠️ PRODUCTOS EN ALERTA (STOCK BAJO) ⚠️                ',
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
        <Header>
          <div />
          <ExportButton onClick={handleExportar} disabled={!reporteData || loading}>
            📊 Exportar Reporte
          </ExportButton>
        </Header>

        <FiltersContainer>
          <FiltersGrid>
            <FormGroup>
              <Label>Almacén</Label>
              <Select
                value={almacenId}
                onChange={(e) => setAlmacenId(e.target.value)}
              >
                <option value="">Todos los almacenes</option>
                {/* Opciones serán cargadas dinámicamente */}
              </Select>
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
          <EmptyState>No hay datos disponibles. Haga clic en "Generar Reporte".</EmptyState>
        )}

        {!loading && reporteData && (
          <>
            <TabsContainer>
              <TabsHeader>
                <Tab active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                  📊 Resumen General
                </Tab>
                <Tab active={activeTab === 'stock'} onClick={() => setActiveTab('stock')}>
                  📦 Stock por Almacén
                </Tab>
                <Tab active={activeTab === 'analisis'} onClick={() => setActiveTab('analisis')}>
                  📈 Análisis de Rotación
                </Tab>
              </TabsHeader>

              <TabContent>
                {activeTab === 'resumen' && (
                  <>
                    <SummaryCards>
                      <SummaryCard>
                        <CardTitle>Valor Total Inventario</CardTitle>
                        <CardValue>{formatCurrency(reporteData.valorTotalInventario)}</CardValue>
                      </SummaryCard>
                      <SummaryCard>
                        <CardTitle>Total Almacenes</CardTitle>
                        <CardValue>{(reporteData.stockPorAlmacen || []).length}</CardValue>
                      </SummaryCard>
                      <SummaryCard>
                        <CardTitle>Productos en Alerta</CardTitle>
                        <CardValue style={{ color: (reporteData.productosEnAlerta || []).length > 0 ? '#DC2626' : 'inherit' }}>
                          {(reporteData.productosEnAlerta || []).length}
                        </CardValue>
                      </SummaryCard>
                    </SummaryCards>

                    <Section>
                      <SectionTitle>📊 Valor por Categoría</SectionTitle>
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Categoría</Th>
                              <Th>Valor Total</Th>
                              <Th>Participación</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {(reporteData.valorPorCategoria || []).map((c: any, idx: number) => {
                              const porcentaje = reporteData.valorTotalInventario > 0 
                                ? (c.valorTotal / reporteData.valorTotalInventario * 100) 
                                : 0;
                              return (
                                <tr key={idx}>
                                  <Td>{c.categoria || 'Sin categoría'}</Td>
                                  <Td>{formatCurrency(c.valorTotal)}</Td>
                                  <Td>
                                    <span style={{ 
                                      padding: '0.25rem 0.5rem', 
                                      background: '#3b82f620', 
                                      color: '#2563eb',
                                      borderRadius: '0.25rem',
                                      fontWeight: 600
                                    }}>
                                      {porcentaje.toFixed(1)}%
                                    </span>
                                  </Td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </TableContainer>
                    </Section>

                    {(reporteData.productosEnAlerta || []).length > 0 && (
                      <Section>
                        <SectionTitle>⚠️ Productos en Alerta (Stock Bajo)</SectionTitle>
                        <TableContainer>
                          <Table>
                            <thead>
                              <tr>
                                <Th>Producto</Th>
                                <Th>Stock Actual</Th>
                                <Th>Stock Mínimo</Th>
                                <Th>Diferencia</Th>
                              </tr>
                            </thead>
                            <tbody>
                              {(reporteData.productosEnAlerta || []).map((p: any, idx: number) => (
                                <tr key={idx}>
                                  <Td style={{ fontWeight: 500 }}>{p.nombreProducto || 'Sin nombre'}</Td>
                                  <Td style={{ 
                                    color: p.stockActual === 0 ? '#DC2626' : '#F59E0B', 
                                    fontWeight: 600 
                                  }}>
                                    {p.stockActual || 0}
                                  </Td>
                                  <Td>{p.stockMinimo || 0}</Td>
                                  <Td style={{ 
                                    color: '#DC2626',
                                    fontWeight: 600
                                  }}>
                                    {(p.stockMinimo || 0) - (p.stockActual || 0)}
                                  </Td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </TableContainer>
                      </Section>
                    )}
                  </>
                )}

                {activeTab === 'stock' && (
                  <>
                    <Section>
                      <SectionTitle>📦 Stock por Almacén</SectionTitle>
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Almacén</Th>
                              <Th>Cantidad Total</Th>
                              <Th>Valor Total</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {(reporteData.stockPorAlmacen || []).map((a: any, idx: number) => (
                              <tr key={idx}>
                                <Td style={{ fontWeight: 500 }}>{a.almacen || 'Sin nombre'}</Td>
                                <Td>{a._sum?.cantidad || 0}</Td>
                                <Td>{formatCurrency(a._sum?.valor)}</Td>
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
                      <SectionTitle>🔄 Productos con Mayor Rotación</SectionTitle>
                      <TableContainer>
                        <Table>
                          <thead>
                            <tr>
                              <Th>#</Th>
                              <Th>Producto</Th>
                              <Th>Cantidad de Movimientos</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {(reporteData.productosMasRotacion || []).map((p: any, idx: number) => (
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
                                <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{p.nombreProducto || 'Sin nombre'}</Td>
                                <Td>{p.cantidadMovimientos || 0}</Td>
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

export default ReporteInventario;