/**
 * COMPONENTE: PurchaseOrderDetail
 * Vista detallada de una orden de compra
 * Fase 2 - Task 6
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { purchaseOrderService } from '../services';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types/purchases.types';
import {
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_COLORS,
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { media } from '../../../styles/breakpoints';

// ==================== TIPOS ====================

interface PurchaseOrderDetailProps {
  orderId: string;
  onEdit?: (order: PurchaseOrder) => void;
  onCreateReceipt?: (order: PurchaseOrder) => void;
  onClose?: () => void;
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
  
  ${media.mobile} {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
  
  ${media.mobile} {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const StatusBadge = styled.span<{ $status: PurchaseOrderStatus }>`
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  background-color: ${props => PURCHASE_ORDER_STATUS_COLORS[props.$status] || '#6c757d'};
  color: white;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  
  ${media.mobile} {
    width: 100%;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => {
    switch (props.$variant) {
      case 'primary': return '#007bff';
      case 'success': return '#28a745';
      case 'danger': return '#dc3545';
      case 'secondary':
      default: return '#6c757d';
    }
  }};
  color: white;

  &:hover:not(:disabled) {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${media.mobile} {
    flex: 1;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  
  ${media.mobile} {
    font-size: 16px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  ${media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: 600;
`;

const InfoValue = styled.span`
  font-size: 15px;
  color: #333;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  overflow: hidden;
`;

const Thead = styled.thead`
  background-color: #f8f9fa;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
  
  ${media.mobile} {
    padding: 8px;
    font-size: 12px;
  }
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid #dee2e6;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const Td = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #333;
  
  ${media.mobile} {
    padding: 8px;
    font-size: 12px;
  }
`;

const Summary = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
  margin-left: auto;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  
  &.total {
    font-size: 20px;
    font-weight: 700;
    color: #007bff;
    padding-top: 8px;
    border-top: 2px solid #dee2e6;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #007bff;
  font-size: 16px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #dc3545;
  font-size: 16px;
`;

const ObservationsBox = styled.div`
  padding: 12px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 5px;
  font-size: 14px;
  color: #856404;
  margin-top: 8px;
`;

// ==================== COMPONENTE ====================

const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({
  orderId,
  onEdit,
  onCreateReceipt,
  onClose,
}) => {
  const { showNotification } = useNotification();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // ==================== FUNCIONES ====================

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await purchaseOrderService.getPurchaseOrderById(orderId);
      setOrder(response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar detalle de orden';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (newStatus: PurchaseOrderStatus) => {
    if (!order) return;

    const confirmMessage = `¿Está seguro de cambiar el estado a "${PURCHASE_ORDER_STATUS_LABELS[newStatus]}"?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await purchaseOrderService.updatePurchaseOrderStatus(order.id, {
        estado: newStatus,
        observaciones: `Estado cambiado a ${PURCHASE_ORDER_STATUS_LABELS[newStatus]}`,
      });

      showNotification(
        'success',
        'Estado Actualizado',
        `La orden ${order.codigo} cambió a estado ${PURCHASE_ORDER_STATUS_LABELS[newStatus]}`
      );
      fetchOrderDetail();
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cambiar estado';
      showNotification('error', 'Error al cambiar estado', errorMessage);
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) return;

    try {
      showNotification('info', 'Generando PDF', `Preparando documento de la orden ${order.codigo}`);
      
      await purchaseOrderService.downloadPDF(order.id);
      
      showNotification('success', 'PDF Descargado', `Orden ${order.codigo} descargada exitosamente`);
    } catch (err: any) {
      console.error('Error al descargar PDF:', err);
      const errorMessage = err.message || 'No se pudo generar el PDF. Intente nuevamente.';
      showNotification('error', 'Error al descargar PDF', errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const canEdit = order && (order.estado === 'PENDIENTE' || order.estado === 'ENVIADA');
  const canCreateReceipt = order && ['CONFIRMADA', 'EN_RECEPCION', 'PARCIAL'].includes(order.estado);
  const canChangeStatus = order && !['COMPLETADA', 'CERRADA', 'CANCELADA'].includes(order.estado);

  // ==================== RENDER ====================

  if (loading) {
    return (
      <Container>
        <LoadingState>Cargando detalle de orden...</LoadingState>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container>
        <ErrorState>{error || 'Orden no encontrada'}</ErrorState>
        {onClose && (
          <Actions style={{ justifyContent: 'center' }}>
            <ActionButton $variant="secondary" onClick={onClose}>
              Volver
            </ActionButton>
          </Actions>
        )}
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <Title>Orden de Compra {order.codigo}</Title>
          <Subtitle>Creada el {formatDate(order.createdAt)}</Subtitle>
        </HeaderLeft>
        <StatusBadge $status={order.estado}>
          {PURCHASE_ORDER_STATUS_LABELS[order.estado]}
        </StatusBadge>
      </Header>

      {/* Acciones */}
      <Actions>
        <ActionButton $variant="primary" onClick={handleDownloadPDF}>
          📄 Descargar PDF
        </ActionButton>
        {canCreateReceipt && onCreateReceipt && (
          <ActionButton $variant="success" onClick={() => onCreateReceipt(order.id)}>
            📦 Crear Recepción
          </ActionButton>
        )}
        {order.estado === 'PENDIENTE' && (
          <ActionButton $variant="success" onClick={() => handleChangeStatus('ENVIADA')}>
            ➡️ Enviar a Proveedor
          </ActionButton>
        )}
        {order.estado === 'ENVIADA' && (
          <ActionButton $variant="success" onClick={() => handleChangeStatus('CONFIRMADA')}>
            ✅ Confirmar Orden
          </ActionButton>
        )}
        {order.estado === 'COMPLETADA' && (
          <ActionButton $variant="success" onClick={() => handleChangeStatus('CERRADA')}>
            🔒 Cerrar Orden
          </ActionButton>
        )}
        {canChangeStatus && ['PENDIENTE', 'ENVIADA', 'CONFIRMADA'].includes(order.estado) && (
          <ActionButton $variant="danger" onClick={() => handleChangeStatus('CANCELADA')}>
            ❌ Cancelar Orden
          </ActionButton>
        )}
        {onClose && (
          <ActionButton $variant="secondary" onClick={onClose}>
            Cerrar
          </ActionButton>
        )}
      </Actions>

      {/* Información General */}
      <Section>
        <SectionTitle>Información General</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Código</InfoLabel>
            <InfoValue>{order.codigo}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Fecha de Emisión</InfoLabel>
            <InfoValue>{formatDate(order.fechaEmision)}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Proveedor</InfoLabel>
            <InfoValue>
              {order.proveedor?.razonSocial || 'N/A'}
              {order.proveedor?.numeroDocumento && (
                <> ({order.proveedor.numeroDocumento})</>
              )}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Almacén Destino</InfoLabel>
            <InfoValue>
              {order.almacenDestino?.nombre || 'N/A'}
              {order.almacenDestino?.codigo && (
                <> ({order.almacenDestino.codigo})</>
              )}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Estado</InfoLabel>
            <InfoValue>{PURCHASE_ORDER_STATUS_LABELS[order.estado]}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Última Actualización</InfoLabel>
            <InfoValue>{formatDate(order.updatedAt)}</InfoValue>
          </InfoItem>
          {order.condicionesPago && (
            <InfoItem>
              <InfoLabel>Condiciones de Pago</InfoLabel>
              <InfoValue>{order.condicionesPago}</InfoValue>
            </InfoItem>
          )}
          {order.moneda && (
            <InfoItem>
              <InfoLabel>Moneda</InfoLabel>
              <InfoValue>{order.moneda === 'PEN' ? 'Soles (PEN)' : order.moneda}</InfoValue>
            </InfoItem>
          )}
        </InfoGrid>

        {order.observaciones && (
          <ObservationsBox>
            <strong>Observaciones:</strong> {order.observaciones}
          </ObservationsBox>
        )}
      </Section>

      {/* Productos */}
      <Section>
        <SectionTitle>Productos ({order.items.length})</SectionTitle>
        <Table>
          <Thead>
            <tr>
              <Th>#</Th>
              <Th>Producto</Th>
              <Th>Cantidad</Th>
              <Th>Precio Unit.</Th>
              <Th>Subtotal</Th>
              <Th>Observaciones</Th>
            </tr>
          </Thead>
          <Tbody>
            {order.items.map((item, index) => (
              <Tr key={item.id}>
                <Td>{index + 1}</Td>
                <Td>
                  {item.producto?.codigo && <>{item.producto.codigo} - </>}
                  {item.producto?.nombre || 'N/A'}
                </Td>
                <Td>{item.cantidadOrdenada || item.cantidad || 0}</Td>
                <Td>{formatCurrency(item.precioUnitario)}</Td>
                <Td>{formatCurrency(item.subtotal)}</Td>
                <Td>{item.especificaciones || item.observaciones || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Resumen */}
        <Summary>
          <SummaryRow>
            <span>Subtotal:</span>
            <strong>{formatCurrency(order.subtotal)}</strong>
          </SummaryRow>
          {order.descuento > 0 && (
            <SummaryRow>
              <span>Descuento:</span>
              <strong>-{formatCurrency(order.descuento)}</strong>
            </SummaryRow>
          )}
          {order.igv > 0 && (
            <SummaryRow>
              <span>IGV (18%):</span>
              <strong>{formatCurrency(order.igv)}</strong>
            </SummaryRow>
          )}
          <SummaryRow className="total">
            <span>TOTAL:</span>
            <span>{formatCurrency(order.total)}</span>
          </SummaryRow>
        </Summary>
      </Section>
    </Container>
  );
};

export default PurchaseOrderDetail;
