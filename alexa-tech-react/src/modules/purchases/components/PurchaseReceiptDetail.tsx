/**
 * COMPONENTE: PurchaseReceiptDetail
 * Vista detallada de una recepción de compra
 * Fase 3 - Task 9
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { purchaseReceiptService } from '../services';
import type { PurchaseReceipt, PurchaseReceiptStatus } from '../types/purchases.types';
import {
  PURCHASE_RECEIPT_STATUS_LABELS,
  PURCHASE_RECEIPT_STATUS_COLORS,
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { media } from '../../../styles/breakpoints';

// ==================== TIPOS ====================

interface PurchaseReceiptDetailProps {
  receiptId: string;
  onConfirm?: (receiptId: string) => void;
  onCancel?: (receiptId: string) => void;
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

const StatusBadge = styled.span<{ $status: PurchaseReceiptStatus }>`
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  background-color: ${props => PURCHASE_RECEIPT_STATUS_COLORS[props.$status] || '#6c757d'};
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

const OrderLink = styled.a`
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
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

const Tr = styled.tr<{ $warning?: boolean }>`
  border-bottom: 1px solid #dee2e6;
  background-color: ${props => props.$warning ? '#fff3cd' : 'transparent'};

  &:hover {
    background-color: ${props => props.$warning ? '#ffe69c' : '#f8f9fa'};
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

const WarningBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background-color: #ffc107;
  color: #856404;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
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

const AlertBox = styled.div<{ $type?: 'info' | 'warning' | 'success' }>`
  padding: 12px 16px;
  border-radius: 5px;
  font-size: 14px;
  margin-top: 12px;
  background-color: ${props => {
    switch (props.$type) {
      case 'success': return '#d4edda';
      case 'warning': return '#fff3cd';
      case 'info':
      default: return '#d1ecf1';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'success': return '#c3e6cb';
      case 'warning': return '#ffc107';
      case 'info':
      default: return '#bee5eb';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#155724';
      case 'warning': return '#856404';
      case 'info':
      default: return '#0c5460';
    }
  }};
`;

// ==================== COMPONENTE ====================

const PurchaseReceiptDetail: React.FC<PurchaseReceiptDetailProps> = ({
  receiptId,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchReceiptDetail();
  }, [receiptId]);

  // ==================== FUNCIONES ====================

  const fetchReceiptDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await purchaseReceiptService.getPurchaseReceiptById(receiptId);
      setReceipt(response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar detalle de recepción';
      setError(errorMessage);
      showNotification('error', 'Error de Carga', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!receipt || receipt.estado !== 'PENDIENTE') {
      showNotification('error', 'Acción No Permitida', 'Solo se pueden confirmar recepciones con estado PENDIENTE');
      return;
    }

    if (!user?.id) {
      showNotification('error', 'Sesión Requerida', 'Debe iniciar sesión para confirmar recepciones');
      return;
    }

    if (!confirm('¿Confirmar esta recepción? Esto actualizará el inventario y no se podrá revertir.')) {
      return;
    }

    try {
      await purchaseReceiptService.confirmPurchaseReceipt(receipt.id, {
        inspeccionadoPorId: user.id,
        items: []
      });
      showNotification('success', 'Recepción Confirmada', 'La recepción se confirmó exitosamente y el inventario se ha actualizado');
      fetchReceiptDetail();
      
      if (onConfirm) {
        onConfirm(receipt.id);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al confirmar recepción';
      showNotification('error', 'Error al Confirmar', errorMessage);
    }
  };

  const handleCancelReceipt = async () => {
    if (!receipt || receipt.estado === 'CANCELADA') {
      showNotification('warning', 'Ya Cancelada', 'Esta recepción ya se encuentra en estado CANCELADA');
      return;
    }

    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) {
      return;
    }

    try {
      await purchaseReceiptService.cancelPurchaseReceipt(receipt.id, motivo);
      showNotification('success', 'Recepción Cancelada', 'La recepción se ha cancelado correctamente');
      fetchReceiptDetail();
      
      if (onCancel) {
        onCancel(receipt.id);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al anular recepción';
      showNotification('error', 'Error al Cancelar', errorMessage);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receipt) return;

    try {
      await purchaseReceiptService.downloadPDF(receipt.id);
      showNotification('success', 'PDF Descargado', 'El documento se ha descargado correctamente');
    } catch (err: any) {
      const errorMessage = err.message || 'Error al descargar PDF';
      showNotification('error', 'Error al Descargar', errorMessage);
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

  const hasQuantityDifference = (expectedQty: number, receivedQty: number): boolean => {
    return expectedQty !== receivedQty;
  };

  const canConfirm = receipt && receipt.estado === 'PENDIENTE';
  const canCancelReceipt = receipt && receipt.estado !== 'CANCELADA';

  // ==================== RENDER ====================

  if (loading) {
    return (
      <Container>
        <LoadingState>Cargando detalle de recepción...</LoadingState>
      </Container>
    );
  }

  if (error || !receipt) {
    return (
      <Container>
        <ErrorState>{error || 'Recepción no encontrada'}</ErrorState>
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
          <Title>Recepción {receipt.codigo}</Title>
          <Subtitle>Creada el {formatDate(receipt.createdAt)}</Subtitle>
        </HeaderLeft>
        <StatusBadge $status={receipt.estado}>
          {PURCHASE_RECEIPT_STATUS_LABELS[receipt.estado]}
        </StatusBadge>
      </Header>

      {/* Acciones */}
      <Actions>
        <ActionButton $variant="primary" onClick={handleDownloadPDF}>
          📄 Descargar PDF
        </ActionButton>
        {canConfirm && (
          <ActionButton $variant="success" onClick={handleConfirm}>
            ✅ Confirmar Recepción
          </ActionButton>
        )}
        {canCancelReceipt && (
          <ActionButton $variant="danger" onClick={handleCancelReceipt}>
            ❌ Anular Recepción
          </ActionButton>
        )}
        {onClose && (
          <ActionButton $variant="secondary" onClick={onClose}>
            Cerrar
          </ActionButton>
        )}
      </Actions>

      {/* Alertas de estado */}
      {receipt.estado === 'CONFIRMADA' && (
        <AlertBox $type="success">
          ✅ Esta recepción ha sido confirmada. El inventario fue actualizado el {formatDate(receipt.updatedAt)}.
        </AlertBox>
      )}
      {receipt.estado === 'CANCELADA' && (
        <AlertBox $type="warning">
          ⚠️ Esta recepción ha sido cancelada y no afecta el inventario.
        </AlertBox>
      )}

      {/* Información General */}
      <Section>
        <SectionTitle>Información General</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Código</InfoLabel>
            <InfoValue>{receipt.codigo}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Fecha de Recepción</InfoLabel>
            <InfoValue>{formatDate(receipt.fechaRecepcion)}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Orden de Compra</InfoLabel>
            <InfoValue>
              {receipt.ordenCompra?.codigo ? (
                <OrderLink href={`#orden-${receipt.ordenCompraId}`}>
                  {receipt.ordenCompra.codigo}
                </OrderLink>
              ) : (
                'N/A'
              )}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Proveedor</InfoLabel>
            <InfoValue>
              {receipt.ordenCompra?.proveedor?.razonSocial || 'N/A'}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Almacén Destino</InfoLabel>
            <InfoValue>
              {receipt.almacen?.nombre || 'N/A'}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Estado</InfoLabel>
            <InfoValue>{PURCHASE_RECEIPT_STATUS_LABELS[receipt.estado]}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Última Actualización</InfoLabel>
            <InfoValue>{formatDate(receipt.updatedAt)}</InfoValue>
          </InfoItem>
        </InfoGrid>

        {receipt.observaciones && (
          <ObservationsBox>
            <strong>Observaciones:</strong> {receipt.observaciones}
          </ObservationsBox>
        )}
      </Section>

      {/* Resumen de Progreso */}
      <Section>
        <SectionTitle>Resumen de Recepción</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Productos en Orden</InfoLabel>
            <InfoValue>{receipt.ordenCompra?.items.length || 0} items</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Estado de Orden</InfoLabel>
            <InfoValue>{receipt.ordenCompra?.estado || 'N/A'}</InfoValue>
          </InfoItem>
        </InfoGrid>
      </Section>

      {/* Productos Recibidos */}
      <Section>
        <SectionTitle>Productos Recibidos ({receipt.items.length})</SectionTitle>
        <Table>
          <Thead>
            <tr>
              <Th>#</Th>
              <Th>Producto</Th>
              <Th>Ordenada Original</Th>
              <Th>Ya Recibida</Th>
              <Th>Pendiente</Th>
              <Th>En Esta Recepción</Th>
              <Th>Observaciones</Th>
            </tr>
          </Thead>
          <Tbody>
            {receipt.items.map((item, index) => {
              const ordenada = item.ordenCompraItem?.cantidadOrdenada || 0;
              const enEstaRecepcion = item.cantidadRecibida || 0;
              const totalRecibidaEnOC = item.ordenCompraItem?.cantidadRecibida || 0;
              const pendienteActual = item.ordenCompraItem?.cantidadPendiente || 0;
              
              // Si la recepción está CONFIRMADA: totalRecibidaEnOC YA incluye esta recepción
              // Si está PENDIENTE: totalRecibidaEnOC NO incluye esta recepción
              const yaRecibidaAntes = receipt.estado === 'CONFIRMADA' 
                ? totalRecibidaEnOC - enEstaRecepcion 
                : totalRecibidaEnOC;
              
              // Pendiente después de esta recepción
              const pendienteDespues = receipt.estado === 'CONFIRMADA'
                ? pendienteActual
                : pendienteActual - enEstaRecepcion;
              
              return (
                <Tr key={item.id}>
                  <Td>{index + 1}</Td>
                  <Td>
                    {item.producto?.codigo && <>{item.producto.codigo} - </>}
                    {item.producto?.nombre || 'N/A'}
                  </Td>
                  <Td>{ordenada}</Td>
                  <Td>{yaRecibidaAntes}</Td>
                  <Td>
                    <strong style={{ color: pendienteDespues > 0 ? '#f59e0b' : '#10b981' }}>
                      {pendienteDespues}
                    </strong>
                  </Td>
                  <Td>
                    <strong>{enEstaRecepcion}</strong>
                  </Td>
                  <Td>{item.observaciones || '-'}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        {receipt.items.some(item => {
          const pendiente = item.ordenCompraItem?.cantidadPendiente || 0;
          return pendiente > 0;
        }) && (
          <AlertBox $type="info">
            ℹ️ Esta es una recepción parcial. Quedan {
              receipt.items.reduce((sum, item) => sum + (item.ordenCompraItem?.cantidadPendiente || 0), 0)
            } unidades pendientes por recepcionar.
          </AlertBox>
        )}
        {receipt.estado === 'CONFIRMADA' && receipt.items.every(item => (item.ordenCompraItem?.cantidadPendiente || 0) === 0) && (
          <AlertBox $type="success">
            ✅ Recepción completada. Todos los productos de la orden fueron recibidos.
          </AlertBox>
        )}
      </Section>
    </Container>
  );
};

export default PurchaseReceiptDetail;
