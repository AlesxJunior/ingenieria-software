/**
 * COMPONENTE: PurchaseReceiptForm
 * Formulario para crear recepciones de compra
 * Fase 3 - Task 8
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { purchaseReceiptService, purchaseOrderService } from '../services';
import type {
  PurchaseReceipt,
  PurchaseOrder,
  CreatePurchaseReceiptDto,
  CreatePurchaseReceiptItemDto,
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { media } from '../../../styles/breakpoints';

// ==================== TIPOS ====================

interface PurchaseReceiptFormProps {
  preselectedOrderId?: string;
  onSuccess?: (receipt: PurchaseReceipt) => void;
  onCancel?: () => void;
}

interface FormData {
  ordenCompraId: string;
  almacenId: string;
  fechaRecepcion: string;
  guiaRemision?: string;
  transportista?: string;
  condicionMercancia?: string;
  items: CreatePurchaseReceiptItemDto[];
  observaciones?: string;
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
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 16px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  
  ${media.mobile} {
    font-size: 16px;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  ${media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #555;
`;

const RequiredMark = styled.span`
  color: #dc3545;
  margin-left: 4px;
`;

const Select = styled.select<{ $error?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.$error ? '#dc3545' : '#ddd'};
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  background-color: white;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#dc3545' : '#007bff'};
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Input = styled.input<{ $error?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.$error ? '#dc3545' : '#ddd'};
  border-radius: 5px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#dc3545' : '#007bff'};
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #dc3545;
`;

const OrderInfo = styled.div`
  padding: 16px;
  background-color: #e7f3ff;
  border: 1px solid #007bff;
  border-radius: 5px;
  margin-top: 8px;
`;

const OrderInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemsSection = styled.div`
  margin-top: 16px;
`;

const ItemsTable = styled.div`
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const Thead = styled.thead`
  background-color: #f8f9fa;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
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
  padding: 8px 12px;
  font-size: 14px;
`;

const ItemInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid ${props => props.$error ? '#dc3545' : '#ddd'};
  border-radius: 4px;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#dc3545' : '#007bff'};
  }

  &:disabled {
    background-color: #f5f5f5;
  }
`;

const WarningText = styled.span`
  font-size: 11px;
  color: #856404;
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  
  ${media.mobile} {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.$variant === 'secondary' ? '#6c757d' : '#28a745'};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${props => props.$variant === 'secondary' ? '#5a6268' : '#218838'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${media.mobile} {
    width: 100%;
  }
`;

const EmptyItemsMessage = styled.div`
  text-align: center;
  padding: 32px;
  color: #666;
  font-size: 14px;
`;

// ==================== COMPONENTE ====================

const PurchaseReceiptForm: React.FC<PurchaseReceiptFormProps> = ({
  preselectedOrderId,
  onSuccess,
  onCancel,
}) => {
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Estados
  const [formData, setFormData] = useState<FormData>({
    ordenCompraId: preselectedOrderId || '',
    almacenId: '',
    fechaRecepcion: new Date().toISOString().split('T')[0],
    guiaRemision: '',
    transportista: '',
    condicionMercancia: 'BUENA',
    items: [],
    observaciones: '',
  });

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [availableOrders, setAvailableOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  useEffect(() => {
    if (formData.ordenCompraId) {
      fetchOrderDetails(formData.ordenCompraId);
    }
  }, [formData.ordenCompraId]);

  // ==================== FUNCIONES ====================

  const fetchAvailableOrders = async () => {
    try {
      // Obtener órdenes en estados que permiten crear recepciones
      const response = await purchaseOrderService.getPurchaseOrders({
        limit: 100,
      });

      // Filtrar solo órdenes en estados válidos para recibir
      const validOrders = response.data.filter((order: PurchaseOrder) => 
        ['CONFIRMADA', 'EN_RECEPCION', 'PARCIAL'].includes(order.estado)
      );

      setAvailableOrders(validOrders);
    } catch (err: any) {
      showNotification('Error al cargar órdenes disponibles', 'error');
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await purchaseOrderService.getPurchaseOrderById(orderId);
      const order = response.data;
      
      setSelectedOrder(order);

      // Inicializar items con cantidades PENDIENTES (no la cantidad total)
      const receiptItems: CreatePurchaseReceiptItemDto[] = order.items
        .filter(item => item.cantidadPendiente > 0) // Solo items con pendientes
        .map(item => ({
          ordenCompraItemId: item.id,
          productoId: item.productoId,
          cantidadRecibida: item.cantidadPendiente, // Pre-llenar con cantidad pendiente
          cantidadAceptada: item.cantidadPendiente, // Por defecto, todo aceptado
          cantidadRechazada: 0,
          estadoQC: 'APROBADO',
          numeroLote: '',
          fechaVencimiento: undefined,
          observaciones: '',
        }));

      setFormData(prev => ({
        ...prev,
        almacenId: order.almacenDestinoId || '', // Pre-llenar con almacén de la orden
        items: receiptItems,
      }));
    } catch (err: any) {
      showNotification('Error al cargar detalles de la orden', 'error');
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleItemChange = (index: number, field: keyof CreatePurchaseReceiptItemDto, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const currentItem = { ...newItems[index], [field]: value };
      
      // Si se modifica cantidadRecibida, ajustar cantidadAceptada automáticamente
      // manteniendo la proporción con cantidadRechazada
      if (field === 'cantidadRecibida') {
        const newCantidadRecibida = Number(value) || 0;
        const cantidadRechazada = currentItem.cantidadRechazada || 0;
        // cantidadAceptada = cantidadRecibida - cantidadRechazada
        currentItem.cantidadAceptada = Math.max(0, newCantidadRecibida - cantidadRechazada);
      }
      
      // Si se modifica cantidadRechazada, ajustar cantidadAceptada
      if (field === 'cantidadRechazada') {
        const cantidadRechazada = Number(value) || 0;
        const cantidadRecibida = currentItem.cantidadRecibida || 0;
        currentItem.cantidadAceptada = Math.max(0, cantidadRecibida - cantidadRechazada);
      }
      
      newItems[index] = currentItem;
      return { ...prev, items: newItems };
    });
  };

  const getExpectedQuantity = (productId: string): number => {
    if (!selectedOrder) return 0;
    const item = selectedOrder.items.find(i => i.productoId === productId);
    // Retornar cantidad PENDIENTE (no la cantidad total ordenada)
    return item?.cantidadPendiente || 0;
  };

  const getProductName = (productId: string): string => {
    if (!selectedOrder) return '';
    const item = selectedOrder.items.find(i => i.productoId === productId);
    return item?.producto ? `${item.producto.codigo} - ${item.producto.nombre}` : '';
  };

  const hasQuantityWarning = (productId: string, receivedQty: number): boolean => {
    const expected = getExpectedQuantity(productId);
    return receivedQty !== expected;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ordenCompraId) {
      newErrors.ordenCompraId = 'Debe seleccionar una orden de compra';
    }

    if (!formData.fechaRecepcion) {
      newErrors.fechaRecepcion = 'Debe ingresar la fecha de recepción';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'No hay productos para recepcionar';
      showNotification('No hay productos para recepcionar', 'error');
    }

    formData.items.forEach((item, index) => {
      if (!item.cantidadRecibida || item.cantidadRecibida <= 0) {
        newErrors[`item_${index}_cantidad`] = 'Cantidad inválida';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      showNotification('Error: Usuario no autenticado', 'error');
      return;
    }

    // Confirmar si hay diferencias en cantidades
    const hasWarnings = formData.items.some(item => 
      hasQuantityWarning(item.productoId, item.cantidadRecibida)
    );

    if (hasWarnings) {
      const confirmDiff = confirm(
        'Algunas cantidades recibidas son diferentes a las esperadas. ¿Desea continuar?'
      );
      if (!confirmDiff) {
        return;
      }
    }

    setLoading(true);

    try {
      const createData: CreatePurchaseReceiptDto = {
        ordenCompraId: formData.ordenCompraId,
        almacenId: formData.almacenId,
        recibidoPorId: user.id,
        fechaRecepcion: formData.fechaRecepcion,
        guiaRemision: formData.guiaRemision,
        transportista: formData.transportista,
        condicionMercancia: formData.condicionMercancia,
        items: formData.items,
        observaciones: formData.observaciones,
      };

      const response = await purchaseReceiptService.createPurchaseReceipt(createData);
      showNotification('Recepción creada exitosamente', 'success');

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear recepción';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <Container>
      <Header>
        <Title>Nueva Recepción de Compra</Title>
        <Subtitle>Complete los datos para registrar la recepción de productos</Subtitle>
      </Header>

      <Form onSubmit={handleSubmit}>
        {/* Sección: Información General */}
        <Section>
          <SectionTitle>Información General</SectionTitle>
          <Row>
            <FormGroup>
              <Label>
                Orden de Compra
                <RequiredMark>*</RequiredMark>
              </Label>
              <Select
                value={formData.ordenCompraId}
                onChange={(e) => handleInputChange('ordenCompraId', e.target.value)}
                $error={!!errors.ordenCompraId}
                disabled={loading || !!preselectedOrderId}
              >
                <option value="">Seleccione una orden</option>
                {availableOrders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.codigo} - {order.proveedor?.razonSocial}
                  </option>
                ))}
              </Select>
              {errors.ordenCompraId && <ErrorText>{errors.ordenCompraId}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>
                Fecha de Recepción
                <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="date"
                value={formData.fechaRecepcion}
                onChange={(e) => handleInputChange('fechaRecepcion', e.target.value)}
                $error={!!errors.fechaRecepcion}
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.fechaRecepcion && <ErrorText>{errors.fechaRecepcion}</ErrorText>}
            </FormGroup>
          </Row>

          {/* Info de la orden seleccionada */}
          {selectedOrder && (
            <OrderInfo>
              <OrderInfoRow>
                <strong>Código:</strong>
                <span>{selectedOrder.codigo}</span>
              </OrderInfoRow>
              <OrderInfoRow>
                <strong>Proveedor:</strong>
                <span>{selectedOrder.proveedor?.razonSocial}</span>
              </OrderInfoRow>
              <OrderInfoRow>
                <strong>Almacén Destino:</strong>
                <span>{selectedOrder.almacenDestino?.nombre}</span>
              </OrderInfoRow>
              <OrderInfoRow>
                <strong>Productos:</strong>
                <span>{selectedOrder.items.length} items</span>
              </OrderInfoRow>
            </OrderInfo>
          )}

          <FormGroup>
            <Label>Observaciones</Label>
            <TextArea
              value={formData.observaciones || ''}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Ingrese observaciones sobre la recepción (opcional)"
              disabled={loading}
            />
          </FormGroup>
        </Section>

        {/* Sección: Productos */}
        <ItemsSection>
          <SectionTitle>Productos a Recepcionar</SectionTitle>

          {formData.items.length === 0 ? (
            <EmptyItemsMessage>
              Seleccione una orden de compra para ver los productos
            </EmptyItemsMessage>
          ) : (
            <ItemsTable>
              <Table>
                <Thead>
                  <tr>
                    <Th>Producto</Th>
                    <Th>Cant. Esperada</Th>
                    <Th>Cant. Recibida</Th>
                    <Th>Observaciones</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {formData.items.map((item, index) => {
                    const expected = getExpectedQuantity(item.productoId);
                    const hasWarning = hasQuantityWarning(item.productoId, item.cantidadRecibida);
                    
                    return (
                      <Tr key={index} $warning={hasWarning}>
                        <Td>{getProductName(item.productoId)}</Td>
                        <Td>
                          <strong>{expected}</strong>
                        </Td>
                        <Td>
                          <ItemInput
                            type="number"
                            min="0"
                            step="1"
                            value={item.cantidadRecibida || ''}
                            onChange={(e) => handleItemChange(index, 'cantidadRecibida', Number(e.target.value))}
                            $error={!!errors[`item_${index}_cantidad`]}
                            disabled={loading}
                          />
                          {hasWarning && (
                            <WarningText>
                              ⚠️ Diferente a lo esperado
                            </WarningText>
                          )}
                          {errors[`item_${index}_cantidad`] && (
                            <ErrorText>{errors[`item_${index}_cantidad`]}</ErrorText>
                          )}
                        </Td>
                        <Td>
                          <ItemInput
                            type="text"
                            value={item.observaciones || ''}
                            onChange={(e) => handleItemChange(index, 'observaciones', e.target.value)}
                            placeholder="Opcional"
                            disabled={loading}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </ItemsTable>
          )}
        </ItemsSection>

        {/* Acciones */}
        <Actions>
          <Button type="button" $variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || formData.items.length === 0}>
            {loading ? 'Creando...' : 'Crear Recepción'}
          </Button>
        </Actions>
      </Form>
    </Container>
  );
};

export default PurchaseReceiptForm;
