import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useSales } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';
import { useClients } from '../../clients/context/ClientContext';
import { ModalNotaCredito } from '../components/ModalNotaCredito';


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
  white-space: nowrap;
  
  ${props => {
    const status = props.status.toLowerCase();
    switch (status) {
      case 'pendiente':
        return `
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffc107;
        `;
      case 'completada':
        return `
          background: #d4edda;
          color: #155724;
          border: 1px solid #28a745;
        `;
      case 'cancelada':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #dc3545;
        `;
      default:
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
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

const VoucherBadge = styled.span<{ type: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    switch (props.type.toLowerCase()) {
      case 'factura':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'boleta':
        return `
          background: #cfe2ff;
          color: #084298;
        `;
      case 'notaventa':
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

const ActionButton = styled.button<{ $variant?: 'view' | 'pdf' | 'download' | 'complete' | 'cancel' }>`
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  &:last-child {
    margin-right: 0;
  }

  ${props => {
    switch (props.$variant) {
      case 'view':
        return `
          background: #3498db;
          color: white;
          &:hover {
            background: #2980b9;
            transform: translateY(-1px);
          }
        `;
      case 'pdf':
        return `
          background: #e74c3c;
          color: white;
          &:hover {
            background: #c0392b;
            transform: translateY(-1px);
          }
        `;
      case 'download':
        return `
          background: #27ae60;
          color: white;
          &:hover {
            background: #229954;
            transform: translateY(-1px);
          }
        `;
      case 'complete':
        return `
          background: #f39c12;
          color: white;
          &:hover {
            background: #e67e22;
            transform: translateY(-1px);
          }
        `;
      case 'cancel':
        return `
          background: #95a5a6;
          color: white;
          &:hover {
            background: #7f8c8d;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: #95a5a6;
          color: white;
          &:hover {
            background: #7f8c8d;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e1e8ed;
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
    color: #2c3e50;
  }
`;

const ListaVentas: React.FC = () => {
  const navigate = useNavigate();
  const { sales, cancelSale, confirmPayment, loadSales, createCreditNote, previewInvoice } = useSales();
  const { clients, loadClients } = useClients();
  const { addNotification } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [voucherFilter, setVoucherFilter] = useState(''); // Nuevo: filtro por tipo comprobante
  const [clientFilter, setClientFilter] = useState(''); // Nuevo: filtro por cliente
  const [dateFilter, setDateFilter] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal Nota de Crédito
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Modal Confirmar Pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<any>(null);
  const [montoRecibido, setMontoRecibido] = useState('');
  const [referenciaPago, setReferenciaPago] = useState('');

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const client = sale.cliente;
      const clientName = client 
        ? (client.tipoDocumento === 'RUC' 
            ? client.razonSocial || ''
            : `${client.nombres || ''} ${client.apellidos || ''}`.trim())
        : 'Cliente General';
      
      const saleCode = sale.codigoVenta || '';
      
      const matchesSearch = 
        saleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || sale.estado === statusFilter;
      const matchesPayment = !paymentFilter || sale.formaPago === paymentFilter;
      const matchesVoucher = !voucherFilter || sale.tipoComprobante === voucherFilter; // Nuevo
      const matchesClient = !clientFilter || sale.clienteId === clientFilter; // Nuevo
      
      const matchesDate = !dateFilter || 
        new Date(sale.fechaEmision).toISOString().split('T')[0] === dateFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesVoucher && matchesClient && matchesDate;
    });
  }, [sales, searchTerm, statusFilter, paymentFilter, voucherFilter, clientFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const completedSales = filteredSales.filter(sale => sale.estado === 'Completada').length;
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

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getPaymentText = (method: string) => {
    switch (method.toLowerCase()) {
      case 'efectivo': return 'Efectivo';
      case 'tarjeta': return 'Tarjeta';
      case 'transferencia': return 'Transferencia';
      case 'yape': return 'Yape';
      case 'plin': return 'Plin';
      default: return method;
    }
  };

  const handleViewSale = (saleId: string) => {
    navigate(`/ventas/detalle/${saleId}`);
  };

  const handlePreviewPDF = async (saleId: string) => {
    try {
      setIsProcessing(true);
      await previewInvoice(saleId);
      addNotification('success', 'Imprimiendo', 'Ventana de impresión abierta');
    } catch (error: any) {
      addNotification('error', 'Error al Imprimir', error.message || 'No se pudo imprimir el comprobante');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSale = async (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const motivo = window.prompt(
      `¿Cancelar la venta ${sale.codigoVenta}?\n\nIngresa el motivo de la cancelación:`,
      'Cancelación solicitada por el cliente'
    );

    if (!motivo) return;

    try {
      setIsProcessing(true);
      await cancelSale(saleId, motivo);
      addNotification('success', 'Venta Cancelada', `Venta ${sale.codigoVenta} cancelada`);
    } catch (error: any) {
      addNotification('error', 'Error al Cancelar', error.message || 'No se pudo cancelar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==================== NOTA DE CRÉDITO ====================
  const handleOpenCreditNoteModal = (sale: any) => {
    setSelectedSale(sale);
    setShowCreditNoteModal(true);
  };

  const handleCloseCreditNoteModal = () => {
    setShowCreditNoteModal(false);
    setSelectedSale(null);
  };

  const handleSubmitCreditNote = async (data: any) => {
    try {
      await createCreditNote(data);
      addNotification('success', 'Nota de Crédito Emitida', `Nota de crédito creada exitosamente`);
      handleCloseCreditNoteModal();
      loadSales(); // Recargar ventas
    } catch (error: any) {
      addNotification('error', 'Error al Emitir', error.message || 'No se pudo emitir la nota de crédito');
      throw error;
    }
  };

  // ==================== CONFIRMAR PAGO ====================
  const handleOpenPaymentModal = (sale: any) => {
    setSelectedSaleForPayment(sale);
    setMontoRecibido(sale.total.toString());
    setReferenciaPago('');
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedSaleForPayment(null);
    setMontoRecibido('');
    setReferenciaPago('');
  };

  const redondearAlDecimo = (monto: number): number => {
    return Math.round(monto * 10) / 10;
  };

  const handleConfirmPayment = async () => {
    if (!selectedSaleForPayment) return;

    const montoRecibidoNum = parseFloat(montoRecibido);
    
    if (isNaN(montoRecibidoNum) || montoRecibidoNum <= 0) {
      addNotification('warning', 'Monto Inválido', 'Ingresa un monto válido');
      return;
    }

    const totalVenta = Number(selectedSaleForPayment.total);

    if (montoRecibidoNum < totalVenta) {
      addNotification('error', 'Monto Insuficiente', 
        `El monto recibido (S/ ${montoRecibidoNum.toFixed(2)}) es menor al total (S/ ${totalVenta.toFixed(2)})`
      );
      return;
    }

    // Calcular cambio con redondeo al décimo (monedas de S/0.10)
    const cambioExacto = montoRecibidoNum - totalVenta;
    const cambioRedondeado = redondearAlDecimo(cambioExacto);
    const diferencia = cambioRedondeado - cambioExacto;

    const confirmed = window.confirm(
      `Confirmar Pago de Venta ${selectedSaleForPayment.codigoVenta}\n\n` +
      `Total: S/ ${totalVenta.toFixed(2)}\n` +
      `Recibido: S/ ${montoRecibidoNum.toFixed(2)}\n` +
      `Cambio exacto: S/ ${cambioExacto.toFixed(2)}\n` +
      `Cambio redondeado: S/ ${cambioRedondeado.toFixed(2)}\n` +
      (diferencia !== 0 ? `Diferencia por redondeo: S/ ${Math.abs(diferencia).toFixed(2)}\n\n` : '\n') +
      `¿Confirmar el pago?`
    );

    if (!confirmed) return;

    try {
      setIsProcessing(true);
      await confirmPayment(selectedSaleForPayment.id, {
        montoRecibido: montoRecibidoNum,
        montoCambio: cambioRedondeado,
        referenciaPago: referenciaPago || undefined,
      });
      
      addNotification('success', 'Pago Confirmado', 
        `Pago de ${selectedSaleForPayment.codigoVenta} confirmado exitosamente`
      );
      handleClosePaymentModal();
      await loadSales(); // Recargar lista
    } catch (error: any) {
      addNotification('error', 'Error al Confirmar Pago', error.message || 'No se pudo confirmar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPaymentFilter('');
    setVoucherFilter('');
    setClientFilter('');
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
              placeholder="Buscar por número de venta o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </FilterSelect>
            <FilterSelect
              value={voucherFilter}
              onChange={(e) => setVoucherFilter(e.target.value)}
            >
              <option value="">Todos los comprobantes</option>
              <option value="Boleta">Boleta</option>
              <option value="Factura">Factura</option>
              <option value="NotaVenta">Nota de Venta</option>
            </FilterSelect>
            <FilterSelect
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="">Todas las formas de pago</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Yape">Yape</option>
              <option value="Plin">Plin</option>
            </FilterSelect>
            <FilterSelect
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.tipoDocumento === 'RUC' 
                    ? client.razonSocial 
                    : `${client.nombres} ${client.apellidos}`
                  }
                </option>
              ))}
            </FilterSelect>
            <DateInput
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {(searchTerm || statusFilter || paymentFilter || voucherFilter || clientFilter || dateFilter) && (
              <Button onClick={clearFilters}>
                🗑️ Limpiar Filtros
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
                  <TableHeaderCell>Código</TableHeaderCell>
                  <TableHeaderCell>Cliente</TableHeaderCell>
                  <TableHeaderCell>Comprobante</TableHeaderCell>
                  <TableHeaderCell>Fecha/Hora</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell>NC</TableHeaderCell>
                  <TableHeaderCell>Pago</TableHeaderCell>
                  <TableHeaderCell>Estado</TableHeaderCell>
                  <TableHeaderCell>Acciones</TableHeaderCell>
                </tr>
              </TableHeader>
              <tbody>
                {filteredSales.map((sale) => {
                  const client = sale.cliente;
                  const clientName = client 
                    ? (client.tipoDocumento === 'RUC' 
                        ? client.razonSocial || ''
                        : `${client.nombres || ''} ${client.apellidos || ''}`.trim())
                    : 'Cliente General';
                  
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <strong>{sale.codigoVenta}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                          {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <strong>{clientName}</strong>
                        {client && (
                          <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                            {client.numeroDocumento}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <VoucherBadge type={sale.tipoComprobante || 'NotaVenta'}>
                          {sale.tipoComprobante === 'NotaVenta' ? 'Nota de Venta' : sale.tipoComprobante}
                        </VoucherBadge>
                      </TableCell>
                      <TableCell>
                        <div>{formatDate(sale.fechaEmision)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                          {formatTime(sale.fechaEmision)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <strong style={{ fontSize: '1.05rem', color: '#27ae60' }}>
                          {formatCurrency(sale.total)}
                        </strong>
                      </TableCell>
                      <TableCell>
                        {sale.tieneNotaCredito ? (
                          <div style={{ fontSize: '0.9rem', color: '#e74c3c', fontWeight: '600' }}>
                            -{formatCurrency(sale.montoNotaCredito || 0)}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.9rem', color: '#95a5a6' }}>-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <PaymentBadge method={sale.formaPago}>
                          {getPaymentText(sale.formaPago)}
                        </PaymentBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={sale.estado}>
                          {getStatusText(sale.estado)}
                        </StatusBadge>
                        {sale.tieneNotaCredito && (
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>⚠️</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ActionsContainer>
                          {sale.estado === 'Completada' ? (
                            <>
                              <ActionButton 
                                $variant="view"
                                onClick={() => handleViewSale(sale.id)}
                                disabled={isProcessing}
                                style={{ background: '#3498db' }}
                              >
                                � Ver Detalles
                              </ActionButton>
                              <ActionButton 
                                $variant="pdf"
                                onClick={() => handlePreviewPDF(sale.id)}
                                disabled={isProcessing}
                                style={{ background: '#9b59b6' }}
                              >
                                �️ Imprimir
                              </ActionButton>
                              <ActionButton 
                                $variant="cancel"
                                onClick={() => handleOpenCreditNoteModal(sale)}
                                disabled={isProcessing}
                                style={{ background: '#e74c3c' }}
                              >
                                📝 Nota Crédito
                              </ActionButton>
                            </>
                          ) : sale.estado === 'Pendiente' ? (
                            <>
                              <ActionButton 
                                $variant="view"
                                onClick={() => handleViewSale(sale.id)}
                                disabled={isProcessing}
                                style={{ background: '#3498db' }}
                              >
                                📋 Ver Detalles
                              </ActionButton>
                              <ActionButton 
                                $variant="complete"
                                onClick={() => handleOpenPaymentModal(sale)}
                                disabled={isProcessing}
                                style={{ background: '#27ae60' }}
                              >
                                💰 Confirmar Pago
                              </ActionButton>
                              <ActionButton 
                                $variant="cancel"
                                onClick={() => handleCancelSale(sale.id)}
                                disabled={isProcessing}
                              >
                                ❌ Cancelar
                              </ActionButton>
                            </>
                          ) : sale.estado === 'Cancelada' ? (
                            <ActionButton 
                              $variant="view"
                              onClick={() => handleViewSale(sale.id)}
                              disabled={isProcessing}
                              style={{ background: '#3498db' }}
                            >
                              📋 Ver Detalles
                            </ActionButton>
                          ) : null}
                        </ActionsContainer>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          )}
        </TableContainer>

        {/* Modal: Confirmar Pago */}
        {showPaymentModal && selectedSaleForPayment && (
          <ModalOverlay onClick={handleClosePaymentModal}>
            <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <ModalHeader>
                <ModalTitle>💰 Confirmar Pago de Venta</ModalTitle>
                <CloseButton onClick={handleClosePaymentModal}>×</CloseButton>
              </ModalHeader>
              
              <div style={{ padding: '1.5rem' }}>
                {/* Información de la venta */}
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1.5rem' 
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Venta:</strong> {selectedSaleForPayment.codigoVenta}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Cliente:</strong> {
                      selectedSaleForPayment.cliente
                        ? (selectedSaleForPayment.cliente.tipoDocumento === 'RUC'
                            ? selectedSaleForPayment.cliente.razonSocial
                            : `${selectedSaleForPayment.cliente.nombres} ${selectedSaleForPayment.cliente.apellidos}`)
                        : 'Cliente General'
                    }
                  </div>
                  <div style={{ fontSize: '1.2rem', color: '#27ae60', fontWeight: 'bold' }}>
                    <strong>Total a Pagar:</strong> S/ {Number(selectedSaleForPayment.total).toFixed(2)}
                  </div>
                </div>

                {/* Campo: Monto Recibido */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    Monto Recibido (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    placeholder="Ingresa el monto recibido"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {/* Mostrar cambio */}
                {montoRecibido && !isNaN(parseFloat(montoRecibido)) && (
                  <div style={{ 
                    background: '#e3f2fd', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginBottom: '1rem' 
                  }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Cambio Exacto:</strong> S/ {
                        (parseFloat(montoRecibido) - Number(selectedSaleForPayment.total)).toFixed(2)
                      }
                    </div>
                    <div style={{ color: '#1976d2', fontWeight: 'bold' }}>
                      <strong>Cambio Redondeado (S/0.10):</strong> S/ {
                        redondearAlDecimo(parseFloat(montoRecibido) - Number(selectedSaleForPayment.total)).toFixed(2)
                      }
                    </div>
                  </div>
                )}

                {/* Campo: Referencia de Pago (opcional) */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    Referencia de Pago (Opcional)
                  </label>
                  <input
                    type="text"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    placeholder="Nro. Operación, Voucher, etc."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleClosePaymentModal}
                    disabled={isProcessing}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#7f8c8d',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing || !montoRecibido}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: isProcessing || !montoRecibido ? '#95a5a6' : '#27ae60',
                      color: 'white',
                      cursor: isProcessing || !montoRecibido ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    {isProcessing ? 'Procesando...' : '✓ Confirmar Pago'}
                  </button>
                </div>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Modal: Emitir Nota de Crédito */}
        {showCreditNoteModal && selectedSale && (
          <ModalNotaCredito
            sale={selectedSale}
            onClose={handleCloseCreditNoteModal}
            onSubmit={handleSubmitCreditNote}
          />
        )}
      </Container>
    </Layout>
  );
};

export default ListaVentas;