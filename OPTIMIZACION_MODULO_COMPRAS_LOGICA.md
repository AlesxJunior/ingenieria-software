# 🔄 OPTIMIZACIÓN MÓDULO DE COMPRAS - LÓGICA DEL PROYECTO

**Fecha:** 3 de Diciembre, 2025  
**Estado:** Análisis Completo y Plan de Implementación  
**Archivo Base:** `PurchaseOrderForm.tsx`, `PurchaseOrderList.tsx`

---

## 📋 ANÁLISIS DE DISCREPANCIAS ACTUALES

### ❌ Problemas Identificados

#### 1. **Duplicación de Servicios**
**Problema:** `auxiliaryEntitiesService.ts` duplica endpoints existentes
```typescript
// ❌ ACTUAL (duplicado):
auxiliaryEntitiesService.getSuppliers()     // GET /api/entidades?tipo=Proveedor
auxiliaryEntitiesService.getWarehouses()    // GET /api/almacenes
auxiliaryEntitiesService.getProducts()      // GET /api/productos

// ✅ DEBERÍA USAR:
ClientContext (via useClients)              // Ya filtra por tipoEntidad
WarehouseContext o configuracionApi         // Gestión centralizada
ProductContext (via useProducts)            // Contexto global de productos
```

**Impacto:** 
- Redundancia en llamadas HTTP
- Inconsistencia en caché
- Dificulta debugging

---

#### 2. **Moneda No Configurable**
**Problema:** Select permite cambiar moneda, pero debería ser PEN fijo desde configuración

**Ubicación:** Línea 650 `PurchaseOrderForm.tsx`
```tsx
// ❌ ACTUAL:
<Select value={formData.moneda || 'PEN'} onChange={...}>
  <option value="PEN">PEN (Soles)</option>
  <option value="USD">USD (Dólares)</option>
</Select>

// ✅ CORRECTO:
<Input value="PEN (Soles)" disabled={true} />
// Obtener de: Company.moneda (configuración empresa)
```

**Requisito:** Usuario especifica: "Configuracion = Soles (predeterminado, no poder cambiar)"

---

#### 3. **Sin Creación Rápida de Productos**
**Problema:** No hay botón + para crear productos sin salir del formulario

**Análisis:** Usuario menciona:
> "en caso tenga un nuevo producto q el proveedor me mencione o me de una nueva ofecta como hago puedo implementar un acceso directo para crear ese producto sin salir de la pagina"

**Patrón Existente:** `NuevaCompraModal.tsx` NO tiene modal inline (usa autocompletado)

**Solución:** Usar `NuevoProductoModal` del módulo de productos

```tsx
// Estructura propuesta:
<Row>
  <FormGroup style={{flex: 1}}>
    <Label>Producto</Label>
    <Select>...</Select>
  </FormGroup>
  <QuickAddButton onClick={() => setShowProductModal(true)}>
    + Nuevo
  </QuickAddButton>
</Row>

{showProductModal && (
  <NuevoProductoModal 
    onClose={() => setShowProductModal(false)}
    onSuccess={(product) => {
      // Recargar productos y seleccionar el nuevo
      fetchProducts();
      handleItemChange(index, 'productoId', product.id);
    }}
  />
)}
```

---

#### 4. **IGV No Flexible**
**Problema:** No hay opción para manejar productos sin IGV (empresas de selva peruana)

**Requisito Usuario:**
> "Como manejo del IGV, algunas empresa me puedes vendar con igv mismas otras no(las de la selva peruana no usar el igv)."

**Solución:** Agregar checkbox por item

```tsx
// Estructura de Item actualizada:
interface CreatePurchaseOrderItemDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  incluyeIGV: boolean;        // ✅ NUEVO
  observaciones?: string;
}

// Cálculo de subtotal:
const calculateSubtotal = (item) => {
  const base = item.cantidad * item.precioUnitario;
  if (!item.incluyeIGV) return base;
  
  // Si incluye IGV, calcular sin IGV
  const subtotal = base / 1.18;
  const igv = subtotal * 0.18;
  return { subtotal, igv, total: base };
};
```

**Tabla Actualizada:**
```tsx
<Th>Producto</Th>
<Th>Cantidad</Th>
<Th>Precio Unit.</Th>
<Th>¿IGV?</Th>          {/* ✅ NUEVA COLUMNA */}
<Th>Subtotal</Th>
<Th>IGV</Th>            {/* ✅ NUEVA COLUMNA */}
<Th>Total</Th>
<Th>Acciones</Th>
```

---

#### 5. **Modal Ver No Sincronizado**
**Problema:** Modal "Ver" no muestra estado actual correctamente

**Requisito:**
> "Ver: sincronizar correctamente con el modal de Nueva orden de compra y su estado actual."

**Análisis:** 
- `PurchaseOrderDetail.tsx` existe pero puede estar desactualizado
- Debe reflejar estado REAL de la orden (PENDIENTE, ENVIADA, CONFIRMADA, etc.)
- Debe usar mismo formulario en modo READONLY

**Solución:**
```tsx
// PurchaseOrderDetail.tsx:
<PurchaseOrderForm 
  order={order} 
  mode="view"           // ✅ Modo solo lectura
  onCancel={onClose}
/>

// PurchaseOrderForm.tsx:
const isReadOnly = mode === 'view';
const isEditMode = !!order && mode === 'edit';

// Todos los inputs:
disabled={isReadOnly || loading}
```

---

#### 6. **Campos Editables No Validados por Estado**
**Problema:** No hay lógica de campos editables según estado de orden

**Reglas de Negocio:**
```typescript
const getEditableFields = (estado: PurchaseOrderStatus): string[] => {
  switch (estado) {
    case 'PENDIENTE':
      return ['*'];  // Todos los campos
      
    case 'ENVIADA':
      return ['fechaEntregaEsperada', 'observaciones'];  // Solo estos 2
      
    case 'CONFIRMADA':
    case 'EN_RECEPCION':
    case 'RECEPCIONADA':
    case 'PARCIALMENTE_RECIBIDA':
      return ['observaciones'];  // Solo observaciones
      
    case 'COMPLETADA':
    case 'CANCELADA':
      return [];  // Ninguno
      
    default:
      return [];
  }
};

// Uso:
const editableFields = getEditableFields(order?.estado);
const isFieldEditable = (field: string) => {
  return editableFields.includes('*') || editableFields.includes(field);
};

// En cada input:
disabled={!isFieldEditable('proveedorId') || loading}
```

---

#### 7. **Notificaciones PDF Inconsistentes**
**Problema:** No siguen el patrón estándar del sistema

**Patrón Encontrado en `Cotizaciones.tsx`:**
```tsx
// ✅ CORRECTO:
// 1. Al iniciar
showNotification('info', 'Generando PDF...', 'Preparando documento');

// 2. Al completar
showNotification('success', 'Éxito', 'PDF descargado exitosamente');

// 3. Al fallar
showNotification('error', 'Error', 'No se pudo generar el PDF');
```

**ACTUAL en `PurchaseOrderList.tsx` (línea 467):**
```tsx
// ❌ INCONSISTENTE:
showNotification('PDF descargado exitosamente', 'success');  // Orden invertido
```

**Corrección:**
```tsx
// Archivo: PurchaseOrderList.tsx
const handleDownloadPDF = async (orderId: string) => {
  try {
    showNotification('info', 'Generando PDF...', 'Preparando documento de orden de compra');
    
    const blob = await purchaseOrderService.downloadPDF(orderId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orden-compra-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('success', 'Éxito', 'PDF descargado exitosamente');
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    showNotification('error', 'Error', 'No se pudo generar el PDF. Intente nuevamente.');
  }
};
```

---

#### 8. **Validaciones de Eliminación**
**Estado Actual:** Ya implementadas correctamente ✅

```typescript
// ✅ YA CORRECTO (líneas 427-449):
const estadosPermitidos = ['PENDIENTE', 'ENVIADA'];
if (!estadosPermitidos.includes(order.estado)) {
  showNotification('warning', 'Acción no permitida', 
    `No se puede cancelar una orden en estado ${order.estado}. ` +
    'Solo se pueden cancelar órdenes en estado PENDIENTE o ENVIADA.'
  );
  return;
}

// Confirmación
if (!window.confirm(`¿Está seguro de cancelar la orden ${order.codigo}?`)) {
  return;
}
```

**Mejora Adicional:** Modal de confirmación personalizado (opcional)
```tsx
<ConfirmModal
  title="Cancelar Orden de Compra"
  message={`¿Está seguro de cancelar la orden ${order.codigo}?`}
  detail="Esta acción cambiará el estado a CANCELADA y no se podrá revertir."
  onConfirm={() => handleDelete(orderId)}
  onCancel={() => setShowConfirmModal(false)}
  confirmText="Sí, Cancelar"
  confirmColor="danger"
/>
```

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### **Fase 1: Integración de Contextos Globales** ⏱️ 30 min

#### Archivo: `PurchaseOrderForm.tsx`

**1.1 Imports Actualizados:**
```tsx
import React, { useState, useEffect } from 'styled-components';
import { useClients } from '../../../context/ClientContext';        // ✅ Proveedores
import { useProducts } from '../../../context/ProductContext';      // ✅ Productos
import { useNotification } from '../../../context/NotificationContext';
import { configuracionApi } from '../../../services/configuracionApi';  // ✅ Almacenes y Company
import NuevoProductoModal from '../../products/components/NuevoProductoModal';  // ✅ Modal
```

**1.2 Reemplazar fetchInitialData:**
```tsx
// ❌ ELIMINAR:
const fetchInitialData = async () => {
  const [suppliersRes, warehousesRes, productsRes] = await Promise.all([
    auxiliaryEntitiesService.getSuppliers({ activo: true }),
    // ...
  ]);
};

// ✅ USAR CONTEXTOS:
const { clients } = useClients();
const { products, loadProducts } = useProducts();
const [warehouses, setWarehouses] = useState([]);
const [companyConfig, setCompanyConfig] = useState(null);

useEffect(() => {
  loadInitialData();
}, []);

const loadInitialData = async () => {
  try {
    // Cargar productos si no están en contexto
    if (products.length === 0) {
      await loadProducts();
    }
    
    // Cargar almacenes desde configuración
    const whResponse = await configuracionApi.getAlmacenes({ activo: true });
    setWarehouses(whResponse.data || []);
    
    // Cargar configuración de empresa (para moneda)
    const companyResponse = await configuracionApi.getCompany();
    setCompanyConfig(companyResponse.data);
    
    // Setear moneda por defecto
    if (companyResponse.data?.moneda) {
      handleInputChange('moneda', companyResponse.data.moneda);
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
    showNotification('error', 'Error', 'No se pudieron cargar los datos iniciales');
  }
};

// Filtrar solo proveedores activos
const suppliers = useMemo(() => {
  return clients.filter(c => 
    (c.tipoEntidad === 'Proveedor' || c.tipoEntidad === 'Ambos') && 
    c.isActive
  );
}, [clients]);

// Filtrar solo productos activos
const activeProducts = useMemo(() => {
  return products.filter(p => p.isActive);
}, [products]);
```

---

### **Fase 2: Moneda Fija desde Configuración** ⏱️ 10 min

```tsx
// En la sección de formulario (línea ~650):
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
```

---

### **Fase 3: Creación Rápida de Productos** ⏱️ 20 min

```tsx
// Estado:
const [showNewProductModal, setShowNewProductModal] = useState(false);
const [newProductTargetIndex, setNewProductTargetIndex] = useState<number | null>(null);

// Botón junto al select:
<ItemsTableRow>
  <Td style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
    <ItemSelect 
      value={item.productoId}
      onChange={(e) => handleItemChange(index, 'productoId', e.target.value)}
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
      title="Crear nuevo producto"
    >
      +
    </QuickAddButton>
  </Td>
</ItemsTableRow>

// Styled Component:
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
  
  &:hover {
    background-color: #218838;
  }
`;

// Modal al final del componente:
{showNewProductModal && (
  <NuevoProductoModal
    onClose={() => {
      setShowNewProductModal(false);
      setNewProductTargetIndex(null);
    }}
    onSuccess={async (newProduct) => {
      // Recargar productos
      await loadProducts();
      
      // Seleccionar el nuevo producto en el item actual
      if (newProductTargetIndex !== null) {
        handleItemChange(newProductTargetIndex, 'productoId', newProduct.id);
      }
      
      setShowNewProductModal(false);
      setNewProductTargetIndex(null);
      showNotification('success', 'Éxito', 'Producto creado y agregado a la orden');
    }}
  />
)}
```

---

### **Fase 4: Manejo Flexible de IGV** ⏱️ 40 min

**4.1 Actualizar Interface:**
```typescript
// En types/purchases.types.ts:
export interface CreatePurchaseOrderItemDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  incluyeIGV?: boolean;  // ✅ NUEVO (opcional, default true)
  observaciones?: string;
}
```

**4.2 Actualizar Estado Inicial:**
```tsx
const handleAddItem = () => {
  const newItem: CreatePurchaseOrderItemDto = {
    productoId: '',
    cantidad: 0,
    precioUnitario: 0,
    incluyeIGV: true,  // ✅ Por defecto con IGV
    observaciones: '',
  };
  setFormData(prev => ({
    ...prev,
    items: [...prev.items, newItem],
  }));
};
```

**4.3 Actualizar Cálculos:**
```tsx
const calculateItemTotals = (item: CreatePurchaseOrderItemDto) => {
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

const calculateSubtotal = (item: CreatePurchaseOrderItemDto): number => {
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
```

**4.4 Actualizar Tabla:**
```tsx
<Thead>
  <tr>
    <Th>Producto</Th>
    <Th>Unidad</Th>
    <Th>Cantidad</Th>
    <Th>Precio Unit.</Th>
    <Th>IGV</Th>           {/* ✅ NUEVA COLUMNA */}
    <Th>Subtotal</Th>
    <Th>IGV Monto</Th>     {/* ✅ NUEVA COLUMNA */}
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
        {/* ... otros campos ... */}
        <Td>
          <CheckboxWrapper>
            <input
              type="checkbox"
              checked={item.incluyeIGV !== false}  // Default true
              onChange={(e) => handleItemChange(index, 'incluyeIGV', e.target.checked)}
              disabled={loading}
            />
            <label>{item.incluyeIGV !== false ? 'Sí' : 'No'}</label>
          </CheckboxWrapper>
        </Td>
        <Td>{formatCurrency(totals.subtotal)}</Td>
        <Td style={{ color: totals.igv > 0 ? '#28a745' : '#999' }}>
          {formatCurrency(totals.igv)}
        </Td>
        <Td><strong>{formatCurrency(totals.total)}</strong></Td>
        {/* ... */}
      </Tr>
    );
  })}
</Tbody>

// Styled Component:
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
```

**4.5 Actualizar Resumen:**
```tsx
<Summary>
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
  <small style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
    {formData.items.filter(i => i.incluyeIGV !== false).length} items con IGV, {' '}
    {formData.items.filter(i => i.incluyeIGV === false).length} items sin IGV
  </small>
</Summary>
```

---

### **Fase 5: Campos Editables por Estado** ⏱️ 30 min

**5.1 Helper Function:**
```tsx
// Al inicio del componente:
const getEditableFields = (estado?: PurchaseOrderStatus): string[] => {
  if (!estado) return ['*'];  // Crear nuevo, todos editables
  
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
  if (!order) return true;  // Modo creación, todos editables
  
  const editableFields = getEditableFields(order.estado);
  return editableFields.includes('*') || editableFields.includes(fieldName);
};

const isItemsEditable = (): boolean => {
  if (!order) return true;
  return order.estado === 'PENDIENTE';
};
```

**5.2 Aplicar a Campos:**
```tsx
// Proveedor:
<Select
  value={formData.proveedorId}
  onChange={(e) => handleInputChange('proveedorId', e.target.value)}
  disabled={!isFieldEditable('proveedorId') || loading}
  $error={!!errors.proveedorId}
>

// Almacén:
<Select
  value={formData.almacenDestinoId}
  onChange={(e) => handleInputChange('almacenDestinoId', e.target.value)}
  disabled={!isFieldEditable('almacenDestinoId') || loading}
  $error={!!errors.almacenDestinoId}
>

// Fecha Entrega:
<Input
  type="date"
  value={formData.fechaEntregaEsperada || ''}
  onChange={(e) => handleInputChange('fechaEntregaEsperada', e.target.value)}
  disabled={!isFieldEditable('fechaEntregaEsperada') || loading}
/>

// Condiciones Pago:
<TextArea
  value={formData.condicionesPago || ''}
  onChange={(e) => handleInputChange('condicionesPago', e.target.value)}
  disabled={!isFieldEditable('condicionesPago') || loading}
/>

// Observaciones (siempre editable hasta COMPLETADA):
<TextArea
  value={formData.observaciones || ''}
  onChange={(e) => handleInputChange('observaciones', e.target.value)}
  disabled={!isFieldEditable('observaciones') || loading}
/>

// Items:
<AddItemButton 
  type="button" 
  onClick={handleAddItem}
  disabled={!isItemsEditable() || loading}
>
  + Agregar Producto
</AddItemButton>

// En cada input de item:
<ItemInput
  disabled={!isItemsEditable() || loading}
  // ...
/>
```

**5.3 Mensaje Informativo:**
```tsx
{order && !isItemsEditable() && (
  <InfoBanner>
    ℹ️ Solo se pueden editar items en estado PENDIENTE. Estado actual: <strong>{order.estado}</strong>
  </InfoBanner>
)}

const InfoBanner = styled.div`
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 14px;
  color: #1565c0;
`;
```

---

### **Fase 6: Optimizar Notificaciones** ⏱️ 15 min

**Archivo: `PurchaseOrderList.tsx`**

```tsx
// Línea ~460 - handleDownloadPDF:
const handleDownloadPDF = async (orderId: string) => {
  try {
    // 1. Notificación de inicio
    showNotification('info', 'Generando PDF...', 'Preparando documento de orden de compra');
    
    const blob = await purchaseOrderService.downloadPDF(orderId);
    
    // Crear descarga
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orden-compra-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // 2. Notificación de éxito
    showNotification('success', 'Éxito', 'PDF descargado exitosamente');
  } catch (error: any) {
    console.error('Error al descargar PDF:', error);
    // 3. Notificación de error
    showNotification('error', 'Error', error.message || 'No se pudo generar el PDF. Intente nuevamente.');
  }
};
```

**Archivo: `PurchaseOrderDetail.tsx`** (si tiene botón PDF):

```tsx
const handleDownloadPDF = async () => {
  if (!order) return;
  
  try {
    showNotification('info', 'Generando PDF...', 'Preparando documento');
    
    const blob = await purchaseOrderService.downloadPDF(order.id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OC-${order.codigo}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('success', 'Éxito', 'PDF descargado exitosamente');
  } catch (error: any) {
    console.error('Error:', error);
    showNotification('error', 'Error', error.message || 'No se pudo generar el PDF');
  }
};
```

---

## 📊 RESUMEN DE CAMBIOS

| # | Optimización | Archivos Afectados | Tiempo | Prioridad |
|---|-------------|-------------------|--------|-----------|
| 1 | Integración Contextos | PurchaseOrderForm.tsx | 30 min | 🔴 Alta |
| 2 | Moneda Fija PEN | PurchaseOrderForm.tsx | 10 min | 🔴 Alta |
| 3 | Creación Rápida Productos | PurchaseOrderForm.tsx | 20 min | 🟡 Media |
| 4 | Manejo Flexible IGV | PurchaseOrderForm.tsx, types | 40 min | 🔴 Alta |
| 5 | Campos por Estado | PurchaseOrderForm.tsx | 30 min | 🔴 Alta |
| 6 | Notificaciones PDF | PurchaseOrderList.tsx, Detail | 15 min | 🟡 Media |
| 7 | Validar Eliminación | PurchaseOrderList.tsx | 0 min | ✅ OK |

**Tiempo Total Estimado:** ~2 horas 25 minutos

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend (si aplica)
- [ ] Actualizar DTO `CreatePurchaseOrderItemDto` con campo `incluyeIGV?: boolean`
- [ ] Actualizar lógica de cálculo de totales en `purchases.service.ts`
- [ ] Agregar campo `incluyeIGV` a tabla `PurchaseOrderItem` si no existe

### Frontend
- [ ] **Fase 1:** Reemplazar `auxiliaryEntitiesService` por contextos globales
- [ ] **Fase 2:** Fijar moneda PEN desde configuración
- [ ] **Fase 3:** Implementar botón + y modal de productos
- [ ] **Fase 4:** Agregar checkbox IGV y actualizar cálculos
- [ ] **Fase 5:** Implementar validaciones de campos por estado
- [ ] **Fase 6:** Estandarizar notificaciones PDF
- [ ] Probar flujo completo: Crear → Ver → Editar → PDF → Eliminar
- [ ] Validar estados: PENDIENTE, ENVIADA, CONFIRMADA, COMPLETADA
- [ ] Probar con productos CON y SIN IGV

### Testing
- [ ] Crear orden con todos los campos
- [ ] Verificar moneda fija
- [ ] Probar creación rápida de producto desde orden
- [ ] Validar cálculo IGV con items mixtos (con/sin IGV)
- [ ] Editar orden en cada estado
- [ ] Generar PDF y verificar notificaciones
- [ ] Intentar eliminar en estados no permitidos

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Corregir errores TypeScript en backend** (COMPLETADO)
2. 🔧 **Implementar optimizaciones frontend** (EN PROGRESO)
3. 🧪 **Testing completo del flujo**
4. 📝 **Documentar cambios en CHANGELOG**

---

**Fin del Documento**
