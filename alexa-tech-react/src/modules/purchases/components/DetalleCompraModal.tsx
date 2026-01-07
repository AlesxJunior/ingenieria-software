import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../../../utils/api';
import { useNotification } from '../../../context/NotificationContext';
import { getWarehouseLabel } from '../../../constants/warehouses';
import { useClients } from '../../clients/context/ClientContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Section = styled.div`
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  background: #f1f3f5;
  padding: 8px 10px;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #555;
`;

const Td = styled.td`
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
  color: #333;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 500;
  ${p => p.$variant === 'secondary' ? `
    background: #6c757d;
    color: white;
    &:hover { background: #5a6268; }
  ` : `
    background: #0047b3;
    border-color: #0047b3;
    color: white;
    &:hover { background: #003a92; border-color: #003a92; }
  `}
`;

interface DetalleCompraModalProps {
  purchaseId: string;
  onClose: () => void;
}

interface PurchaseItem {
  productoId: string;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
}
interface PurchaseDetail {
  id: string;
  codigoOrden: string;
  proveedorId: string;
  almacenId: string;
  fechaEmision: string;
  tipoComprobante?: string;
  items: PurchaseItem[];
  subtotal: number;
  descuento?: number;
  total: number;
  formaPago?: string;
  fechaEntregaEstimada?: string;
  observaciones?: string;
  usuarioId: string;
  estado: 'Pendiente' | 'Recibida' | 'Cancelada';
}

const DetalleCompraModal: React.FC<DetalleCompraModalProps> = ({ purchaseId, onClose }) => {
  const { showError } = useNotification();
  const { getClientById } = useClients();
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await apiService.getPurchaseById(purchaseId);
        if (!response.success || !response.data) throw new Error(response.message || 'Error al cargar detalle');
        setPurchase(response.data as PurchaseDetail);
      } catch (err) {
        console.error('Error fetching purchase detail:', err);
        showError('No se pudo cargar el detalle de la compra');
      } finally {
        setLoading(false);
      }
    })();
  }, [purchaseId]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
  const proveedorNombre = (id: string) => {
    const prov = getClientById(id);
    if (!prov) return id;
    if (prov.tipoDocumento === 'RUC') return prov.razonSocial || id;
    return `${prov.nombres || ''} ${prov.apellidos || ''}`.trim() || id;
  };

  return (
    <Container>
      {loading ? (
        <p>Cargando...</p>
      ) : purchase ? (
        <>
          <Section>
            <strong>{purchase.codigoOrden}</strong>
            <div>Proveedor: {proveedorNombre(purchase.proveedorId)}</div>
            <div>Almacén: {getWarehouseLabel(purchase.almacenId)}</div>
            <div>Fecha Emisión: {new Date(purchase.fechaEmision).toLocaleDateString('es-PE')}</div>
            <div>Estado: {purchase.estado}</div>
            {purchase.fechaEntregaEstimada && <div>Entrega Estimada: {new Date(purchase.fechaEntregaEstimada).toLocaleDateString('es-PE')}</div>}
            {purchase.tipoComprobante && <div>Comprobante: {purchase.tipoComprobante}</div>}
            {purchase.formaPago && <div>Forma de Pago: {purchase.formaPago}</div>}
            {purchase.observaciones && <div>Observaciones: {purchase.observaciones}</div>}
          </Section>
          <Section>
            <Table>
              <thead>
                <tr>
                  <Th>Producto</Th>
                  <Th>Cantidad</Th>
                  <Th>Precio Unit</Th>
                  <Th>Subtotal</Th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((it, idx) => (
                  <tr key={idx}>
                    <Td>{it.nombreProducto || it.productoId}</Td>
                    <Td>{it.cantidad}</Td>
                    <Td>{formatCurrency(it.precioUnitario)}</Td>
                    <Td>{formatCurrency(it.cantidad * it.precioUnitario)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
          <Section>
            <div>Subtotal: {formatCurrency(purchase.subtotal)}</div>
            <div>Descuento: {formatCurrency(Number(purchase.descuento || 0))}</div>
            <div><strong>Total: {formatCurrency(purchase.total)}</strong></div>
          </Section>
          <Actions>
            <Button $variant="secondary" onClick={onClose}>Cerrar</Button>
          </Actions>
        </>
      ) : (
        <p>No se encontró información de la compra</p>
      )}
    </Container>
  );
};

export default DetalleCompraModal;