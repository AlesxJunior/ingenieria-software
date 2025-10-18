import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useClients } from '../context/ClientContext';
import { useNotification } from '../context/NotificationContext';
import { WAREHOUSE_OPTIONS } from '../utils/warehouses';
import { apiService } from '../utils/api';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  label { font-weight: 500; }
  input, select, textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  .error { color: #dc3545; font-size: 12px; }
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

interface ItemForm {
  productoId: string;
  nombreProducto?: string;
  cantidad: string;
  precioUnitario: string;
}

interface NuevaCompraModalProps {
  onClose: () => void;
}

const NuevaCompraModal: React.FC<NuevaCompraModalProps> = ({ onClose }) => {
  const { clients } = useClients();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [proveedorId, setProveedorId] = useState('');
  const [almacenId, setAlmacenId] = useState('');
  const todayIso = new Date().toISOString().slice(0, 10);
  const [fechaEmision, setFechaEmision] = useState(todayIso);
  const [tipoComprobante, setTipoComprobante] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState('');
  const [items, setItems] = useState<ItemForm[]>([{
    productoId: '', nombreProducto: '', cantidad: '1', precioUnitario: '0'
  }]);

  const proveedores = useMemo(() => {
    return clients.filter(c => (c.tipoEntidad === 'Proveedor' || c.tipoEntidad === 'Ambos') && c.isActive);
  }, [clients]);

  const validate = (): boolean => {
    const errs: Record<string, string | undefined> = {};
    if (!proveedorId) errs.proveedorId = 'Proveedor es requerido';
    if (!almacenId) errs.almacenId = 'Almacén es requerido';
    if (!fechaEmision) errs.fechaEmision = 'Fecha de emisión es requerida';
    if (!items.length) errs.items = 'Debe incluir al menos un item';
    items.forEach((it, idx) => {
      if (!it.productoId) errs[`items.${idx}.productoId`] = 'Producto requerido';
      const c = Number(it.cantidad);
      if (!Number.isFinite(c) || c <= 0) errs[`items.${idx}.cantidad`] = 'Cantidad > 0';
      const p = Number(it.precioUnitario);
      if (!Number.isFinite(p) || p <= 0) errs[`items.${idx}.precioUnitario`] = 'Precio > 0';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddItem = () => {
    setItems(prev => [...prev, { productoId: '', nombreProducto: '', cantidad: '1', precioUnitario: '0' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemForm, value: string) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      const payload = {
        proveedorId,
        almacenId,
        fechaEmision,
        tipoComprobante: tipoComprobante || undefined,
        items: items.map(it => ({
          productoId: it.productoId,
          nombreProducto: it.nombreProducto || undefined,
          cantidad: Number(it.cantidad),
          precioUnitario: Number(it.precioUnitario)
        })),
        formaPago: formaPago || undefined,
        observaciones: observaciones || undefined,
        fechaEntregaEstimada: fechaEntregaEstimada || undefined,
      };
      const response = await apiService.createPurchase(payload);
      if (!response.success) {
        throw new Error(response.message || 'Error al registrar compra');
      }
      showSuccess('Orden de compra creada exitosamente');
      onClose();
    } catch (err) {
      console.error('Error creating purchase:', err);
      showError('No se pudo crear la orden de compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGrid>
        <FormGroup>
          <label htmlFor="proveedorId">Proveedor *</label>
          <select id="proveedorId" value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
            <option value="">Selecciona proveedor</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.razonSocial || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || p.email}</option>
            ))}
          </select>
          {errors.proveedorId && <span className="error">{errors.proveedorId}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="almacenId">Almacén *</label>
          <select id="almacenId" value={almacenId} onChange={e => setAlmacenId(e.target.value)}>
            <option value="">Selecciona almacén</option>
            {WAREHOUSE_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
          {errors.almacenId && <span className="error">{errors.almacenId}</span>}
        </FormGroup>

        <FormGroup>
          <label htmlFor="fechaEmision">Fecha de Emisión *</label>
          <input id="fechaEmision" type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} />
          {errors.fechaEmision && <span className="error">{errors.fechaEmision}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="fechaEntregaEstimada">Fecha de Entrega Estimada</label>
          <input id="fechaEntregaEstimada" type="date" value={fechaEntregaEstimada} onChange={e => setFechaEntregaEstimada(e.target.value)} />
        </FormGroup>

        <FormGroup>
          <label htmlFor="tipoComprobante">Tipo de Comprobante</label>
          <select id="tipoComprobante" value={tipoComprobante} onChange={e => setTipoComprobante(e.target.value)}>
            <option value="">Selecciona</option>
            <option value="Factura">Factura</option>
            <option value="Boleta">Boleta</option>
          </select>
        </FormGroup>
        <FormGroup>
          <label htmlFor="formaPago">Forma de Pago</label>
          <select id="formaPago" value={formaPago} onChange={e => setFormaPago(e.target.value)}>
            <option value="">Selecciona</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </FormGroup>
      </FormGrid>

      <div>
        <h4>Items de Compra</h4>
        {errors.items && <span className="error">{errors.items}</span>}
        {items.map((it, idx) => (
          <FormGrid key={idx}>
            <FormGroup>
              <label>Producto ID *</label>
              <input value={it.productoId} onChange={e => handleItemChange(idx, 'productoId', e.target.value)} />
              {errors[`items.${idx}.productoId`] && <span className="error">{errors[`items.${idx}.productoId`]}</span>}
            </FormGroup>
            <FormGroup>
              <label>Nombre del Producto</label>
              <input value={it.nombreProducto || ''} onChange={e => handleItemChange(idx, 'nombreProducto', e.target.value)} />
            </FormGroup>
            <FormGroup>
              <label>Cantidad *</label>
              <input type="number" min={1} value={it.cantidad} onChange={e => handleItemChange(idx, 'cantidad', e.target.value)} />
              {errors[`items.${idx}.cantidad`] && <span className="error">{errors[`items.${idx}.cantidad`]}</span>}
            </FormGroup>
            <FormGroup>
              <label>Precio Unitario *</label>
              <input type="number" min={0} step="0.01" value={it.precioUnitario} onChange={e => handleItemChange(idx, 'precioUnitario', e.target.value)} />
              {errors[`items.${idx}.precioUnitario`] && <span className="error">{errors[`items.${idx}.precioUnitario`]}</span>}
            </FormGroup>
            <FormGroup>
              <Button type="button" $variant="secondary" onClick={() => handleRemoveItem(idx)}>Eliminar</Button>
            </FormGroup>
          </FormGrid>
        ))}
        <Button type="button" $variant="secondary" onClick={handleAddItem}>Agregar Item</Button>
      </div>

      <FormGroup>
        <label htmlFor="observaciones">Observaciones</label>
        <textarea id="observaciones" rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
      </FormGroup>

      <Actions>
        <Button type="button" $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" $variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Registrar'}</Button>
      </Actions>
    </Form>
  );
};

export default NuevaCompraModal;