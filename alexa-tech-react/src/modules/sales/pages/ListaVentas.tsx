import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useSales } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';
import { useClients } from '../../clients/context/ClientContext';
import { ModalNotaCredito } from '../components/ModalNotaCredito';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button as SharedButton,
  Input as SharedInput,
  Select as SharedSelect,
  Label as SharedLabel,
  Table as SharedTable,
  Thead as SharedThead,
  Th as SharedTh,
  Tbody as SharedTbody,
  Tr as SharedTr,
  Td as SharedTd,
  PaginationContainer as SharedPaginationContainer,
  PaginationInfo as SharedPaginationInfo,
  PaginationButtons as SharedPaginationButtons,
  PageButton,
  StatCard,
  StatsGrid,
  StatValue,
  StatLabel
} from '../../../components/shared';


const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

const FiltersContainer = styled.div`
  background: ${COLORS.neutral.white};
  padding: ${SPACING.xl};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  margin-bottom: ${SPACING.xl};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: ${SPACING.lg};

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

const TableContainer = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  overflow: hidden;
`;

const PageSizeSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  background: ${COLORS.background};
  cursor: pointer;
  transition: ${TRANSITIONS.default};

  &:hover {
    border-color: ${COLOR_SCALES.primary[300]};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
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
  padding: ${SPACING['3xl']};
  color: ${COLORS.text.secondary};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${SPACING.lg};
  opacity: 0.5;
`;

const ActionButton = styled.button<{ $variant?: 'view' | 'pdf' | 'credit' }>`
  padding: ${SPACING.sm} ${SPACING.md};
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  cursor: pointer;
  transition: ${TRANSITIONS.default};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.xs};

  ${props => {
    switch (props.$variant) {
      case 'view':
        return `
          background: ${COLOR_SCALES.primary[500]};
          color: ${COLORS.neutral.white};
          &:hover {
            background: ${COLOR_SCALES.primary[600]};
          }
        `;
      case 'pdf':
        return `
          background: #9b59b6;
          color: ${COLORS.neutral.white};
          &:hover {
            background: #8e44ad;
          }
        `;
      case 'credit':
        return `
          background: ${COLOR_SCALES.danger[500]};
          color: ${COLORS.neutral.white};
          &:hover {
            background: ${COLOR_SCALES.danger[600]};
          }
        `;
      default:
        return `
          background: ${COLORS.neutral[300]};
          color: ${COLORS.text.primary};
          &:hover {
            background: ${COLORS.neutral[400]};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.xs};
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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
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

  // Paginación de resultados filtrados
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSales.slice(startIndex, startIndex + pageSize);
  }, [filteredSales, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredSales.length / pageSize);
  }, [filteredSales.length, pageSize]);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, voucherFilter, clientFilter, dateFilter]);

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

  // ✅ Función para renderizar método(s) de pago
  const renderPaymentMethods = (sale: Sale) => {
    if (sale.payments && sale.payments.length > 0) {
      // Tiene pagos múltiples
      if (sale.payments.length > 1) {
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {sale.payments.map((payment, index) => (
              <PaymentBadge key={payment.id || index} method={payment.metodoPago}>
                {getPaymentText(payment.metodoPago)}
              </PaymentBadge>
            ))}
          </div>
        );
      }
      // Un solo pago en el array
      return (
        <PaymentBadge method={sale.payments[0].metodoPago}>
          {getPaymentText(sale.payments[0].metodoPago)}
        </PaymentBadge>
      );
    }
    // Fallback a formaPago (legacy)
    return (
      <PaymentBadge method={sale.formaPago}>
        {getPaymentText(sale.formaPago)}
      </PaymentBadge>
    );
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
          <TitleSection>
            <Title>Lista de Ventas</Title>
            <PageSubtitle>Historial completo de transacciones, comprobantes y estados de pago</PageSubtitle>
          </TitleSection>
        </Header>

        {/* Stats Cards */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.totalSales}</StatValue>
            <StatLabel>Total de Ventas</StatLabel>
          </StatCard>
          <StatCard $color="#27ae60">
            <StatValue $color="#27ae60">{formatCurrency(stats.totalRevenue)}</StatValue>
            <StatLabel>Ingresos Totales</StatLabel>
          </StatCard>
          <StatCard $color="#9b59b6">
            <StatValue $color="#9b59b6">{stats.completedSales}</StatValue>
            <StatLabel>Ventas Completadas</StatLabel>
          </StatCard>
          <StatCard $color="#e67e22">
            <StatValue $color="#e67e22">{formatCurrency(stats.averageSale)}</StatValue>
            <StatLabel>Venta Promedio</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Filtros */}
        <FiltersContainer>
          <FiltersGrid>
            <FormGroup>
              <SharedLabel htmlFor="search">Buscar</SharedLabel>
              <SharedInput
                id="search"
                type="text"
                placeholder="Número de venta o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <SharedLabel htmlFor="status">Estado</SharedLabel>
              <SharedSelect
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </SharedSelect>
            </FormGroup>
            <FormGroup>
              <SharedLabel htmlFor="voucher">Comprobante</SharedLabel>
              <SharedSelect
                id="voucher"
                value={voucherFilter}
                onChange={(e) => setVoucherFilter(e.target.value)}
              >
                <option value="">Todos los comprobantes</option>
                <option value="Boleta">Boleta</option>
                <option value="Factura">Factura</option>
                <option value="NotaVenta">Nota de Venta</option>
              </SharedSelect>
            </FormGroup>
            <FormGroup>
              <SharedLabel htmlFor="payment">Forma de Pago</SharedLabel>
              <SharedSelect
                id="payment"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="">Todas las formas de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
              </SharedSelect>
            </FormGroup>
            <FormGroup>
              <SharedLabel htmlFor="client">Cliente</SharedLabel>
              <SharedSelect
                id="client"
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
              </SharedSelect>
            </FormGroup>
            <FormGroup>
              <SharedLabel htmlFor="date">Fecha</SharedLabel>
              <SharedInput
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </FormGroup>
          </FiltersGrid>
          <ButtonGroup>
            <SharedButton $variant="secondary" onClick={clearFilters}>
              Limpiar
            </SharedButton>
            <SharedButton $variant="primary" onClick={() => {}}>
              Buscar
            </SharedButton>
            <SharedButton $variant="primary" style={{ background: '#28a745' }}>
              Exportar a Excel
            </SharedButton>
          </ButtonGroup>
        </FiltersContainer>

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
            <SharedTable>
              <SharedThead>
              <tr>
                  <SharedTh>Código</SharedTh>
                  <SharedTh>Cliente</SharedTh>
                  <SharedTh>Comprobante</SharedTh>
                  <SharedTh>Fecha/Hora</SharedTh>
                  <SharedTh>Total</SharedTh>
                  <SharedTh>NC</SharedTh>
                  <SharedTh>Pago</SharedTh>
                  <SharedTh>Estado</SharedTh>
                  <SharedTh>Acciones</SharedTh>
                </tr>
              </SharedThead>
              <SharedTbody>
                {paginatedSales.map((sale) => {
                  const client = sale.cliente;
                  const clientName = client 
                    ? (client.tipoDocumento === 'RUC' 
                        ? client.razonSocial || ''
                        : `${client.nombres || ''} ${client.apellidos || ''}`.trim())
                    : 'Cliente General';
                  
                  return (
                    <SharedTr key={sale.id}>
                      <SharedTd>
                        <strong>{sale.codigoVenta}</strong>
                        <div style={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
                          {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                        </div>
                      </SharedTd>
                      <SharedTd>
                        <strong>{clientName}</strong>
                        {client && (
                          <div style={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
                            {client.numeroDocumento}
                          </div>
                        )}
                      </SharedTd>
                      <SharedTd>
                        <VoucherBadge type={sale.tipoComprobante || 'NotaVenta'}>
                          {sale.tipoComprobante === 'NotaVenta' ? 'Nota de Venta' : sale.tipoComprobante}
                        </VoucherBadge>
                      </SharedTd>
                      <SharedTd>
                        <div>{formatDate(sale.fechaEmision)}</div>
                        <div style={{ fontSize: '0.75rem', color: COLORS.text.secondary }}>
                          {formatTime(sale.fechaEmision)}
                        </div>
                      </SharedTd>
                      <SharedTd>
                        <strong style={{ fontSize: '1.05rem', color: '#27ae60' }}>
                          {formatCurrency(sale.total)}
                        </strong>
                      </SharedTd>
                      <SharedTd>
                        {sale.tieneNotaCredito ? (
                          <div style={{ fontSize: '0.9rem', color: '#e74c3c', fontWeight: '600' }}>
                            -{formatCurrency(sale.montoNotaCredito || 0)}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.9rem', color: COLORS.text.secondary }}>-</div>
                        )}
                      </SharedTd>
                      <SharedTd>
                        {renderPaymentMethods(sale)}
                      </SharedTd>
                      <SharedTd>
                        <StatusBadge status={sale.estado}>
                          {getStatusText(sale.estado)}
                        </StatusBadge>
                      </SharedTd>
                      <SharedTd>
                        <ActionsContainer>
                          {sale.estado === 'Completada' ? (
                            <>
                              <ActionButton 
                                $variant="view"
                                onClick={() => handleViewSale(sale.id)}
                                disabled={isProcessing}
                              >
                                Ver Detalles
                              </ActionButton>
                              <ActionButton 
                                $variant="pdf"
                                onClick={() => handlePreviewPDF(sale.id)}
                                disabled={isProcessing}
                              >
                                Imprimir
                              </ActionButton>
                              <ActionButton 
                                $variant="credit"
                                onClick={() => handleOpenCreditNoteModal(sale)}
                                disabled={isProcessing}
                              >
                                Nota Crédito
                              </ActionButton>
                            </>
                          ) : sale.estado === 'Pendiente' ? (
                            <>
                              <ActionButton 
                                $variant="view"
                                onClick={() => handleViewSale(sale.id)}
                                disabled={isProcessing}
                              >
                                Ver Detalles
                              </ActionButton>
                              <SharedButton 
                                $variant="primary"
                                onClick={() => handleOpenPaymentModal(sale)}
                                disabled={isProcessing}
                                style={{ background: '#27ae60', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                              >
                                Confirmar Pago
                              </SharedButton>
                              <SharedButton 
                                $variant="secondary"
                                onClick={() => handleCancelSale(sale.id)}
                                disabled={isProcessing}
                                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                              >
                                Cancelar
                              </SharedButton>
                            </>
                          ) : sale.estado === 'Cancelada' ? (
                            <ActionButton 
                              $variant="view"
                              onClick={() => handleViewSale(sale.id)}
                              disabled={isProcessing}
                            >
                              Ver Detalles
                            </ActionButton>
                          ) : null}
                        </ActionsContainer>
                      </SharedTd>
                    </SharedTr>
                  );
                })}
              </SharedTbody>
            </SharedTable>
          )}

          {/* Paginación */}
          {filteredSales.length > 0 && (
            <SharedPaginationContainer>
              <SharedPaginationInfo>
                Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredSales.length)} de {filteredSales.length} ventas
              </SharedPaginationInfo>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <PageSizeSelect
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </PageSizeSelect>

                <SharedPaginationButtons>
                  <PageButton
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </PageButton>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PageButton
                        key={pageNum}
                        $active={pageNum === currentPage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PageButton>
                    );
                  })}

                  <PageButton
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </PageButton>
                </SharedPaginationButtons>
              </div>
            </SharedPaginationContainer>
          )}
        </TableContainer>

        {/* Modal: Confirmar Pago */}
        {showPaymentModal && selectedSaleForPayment && (
          <ModalOverlay onClick={handleClosePaymentModal}>
            <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <ModalHeader>
                <ModalTitle>Confirmar Pago de Venta</ModalTitle>
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