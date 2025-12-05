import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { MetodoPagoData } from '../../configuracion/services/configuracionApi';

// ============================================
// INTERFACES
// ============================================

interface CartItem {
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  stock: number;
}

interface ClientData {
  id: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  tipoDocumento: 'DNI' | 'CE' | 'RUC';
  numeroDocumento: string;
}

interface PaymentEntry {
  id: string;
  metodoPago: string;
  monto: string;
  referencia: string;
  tipo?: 'efectivo' | 'transferencia' | 'tarjeta' | 'yape' | 'plin' | 'otro';
  requiereReferencia?: boolean;
}

interface PaymentProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: PaymentConfirmData) => Promise<void>;
  // Datos de la venta
  tipoComprobante: string;
  cliente: ClientData | null;
  cart: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
  includeIGV: boolean;
  igvPorcentaje: number;
  // Métodos de pago disponibles
  metodosPago: MetodoPagoData[];
  // Estado de procesamiento
  isProcessing: boolean;
}

export interface PaymentConfirmData {
  formaPago: string;
  montoRecibido?: number;
  referencia?: string;
  cambio?: number;
  payments?: Array<{
    metodoPago: string;
    monto: number;
    referencia?: string;
  }>;
}

// ============================================
// STYLED COMPONENTS
// ============================================

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 10px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: calc(100vh - 20px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;

  h2 {
    margin: 0;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px;
  overflow: visible;
`;

const LeftPanel = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const RightPanel = styled.div`
  padding: 0;
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 6px;
  border-bottom: 2px solid #e5e7eb;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.8rem;

  &:last-child {
    border-bottom: none;
  }

  span:first-child {
    color: #6b7280;
  }

  span:last-child {
    font-weight: 500;
    color: #1f2937;
  }
`;

const ItemsList = styled.div`
  max-height: 80px;
  overflow-y: auto;
  margin-bottom: 10px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .item-name {
    flex: 1;
    color: #374151;
  }

  .item-qty {
    color: #6b7280;
    margin: 0 8px;
  }

  .item-total {
    font-weight: 600;
    color: #059669;
  }
`;

const TotalsCard = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #86efac;
`;

const TotalRow = styled.div<{ $isMain?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.$isMain ? '8px 0 0 0' : '4px 0'};
  font-size: ${props => props.$isMain ? '1.1rem' : '0.85rem'};
  font-weight: ${props => props.$isMain ? '700' : '400'};
  color: ${props => props.$isMain ? '#059669' : '#374151'};
  ${props => props.$isMain && 'border-top: 2px dashed #86efac; margin-top: 6px;'}
`;

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const PaymentMethodButton = styled.button<{ $selected?: boolean; $type?: string }>`
  padding: 10px 8px;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$selected ? '#eff6ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }

  .icon {
    font-size: 1.2rem;
  }

  .name {
    font-size: 0.7rem;
    font-weight: 500;
    color: ${props => props.$selected ? '#1d4ed8' : '#374151'};
  }
`;

const PaymentInputGroup = styled.div`
  margin-bottom: 10px;

  label {
    display: block;
    font-size: 0.8rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 4px;
  }

  input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const ChangeDisplay = styled.div<{ $show: boolean }>`
  background: ${props => props.$show ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : '#f3f4f6'};
  border: 1px solid ${props => props.$show ? '#f59e0b' : '#e5e7eb'};
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  margin-bottom: 10px;
  transition: all 0.3s;

  .label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 2px;
  }

  .amount {
    font-size: 1.3rem;
    font-weight: 700;
    color: ${props => props.$show ? '#d97706' : '#9ca3af'};
  }
`;

const MultiplePaymentsToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f1f5f9;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  label {
    font-size: 0.8rem;
    color: #374151;
    cursor: pointer;
  }
`;

const MultiplePaymentsList = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
`;

const PaymentEntryRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 100px 32px;
  gap: 6px;
  margin-bottom: 8px;
  align-items: center;

  select, input {
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  button {
    background: #fee2e2;
    border: none;
    color: #dc2626;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;

    &:hover {
      background: #fecaca;
    }
  }
`;

const AddPaymentButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #eff6ff;
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dbeafe;
  }
`;

const PaymentSummary = styled.div<{ $isValid: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.$isValid ? '#dcfce7' : '#fee2e2'};
  border-radius: 8px;
  margin-top: 10px;
  font-weight: 500;

  .label {
    color: ${props => props.$isValid ? '#166534' : '#991b1b'};
  }

  .amount {
    color: ${props => props.$isValid ? '#059669' : '#dc2626'};
  }
`;

const ModalFooter = styled.div`
  padding: 12px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    border: none;
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
    }
  ` : `
    background: white;
    border: 2px solid #e5e7eb;
    color: #6b7280;

    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #d1d5db;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// ============================================
// HELPER FUNCTIONS
// ============================================

const getMethodIcon = (tipo: string): string => {
  switch (tipo) {
    case 'efectivo': return '💵';
    case 'tarjeta': return '💳';
    case 'transferencia': return '🏦';
    case 'yape': return '📱';
    case 'plin': return '📲';
    default: return '💰';
  }
};

const redondearAlDecimo = (valor: number): number => {
  return Math.round(valor * 10) / 10;
};

// ============================================
// COMPONENT
// ============================================

export const PaymentProcessModal: React.FC<PaymentProcessModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tipoComprobante,
  cliente,
  cart,
  subtotal,
  igv,
  total,
  includeIGV,
  igvPorcentaje,
  metodosPago,
  isProcessing,
}) => {
  // Estados del pago
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [referencia, setReferencia] = useState<string>('');
  const [useMultiplePayments, setUseMultiplePayments] = useState(false);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);

  // Inicializar método de pago por defecto
  useEffect(() => {
    if (isOpen && metodosPago.length > 0 && !selectedMethod) {
      const defaultMethod = metodosPago.find(m => m.predeterminado) || metodosPago[0];
      setSelectedMethod(defaultMethod.nombre);
    }
  }, [isOpen, metodosPago, selectedMethod]);

  // Reset estados al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setMontoRecibido('');
      setReferencia('');
      setUseMultiplePayments(false);
      // Inicializar con el método por defecto y su información
      const defaultMethod = metodosPago.find(m => m.predeterminado) || metodosPago[0];
      const esEfectivo = defaultMethod?.tipo === 'efectivo';
      setPayments([{
        id: '1',
        metodoPago: defaultMethod?.nombre || 'Efectivo',
        monto: '',
        referencia: '',
        tipo: defaultMethod?.tipo,
        requiereReferencia: defaultMethod?.requiereReferencia ?? !esEfectivo,
      }]);
    }
  }, [isOpen, metodosPago]);

  // Obtener info del método seleccionado
  const selectedMethodInfo = metodosPago.find(m => m.nombre === selectedMethod);
  const isEfectivo = selectedMethodInfo?.tipo === 'efectivo';
  const requiresReference = selectedMethodInfo?.requiereReferencia ?? !isEfectivo;

  // Calcular cambio
  const montoRecibidoNum = parseFloat(montoRecibido) || 0;
  const cambio = redondearAlDecimo(montoRecibidoNum - total);
  const showCambio = isEfectivo && montoRecibidoNum > total;

  // Calcular suma de pagos múltiples considerando redondeo en efectivo
  const tieneEfectivoEnMultiple = payments.some(p => {
    const metodoInfo = metodosPago.find(m => m.nombre === p.metodoPago);
    return metodoInfo?.tipo === 'efectivo';
  });
  
  // Si hay efectivo en pagos múltiples, el total a pagar se redondea al décimo superior
  const totalAPagarMultiple = tieneEfectivoEnMultiple ? redondearAlDecimo(total) : total;
  
  const totalPagosMultiples = payments.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
  const isPagosCompletos = Math.abs(totalPagosMultiples - totalAPagarMultiple) < 0.01;

  // Validar si puede confirmar
  const canConfirm = useMultiplePayments
    ? isPagosCompletos && payments.every(p => {
        const montoValido = parseFloat(p.monto) > 0;
        const metodoValido = p.metodoPago && p.metodoPago.trim().length > 0;
        // Si requiere referencia, validar que exista
        const referenciaValida = p.requiereReferencia ? p.referencia.trim().length > 0 : true;
        return montoValido && metodoValido && referenciaValida;
      })
    : isEfectivo
      ? montoRecibidoNum >= total
      : requiresReference
        ? referencia.trim().length > 0
        : true;

  // Handlers
  const handleAddPayment = () => {
    const newId = (payments.length + 1).toString();
    const defaultMethod = metodosPago.find(m => m.predeterminado) || metodosPago[0];
    const esEfectivo = defaultMethod?.tipo === 'efectivo';
    setPayments([...payments, {
      id: newId,
      metodoPago: defaultMethod?.nombre || 'Efectivo',
      monto: '',
      referencia: '',
      tipo: defaultMethod?.tipo,
      requiereReferencia: defaultMethod?.requiereReferencia ?? !esEfectivo,
    }]);
  };

  const handleRemovePayment = (id: string) => {
    if (payments.length > 1) {
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  const handlePaymentChange = (id: string, field: keyof PaymentEntry, value: string) => {
    setPayments(payments.map(p => {
      if (p.id !== id) return p;
      
      // Si cambió el método de pago, actualizar tipo y requiereReferencia
      if (field === 'metodoPago') {
        const metodoInfo = metodosPago.find(m => m.nombre === value);
        const esEfectivo = metodoInfo?.tipo === 'efectivo';
        return {
          ...p,
          [field]: value,
          tipo: metodoInfo?.tipo,
          requiereReferencia: metodoInfo?.requiereReferencia ?? !esEfectivo,
          referencia: esEfectivo ? '' : p.referencia, // Limpiar referencia si es efectivo
        };
      }
      
      return { ...p, [field]: value };
    }));
  };

  const handleConfirm = async () => {
    const paymentData: PaymentConfirmData = useMultiplePayments
      ? {
          // Pagos múltiples
          formaPago: 'Múltiple',
          payments: payments.map(p => ({
            metodoPago: p.metodoPago,
            monto: parseFloat(p.monto) || 0,
            referencia: p.referencia || undefined,
          })),
        }
      : {
          // ✅ Pago único
          formaPago: selectedMethod,
          montoRecibido: isEfectivo ? montoRecibidoNum : undefined,
          referencia: requiresReference ? referencia : undefined,
          cambio: showCambio ? cambio : undefined,
          // ✅ CORRECCIÓN: monto del pago es el total de la venta, NO el monto recibido
          payments: [{
            metodoPago: selectedMethod,
            monto: Number(total), // Siempre el total de la venta
            referencia: requiresReference ? referencia : undefined,
          }],
        };

    await onConfirm(paymentData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canConfirm && !isProcessing) {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && !isProcessing && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <h2>💳 Procesar Pago</h2>
          <CloseButton onClick={onClose} disabled={isProcessing}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Panel Izquierdo - Resumen de Venta */}
          <LeftPanel>
            <SectionTitle>📄 Resumen de Venta</SectionTitle>
            
            <InfoCard>
              <InfoRow>
                <span>Comprobante</span>
                <span>{tipoComprobante}</span>
              </InfoRow>
              <InfoRow>
                <span>Cliente</span>
                <span>
                  {cliente
                    ? cliente.tipoDocumento === 'RUC'
                      ? cliente.razonSocial
                      : `${cliente.nombres} ${cliente.apellidos}`
                    : 'Cliente General'}
                </span>
              </InfoRow>
              {cliente && (
                <InfoRow>
                  <span>Documento</span>
                  <span>{cliente.tipoDocumento}: {cliente.numeroDocumento}</span>
                </InfoRow>
              )}
            </InfoCard>

            <SectionTitle>📦 Productos ({cart.length})</SectionTitle>
            <ItemsList>
              {cart.map((item) => (
                <ItemRow key={item.productId}>
                  <span className="item-name">{item.nombreProducto}</span>
                  <span className="item-qty">×{item.cantidad}</span>
                  <span className="item-total">S/ {(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                </ItemRow>
              ))}
            </ItemsList>

            <TotalsCard>
              <TotalRow>
                <span>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </TotalRow>
              {includeIGV && (
                <TotalRow>
                  <span>IGV ({igvPorcentaje}%)</span>
                  <span>S/ {igv.toFixed(2)}</span>
                </TotalRow>
              )}
              <TotalRow $isMain>
                <span>TOTAL A PAGAR</span>
                <span>S/ {total.toFixed(2)}</span>
              </TotalRow>
            </TotalsCard>
          </LeftPanel>

          {/* Panel Derecho - Método de Pago */}
          <RightPanel onKeyDown={handleKeyDown}>
            <SectionTitle>💰 Método de Pago</SectionTitle>

            {!useMultiplePayments && (
              <>
                <PaymentMethodsGrid>
                  {metodosPago.map((metodo) => (
                    <PaymentMethodButton
                      key={metodo.id}
                      $selected={selectedMethod === metodo.nombre}
                      $type={metodo.tipo}
                      onClick={() => setSelectedMethod(metodo.nombre)}
                    >
                      <span className="icon">{getMethodIcon(metodo.tipo)}</span>
                      <span className="name">{metodo.nombre}</span>
                    </PaymentMethodButton>
                  ))}
                </PaymentMethodsGrid>

                {isEfectivo ? (
                  <>
                    <PaymentInputGroup>
                      <label>💵 Monto Recibido</label>
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={montoRecibido}
                        onChange={(e) => setMontoRecibido(e.target.value)}
                        placeholder={`Mínimo S/ ${total.toFixed(2)}`}
                        autoFocus
                      />
                    </PaymentInputGroup>

                    <ChangeDisplay $show={showCambio}>
                      <div className="label">Cambio a entregar</div>
                      <div className="amount">S/ {showCambio ? cambio.toFixed(2) : '0.00'}</div>
                    </ChangeDisplay>
                  </>
                ) : requiresReference ? (
                  <PaymentInputGroup>
                    <label>🔢 N° de Operación / Voucher</label>
                    <input
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder={`Ingresa el código de ${selectedMethod}`}
                      autoFocus
                    />
                  </PaymentInputGroup>
                ) : null}
              </>
            )}

            <MultiplePaymentsToggle onClick={() => setUseMultiplePayments(!useMultiplePayments)}>
              <input
                type="checkbox"
                checked={useMultiplePayments}
                onChange={(e) => setUseMultiplePayments(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <label>💳 Usar múltiples métodos de pago</label>
            </MultiplePaymentsToggle>

            {useMultiplePayments && (
              <MultiplePaymentsList>
                {payments.map((payment) => {
                  const metodoInfo = metodosPago.find(m => m.nombre === payment.metodoPago);
                  const esEfectivoMultiple = metodoInfo?.tipo === 'efectivo';
                  const requiereRef = payment.requiereReferencia ?? (metodoInfo?.requiereReferencia ?? !esEfectivoMultiple);
                  
                  return (
                    <PaymentEntryRow key={payment.id}>
                      <select
                        value={payment.metodoPago}
                        onChange={(e) => handlePaymentChange(payment.id, 'metodoPago', e.target.value)}
                      >
                        {metodosPago.map((m) => (
                          <option key={m.id} value={m.nombre}>
                            {getMethodIcon(m.tipo)} {m.nombre}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step={esEfectivoMultiple ? "0.10" : "0.01"}
                        min="0"
                        placeholder="Monto"
                        value={payment.monto || ''}
                        onChange={(e) => handlePaymentChange(payment.id, 'monto', e.target.value)}
                      />
                      {requiereRef ? (
                        <input
                          type="text"
                          placeholder="Referencia *"
                          value={payment.referencia || ''}
                          onChange={(e) => handlePaymentChange(payment.id, 'referencia', e.target.value)}
                          required
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="-"
                          disabled
                          style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                        />
                      )}
                      <button
                        onClick={() => handleRemovePayment(payment.id)}
                        disabled={payments.length === 1}
                      >
                        🗑️
                      </button>
                    </PaymentEntryRow>
                  );
                })}

                <AddPaymentButton onClick={handleAddPayment}>
                  + Agregar otro método de pago
                </AddPaymentButton>

                <PaymentSummary $isValid={isPagosCompletos}>
                  <span className="label">
                    {isPagosCompletos ? '✅ Pago completo' : `⚠️ Falta: S/ ${(totalAPagarMultiple - totalPagosMultiples).toFixed(2)}`}
                  </span>
                  <span className="amount">
                    Total: S/ {totalPagosMultiples.toFixed(2)} / S/ {totalAPagarMultiple.toFixed(2)}
                    {tieneEfectivoEnMultiple && totalAPagarMultiple !== total && (
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', marginLeft: '4px' }}>
                        (redondeado)
                      </span>
                    )}
                  </span>
                </PaymentSummary>
              </MultiplePaymentsList>
            )}
          </RightPanel>
        </ModalBody>

        <ModalFooter>
          <Button $variant="secondary" onClick={onClose} disabled={isProcessing}>
            ❌ Cancelar
          </Button>
          <Button $variant="primary" onClick={handleConfirm} disabled={!canConfirm || isProcessing}>
            {isProcessing ? (
              <>
                <Spinner /> Procesando...
              </>
            ) : (
              <>✅ Confirmar Pago</>
            )}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PaymentProcessModal;
