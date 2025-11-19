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
    // Exportar a Excel o PDF
    const csvContent = [
      ['Fecha', 'Hora', 'Tipo', 'Concepto', 'Monto', 'Saldo', 'Usuario', 'Comprobante', 'Método Pago', 'Observaciones'],
      ...movimientos.map(m => [
        m.fecha,
        m.hora,
        m.tipo,
        m.concepto,
        m.monto.toFixed(2),
        m.saldo.toFixed(2),
        m.usuario,
        m.comprobante || '',
        m.metodoPago,
        m.observaciones || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_caja_${fechaInicio}_${fechaFin}.csv`;
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

        <SummaryCards>
          <SummaryCard>
            <CardTitle>Total Ingresos</CardTitle>
            <CardValue>S/ {resumen.totalIngresos.toFixed(2)}</CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Total Egresos</CardTitle>
            <CardValue>S/ {resumen.totalEgresos.toFixed(2)}</CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Saldo Final</CardTitle>
            <CardValue>S/ {resumen.saldoFinal.toFixed(2)}</CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Total Movimientos</CardTitle>
            <CardValue>{resumen.totalMovimientos}</CardValue>
          </SummaryCard>
        </SummaryCards>

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
                  <TableCell style={{ color: movimiento.monto >= 0 ? '#059669' : '#DC2626' }}>
                    S/ {movimiento.monto.toFixed(2)}
                  </TableCell>
                  <TableCell>S/ {movimiento.saldo.toFixed(2)}</TableCell>
                  <TableCell>{movimiento.usuario}</TableCell>
                  <TableCell>{movimiento.comprobante || '-'}</TableCell>
                  <TableCell>{movimiento.metodoPago}</TableCell>
                  <TableCell>{movimiento.observaciones || '-'}</TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </Container>
    </Layout>
  );
};

export default ReporteCaja;