import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import Layout from '../../../components/Layout';
import { useSales } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';
import { ModalNotaCredito } from '../components/ModalNotaCredito';
import { tokenUtils } from '../../../utils/api';

// ✅ Helper para obtener el nombre del motivo de NC (simplificado a 2 motivos)
const getCreditNoteReasonLabel = (reason: string): string => {
  const labels: Record<string, string> = {
    'DevolucionTotal': 'Devolución Total',
    'DevolucionParcial': 'Devolución Parcial',
  };
  return labels[reason] || reason;
};

// ✅ Helper para obtener el label del estado de NC
const getNCStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'Pendiente': 'Pendiente (Vale)',
    'Reembolsada': 'Reembolsada',
    'PendientePagoBancario': 'Pendiente Pago Bancario',
    'Aplicada': 'Aplicada',
    'Cancelada': 'Cancelada',
  };
  return labels[status] || status;
};

const Container = styled.div`
  padding: ${SPACING.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
  gap: ${SPACING.lg};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  padding: ${SPACING.md} ${SPACING.xl};
  background: ${COLORS.neutral[400]};
  color: ${COLORS.neutral.white};
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  cursor: pointer;
  transition: ${TRANSITIONS.default};

  &:hover {
    background: ${COLORS.neutral[500]};
    transform: translateY(-2px);
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: ${SPACING.md} ${SPACING.xl};
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;
  transition: ${TRANSITIONS.default};
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};

  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: ${COLOR_SCALES.danger[500]};
        color: ${COLORS.neutral.white};
        &:hover { background: ${COLOR_SCALES.danger[600]}; }
      `;
    }
    return `
      background: ${COLOR_SCALES.primary[500]};
      color: ${COLORS.neutral.white};
      &:hover { background: ${COLOR_SCALES.primary[600]}; }
    `;
  }}

  &:disabled {
    background: ${COLORS.neutral[300]};
    cursor: not-allowed;
    transform: none;
  }
`;

const Card = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.md};
  padding: ${SPACING.xl};
  margin-bottom: ${SPACING.xl};
`;

const CardTitle = styled.h2`
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  margin: 0 0 ${SPACING.lg} 0;
  padding-bottom: ${SPACING.md};
  border-bottom: 2px solid ${COLORS.neutral[200]};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${SPACING.lg};
`;

const InfoItem = styled.div`
  margin-bottom: ${SPACING.md};
`;

const InfoLabel = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.secondary};
  margin-bottom: ${SPACING.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const InfoValue = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.base};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  
  ${props => {
    const status = props.status.toLowerCase();
    switch (status) {
      case 'pendiente':
        return `
          background: #fff3cd;
          color: #856404;
          border: 2px solid #ffc107;
        `;
      case 'completada':
        return `
          background: #d4edda;
          color: #155724;
          border: 2px solid #28a745;
        `;
      case 'cancelada':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 2px solid #dc3545;
        `;
      default:
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #dee2e6;
        `;
    }
  }}
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${SPACING.lg};
`;

const TableHeader = styled.thead`
  background: ${COLORS.neutral[50]};
`;

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.neutral[200]};
  }

  &:hover {
    background: ${COLORS.neutral[50]};
  }
`;

const TableHeaderCell = styled.th`
  padding: ${SPACING.lg};
  text-align: left;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
  border-bottom: 2px solid ${COLORS.neutral[200]};
`;

const TableCell = styled.td`
  padding: ${SPACING.lg};
  color: ${COLORS.text.primary};
`;

const TotalSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${SPACING.sm};
  margin-top: ${SPACING.lg};
  padding-top: ${SPACING.lg};
  border-top: 2px solid ${COLORS.neutral[200]};
`;

const TotalRow = styled.div<{ $isGrandTotal?: boolean }>`
  display: flex;
  justify-content: space-between;
  min-width: 300px;
  padding: ${SPACING.sm} 0;
  font-size: ${props => props.$isGrandTotal ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.base};
  font-weight: ${props => props.$isGrandTotal ? TYPOGRAPHY.fontWeight.bold : TYPOGRAPHY.fontWeight.medium};
  color: ${props => props.$isGrandTotal ? COLOR_SCALES.success[500] : COLORS.text.primary};
`;

const AlertBox = styled.div<{ $type: 'warning' | 'info' | 'success' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  ${props => {
    switch (props.$type) {
      case 'warning':
        return `
          background: #fff3cd;
          border: 2px solid #ffc107;
          color: #856404;
        `;
      case 'success':
        return `
          background: #d4edda;
          border: 2px solid #28a745;
          color: #155724;
        `;
      default:
        return `
          background: #d1ecf1;
          border: 2px solid #17a2b8;
          color: #0c5460;
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: ${TYPOGRAPHY.fontSize.xl};
  color: ${COLORS.text.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const NCBadge = styled.span`
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-left: 0.5rem;
`;

const NCStatus = styled.span<{ status: string }>`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin-top: 0.5rem;
  
  ${props => {
    const status = props.status;
    switch (status) {
      case 'Pendiente':
        return `
          background: #fff3cd;
          color: #856404;
          border: 2px solid #ffc107;
        `;
      case 'Reembolsada':
        return `
          background: #d4edda;
          color: #155724;
          border: 2px solid #28a745;
        `;
      case 'PendientePagoBancario':
        return `
          background: #d1ecf1;
          color: #0c5460;
          border: 2px solid #17a2b8;
        `;
      case 'Aplicada':
        return `
          background: #d1f2eb;
          color: #0a3d2c;
          border: 2px solid #00b894;
        `;
      case 'Cancelada':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 2px solid #dc3545;
        `;
      default:
        return `
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #dee2e6;
        `;
    }
  }}
`;

const IconButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const DetalleVenta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSaleById, previewInvoice, createCreditNote } = useSales(); // ✅ Removido getCreditNotesBySale
  const { addNotification } = useNotification();

  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);

  useEffect(() => {
    loadSaleDetails();
  }, [id]);

  const loadSaleDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const saleData = await getSaleById(id);
      setSale(saleData);
      // ✅ Ya no necesitamos query separada, sale.creditNotes viene del backend
    } catch (error: any) {
      addNotification('error', 'Error al Cargar', error.message || 'No se pudo cargar el detalle de la venta');
      navigate('/ventas/lista');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!sale) return;
    
    try {
      setIsProcessing(true);
      await previewInvoice(sale.id);
    } catch (error: any) {
      addNotification('error', 'Error al Imprimir', error.message || 'No se pudo generar el PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmitCreditNote = () => {
    setShowCreditNoteModal(true);
  };

  const handleCloseCreditNoteModal = () => {
    setShowCreditNoteModal(false);
  };

  const handleSubmitCreditNote = async (data: any) => {
    try {
      const result = await createCreditNote(data);
      addNotification('success', 'Nota de Crédito Emitida', 'Nota de crédito creada exitosamente');
      handleCloseCreditNoteModal();
      // Recargar detalles de la venta
      await loadSaleDetails();
      return { creditNote: result }; // ✅ Retornar el resultado para que el modal pueda descargar el PDF
    } catch (error: any) {
      addNotification('error', 'Error al Emitir', error.message || 'No se pudo emitir la nota de crédito');
      throw error;
    }
  };

  const printCreditNote = async (creditNoteId: string) => {
    try {
      setIsProcessing(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = tokenUtils.getAccessToken();

      const response = await fetch(`${API_URL}/credit-notes/${creditNoteId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'Error al generar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva ventana y ejecutar impresión
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          // No cerrar la ventana automáticamente para que el usuario pueda revisar
        };
      } else {
        // Fallback: iframe si el popup está bloqueado
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
          try {
            iframe.contentWindow?.print();
          } catch (e) {
            console.error('Error al imprimir:', e);
          }
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
      }

      addNotification('success', 'Imprimiendo', 'Ventana de impresión abierta');
    } catch (error: any) {
      addNotification('error', 'Error al Imprimir', error.message || 'No se pudo imprimir la nota de crédito');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `S/ ${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout title="Detalle de Venta">
        <LoadingSpinner>Cargando detalle de venta...</LoadingSpinner>
      </Layout>
    );
  }

  if (!sale) {
    return (
      <Layout title="Detalle de Venta">
        <Container>
          <AlertBox $type="warning">
            Venta no encontrada
          </AlertBox>
          <BackButton onClick={() => navigate('/ventas/lista')}>
            ← Volver a Lista de Ventas
          </BackButton>
        </Container>
      </Layout>
    );
  }

  const clientName = sale.cliente
    ? (sale.cliente.tipoDocumento === 'RUC'
        ? sale.cliente.razonSocial
        : `${sale.cliente.nombres} ${sale.cliente.apellidos}`)
    : 'Cliente General';

  const subtotal = Number(sale.subtotal) || 0;
  const igv = Number(sale.igv) || 0;
  const total = Number(sale.total) || 0;
  
  // ✅ Calcular monto de NC desde sale.creditNotes (getById no tiene montoNotaCredito)
  const montoNC = sale.creditNotes?.reduce((sum: number, nc: any) => sum + Number(nc.total), 0) || 0;
  const montoEfectivo = total - montoNC;

  return (
    <Layout title={`Detalle de Venta - ${sale.codigoVenta}`}>
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/ventas/lista')}>
            ← Volver
          </BackButton>
          <ButtonGroup>
            <ActionButton onClick={handlePrint} disabled={isProcessing || sale.estado !== 'Completada'}>
              Imprimir
            </ActionButton>
            <ActionButton 
              $variant="danger" 
              onClick={handleEmitCreditNote}
              disabled={isProcessing || sale.estado !== 'Completada'}
            >
              Emitir Nota de Crédito
            </ActionButton>
          </ButtonGroup>
        </Header>

        {/* Alerta si tiene Nota de Crédito */}
        {sale.tieneNotaCredito && (
          <AlertBox $type="warning">
            Esta venta tiene Notas de Crédito asociadas por un total de {formatCurrency(montoNC)}
          </AlertBox>
        )}

        {/* Información del Comprobante */}
        <Card>
          <CardTitle>Información del Comprobante</CardTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Código de Venta</InfoLabel>
              <InfoValue style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3498db' }}>
                {sale.codigoVenta}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Tipo de Comprobante</InfoLabel>
              <InfoValue>{sale.tipoComprobante === 'NotaVenta' ? 'Nota de Venta' : sale.tipoComprobante}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Estado</InfoLabel>
              <InfoValue>
                <StatusBadge status={sale.estado}>
                  {sale.estado}
                </StatusBadge>
                {sale.tieneNotaCredito && <NCBadge>NC</NCBadge>}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Fecha de Emisión</InfoLabel>
              <InfoValue>{formatDate(sale.fechaEmision)} - {formatTime(sale.fechaEmision)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Método(s) de Pago</InfoLabel>
              <InfoValue>
                {sale.payments && sale.payments.length > 0 ? (
                  sale.payments.length === 1 ? (
                    // Un solo método
                    sale.payments[0].metodoPago
                  ) : (
                    // Múltiples métodos: mostrar lista
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {sale.payments.map((payment, index) => (
                        <span key={payment.id || index} style={{ fontSize: '0.9rem' }}>
                          • {payment.metodoPago}: S/ {Number(payment.monto).toFixed(2)}
                          {payment.referencia && ` (${payment.referencia})`}
                        </span>
                      ))}
                    </div>
                  )
                ) : (
                  // Fallback a formaPago (legacy)
                  sale.formaPago
                )}
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </Card>

        {/* Información del Cliente */}
        <Card>
          <CardTitle>Información del Cliente</CardTitle>
          {sale.cliente ? (
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Nombre / Razón Social</InfoLabel>
                <InfoValue>{clientName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Tipo de Documento</InfoLabel>
                <InfoValue>{sale.cliente.tipoDocumento}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Número de Documento</InfoLabel>
                <InfoValue>{sale.cliente.numeroDocumento}</InfoValue>
              </InfoItem>
              {sale.cliente.direccion && (
                <InfoItem>
                  <InfoLabel>Dirección</InfoLabel>
                  <InfoValue>{sale.cliente.direccion}</InfoValue>
                </InfoItem>
              )}
              {sale.cliente.telefono && (
                <InfoItem>
                  <InfoLabel>Teléfono</InfoLabel>
                  <InfoValue>{sale.cliente.telefono}</InfoValue>
                </InfoItem>
              )}
            </InfoGrid>
          ) : (
            <InfoValue>Cliente General (Sin datos registrados)</InfoValue>
          )}
        </Card>

        {/* Detalle de Productos */}
        <Card>
          <CardTitle>Productos</CardTitle>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>Producto</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'center' }}>Cantidad</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>P. Unitario</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>Subtotal</TableHeaderCell>
              </tr>
            </TableHeader>
            <tbody>
              {sale.items.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <div style={{ fontWeight: '600' }}>{item.nombreProducto}</div>
                    {item.productCode && (
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                        Código: {item.productCode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{item.cantidad}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    {formatCurrency(item.precioUnitario)}
                  </TableCell>
                  <TableCell style={{ textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>

          <TotalSection>
            <TotalRow>
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </TotalRow>
            <TotalRow>
              <span>IGV (18%):</span>
              <span>{formatCurrency(igv)}</span>
            </TotalRow>
            <TotalRow $isGrandTotal>
              <span>TOTAL:</span>
              <span>{formatCurrency(total)}</span>
            </TotalRow>
            {sale.tieneNotaCredito && (
              <>
                <TotalRow style={{ color: '#e74c3c' }}>
                  <span>(-) Notas de Crédito:</span>
                  <span>-{formatCurrency(montoNC)}</span>
                </TotalRow>
                <TotalRow $isGrandTotal style={{ color: '#f39c12' }}>
                  <span>MONTO EFECTIVO:</span>
                  <span>{formatCurrency(montoEfectivo)}</span>
                </TotalRow>
              </>
            )}
          </TotalSection>
        </Card>

        {/* Detalles de Pago (si está completada) */}
        {sale.estado === 'Completada' && sale.montoRecibido && (
          <Card>
            <CardTitle>💰 Detalles de Pago</CardTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Monto Recibido</InfoLabel>
                <InfoValue style={{ color: '#27ae60', fontWeight: '600' }}>
                  {formatCurrency(sale.montoRecibido)}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Cambio Entregado</InfoLabel>
                <InfoValue style={{ color: '#3498db', fontWeight: '600' }}>
                  {formatCurrency(sale.montoCambio || 0)}
                </InfoValue>
              </InfoItem>
              {sale.referenciaPago && (
                <InfoItem>
                  <InfoLabel>Referencia de Pago</InfoLabel>
                  <InfoValue>{sale.referenciaPago}</InfoValue>
                </InfoItem>
              )}
              {sale.fechaPago && (
                <InfoItem>
                  <InfoLabel>Fecha de Pago</InfoLabel>
                  <InfoValue>{formatDate(sale.fechaPago)} - {formatTime(sale.fechaPago)}</InfoValue>
                </InfoItem>
              )}
            </InfoGrid>
          </Card>
        )}

        {/* Observaciones */}
        {sale.observaciones && (
          <Card>
            <CardTitle>Observaciones</CardTitle>
            <InfoValue>{sale.observaciones}</InfoValue>
          </Card>
        )}

        {/* Historial de Notas de Crédito */}
        {sale.creditNotes && sale.creditNotes.length > 0 && (
          <Card>
            <CardTitle>Historial de Notas de Crédito</CardTitle>
            <AlertBox $type="warning" style={{ marginBottom: '1rem' }}>
              Esta venta tiene {sale.creditNotes.length} Nota{sale.creditNotes.length > 1 ? 's' : ''} de Crédito por un total de <strong style={{ color: '#e74c3c' }}>{formatCurrency(-montoNC)}</strong>
            </AlertBox>
            
            {sale.creditNotes.map((nc: any, index: number) => (
              <div
                key={nc.id}
                style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: index < sale.creditNotes.length - 1 ? '1rem' : '0',
                }}
              >
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <InfoItem>
                    <InfoLabel>Código NC</InfoLabel>
                    <InfoValue style={{ fontWeight: '600', color: '#856404' }}>
                      {nc.codigoVenta}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Fecha Emisión</InfoLabel>
                    <InfoValue>{formatDate(nc.fechaEmision)} - {formatTime(nc.fechaEmision)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Motivo</InfoLabel>
                    <InfoValue style={{ fontWeight: '600' }}>
                      {getCreditNoteReasonLabel(nc.creditNoteReason)}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Monto NC</InfoLabel>
                    <InfoValue style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e74c3c' }}>
                      {formatCurrency(Math.abs(Number(nc.total)))}
                    </InfoValue>
                  </InfoItem>
                </div>

                {/* Estado y Método de Pago */}
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {nc.creditNoteStatus && (
                    <div>
                      <InfoLabel>Estado</InfoLabel>
                      <NCStatus status={nc.creditNoteStatus}>
                        {getNCStatusLabel(nc.creditNoteStatus)}
                      </NCStatus>
                    </div>
                  )}
                  {nc.creditNotePaymentMethod && (
                    <InfoItem>
                      <InfoLabel>Método de Pago</InfoLabel>
                      <InfoValue style={{ fontWeight: '600', color: '#2c3e50' }}>
                        {nc.creditNotePaymentMethod === 'Efectivo' && '💵 Efectivo'}
                        {nc.creditNotePaymentMethod === 'Transferencia' && '🏦 Transferencia'}
                        {nc.creditNotePaymentMethod === 'Vale' && '🎟️ Vale'}
                      </InfoValue>
                    </InfoItem>
                  )}
                  <div style={{ marginLeft: 'auto' }}>
                    <IconButton 
                      onClick={() => printCreditNote(nc.id)}
                      disabled={isProcessing}
                    >
                      Imprimir NC
                    </IconButton>
                  </div>
                </div>

                {nc.creditNoteDescription && (
                  <InfoItem>
                    <InfoLabel>Observaciones</InfoLabel>
                    <InfoValue style={{ fontStyle: 'italic' }}>{nc.creditNoteDescription}</InfoValue>
                  </InfoItem>
                )}

                {/* Productos devueltos */}
                {nc.items && nc.items.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>
                      Productos Devueltos:
                    </InfoLabel>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      background: 'white',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Producto</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Cantidad</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Precio Unit.</th>
                          <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nc.items.map((item: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.5rem' }}>{item.nombreProducto}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.cantidad}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                              {formatCurrency(Math.abs(Number(item.precioUnitario)))}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                              {formatCurrency(Math.abs(Number(item.subtotal)))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Usuario que emitió */}
                {nc.usuario && (
                  <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    Emitida por: <strong>{nc.usuario.nombre}</strong>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
      </Container>

      {/* Modal: Emitir Nota de Crédito */}
      {showCreditNoteModal && sale && (
        <ModalNotaCredito
          sale={sale}
          onClose={handleCloseCreditNoteModal}
          onSubmit={handleSubmitCreditNote}
        />
      )}
    </Layout>
  );
};

export default DetalleVenta;
