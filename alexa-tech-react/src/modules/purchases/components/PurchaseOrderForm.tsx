/**
 * COMPONENTE: PurchaseOrderForm
 * Formulario para crear/editar órdenes de compra
 * Fase 2 - Task 5
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { purchaseOrderService } from '../services';
import type {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  CreatePurchaseOrderItemDto,
  PurchaseOrderStatus,
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { useClients } from '../../../context/ClientContext';
import { useProducts } from '../../../context/ProductContext';
import { almacenesApi } from '../../../services/almacenesApi';  // ✅ CORREGIDO: usar almacenesApi
import NuevoProductoModal from '../../products/components/NuevoProductoModal';
import { media } from '../../../styles/breakpoints';

// ==================== TIPOS ====================

interface PurchaseOrderFormProps {
  order?: PurchaseOrder;
  mode?: 'create' | 'edit' | 'view';  // Modo del formulario
  onSuccess?: (order: PurchaseOrder) => void;
  onCancel?: () => void;
}

interface FormData {
  proveedorId: string;
  almacenDestinoId: string;
  fechaEntregaEsperada?: string; // Fecha ISO string
  moneda?: string; // 'PEN' | 'USD'
  condicionesPago?: string;
  items: Array<CreatePurchaseOrderItemDto & { incluyeIGV?: boolean }>;  // ✅ Agregado incluyeIGV
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
  font-size: 11px;
  color: #dc3545;
  display: block;
  margin-top: 2px;
  font-weight: 500;
`;

const ItemsSection = styled.div`
  margin-top: 16px;
`;

const ItemsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const AddItemButton = styled.button`
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #218838;
  }
`;

const ItemsTable = styled.div`
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
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

const Tr = styled.tr`
  border-bottom: 1px solid #dee2e6;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const Td = styled.td`
  padding: 8px 12px;
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
`;

const ItemSelect = styled.select<{ $error?: boolean }>`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid ${props => props.$error ? '#dc3545' : '#ddd'};
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background-color: ${props => props.$error ? '#fff5f5' : 'white'};

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#dc3545' : '#007bff'};
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
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
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  
  &.total {
    font-size: 18px;
    font-weight: 700;
    color: #007bff;
    padding-top: 8px;
    border-top: 2px solid #dee2e6;
  }
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
  background-color: ${props => props.$variant === 'secondary' ? '#6c757d' : '#007bff'};
  color: white;

  &:hover:not(:disabled) {
    background-color: ${props => props.$variant === 'secondary' ? '#5a6268' : '#0056b3'};
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

const QuickAddButton = styled.button`
  padding: 10px 14px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  min-width: 45px;
  
  &:hover:not(:disabled) {
    background-color: #218838;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  label {
    font-size: 12px;
    color: #666;
    cursor: pointer;
  }
`;

const InfoBanner = styled.div`
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 14px;
  color: #1565c0;
`;

const EmptyItemsMessage = styled.div`
  text-align: center;
  padding: 32px;
  color: #666;
  font-size: 14px;
`;

// ==================== COMPONENTE ====================

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ 
  order, 
  mode,  // Detectar automáticamente si no se especifica
  onSuccess, 
  onCancel 
}) => {
  const { showNotification } = useNotification();
  const { clients, loadClients } = useClients();
  const { products, loadProducts } = useProducts();
  
  // ✅ Auto-detectar modo: si hay order y no se especificó mode, es 'edit'
  const actualMode = mode || (order ? 'edit' : 'create');
  const isEditMode = actualMode === 'edit';
  const isViewMode = actualMode === 'view';
  const isReadOnly = isViewMode;

  // Estados
  const [formData, setFormData] = useState<FormData>({
    proveedorId: order?.proveedorId || '',
    almacenDestinoId: order?.almacenDestinoId || '',
    fechaEntregaEsperada: order?.fechaEntregaEsperada ? new Date(order.fechaEntregaEsperada).toISOString().split('T')[0] : '',
    moneda: order?.moneda || 'PEN',
    condicionesPago: order?.condicionesPago || '',
    items: order?.items?.map(item => ({ 
      productoId: item.productoId,
      cantidad: item.cantidadOrdenada || item.cantidad || 0,
      cantidadOrdenada: item.cantidadOrdenada || item.cantidad || 0,
      precioUnitario: item.precioUnitario,
      descuento: item.descuento || 0,
      incluyeIGV: item.incluyeIGV ?? false,  // ✅ Respetar valor exacto del backend (false si es false)
      observaciones: item.especificaciones || item.observaciones || '',
    })) || [],
    observaciones: order?.observaciones || '',
  });

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [companyConfig, setCompanyConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewProductModal, setShowNewProductModal] = useState(false);  // ✅ Modal productos
  const [newProductTargetIndex, setNewProductTargetIndex] = useState<number | null>(null);

  // ✅ Filtrar solo proveedores activos
  const suppliers = useMemo(() => {
    return clients.filter(c => 
      (c.tipoEntidad === 'Proveedor' || c.tipoEntidad === 'Ambos') && 
      c.isActive
    );
  }, [clients]);

  // ✅ Filtrar solo productos activos
  const activeProducts = useMemo(() => {
    return products.filter(p => p.isActive);
  }, [products]);

  // ==================== EFECTOS ====================

  useEffect(() => {
    loadInitialData();
  }, []);

  // ==================== FUNCIONES ====================

  // ✅ NUEVA FUNCIÓN: Usa contextos globales y almacenesApi
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // ✅ Cargar clientes si no están en contexto
      if (clients.length === 0) {
        await loadClients({ tipoEntidad: 'Proveedor' });
      }
      
      // Cargar productos si no están en contexto
      if (products.length === 0) {
        await loadProducts();
      }
      
      // Cargar almacenes desde almacenesApi
      const almacenesData = await almacenesApi.getAlmacenes({ activo: true });
      setWarehouses(Array.isArray(almacenesData) ? almacenesData : []);
      
      // Configurar moneda fija PEN
      setCompanyConfig({ moneda: 'PEN' });  // ✅ Moneda fija
      if (!order) {
        setFormData(prev => ({ ...prev, moneda: 'PEN' }));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      showNotification('error', 'Error', 'No se pudieron cargar los datos iniciales');
      // Inicializar con arrays vacíos en caso de error
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Validar qué campos son editables según el estado de la orden
  const getEditableFields = (estado?: PurchaseOrderStatus): string[] => {
    if (!estado || mode === 'create') return ['*'];  // Crear nuevo, todos editables
    
    switch (estado) {
      case 'PENDIENTE':
        return ['*'];  // Todos los campos
        
      case 'ENVIADA':
        return ['fechaEntregaEsperada', 'observaciones'];
        
      case 'CONFIRMADA':
      case 'EN_RECEPCION':
      case 'RECEPCIONADA':
      case 'PARCIALMENTE_RECIBIDA':
        return ['observaciones'];
        
      case 'COMPLETADA':
      case 'CANCELADA':
        return [];  // Solo lectura completa
        
      default:
        return [];
    }
  };

  const isFieldEditable = (fieldName: string): boolean => {
    if (isViewMode) return false;  // Modo ver, nada editable
    if (!order) return true;  // Modo creación, todos editables
    
    const editableFields = getEditableFields(order.estado);
    return editableFields.includes('*') || editableFields.includes(fieldName);
  };

  const isItemsEditable = (): boolean => {
    if (isViewMode) return false;
    if (!order) return true;
    return order.estado === 'PENDIENTE';
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddItem = () => {
    const newItem: CreatePurchaseOrderItemDto & { incluyeIGV?: boolean } = {
      productoId: '',
      cantidad: 0,
      precioUnitario: 0,
      incluyeIGV: false,  // ✅ Por defecto SIN IGV (usuario decide)
      observaciones: '',
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof CreatePurchaseOrderItemDto | 'incluyeIGV', value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // ✅ Calcular totales de un item considerando IGV
  const calculateItemTotals = (item: CreatePurchaseOrderItemDto & { incluyeIGV?: boolean }) => {
    const cantidad = item.cantidad || 0;
    const precioUnitario = item.precioUnitario || 0;
    const base = cantidad * precioUnitario;
    
    if (!item.incluyeIGV) {
      // Sin IGV
      return {
        subtotal: base,
        igv: 0,
        total: base
      };
    }
    
    // Con IGV (18%)
    const subtotal = base / 1.18;
    const igv = subtotal * 0.18;
    
    return {
      subtotal,
      igv,
      total: base
    };
  };

  const calculateSubtotal = (item: CreatePurchaseOrderItemDto & { incluyeIGV?: boolean }): number => {
    return calculateItemTotals(item).subtotal;
  };

  const calculateTotalIGV = (): number => {
    return formData.items.reduce((sum, item) => 
      sum + calculateItemTotals(item).igv, 0
    );
  };

  const calculateTotal = (): number => {
    return formData.items.reduce((sum, item) => 
      sum + calculateItemTotals(item).total, 0
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const validationMessages: string[] = [];

    // Validar proveedor
    if (!formData.proveedorId) {
      newErrors.proveedorId = 'Debe seleccionar un proveedor';
      validationMessages.push('• Proveedor es obligatorio');
    }

    // Validar almacén
    if (!formData.almacenDestinoId) {
      newErrors.almacenDestinoId = 'Debe seleccionar un almacén';
      validationMessages.push('• Almacén de destino es obligatorio');
    }

    // Validar items
    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto';
      validationMessages.push('• Debe agregar al menos un producto');
    } else {
      // Validar cada item
      let itemsWithErrors = 0;
      formData.items.forEach((item, index) => {
        let itemHasError = false;
        
        if (!item.productoId) {
          newErrors[`item_${index}_producto`] = 'Seleccione un producto';
          itemHasError = true;
        }
        if (!item.cantidad || item.cantidad <= 0) {
          newErrors[`item_${index}_cantidad`] = 'Cantidad debe ser mayor a 0';
          itemHasError = true;
        }
        if (!item.precioUnitario || item.precioUnitario <= 0) {
          newErrors[`item_${index}_precio`] = 'Precio debe ser mayor a 0';
          itemHasError = true;
        }
        
        if (itemHasError) {
          itemsWithErrors++;
        }
      });
      
      if (itemsWithErrors > 0) {
        validationMessages.push(`• ${itemsWithErrors} producto(s) tienen campos incompletos o inválidos`);
      }
    }

    setErrors(newErrors);
    
    // Mostrar notificación con todos los errores si hay alguno
    if (validationMessages.length > 0) {
      showNotification(
        'warning',
        'Campos Incompletos',
        `Por favor complete los siguientes campos:\n${validationMessages.join('\n')}`
      );
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result: PurchaseOrder;

      if (isEditMode && order) {
        const updateData: UpdatePurchaseOrderDto = {
          proveedorId: formData.proveedorId,
          almacenDestinoId: formData.almacenDestinoId,
          fechaEntregaEsperada: formData.fechaEntregaEsperada ? new Date(formData.fechaEntregaEsperada).toISOString() : undefined,
          moneda: formData.moneda,
          condicionesPago: formData.condicionesPago,
          items: formData.items,
          observaciones: formData.observaciones,
        };

        const response = await purchaseOrderService.updatePurchaseOrder(order.id, updateData);
        result = response.data;
        showNotification(
          'success',
          'Orden Actualizada',
          `La orden ${result.codigo} se actualizó correctamente con ${result.items?.length || 0} productos`
        );
      } else {
        // ✅ Mapear items al formato correcto del backend
        const mappedItems = formData.items.map(item => ({
          productoId: item.productoId,
          cantidadOrdenada: item.cantidad,
          precioUnitario: item.precioUnitario,
          descuento: item.descuento || 0,
          incluyeIGV: item.incluyeIGV ?? false,  // ✅ Incluir campo IGV
          especificaciones: item.observaciones || undefined,
        }));
        
        const createData: CreatePurchaseOrderDto = {
          proveedorId: formData.proveedorId,
          almacenDestinoId: formData.almacenDestinoId,
          solicitadoPorId: '',  // ✅ Se agregará en el backend desde el token
          fechaEntregaEsperada: formData.fechaEntregaEsperada ? new Date(formData.fechaEntregaEsperada).toISOString() : undefined,
          moneda: formData.moneda || 'PEN',
          condicionesPago: formData.condicionesPago,
          formaPago: undefined,  // ✅ Opcional
          lugarEntrega: undefined,  // ✅ Opcional
          items: mappedItems,  // ✅ Items mapeados
          observaciones: formData.observaciones,
        };

        const response = await purchaseOrderService.createPurchaseOrder(createData);
        result = response.data;
        const totalAmount = typeof result.total === 'number' ? result.total : Number(result.total) || 0;
        showNotification(
          'success',
          'Orden Creada',
          `Orden ${result.codigo} creada exitosamente con ${result.items?.length || 0} productos por un total de S/ ${totalAmount.toFixed(2)}`
        );
      }

      if (onSuccess) {
        onSuccess(result);
      }
      
      // Recargar productos después de crear/editar para refrescar la lista
      await loadProducts();
    } catch (err: any) {
      const errorMessage = err.message || 'Error al guardar orden de compra';
      showNotification('error', 'Error al guardar', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string): string => {
    const product = activeProducts.find(p => p.id === productId);
    return product ? `${product.productCode} - ${product.productName}` : '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  // ==================== RENDER ====================

  return (
    <Container>
      <Header>
        <Title>
          {isViewMode ? 'Ver Orden de Compra' : isEditMode ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
        </Title>
        <Subtitle>
          {isViewMode 
            ? `Orden ${order?.codigo} - Estado: ${order?.estado}`
            : isEditMode 
              ? `Modificando orden ${order?.codigo}`
              : 'Complete los datos para crear una nueva orden'
          }
        </Subtitle>
      </Header>

      {/* Banner informativo sobre edición según estado */}
      {order && !isViewMode && !isItemsEditable() && (
        <InfoBanner>
          ℹ️ Solo se pueden editar items en estado PENDIENTE. Estado actual: <strong>{order.estado}</strong>
        </InfoBanner>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Sección: Información General */}
        <Section>
          <SectionTitle>Información General</SectionTitle>
          <Row>
            <FormGroup>
              <Label>
                Proveedor
                <RequiredMark>*</RequiredMark>
              </Label>
              <Select
                value={formData.proveedorId}
                onChange={(e) => handleInputChange('proveedorId', e.target.value)}
                $error={!!errors.proveedorId}
                disabled={!isFieldEditable('proveedorId') || loading}
              >
                <option value="">Seleccione un proveedor</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.razonSocial || supplier.nombres}
                  </option>
                ))}
              </Select>
              {errors.proveedorId && <ErrorText>{errors.proveedorId}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>
                Almacén Destino
                <RequiredMark>*</RequiredMark>
              </Label>
              <Select
                value={formData.almacenDestinoId}
                onChange={(e) => handleInputChange('almacenDestinoId', e.target.value)}
                $error={!!errors.almacenDestinoId}
                disabled={!isFieldEditable('almacenDestinoId') || loading}
              >
                <option value="">Seleccione un almacén</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.codigo} - {warehouse.nombre}
                  </option>
                ))}
              </Select>
              {errors.almacenDestinoId && <ErrorText>{errors.almacenDestinoId}</ErrorText>}
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>Fecha de Entrega Esperada</Label>
              <Input
                type="date"
                value={formData.fechaEntregaEsperada || ''}
                onChange={(e) => handleInputChange('fechaEntregaEsperada', e.target.value)}
                disabled={!isFieldEditable('fechaEntregaEsperada') || loading}
              />
            </FormGroup>

            <FormGroup>
              <Label>Moneda</Label>
              <Input
                type="text"
                value={companyConfig?.moneda === 'PEN' ? 'PEN (Soles)' : companyConfig?.moneda || 'PEN (Soles)'}
                disabled={true}
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                Configurado desde Ajustes de Empresa
              </small>
            </FormGroup>
          </Row>

          <FormGroup>
            <Label>Condiciones de Pago</Label>
            <TextArea
              value={formData.condicionesPago || ''}
              onChange={(e) => handleInputChange('condicionesPago', e.target.value)}
              placeholder="Ej: Contado, Crédito 30 días, etc. (opcional)"
              rows={2}
              disabled={!isFieldEditable('condicionesPago') || loading}
            />
          </FormGroup>

          <FormGroup>
            <Label>Observaciones</Label>
            <TextArea
              value={formData.observaciones || ''}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Ingrese observaciones adicionales (opcional)"
              disabled={!isFieldEditable('observaciones') || loading}
            />
          </FormGroup>
        </Section>

        {/* Sección: Items */}
        <ItemsSection>
          <ItemsHeader>
            <SectionTitle>Productos</SectionTitle>
            <AddItemButton 
              type="button" 
              onClick={handleAddItem}
              disabled={!isItemsEditable() || loading}
            >
              + Agregar Producto
            </AddItemButton>
          </ItemsHeader>

          {formData.items.length === 0 ? (
            <EmptyItemsMessage>
              No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
            </EmptyItemsMessage>
          ) : (
            <ItemsTable>
              <Table>
                <Thead>
                  <tr>
                    <Th>Producto</Th>
                    <Th>Unidad</Th>
                    <Th>Cantidad</Th>
                    <Th>Precio Unit.</Th>
                    <Th>IGV</Th>
                    <Th>Subtotal</Th>
                    <Th>IGV Monto</Th>
                    <Th>Total</Th>
                    <Th>Obs.</Th>
                    <Th>Acciones</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {formData.items.map((item, index) => {
                    const totals = calculateItemTotals(item);
                    return (
                      <Tr key={index}>
                        <Td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <ItemSelect
                                value={item.productoId}
                                onChange={(e) => handleItemChange(index, 'productoId', e.target.value)}
                                disabled={!isItemsEditable() || loading}
                                $error={!!errors[`item_${index}_producto`]}
                                style={{ flex: 1 }}
                              >
                                <option value="">Seleccione...</option>
                                {activeProducts.map(product => (
                                  <option key={product.id} value={product.id}>
                                    {product.productCode} - {product.productName}
                                  </option>
                                ))}
                              </ItemSelect>
                              <QuickAddButton
                                type="button"
                                onClick={() => {
                                  setNewProductTargetIndex(index);
                                  setShowNewProductModal(true);
                                }}
                                disabled={!isItemsEditable() || loading}
                                title="Crear nuevo producto"
                              >
                                +
                              </QuickAddButton>
                            </div>
                            {errors[`item_${index}_producto`] && (
                              <ErrorText>{errors[`item_${index}_producto`]}</ErrorText>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <small style={{ color: '#666' }}>
                            {item.productoId ? (() => {
                              const product = activeProducts.find(p => p.id === item.productoId);  // ✅ Solo comparar por id
                              if (!product) return '-';
                              // ✅ Verificación defensiva: asegurar que unit es string
                              const unit = typeof product.unit === 'object' && (product.unit as any)?.nombre
                                ? (product.unit as any).nombre
                                : product.unit || 'UND';
                              return unit;
                            })() : '-'}
                          </small>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <ItemInput
                              type="number"
                              min="0"
                              step="1"
                              value={item.cantidad || ''}
                              onChange={(e) => handleItemChange(index, 'cantidad', Number(e.target.value))}
                              $error={!!errors[`item_${index}_cantidad`]}
                              disabled={!isItemsEditable() || loading}
                            />
                            {errors[`item_${index}_cantidad`] && (
                              <ErrorText>{errors[`item_${index}_cantidad`]}</ErrorText>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <ItemInput
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.precioUnitario || ''}
                              onChange={(e) => handleItemChange(index, 'precioUnitario', Number(e.target.value))}
                              $error={!!errors[`item_${index}_precio`]}
                              disabled={!isItemsEditable() || loading}
                            />
                            {errors[`item_${index}_precio`] && (
                              <ErrorText>{errors[`item_${index}_precio`]}</ErrorText>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <CheckboxWrapper>
                            <input
                              type="checkbox"
                              checked={item.incluyeIGV !== false}
                              onChange={(e) => handleItemChange(index, 'incluyeIGV', e.target.checked)}
                              disabled={!isItemsEditable() || loading}
                            />
                            <label>{item.incluyeIGV !== false ? 'Sí' : 'No'}</label>
                          </CheckboxWrapper>
                        </Td>
                        <Td>{formatCurrency(totals.subtotal)}</Td>
                        <Td style={{ color: totals.igv > 0 ? '#28a745' : '#999' }}>
                          {formatCurrency(totals.igv)}
                        </Td>
                        <Td><strong>{formatCurrency(totals.total)}</strong></Td>
                        <Td>
                          <ItemInput
                            type="text"
                            value={item.observaciones || ''}
                            onChange={(e) => handleItemChange(index, 'observaciones', e.target.value)}
                            placeholder="Opcional"
                            disabled={!isItemsEditable() || loading}
                          />
                        </Td>
                        <Td>
                          <RemoveButton
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={!isItemsEditable() || loading}
                          >
                            Quitar
                          </RemoveButton>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </ItemsTable>
          )}

          {/* Resumen */}
          <Summary>
            <SummaryRow>
              <span>Cantidad de productos:</span>
              <strong>{formData.items.length}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Unidades totales:</span>
              <strong>{formData.items.reduce((sum, item) => sum + (item.cantidad || 0), 0)}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>Subtotal (sin IGV):</span>
              <strong>{formatCurrency(formData.items.reduce((sum, item) => 
                sum + calculateItemTotals(item).subtotal, 0
              ))}</strong>
            </SummaryRow>
            <SummaryRow>
              <span>IGV Total (18%):</span>
              <strong style={{ color: '#28a745' }}>
                {formatCurrency(calculateTotalIGV())}
              </strong>
            </SummaryRow>
            <SummaryRow className="total">
              <span>TOTAL A PAGAR:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </SummaryRow>
            <small style={{ color: '#666', fontSize: '12px', marginTop: '8px', display: 'block' }}>
              {formData.items.filter(i => i.incluyeIGV !== false).length} items con IGV, {' '}
              {formData.items.filter(i => i.incluyeIGV === false).length} items sin IGV
            </small>
          </Summary>
        </ItemsSection>

        {/* Acciones */}
        <Actions>
          <Button type="button" $variant="secondary" onClick={onCancel} disabled={loading}>
            {isViewMode ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!isViewMode && (
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditMode ? 'Actualizar Orden' : 'Crear Orden'}
            </Button>
          )}
        </Actions>
      </Form>

      {/* Modal de Nuevo Producto */}
      {showNewProductModal && (
        <NuevoProductoModal
          onClose={() => {
            setShowNewProductModal(false);
            setNewProductTargetIndex(null);
          }}
          onSuccess={async (newProduct: any) => {
            try {
              // ✅ Recargar productos desde el contexto
              await loadProducts();
              
              // ✅ Esperar un momento para que el contexto se actualice
              setTimeout(() => {
                // Seleccionar el nuevo producto en el item actual
                if (newProductTargetIndex !== null) {
                  const productId = newProduct.id || newProduct.productCode;
                  handleItemChange(newProductTargetIndex, 'productoId', productId);
                }
              }, 500);
              
              setShowNewProductModal(false);
              setNewProductTargetIndex(null);
              showNotification('success', 'Éxito', 'Producto creado y agregado automáticamente');
            } catch (error) {
              console.error('Error al agregar producto:', error);
              showNotification('error', 'Error', 'Producto creado pero no se pudo agregar a la orden');
            }
          }}
        />
      )}
    </Container>
  );
};

export default PurchaseOrderForm;
