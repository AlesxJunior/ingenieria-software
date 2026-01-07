import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSales } from '../context/SalesContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, Z_INDEX, TRANSITIONS } from '../../../styles/theme';
import { Button as SharedButton } from '../../../components/shared/Button';
import { Input as SharedInput } from '../../../components/shared/Input';
import { Select as SharedSelect } from '../../../components/shared/Select';
import { Label as SharedLabel } from '../../../components/shared/Label';

// ==================== TIPOS ====================
interface SaleItem {
  id: string;
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Sale {
  id: string;
  codigoVenta: string;
  total: number;
  subtotal: number;
  igv: number;
  items: SaleItem[];
}

interface CreditNoteItem {
  saleItemId: string;
  cantidad: number;
}

interface ModalNotaCreditoProps {
  sale: Sale;
  onClose: () => void;
  onSubmit: (data: {
    saleId: string;
    creditNoteReason: string;
    descripcion?: string;
    items: CreditNoteItem[];
    paymentMethod: 'Efectivo' | 'Transferencia' | 'Vale';
    cashSessionId?: string;
  }) => Promise<any>;
}

// ==================== MOTIVOS DE NC (SIMPLIFICADOS) ====================
// ✅ SIMPLIFICADO A 2 MOTIVOS: NC = Devolución física de productos
// Otros casos (errores de datos/precios) se manejan con edición directa o anulación
const CREDIT_NOTE_REASONS = {
  DevolucionTotal: {
    value: 'DevolucionTotal',
    label: 'Devolución Total',
    description: 'Cliente devuelve TODOS los productos (especificar motivo en observaciones)',
    requiresProducts: true,
    allowPartialReturn: false,  // ⚠️ DEBE devolver TODO
    revertsInventory: true,     // ✅ Revierte stock
    placeholder: 'Ej: Producto defectuoso, cliente insatisfecho, pedido equivocado, error de compra...',
  },
  DevolucionParcial: {
    value: 'DevolucionParcial',
    label: 'Devolución Parcial',
    description: 'Cliente devuelve ALGUNOS productos (especificar motivo en observaciones)',
    requiresProducts: true,
    allowPartialReturn: true,   // ✅ PUEDE ser parcial
    revertsInventory: true,     // ✅ Revierte stock
    placeholder: 'Ej: Producto con falla, talla incorrecta, cambio de opinión, cantidad incorrecta...',
  },
};

// ==================== COMPONENTE ====================
export const ModalNotaCredito: React.FC<ModalNotaCreditoProps> = ({ sale, onClose, onSubmit }) => {
  const { activeCashSession } = useSales();
  
  const [selectedReason, setSelectedReason] = useState<string>('DevolucionTotal');
  const [descripcion, setDescripcion] = useState('');
  const [itemsToReturn, setItemsToReturn] = useState<Map<string, number>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ✅ NUEVOS: Estados para modal de método de pago
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Vale'>('Vale');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Inicializar con devolución total por defecto
  useEffect(() => {
    if (selectedReason === 'DevolucionTotal') {
      const allItems = new Map<string, number>();
      sale.items.forEach(item => {
        allItems.set(item.id, item.cantidad);
      });
      setItemsToReturn(allItems);
    } else {
      setItemsToReturn(new Map());
    }
  }, [selectedReason, sale.items]);

  const handleQuantityChange = (itemId: string, cantidad: number) => {
    const newItems = new Map(itemsToReturn);
    if (cantidad > 0) {
      newItems.set(itemId, cantidad);
    } else {
      newItems.delete(itemId);
    }
    setItemsToReturn(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    sale.items.forEach(item => {
      const cantidadDevuelta = itemsToReturn.get(item.id) || 0;
      subtotal += cantidadDevuelta * Number(item.precioUnitario);
    });
    
    // ✅ Respetar si la venta original tenía IGV o no
    const igvOriginal = Number(sale.igv);
    const tieneIGV = igvOriginal > 0;
    
    const igv = tieneIGV ? subtotal * 0.18 : 0;
    const total = subtotal + igv;
    
    return { subtotal, igv, total };
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    const reasonConfig = CREDIT_NOTE_REASONS[selectedReason as keyof typeof CREDIT_NOTE_REASONS];

    // ✅ VALIDACIÓN 1: Siempre requiere productos (toda NC es devolución)
    if (itemsToReturn.size === 0) {
      setErrorMessage('Debes seleccionar al menos un producto a devolver');
      return;
    }

    // ✅ VALIDACIÓN 2: DevolucionTotal debe devolver TODO
    if (!reasonConfig.allowPartialReturn) {
      if (itemsToReturn.size !== sale.items.length) {
        setErrorMessage('Devolución Total requiere devolver todos los productos');
        return;
      }
      
      for (const item of sale.items) {
        const cantidadDevuelta = itemsToReturn.get(item.id) || 0;
        if (cantidadDevuelta !== item.cantidad) {
          setErrorMessage('Devolución Total requiere devolver la cantidad completa de todos los productos');
          return;
        }
      }
    }

    // ✅ VALIDACIÓN 3: Cantidades no exceden original
    for (const [itemId, cantidad] of itemsToReturn) {
      const originalItem = sale.items.find(i => i.id === itemId);
      if (!originalItem) continue;
      
      if (cantidad > originalItem.cantidad) {
        setErrorMessage(
          `La cantidad a devolver de "${originalItem.nombreProducto}" (${cantidad}) ` +
          `excede la cantidad original (${originalItem.cantidad})`
        );
        return;
      }
    }

    // ✅ NUEVO: Mostrar modal de selección de método en lugar de confirmar directamente
    setShowPaymentModal(true);
  };

  // ✅ NUEVO: Manejar confirmación con método de pago
  const handleConfirmPayment = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage('');

      // Preparar items para NC
      const itemsArray = Array.from(itemsToReturn.entries()).map(([saleItemId, cantidad]) => ({
        saleItemId,
        cantidad,
      }));

      // ✅ Obtener cashSessionId del contexto
      const cashSessionId = activeCashSession?.id;
      
      // Validar que hay sesión activa si el método es Efectivo
      if (paymentMethod === 'Efectivo' && !cashSessionId) {
        setErrorMessage('No hay sesión de caja activa. Debe abrir una caja para realizar reembolsos en efectivo.');
        setShowPaymentModal(false);
        setIsProcessing(false);
        return;
      }

      const payload = {
        saleId: sale.id,
        creditNoteReason: selectedReason,
        descripcion: descripcion.trim() || undefined,
        items: itemsArray,
        paymentMethod: paymentMethod,
        cashSessionId: paymentMethod === 'Efectivo' ? cashSessionId : undefined,
      };

      const result = await onSubmit(payload);

      // ✅ Descargar PDF automáticamente después de emitir NC
      if (result && result.creditNote && result.creditNote.id) {
        await downloadCreditNotePDF(result.creditNote.id);
      }

      setShowPaymentModal(false);
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al emitir la nota de crédito');
      setShowPaymentModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ NUEVO: Descargar PDF de Nota de Crédito
  const downloadCreditNotePDF = async (creditNoteId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/credit-notes/${creditNoteId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `nota-credito-${creditNoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error descargando PDF:', error);
      // No lanzar error aquí para no interrumpir el flujo principal
    }
  };

  const { subtotal, igv, total } = calculateTotals();
  const reasonConfig = CREDIT_NOTE_REASONS[selectedReason as keyof typeof CREDIT_NOTE_REASONS];

  // ✅ Botón deshabilitado solo si no hay productos seleccionados
  const isButtonDisabled = isProcessing || total === 0;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Emitir Nota de Crédito</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Información de la venta */}
          <InfoSection>
            <InfoLabel>Venta:</InfoLabel>
            <InfoValue>{sale.codigoVenta}</InfoValue>
            <InfoLabel>Total Original:</InfoLabel>
            <InfoValue>S/ {Number(sale.total).toFixed(2)}</InfoValue>
          </InfoSection>

          {/* Selector de motivo */}
          <FormGroup>
            <Label>Motivo de la Nota de Crédito *</Label>
            <Select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              disabled={isProcessing}
            >
              {Object.values(CREDIT_NOTE_REASONS).map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </Select>
            <HelpText>
              <strong>{reasonConfig.label}</strong><br />
              {reasonConfig.description}<br />
              <span style={{ 
                color: reasonConfig.revertsInventory ? '#e74c3c' : '#3498db',
                fontWeight: '600'
              }}>
                {reasonConfig.revertsInventory 
                  ? '⚠️ Este motivo REVIERTE el inventario (productos regresan al almacén)' 
                  : 'ℹ️ Este motivo NO afecta el inventario (solo ajuste contable)'}
              </span>
            </HelpText>
          </FormGroup>

          {/* Productos a devolver */}
          <FormGroup>
            <Label>Productos a Devolver *</Label>
            <ProductsTable>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cant. Original</th>
                  <th>Cant. a Devolver</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map(item => {
                  const cantidadDevuelta = itemsToReturn.get(item.id) || 0;
                  const subtotalItem = cantidadDevuelta * Number(item.precioUnitario);

                  return (
                    <tr key={item.id}>
                      <td>{item.nombreProducto}</td>
                      <td>S/ {Number(item.precioUnitario).toFixed(2)}</td>
                      <td>{item.cantidad}</td>
                      <td>
                        <QuantityInput
                          type="number"
                          min="0"
                          max={item.cantidad}
                          value={cantidadDevuelta}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          disabled={isProcessing || selectedReason === 'DevolucionTotal'}
                        />
                      </td>
                      <td>S/ {subtotalItem.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </ProductsTable>
          </FormGroup>

          {/* Observaciones */}
          <FormGroup>
            <Label>Observaciones</Label>
            <TextArea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={CREDIT_NOTE_REASONS[selectedReason as keyof typeof CREDIT_NOTE_REASONS]?.placeholder || 'Detalles adicionales sobre la nota de crédito...'}
              disabled={isProcessing}
            />
            <HelpText style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Especifica el motivo de la devolución (ej: producto defectuoso, error en pedido, etc.)
            </HelpText>
          </FormGroup>

          {/* Totales */}
          <TotalsSection>
            <TotalRow>
              <span>Subtotal:</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </TotalRow>
            <TotalRow>
              <span>IGV (18%):</span>
              <span>S/ {igv.toFixed(2)}</span>
            </TotalRow>
            <TotalRow $highlight>
              <span>Total Nota de Crédito:</span>
              <span>S/ {total.toFixed(2)}</span>
            </TotalRow>
          </TotalsSection>

          {/* Mensaje de error */}
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose} disabled={isProcessing}>
            Cancelar
          </CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={isButtonDisabled}>
            {isProcessing ? 'Procesando...' : 'Emitir Nota de Crédito'}
          </SubmitButton>
        </ModalFooter>
      </ModalContent>

      {/* ✅ NUEVO: Modal de selección de método de pago */}
      {showPaymentModal && (
        <PaymentModalOverlay onClick={(e) => e.stopPropagation()}>
          <PaymentModalContent onClick={(e) => e.stopPropagation()}>
            <h3>💰 ¿Cómo desea procesar el crédito?</h3>
            
            <InfoBox>
              <p><strong>Monto total de la NC:</strong> S/ {total.toFixed(2)}</p>
            </InfoBox>

            <PaymentOptions>
              <PaymentOption
                $selected={paymentMethod === 'Efectivo'}
                onClick={() => setPaymentMethod('Efectivo')}
              >
                <input
                  type="radio"
                  checked={paymentMethod === 'Efectivo'}
                  onChange={() => setPaymentMethod('Efectivo')}
                />
                <div>
                  <strong>💵 Reembolsar en efectivo ahora</strong>
                  <span>Se registrará EGRESO automático en caja</span>
                </div>
              </PaymentOption>

              <PaymentOption
                $selected={paymentMethod === 'Transferencia'}
                onClick={() => setPaymentMethod('Transferencia')}
              >
                <input
                  type="radio"
                  checked={paymentMethod === 'Transferencia'}
                  onChange={() => setPaymentMethod('Transferencia')}
                />
                <div>
                  <strong>🏦 Transferencia bancaria</strong>
                  <span>Se procesará fuera de caja</span>
                </div>
              </PaymentOption>

              <PaymentOption
                $selected={paymentMethod === 'Vale'}
                onClick={() => setPaymentMethod('Vale')}
              >
                <input
                  type="radio"
                  checked={paymentMethod === 'Vale'}
                  onChange={() => setPaymentMethod('Vale')}
                />
                <div>
                  <strong>🎫 Generar vale (crédito a favor)</strong>
                  <span>Cliente usa en futuras compras</span>
                </div>
              </PaymentOption>
            </PaymentOptions>

            {paymentMethod === 'Efectivo' && (
              <AlertBox $type="warning">
                ⚠️ Se creará EGRESO de S/ {total.toFixed(2)} en caja.
                Entrega el efectivo al cliente.
              </AlertBox>
            )}

            {paymentMethod === 'Vale' && (
              <AlertBox $type="info">
                ℹ️ Cliente recibirá PDF como vale.
                No habrá movimiento de caja.
              </AlertBox>
            )}

            <PaymentModalActions>
              <CancelButton onClick={() => setShowPaymentModal(false)}>
                Cancelar
              </CancelButton>
              <SubmitButton onClick={handleConfirmPayment} disabled={isProcessing}>
                {isProcessing ? 'Procesando...' : 'Confirmar y Emitir NC'}
              </SubmitButton>
            </PaymentModalActions>
          </PaymentModalContent>
        </PaymentModalOverlay>
      )}
    </ModalOverlay>
  );
};

// ==================== STYLED COMPONENTS ====================
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #555;
`;

const InfoValue = styled.span`
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const HelpText = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;

  th {
    background: #f8f9fa;
    padding: 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #555;
    border-bottom: 2px solid #ddd;
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const QuantityInput = styled.input`
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TotalsSection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
`;

const TotalRow = styled.div<{ $highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: ${props => props.$highlight ? '1.2rem' : '1rem'};
  font-weight: ${props => props.$highlight ? '700' : '500'};
  color: ${props => props.$highlight ? '#667eea' : '#333'};
  border-top: ${props => props.$highlight ? '2px solid #ddd' : 'none'};
  margin-top: ${props => props.$highlight ? '0.5rem' : '0'};
  padding-top: ${props => props.$highlight ? '0.75rem' : '0.5rem'};
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid #c33;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  background: white;
  color: #555;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f5f5f5;
    border-color: #999;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ✅ NUEVOS: Estilos para modal de método de pago
const PaymentModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100; /* Mayor que el modal principal */
`;

const PaymentModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

  h3 {
    margin: 0 0 20px;
    font-size: 20px;
    color: #2c3e50;
  }
`;

const InfoBox = styled.div`
  background: #ecf0f1;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;

  p {
    margin: 0;
    font-size: 14px;
    color: #2c3e50;
  }
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const PaymentOption = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 2px solid ${props => props.$selected ? '#3498db' : '#dfe6e9'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$selected ? '#e8f4fd' : 'white'};

  &:hover {
    border-color: #3498db;
  }

  input[type="radio"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  div {
    flex: 1;

    strong {
      display: block;
      font-size: 14px;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    span {
      display: block;
      font-size: 12px;
      color: #7f8c8d;
    }
  }
`;

const AlertBox = styled.div<{ $type: 'warning' | 'info' }>`
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 20px;
  background: ${props => props.$type === 'warning' ? '#fff3cd' : '#d1ecf1'};
  border-left: 4px solid ${props => props.$type === 'warning' ? '#ffc107' : '#17a2b8'};
  color: ${props => props.$type === 'warning' ? '#856404' : '#0c5460'};
`;

const PaymentModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;
