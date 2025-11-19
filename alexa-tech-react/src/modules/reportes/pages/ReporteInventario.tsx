import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';

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

const StockBadge = styled.span<{ stock: number; stockMinimo: number }>`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => {
    if (props.stock <= 0) return '#EF444420';
    if (props.stock <= props.stockMinimo) return '#F59E0B20';
    return '#10B98120';
  }};
  color: ${props => {
    if (props.stock <= 0) return '#DC2626';
    if (props.stock <= props.stockMinimo) return '#D97706';
    return '#059669';
  }};
`;

interface ProductoInventario {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  precioCompra: number;
  precioVenta: number;
  valorInventario: number;
  ubicacion: string;
  ultimoMovimiento: string;
  proveedor: string;
}

const ReporteInventario: React.FC = () => {
  const [categoria, setCategoria] = useState('');
  const [producto, setProducto] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [stockCritico, setStockCritico] = useState(false);
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - esto será reemplazado con datos reales del backend
  const mockProductos: ProductoInventario[] = [
    {
      id: '1',
      codigo: 'PROD001',
      nombre: 'Laptop HP Pavilion',
      categoria: 'Electrónica',
      unidad: 'UNIDAD',
      stockActual: 15,
      stockMinimo: 5,
      stockMaximo: 50,
      precioCompra: 800,
      precioVenta: 1200,
      valorInventario: 12000,
      ubicacion: 'A1-P1',
      ultimoMovimiento: '2024-01-15',
      proveedor: 'Tecnología S.A.C.'
    },
    {
      id: '2',
      codigo: 'PROD002',
      nombre: 'Mouse Inalámbrico Logitech',
      categoria: 'Accesorios',
      unidad: 'UNIDAD',
      stockActual: 3,
      stockMinimo: 10,
      stockMaximo: 100,
      precioCompra: 25,
      precioVenta: 45,
      valorInventario: 135,
      ubicacion: 'A2-P3',
      ultimoMovimiento: '2024-01-14',
      proveedor: 'Accesorios XYZ'
    },
    {
      id: '3',
      codigo: 'PROD003',
      nombre: 'Teclado Mecánico RGB',
      categoria: 'Accesorios',
      unidad: 'UNIDAD',
      stockActual: 25,
      stockMinimo: 10,
      stockMaximo: 80,
      precioCompra: 60,
      precioVenta: 95,
      valorInventario: 2375,
      ubicacion: 'A2-P4',
      ultimoMovimiento: '2024-01-16',
      proveedor: 'Accesorios XYZ'
    },
    {
      id: '4',
      codigo: 'PROD004',
      nombre: 'Monitor LG 24"',
      categoria: 'Electrónica',
      unidad: 'UNIDAD',
      stockActual: 0,
      stockMinimo: 5,
      stockMaximo: 30,
      precioCompra: 150,
      precioVenta: 220,
      valorInventario: 0,
      ubicacion: 'A1-P2',
      ultimoMovimiento: '2024-01-10',
      proveedor: 'Tecnología S.A.C.'
    }
  ];

  useEffect(() => {
    // Cargar datos iniciales
    setProductos(mockProductos);
  }, []);

  const handleBuscar = () => {
    setLoading(true);
    // Filtrar productos según criterios
    let filteredProductos = mockProductos;

    if (stockCritico) {
      filteredProductos = filteredProductos.filter(p => p.stockActual <= p.stockMinimo);
    }
    if (categoria) {
      filteredProductos = filteredProductos.filter(p => p.categoria === categoria);
    }
    if (producto) {
      filteredProductos = filteredProductos.filter(p => 
        p.nombre.toLowerCase().includes(producto.toLowerCase()) ||
        p.codigo.toLowerCase().includes(producto.toLowerCase())
      );
    }
    if (ubicacion) {
      filteredProductos = filteredProductos.filter(p => p.ubicacion.toLowerCase().includes(ubicacion.toLowerCase()));
    }
    if (proveedor) {
      filteredProductos = filteredProductos.filter(p => p.proveedor.toLowerCase().includes(proveedor.toLowerCase()));
    }

    setTimeout(() => {
      setProductos(filteredProductos);
      setLoading(false);
    }, 1000);
  };

  const handleExportar = () => {
    // Exportar a Excel o PDF
    const csvContent = [
      ['Código', 'Producto', 'Categoría', 'Unidad', 'Stock Actual', 'Stock Mínimo', 'Stock Máximo', 'Precio Compra', 'Precio Venta', 'Valor Inventario', 'Ubicación', 'Último Movimiento', 'Proveedor'],
      ...productos.map(p => [
        p.codigo,
        p.nombre,
        p.categoria,
        p.unidad,
        p.stockActual,
        p.stockMinimo,
        p.stockMaximo,
        p.precioCompra.toFixed(2),
        p.precioVenta.toFixed(2),
        p.valorInventario.toFixed(2),
        p.ubicacion,
        p.ultimoMovimiento,
        p.proveedor
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_inventario_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calcularResumen = () => {
    const totalProductos = productos.length;
    const valorTotalInventario = productos.reduce((sum, p) => sum + p.valorInventario, 0);
    const productosStockCritico = productos.filter(p => p.stockActual <= p.stockMinimo).length;
    const productosSinStock = productos.filter(p => p.stockActual === 0).length;

    return {
      totalProductos,
      valorTotalInventario,
      productosStockCritico,
      productosSinStock
    };
  };

  const resumen = calcularResumen();

  return (
    <Layout title="Reportes: Inventario / Almacén">
      <Container>
        <Header>
          <ExportButton onClick={handleExportar}>
            Exportar Reporte
          </ExportButton>
        </Header>

      <FiltersContainer>
        <FiltersGrid>
          <FormGroup>
            <Label>Categoría</Label>
            <Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Software">Software</option>
              <option value="Materiales">Materiales</option>
              <option value="Equipos">Equipos</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Producto o Código</Label>
            <Input
              type="text"
              placeholder="Buscar por nombre o código"
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Ubicación</Label>
            <Input
              type="text"
              placeholder="Buscar por ubicación"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
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
            <Label>
              <input
                type="checkbox"
                checked={stockCritico}
                onChange={(e) => setStockCritico(e.target.checked)}
              />
              Solo stock crítico
            </Label>
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
          <CardTitle>Total Productos</CardTitle>
          <CardValue>{resumen.totalProductos}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Valor Total Inventario</CardTitle>
          <CardValue>S/ {resumen.valorTotalInventario.toFixed(2)}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Productos Stock Crítico</CardTitle>
          <CardValue>{resumen.productosStockCritico}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardTitle>Productos Sin Stock</CardTitle>
          <CardValue>{resumen.productosSinStock}</CardValue>
        </SummaryCard>
      </SummaryCards>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <TableHeader>Código</TableHeader>
              <TableHeader>Producto</TableHeader>
              <TableHeader>Categoría</TableHeader>
              <TableHeader>Unidad</TableHeader>
              <TableHeader>Stock</TableHeader>
              <TableHeader>Stock Mín</TableHeader>
              <TableHeader>Stock Máx</TableHeader>
              <TableHeader>Precio Compra</TableHeader>
              <TableHeader>Precio Venta</TableHeader>
              <TableHeader>Valor Inventario</TableHeader>
              <TableHeader>Ubicación</TableHeader>
              <TableHeader>Último Movimiento</TableHeader>
              <TableHeader>Proveedor</TableHeader>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <TableCell>{producto.codigo}</TableCell>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>{producto.categoria}</TableCell>
                <TableCell>{producto.unidad}</TableCell>
                <TableCell>
                  <StockBadge stock={producto.stockActual} stockMinimo={producto.stockMinimo}>
                    {producto.stockActual}
                  </StockBadge>
                </TableCell>
                <TableCell>{producto.stockMinimo}</TableCell>
                <TableCell>{producto.stockMaximo}</TableCell>
                <TableCell>S/ {producto.precioCompra.toFixed(2)}</TableCell>
                <TableCell>S/ {producto.precioVenta.toFixed(2)}</TableCell>
                <TableCell>S/ {producto.valorInventario.toFixed(2)}</TableCell>
                <TableCell>{producto.ubicacion}</TableCell>
                <TableCell>{formatDMY(producto.ultimoMovimiento)}</TableCell>
                <TableCell>{producto.proveedor}</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      </Container>
    </Layout>
  );
};

export default ReporteInventario;