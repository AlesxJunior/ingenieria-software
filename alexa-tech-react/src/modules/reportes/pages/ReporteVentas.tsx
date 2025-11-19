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
      case 'Completada': return '#10B98120';
      case 'Pendiente': return '#F59E0B20';
      case 'Cancelada': return '#EF444420';
      default: return '#6B728020';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'Completada': return '#059669';
      case 'Pendiente': return '#D97706';
      case 'Cancelada': return '#DC2626';
      default: return '#374151';
    }
  }};
`;

interface VentaUI {
  id: string;
  fecha: string;
  cliente: string;
  comprobante: string;
  numero: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: 'Pendiente' | 'Completada' | 'Cancelada';
  metodoPago: string;
  vendedor?: string;
}

const ReporteVentas: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [fechaFin, setFechaFin] = useState(formatDateInput(new Date()));
  const [cliente, setCliente] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [estado, setEstado] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [ventas, setVentas] = useState<VentaUI[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleBuscar = () => {
    setLoading(true);
    const run = async () => {
      try {
        const res = await apiService.getSales({
          estado: estado as any || undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
          q: cliente || undefined,
        });

        const rows = Array.isArray((res as any).data) ? (res as any).data : (res as any).sales || [];
        const mapped: VentaUI[] = rows.map((s: any) => ({
          id: s.id,
          fecha: s.fechaEmision,
          cliente: s.cliente?.razonSocial || `${s.cliente?.nombres || ''} ${s.cliente?.apellidos || ''}`.trim() || '—',
          comprobante: s.tipoComprobante,
          numero: s.codigoVenta,
          subtotal: Number(s.subtotal) || 0,
          igv: Number(s.igv) || 0,
          total: Number(s.total) || 0,
          estado: s.estado,
          metodoPago: s.formaPago || '—',
          vendedor: s.usuario?.nombre || undefined,
        }));
        setVentas(mapped);
      } catch (e) {
        console.error('Error cargando ventas', e);
        setVentas([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  };

  const handleExportar = () => {
    // Exportar a Excel o PDF
    const csvContent = [
      ['Fecha', 'Cliente', 'Comprobante', 'Número', 'Subtotal', 'IGV', 'Total', 'Estado', 'Método Pago', 'Vendedor'],
      ...ventas.map(v => [
        v.fecha,
        v.cliente,
        v.comprobante,
        v.numero,
        v.subtotal.toFixed(2),
        v.igv.toFixed(2),
        v.total.toFixed(2),
        v.estado,
        v.metodoPago,
        v.vendedor
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_ventas_${fechaInicio}_${fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calcularResumen = () => {
    const totalVentas = ventas.length;
    const totalMonto = ventas.reduce((sum, v) => sum + v.total, 0);
    const ventasPagadas = ventas.filter(v => v.estado === 'paid').length;
    const ventasPendientes = ventas.filter(v => v.estado === 'pending').length;

    return {
      totalVentas,
      totalMonto,
      ventasPagadas,
      ventasPendientes
    };
  };

  const resumen = calcularResumen();

  return (
    <Layout title="Reportes: Ventas">
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
            <Label>Cliente</Label>
            <Input
              type="text"
              placeholder="Buscar por cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Tipo Comprobante</Label>
            <Select
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Boleta">Boleta</option>
              <option value="Factura">Factura</option>
              <option value="NotaVenta">Nota de Venta</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Estado</Label>
            <Select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Completada">Completada</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cancelada">Cancelada</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Vendedor</Label>
            <Input
              type="text"
              placeholder="Buscar por vendedor"
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
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
          <CardTitle>Total de Ventas</CardTitle>
          <CardValue>{resumen.totalVentas}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Monto Total</CardTitle>
          <CardValue>S/ {resumen.totalMonto.toFixed(2)}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Ventas Pagadas</CardTitle>
          <CardValue>{resumen.ventasPagadas}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Ventas Pendientes</CardTitle>
          <CardValue>{resumen.ventasPendientes}</CardValue>
        </SummaryCard>
      </SummaryCards>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <TableHeader>Fecha</TableHeader>
              <TableHeader>Cliente</TableHeader>
              <TableHeader>Comprobante</TableHeader>
              <TableHeader>Número</TableHeader>
              <TableHeader>Subtotal</TableHeader>
              <TableHeader>IGV</TableHeader>
              <TableHeader>Total</TableHeader>
              <TableHeader>Estado</TableHeader>
              <TableHeader>Método Pago</TableHeader>
              <TableHeader>Vendedor</TableHeader>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id}>
                <TableCell>{formatDMY(venta.fecha)}</TableCell>
                <TableCell>{venta.cliente}</TableCell>
                <TableCell>{venta.comprobante}</TableCell>
                <TableCell>{venta.numero}</TableCell>
                <TableCell>S/ {venta.subtotal.toFixed(2)}</TableCell>
                <TableCell>S/ {venta.igv.toFixed(2)}</TableCell>
                <TableCell>S/ {venta.total.toFixed(2)}</TableCell>
                <TableCell>
                  <StatusBadge status={venta.estado}>
                    {venta.estado === 'Completada' ? 'Completada' : venta.estado === 'Pendiente' ? 'Pendiente' : 'Cancelada'}
                  </StatusBadge>
                </TableCell>
                <TableCell>{venta.metodoPago}</TableCell>
                <TableCell>{venta.vendedor}</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      </Container>
    </Layout>
  );
};

export default ReporteVentas;