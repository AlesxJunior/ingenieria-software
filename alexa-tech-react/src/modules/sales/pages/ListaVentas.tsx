import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useSales } from '../context/SalesContext';
import { useClients } from '../../clients/context/ClientContext';


const Container = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 250px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const DateInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }

  &:hover {
    background: #e3f2fd;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e1e8ed;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e1e8ed;
  color: #2c3e50;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'completada':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'pendiente':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'cancelada':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      default:
        return `
          background: #e2e3e5;
          color: #383d41;
        `;
    }
  }}
`;

const PaymentBadge = styled.span<{ method: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.method) {
      case 'efectivo':
        return `
          background: #d1ecf1;
          color: #0c5460;
        `;
      case 'tarjeta':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'transferencia':
        return `
          background: #e2e3e5;
          color: #383d41;
        `;
      default:
        return `
          background: #f8f9fa;
          color: #6c757d;
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2980b9;
    transform: translateY(-1px);
  }
`;

const ActionButton = styled.button<{ variant?: 'view' | 'print' }>`
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.3s ease;

  ${props => props.variant === 'view' ? `
    background: #3498db;
    color: white;
    &:hover {
      background: #2980b9;
    }
  ` : `
    background: #95a5a6;
    color: white;
    &:hover {
      background: #7f8c8d;
    }
  `}
`;

const ListaVentas: React.FC = () => {
  const { sales } = useSales();
  const { getClientById } = useClients();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const client = getClientById(sale.clientId);
      const clientName = client 
        ? (client.tipoDocumento === 'RUC' 
            ? client.razonSocial || ''
            : `${client.nombres || ''} ${client.apellidos || ''}`.trim())
        : 'Entidad Comercial General';
      
      const matchesSearch = 
        sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || sale.status === statusFilter;
      const matchesPayment = !paymentFilter || sale.paymentMethod === paymentFilter;
      
      const matchesDate = !dateFilter || 
        new Date(sale.createdAt).toISOString().split('T')[0] === dateFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [sales, searchTerm, statusFilter, paymentFilter, dateFilter, getClientById]);

  const stats = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const completedSales = filteredSales.filter(sale => sale.status === 'completada').length;
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue,
      completedSales,
      averageSale
    };
  }, [filteredSales]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completada': return 'Completada';
      case 'pendiente': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getPaymentText = (method: string) => {
    switch (method) {
      case 'efectivo': return 'Efectivo';
      case 'tarjeta': return 'Tarjeta';
      case 'transferencia': return 'Transferencia';
      default: return method;
    }
  };

  const handleViewSale = (saleId: string) => {
    // Aquí se podría implementar un modal o navegación a detalle de venta
    console.log('Ver venta:', saleId);
  };

  const handlePrintSale = (saleId: string) => {
    // Aquí se podría implementar la funcionalidad de impresión
    console.log('Imprimir venta:', saleId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPaymentFilter('');
    setDateFilter('');
  };

  return (
    <Layout title="Lista de Ventas">
      <Container>
        <Header>
          <Title>Lista de Ventas</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar por número de venta o entidad comercial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="completada">Completada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
            </FilterSelect>
            <FilterSelect
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </FilterSelect>
            <DateInput
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {(searchTerm || statusFilter || paymentFilter || dateFilter) && (
              <Button onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </SearchContainer>
        </Header>

        <StatsContainer>
          <StatCard>
            <StatValue>{stats.totalSales}</StatValue>
            <StatLabel>Total de Ventas</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
            <StatLabel>Ingresos Totales</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.completedSales}</StatValue>
            <StatLabel>Ventas Completadas</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formatCurrency(stats.averageSale)}</StatValue>
            <StatLabel>Venta Promedio</StatLabel>
          </StatCard>
        </StatsContainer>

        <TableContainer>
          {filteredSales.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📊</EmptyIcon>
              <h3>No se encontraron ventas</h3>
              <p>
                {sales.length === 0 
                  ? 'Aún no se han registrado ventas en el sistema.'
                  : 'No hay ventas que coincidan con los filtros aplicados.'
                }
              </p>
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Número de Venta</TableHeaderCell>
                  <TableHeaderCell>Entidad Comercial</TableHeaderCell>
                  <TableHeaderCell>Fecha</TableHeaderCell>
                  <TableHeaderCell>Hora</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell>Método de Pago</TableHeaderCell>
                  <TableHeaderCell>Estado</TableHeaderCell>
                  <TableHeaderCell>Acciones</TableHeaderCell>
                </tr>
              </TableHeader>
              <tbody>
                {filteredSales.map((sale) => {
                  const client = getClientById(sale.clientId);
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <strong>{sale.saleNumber}</strong>
                      </TableCell>
                      <TableCell>
                        {client 
                          ? (client.tipoDocumento === 'RUC' 
                              ? client.razonSocial || ''
                              : `${client.nombres || ''} ${client.apellidos || ''}`.trim())
                          : 'Entidad Comercial General'
                        }
                        {client && (
                          <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                            {client.numeroDocumento}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(sale.createdAt)}</TableCell>
                      <TableCell>{formatTime(sale.createdAt)}</TableCell>
                      <TableCell>
                        <strong>{formatCurrency(sale.total)}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                          {sale.items.length} producto{sale.items.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PaymentBadge method={sale.paymentMethod}>
                          {getPaymentText(sale.paymentMethod)}
                        </PaymentBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={sale.status}>
                          {getStatusText(sale.status)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <ActionButton 
                          variant="view"
                          onClick={() => handleViewSale(sale.id)}
                        >
                          Ver
                        </ActionButton>
                        <ActionButton 
                          variant="print"
                          onClick={() => handlePrintSale(sale.id)}
                        >
                          Imprimir
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          )}
        </TableContainer>
      </Container>
    </Layout>
  );
};

export default ListaVentas;