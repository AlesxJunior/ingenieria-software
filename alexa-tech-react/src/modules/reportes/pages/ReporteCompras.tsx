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

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'Recibida': return '#10B98120';
      case 'Pendiente': return '#F59E0B20';
      case 'Cancelada': return '#EF444420';
      default: return '#6B728020';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'Recibida': return '#059669';
      case 'Pendiente': return '#D97706';
      case 'Cancelada': return '#DC2626';
      default: return '#374151';
    }
  }};
`;

interface CompraUI {
  id: string;
  fecha: string;
  proveedor: string;
  comprobante: string;
  numero: string;
  subtotal: number;
  igv?: number;
  total: number;
  estado: 'Pendiente' | 'Recibida' | 'Cancelada';
  metodoPago?: string;
  vencimiento?: string;
  categoria?: string;
}

const ReporteCompras: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [fechaFin, setFechaFin] = useState(formatDateInput(new Date()));
  const [proveedor, setProveedor] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [compras, setCompras] = useState<CompraUI[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - esto será reemplazado con datos reales del backend
  const mockCompras: Compra[] = [
    {
      id: '1',
      fecha: '2024-01-15',
      proveedor: 'Distribuidora XYZ S.A.C.',
      ruc: '20123456789',
      comprobante: 'FACTURA',
      numero: 'F001-0001',
      subtotal: 1000,
      igv: 180,
      total: 1180,
      estado: 'paid',
      metodoPago: 'TRANSFERENCIA',
      vencimiento: '2024-02-15',
      categoria: 'Productos'
    },
    {
      id: '2',
      fecha: '2024-01-16',
      proveedor: 'Servicios ABC S.A.C.',
      ruc: '20987654321',
      comprobante: 'FACTURA',
      numero: 'F002-0002',
      subtotal: 500,
      igv: 90,
      total: 590,
      estado: 'pending',
      metodoPago: 'CHEQUE',
      vencimiento: '2024-02-16',
      categoria: 'Servicios'
    },
    {
      id: '3',
      fecha: '2024-01-17',
      proveedor: 'Proveedores ZYX S.R.L.',
      ruc: '20555666777',
      comprobante: 'BOLETA',
      numero: 'B001-0003',
      subtotal: 300,
      igv: 54,
      total: 354,
      estado: 'paid',
      metodoPago: 'EFECTIVO',
      vencimiento: '2024-01-17',
      categoria: 'Materiales'
    }
  ];

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleBuscar = () => {
    setLoading(true);
    const run = async () => {
      try {
        const res = await apiService.getPurchases({
          estado: estado as any || undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
          q: proveedor || undefined,
        });
        const rows = Array.isArray((res as any).data?.purchases) ? (res as any).data.purchases : (res as any).purchases || [];
        const mapped: CompraUI[] = rows.map((p: any) => ({
          id: p.id,
          fecha: p.fechaEmision,
          proveedor: p.proveedorId || '—',
          comprobante: p.tipoComprobante || '—',
          numero: p.codigoOrden,
          subtotal: Number(p.subtotal) || 0,
          igv: undefined,
          total: Number(p.total) || 0,
          estado: p.estado,
          metodoPago: p.formaPago || undefined,
          vencimiento: p.fechaEntregaEstimada || undefined,
          categoria: undefined,
        }));
        setCompras(mapped);
      } catch (e) {
        console.error('Error cargando compras', e);
        setCompras([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  };

  const handleExportar = () => {
    // Exportar a Excel o PDF
    const csvContent = [
      ['Fecha', 'Proveedor', 'RUC', 'Comprobante', 'Número', 'Categoría', 'Subtotal', 'IGV', 'Total', 'Estado', 'Método Pago', 'Vencimiento'],
      ...compras.map(c => [
        c.fecha,
        c.proveedor,
        c.ruc,
        c.comprobante,
        c.numero,
        c.categoria,
        c.subtotal.toFixed(2),
        c.igv.toFixed(2),
        c.total.toFixed(2),
        c.estado,
        c.metodoPago,
        c.vencimiento
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_compras_${fechaInicio}_${fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calcularResumen = () => {
    const totalCompras = compras.length;
    const totalMonto = compras.reduce((sum, c) => sum + c.total, 0);
    const comprasPagadas = compras.filter(c => c.estado === 'paid').length;
    const comprasPendientes = compras.filter(c => c.estado === 'pending').length;
    const totalIGV = compras.reduce((sum, c) => sum + c.igv, 0);

    return {
      totalCompras,
      totalMonto,
      comprasPagadas,
      comprasPendientes,
      totalIGV
    };
  };

  const resumen = calcularResumen();

  return (
    <Layout title="Reportes: Compras">
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
            <Label>Proveedor</Label>
            <Input
              type="text"
              placeholder="Buscar por proveedor"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Tipo Comprobante</Label>
            <Select
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Factura">Factura</option>
              <option value="Boleta">Boleta</option>
              <option value="NotaCompra">Nota de compra</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Estado</Label>
            <Select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Recibida">Recibida</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cancelada">Cancelada</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Categoría</Label>
            <Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Productos">Productos</option>
              <option value="Servicios">Servicios</option>
              <option value="Materiales">Materiales</option>
              <option value="Equipos">Equipos</option>
              <option value="Otros">Otros</option>
            </Select>
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
          <CardTitle>Total de Compras</CardTitle>
          <CardValue>{resumen.totalCompras}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Monto Total</CardTitle>
          <CardValue>S/ {resumen.totalMonto.toFixed(2)}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Total IGV</CardTitle>
          <CardValue>S/ {resumen.totalIGV.toFixed(2)}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Compras Pagadas</CardTitle>
          <CardValue>{resumen.comprasPagadas}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Compras Pendientes</CardTitle>
          <CardValue>{resumen.comprasPendientes}</CardValue>
        </SummaryCard>
      </SummaryCards>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <TableHeader>Fecha</TableHeader>
              <TableHeader>Proveedor</TableHeader>
              <TableHeader>Comprobante</TableHeader>
              <TableHeader>Número</TableHeader>
              <TableHeader>Subtotal</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Método Pago</TableHeader>
              <TableHeader>Vencimiento</TableHeader>
            </tr>
          </thead>
          <tbody>
            {compras.map((compra) => (
              <tr key={compra.id}>
                <TableCell>{formatDMY(compra.fecha)}</TableCell>
                <TableCell>{compra.proveedor}</TableCell>
                <TableCell>{compra.comprobante}</TableCell>
                <TableCell>{compra.numero}</TableCell>
                <TableCell>S/ {compra.subtotal.toFixed(2)}</TableCell>
                <TableCell>S/ {compra.total.toFixed(2)}</TableCell>
                <TableCell>
                  <StatusBadge status={compra.estado}>{compra.estado}</StatusBadge>
                </TableCell>
                <TableCell>{compra.metodoPago || '—'}</TableCell>
                <TableCell>{compra.vencimiento ? formatDMY(compra.vencimiento) : '—'}</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      </Container>
    </Layout>
  );
};

export default ReporteCompras;