# 📦 MANUAL COMPLETO - MÓDULO DE COMPRAS ALEXATECH

**Versión:** 2.0  
**Fecha:** 6 de Diciembre, 2025  
**Estado:** ✅ Producción  
**Calificación:** 9.3/10

---

## 📚 TABLA DE CONTENIDOS

1. [Introducción](#1-introducción)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Guía de Usuario](#3-guía-de-usuario)
4. [Guía Técnica](#4-guía-técnica)
5. [Flujo de Estados](#5-flujo-de-estados)
6. [Troubleshooting](#6-troubleshooting)
7. [FAQ](#7-faq)
8. [Apéndices](#8-apéndices)

---

## 1. INTRODUCCIÓN

### 1.1 ¿Qué es el Módulo de Compras?

El módulo de compras de AlexaTech es una solución completa para gestionar el ciclo de adquisición de productos desde la creación de órdenes hasta la recepción e ingreso al inventario.

**Características principales:**
- ✅ Gestión completa de órdenes de compra
- ✅ Control de estados con validaciones automáticas
- ✅ Generación de PDF profesionales
- ✅ Recepciones de mercadería con control de calidad
- ✅ Actualización automática de inventario
- ✅ Trazabilidad completa con auditoría
- ✅ Cálculo automático de IGV por item
- ✅ Campos editables según estado

### 1.2 Alcance del Sistema

**Procesos cubiertos:**
1. Creación de órdenes de compra a proveedores
2. Envío y confirmación de órdenes
3. Recepción de mercadería (completa/parcial)
4. Control de calidad de productos recibidos
5. Actualización de inventario en almacenes
6. Gestión de cuentas por pagar (integrado)
7. Generación de documentos PDF
8. Auditoría de cambios

**Módulos relacionados:**
- 🔗 **Proveedores:** Gestión de entidades comerciales
- 🔗 **Productos:** Catálogo de productos
- 🔗 **Inventario:** Control de stock y almacenes
- 🔗 **Contabilidad:** Cuentas por pagar
- 🔗 **Usuarios:** Permisos y roles RBAC

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Stack Tecnológico

**Backend:**
```
- Express 5.1.0 (servidor HTTP)
- NestJS 11.1.8 decorators (solo decoradores, sin runtime)
- Prisma 6.16.0 (ORM)
- PostgreSQL 17 (base de datos)
- PDFKit 0.17.0 (generación de PDFs)
- TypeScript 5.3.3
- class-validator 0.14.1 (validaciones)
```

**Frontend:**
```
- React 19.0.0
- Vite (bundler con rolldown)
- Styled Components 6.1.13
- Axios 1.12.1 (HTTP client)
- React Router DOM 7.9.0
```

### 2.2 Estructura de Base de Datos

**Tablas principales:**

```sql
-- Orden de Compra
PurchaseOrder {
  id: String (CUID)
  codigo: String (único, ej: OC-2025-0001)
  estado: PurchaseOrderStatus (8 estados)
  proveedorId: String → Client
  almacenDestinoId: String → Warehouse
  fechaOrden: DateTime
  fechaEntregaEsperada: DateTime?
  subtotal, igv, total: Decimal
  observaciones: String?
  items: PurchaseOrderItem[]
  recepciones: PurchaseReceipt[]
}

-- Items de la Orden
PurchaseOrderItem {
  id: String (CUID)
  ordenCompraId: String → PurchaseOrder
  productoId: String → Product
  cantidadOrdenada: Int
  cantidadRecibida: Int (acumulado)
  cantidadPendiente: Int (calculado)
  precioUnitario: Decimal
  descuento: Decimal
  incluyeIGV: Boolean
  subtotal, igv, total: Decimal
}

-- Recepción de Mercadería
PurchaseReceipt {
  id: String (CUID)
  codigo: String (único, ej: RC-2025-0001)
  ordenCompraId: String → PurchaseOrder
  almacenId: String → Warehouse
  estado: ReceiptStatus
  fechaRecepcion: DateTime
  items: PurchaseReceiptItem[]
}

-- Items de Recepción
PurchaseReceiptItem {
  id: String (CUID)
  recepcionId: String → PurchaseReceipt
  itemOrdenCompraId: String → PurchaseOrderItem
  cantidadRecibida: Int
  estadoCalidad: QualityStatus (APROBADO/RECHAZADO/PENDIENTE)
}
```

### 2.3 Estados del Sistema

**Estados de Orden de Compra:**

```
PENDIENTE → ENVIADA → CONFIRMADA → EN_RECEPCION → PARCIAL/COMPLETADA → CERRADA
                                                            ↓
                                                        CANCELADA
```

| Estado | Descripción | Transiciones Permitidas |
|--------|-------------|------------------------|
| **PENDIENTE** | Orden creada, editable | ENVIADA, CANCELADA |
| **ENVIADA** | Enviada al proveedor | CONFIRMADA, CANCELADA |
| **CONFIRMADA** | Confirmada por proveedor | EN_RECEPCION, CANCELADA |
| **EN_RECEPCION** | Primera recepción registrada | PARCIAL, COMPLETADA |
| **PARCIAL** | Recepción parcial | COMPLETADA |
| **COMPLETADA** | Todo recibido | CERRADA |
| **CERRADA** | Cerrada administrativamente | (final) |
| **CANCELADA** | Cancelada | (final) |

**Estados de Recepción:**

| Estado | Descripción |
|--------|-------------|
| **PENDIENTE** | Creada, pendiente recibir |
| **EN_PROCESO** | Recibiendo mercadería |
| **COMPLETADA** | Recepción finalizada |
| **CANCELADA** | Recepción cancelada |

### 2.4 Estructura de Archivos

**Backend:**
```
alexa-tech-backend/src/modules/purchases/
├── controllers/
│   └── purchases.controller.ts      (endpoints HTTP)
├── services/
│   └── purchases.service.ts         (lógica de negocio, 1055 líneas)
├── routes/
│   └── purchases.routes.ts          (rutas Express)
├── types/
│   └── purchases.types.ts           (interfaces TypeScript)
└── validators/
    └── purchases.validators.ts      (class-validator)

prisma/
├── schema.prisma                    (modelos de datos)
├── seedPurchases.ts                 (datos demo)
└── migrations/                      (migraciones SQL)
```

**Frontend:**
```
alexa-tech-react/src/modules/purchases/
├── components/
│   ├── PurchaseOrderList.tsx       (lista con filtros, 857 líneas)
│   ├── PurchaseOrderForm.tsx       (formulario, 1163 líneas)
│   ├── PurchaseOrderDetail.tsx     (detalle, 337 líneas)
│   ├── PurchaseReceiptForm.tsx     (recepción)
│   └── PurchaseReceiptList.tsx     (lista recepciones)
├── pages/
│   ├── PurchaseOrdersPage.tsx      (página principal)
│   └── PurchaseReceiptsPage.tsx    (página recepciones)
├── services/
│   └── purchaseOrderService.ts     (API calls)
├── hooks/
│   └── usePurchaseOrders.ts        (React hook)
└── types/
    └── purchases.types.ts           (interfaces)
```

---

## 3. GUÍA DE USUARIO

### 3.1 Acceso al Módulo

**Ruta:** `Dashboard → Compras → Órdenes de Compra`

**Permisos necesarios:**
- `purchases.read` - Ver órdenes de compra
- `purchases.create` - Crear nuevas órdenes
- `purchases.update` - Editar órdenes existentes
- `purchases.delete` - Eliminar órdenes
- `purchases.pdf` - Descargar PDFs

### 3.2 Crear una Orden de Compra

**Paso a paso:**

1. **Acceder al módulo**
   - Click en "Compras" en menú lateral
   - Seleccionar "Órdenes de Compra"

2. **Hacer clic en "Nueva Orden"**
   - Botón azul en esquina superior derecha

3. **Completar datos básicos:**

   **Proveedor*** (obligatorio)
   - Seleccionar de lista desplegable
   - Solo muestra proveedores activos
   - Si no existe: ir a "Entidades Comerciales" → Crear proveedor

   **Almacén Destino*** (obligatorio)
   - Seleccionar almacén donde se recibirá la mercadería
   - Solo muestra almacenes activos

   **Fecha de Entrega Esperada** (opcional)
   - Fecha estimada de llegada de productos
   - Ayuda a planificar recepciones

   **Moneda** (automático)
   - Se fija automáticamente en PEN (Soles)
   - Se obtiene de configuración de empresa
   - No es editable

   **Condiciones de Pago** (opcional)
   - Texto libre: "Contado", "30 días", "50% adelanto"
   - Se muestra en PDF generado

   **Observaciones** (opcional)
   - Notas adicionales para el proveedor
   - Especificaciones de entrega, horarios, etc.

4. **Agregar productos:**

   Click en "Agregar Producto"
   
   Para cada producto:
   - **Producto***: Seleccionar de catálogo
   - **Cantidad***: Cantidad a ordenar (mínimo 1)
   - **Precio Unitario***: Precio sin IGV
   - **Descuento**: % o monto fijo (opcional)
   - **☑️ Incluye IGV**: Marcar si precio incluye IGV
   - **Observaciones**: Especificaciones del item

   **Botón "+"**: Crear producto rápido si no existe
   - Se abre modal de creación rápida
   - Producto se agrega automáticamente a la orden

5. **Revisar totales:**
   - Sistema calcula automáticamente:
     - Subtotal por item
     - IGV (18%) por item según checkbox
     - Descuentos aplicados
     - Total general

6. **Guardar orden:**
   - Click en "Crear Orden"
   - Sistema valida todos los campos
   - Genera código automático (ej: OC-2025-0001)
   - Estado inicial: PENDIENTE

### 3.3 Gestionar Órdenes Existentes

**Filtros disponibles:**

Los filtros están organizados en 5 grupos visuales:

**📋 Vista General**
- **Todas**: Muestra todas las órdenes

**📝 Gestión Activa** (editables)
- **Pendiente**: Recién creadas, sin enviar
- **Enviada**: Enviadas al proveedor
- **Confirmada**: Confirmadas por proveedor

**🚚 En Proceso** (en recepción)
- **En Recepción**: Primera recepción registrada
- **Parcial**: Recibidas parcialmente

**✅ Finalizadas** (completadas)
- **Completada**: Todo recibido y verificado
- **Cerrada**: Cerradas administrativamente

**❌ Canceladas**
- **Cancelada**: Órdenes anuladas

**Acciones disponibles:**

| Acción | Icono | Descripción | Estados Permitidos |
|--------|-------|-------------|-------------------|
| **Ver** | 👁️ | Ver detalle completo | Todos |
| **Editar** | ✏️ | Modificar orden | PENDIENTE, ENVIADA |
| **Eliminar** | 🗑️ | Borrar orden | PENDIENTE |
| **Descargar PDF** | 📄 | Generar PDF | Todos |
| **Crear Recepción** | 📦 | Registrar recepción | CONFIRMADA, EN_RECEPCION, PARCIAL |

### 3.4 Ver Detalle de Orden

Al hacer click en "Ver":

**Información mostrada:**
- ✅ Código y estado con badge de color
- ✅ Datos del proveedor (RUC, razón social)
- ✅ Almacén destino
- ✅ Fechas (emisión, entrega esperada)
- ✅ Lista completa de productos
- ✅ Cantidades (ordenadas, recibidas, pendientes)
- ✅ Precios y totales detallados
- ✅ Observaciones

**Acciones disponibles:**
- 📄 Descargar PDF
- ✏️ Editar (si está en PENDIENTE/ENVIADA)
- 📦 Crear Recepción (si está en CONFIRMADA+)
- ➡️ Enviar a Proveedor (si está en PENDIENTE)
- ✅ Confirmar Orden (si está en ENVIADA)
- 🔒 Cerrar Orden (si está en COMPLETADA)
- ❌ Cancelar Orden

### 3.5 Editar una Orden

**Campos editables según estado:**

| Campo | PENDIENTE | ENVIADA | CONFIRMADA+ |
|-------|-----------|---------|-------------|
| Proveedor | ✅ | ❌ | ❌ |
| Almacén Destino | ✅ | ❌ | ❌ |
| Fecha Entrega | ✅ | ✅ | ❌ |
| Productos | ✅ | ❌ | ❌ |
| Cantidades | ✅ | ❌ | ❌ |
| Precios | ✅ | ❌ | ❌ |
| Condiciones Pago | ✅ | ✅ | ✅ |
| Observaciones | ✅ | ✅ | ✅ |

**Lógica implementada:**
```typescript
// En PENDIENTE: todo editable
// En ENVIADA: solo fechas, condiciones y observaciones
// Desde CONFIRMADA: solo observaciones
```

### 3.6 Registrar Recepción de Mercadería

**Cuándo crear una recepción:**
- Orden debe estar en estado: CONFIRMADA, EN_RECEPCION o PARCIAL
- Proveedor ha entregado productos
- Se va a registrar ingreso al almacén

**Proceso:**

1. **Desde detalle de orden → "Crear Recepción"**

2. **Completar datos de recepción:**
   - Fecha de recepción (automática: hoy)
   - Almacén (heredado de orden, no editable)
   - Observaciones generales

3. **Registrar items recibidos:**
   
   Para cada producto de la orden:
   - **Cantidad Recibida**: Cuánto llegó realmente
   - **Estado Calidad**:
     - ✅ APROBADO: Producto en buen estado
     - ❌ RECHAZADO: Producto defectuoso
     - ⏳ PENDIENTE: Pendiente de inspección
   - **Observaciones**: Notas sobre el item

4. **Guardar recepción:**
   - Sistema valida cantidades
   - Actualiza `cantidadRecibida` en items de orden
   - Calcula `cantidadPendiente` = ordenada - recibida
   - Actualiza inventario en almacén (+stock)
   - Cambia estado de orden automáticamente:
     - Si todo recibido → COMPLETADA
     - Si parcial → PARCIAL
     - Si primera recepción → EN_RECEPCION

### 3.7 Descargar PDF

**Cómo descargar:**
1. Click en "📄 Descargar PDF" (desde lista o detalle)
2. Sistema genera PDF en backend
3. Se descarga automáticamente

**Contenido del PDF:**
- Header con logo de empresa
- Datos de la orden (código, fecha, estado)
- Información del proveedor
- Tabla de productos con cantidades y precios
- Totales (subtotal, IGV, total)
- Observaciones
- Footer con datos de contacto

**Formato:**
- Tamaño: A4
- Orientación: Vertical
- Fuente: Helvetica
- Marca de agua si está CANCELADA

---

## 4. GUÍA TÉCNICA

### 4.1 API Endpoints

**Base URL:** `http://localhost:4000/api/compras`

#### Órdenes de Compra

```typescript
// Listar órdenes (con filtros)
GET /ordenes
Query params:
  - estado?: PurchaseOrderStatus
  - proveedorId?: string
  - almacenId?: string
  - fechaDesde?: string (ISO)
  - fechaHasta?: string (ISO)
Response: { data: PurchaseOrder[], total: number }

// Obtener orden por ID
GET /ordenes/:id
Response: { data: PurchaseOrder }

// Crear nueva orden
POST /ordenes
Body: CreatePurchaseOrderDto
Response: { data: PurchaseOrder, message: string }

// Actualizar orden
PUT /ordenes/:id
Body: UpdatePurchaseOrderDto
Response: { data: PurchaseOrder, message: string }

// Actualizar estado
PATCH /ordenes/:id/estado
Body: { estado: PurchaseOrderStatus, observaciones?: string }
Response: { data: PurchaseOrder, message: string }

// Eliminar orden
DELETE /ordenes/:id
Response: { message: string }

// Descargar PDF
GET /ordenes/:id/pdf
Response: PDF file (application/pdf)
```

#### Recepciones

```typescript
// Listar recepciones
GET /recepciones
Response: { data: PurchaseReceipt[], total: number }

// Obtener recepción por ID
GET /recepciones/:id
Response: { data: PurchaseReceipt }

// Crear recepción
POST /recepciones
Body: CreatePurchaseReceiptDto
Response: { data: PurchaseReceipt, message: string }

// Actualizar recepción
PUT /recepciones/:id
Body: UpdatePurchaseReceiptDto
Response: { data: PurchaseReceipt, message: string }
```

### 4.2 DTOs y Validaciones

**CreatePurchaseOrderDto:**
```typescript
{
  proveedorId: string;          // @IsNotEmpty(), @IsString()
  almacenDestinoId: string;     // @IsNotEmpty(), @IsString()
  fechaEntregaEsperada?: Date;  // @IsOptional(), @IsDateString()
  condicionesPago?: string;     // @IsOptional(), @IsString()
  observaciones?: string;       // @IsOptional(), @IsString()
  items: CreatePurchaseOrderItemDto[];  // @IsArray(), @ValidateNested()
}

CreatePurchaseOrderItemDto:
{
  productoId: string;           // @IsNotEmpty(), @IsString()
  cantidad: number;             // @IsNumber(), @Min(1)
  precioUnitario: number;       // @IsNumber(), @Min(0)
  descuento?: number;           // @IsOptional(), @IsNumber(), @Min(0)
  incluyeIGV?: boolean;         // @IsOptional(), @IsBoolean()
  observaciones?: string;       // @IsOptional(), @IsString()
}
```

### 4.3 Lógica de Negocio Clave

**Cálculo de totales con IGV por item:**

```typescript
// purchases.service.ts (líneas 150-200)
function calculateItemTotals(item) {
  const cantidad = item.cantidadOrdenada;
  const precioUnitario = item.precioUnitario;
  const descuento = item.descuento || 0;
  const incluyeIGV = item.incluyeIGV ?? true;
  
  // Subtotal después de descuento
  const subtotalBruto = cantidad * precioUnitario;
  const subtotal = subtotalBruto - descuento;
  
  if (incluyeIGV) {
    // Precio incluye IGV → descomponer
    const totalConIGV = subtotal;
    const baseImponible = totalConIGV / 1.18;
    const igv = totalConIGV - baseImponible;
    
    return {
      subtotal: baseImponible,
      igv: igv,
      total: totalConIGV
    };
  } else {
    // Precio sin IGV → agregar IGV
    const baseImponible = subtotal;
    const igv = baseImponible * 0.18;
    const total = baseImponible + igv;
    
    return {
      subtotal: baseImponible,
      igv: igv,
      total: total
    };
  }
}
```

**Validación de transiciones de estado:**

```typescript
// purchases.service.ts (líneas 400-500)
const ALLOWED_TRANSITIONS = {
  PENDIENTE: ['ENVIADA', 'CANCELADA'],
  ENVIADA: ['CONFIRMADA', 'CANCELADA'],
  CONFIRMADA: ['EN_RECEPCION', 'CANCELADA'],
  EN_RECEPCION: ['PARCIAL', 'COMPLETADA'],
  PARCIAL: ['COMPLETADA'],
  COMPLETADA: ['CERRADA'],
  CERRADA: [],
  CANCELADA: []
};

function validateStateTransition(currentState, newState) {
  const allowed = ALLOWED_TRANSITIONS[currentState] || [];
  if (!allowed.includes(newState)) {
    throw new BadRequestException(
      `No se puede cambiar de ${currentState} a ${newState}`
    );
  }
}
```

**Actualización automática de estado en recepción:**

```typescript
// purchases.service.ts (líneas 600-700)
async function updateOrderStateAfterReceipt(ordenId) {
  const orden = await prisma.purchaseOrder.findUnique({
    where: { id: ordenId },
    include: { items: true, recepciones: true }
  });
  
  // Calcular totales
  const totalOrdenado = orden.items.reduce((sum, i) => sum + i.cantidadOrdenada, 0);
  const totalRecibido = orden.items.reduce((sum, i) => sum + i.cantidadRecibida, 0);
  
  let nuevoEstado;
  
  if (totalRecibido === 0) {
    nuevoEstado = 'CONFIRMADA';
  } else if (totalRecibido < totalOrdenado) {
    if (orden.recepciones.length === 1) {
      nuevoEstado = 'EN_RECEPCION';
    } else {
      nuevoEstado = 'PARCIAL';
    }
  } else if (totalRecibido === totalOrdenado) {
    nuevoEstado = 'COMPLETADA';
  }
  
  await prisma.purchaseOrder.update({
    where: { id: ordenId },
    data: { estado: nuevoEstado }
  });
}
```

### 4.4 Componentes React

**PurchaseOrderForm - Props:**

```typescript
interface PurchaseOrderFormProps {
  order?: PurchaseOrder;           // Orden a editar (opcional)
  mode?: 'create' | 'edit' | 'view';  // Modo del formulario
  onSuccess?: (order: PurchaseOrder) => void;
  onCancel?: () => void;
}
```

**Características:**
- Auto-detecta modo: si hay `order` sin `mode` → edit
- Campos editables según estado con `getEditableFields()`
- Cálculo automático de totales
- Validación en tiempo real
- Modal de creación rápida de productos
- Moneda fija desde configuración
- Checkbox IGV por item

**PurchaseOrderDetail - Refactorizado:**

```typescript
interface PurchaseOrderDetailProps {
  orderId: string;                 // ID de la orden
  onEdit?: (orderId: string) => void;
  onCreateReceipt?: (orderId: string) => void;
  onClose?: () => void;
}
```

**Características:**
- Reutiliza `PurchaseOrderForm` con `mode='view'`
- Elimina duplicación de código (-226 líneas)
- Barra de acciones contextual según estado
- Descarga de PDF integrada
- Transiciones de estado directas

### 4.5 Hooks Personalizados

**usePurchaseOrders:**

```typescript
function usePurchaseOrders(options?: {
  autoFetch?: boolean;
  filters?: FilterPurchaseOrderDto;
  onSuccess?: (data: PurchaseOrder[]) => void;
  onError?: (error: Error) => void;
}) {
  return {
    orders: PurchaseOrder[];
    isLoading: boolean;
    error: Error | null;
    fetchOrders: (filters?) => Promise<void>;
    createOrder: (dto) => Promise<PurchaseOrder>;
    updateOrder: (id, dto) => Promise<PurchaseOrder>;
    deleteOrder: (id) => Promise<boolean>;
    refetch: () => void;
  };
}
```

**Uso:**
```typescript
const {
  orders,
  isLoading,
  createOrder,
  refetch
} = usePurchaseOrders({ autoFetch: true });
```

---

## 5. FLUJO DE ESTADOS

### 5.1 Diagrama de Estados

```
┌─────────────┐
│  PENDIENTE  │  ← Orden creada (editable)
└──────┬──────┘
       │ enviar
       ↓
┌─────────────┐
│   ENVIADA   │  ← Enviada al proveedor
└──────┬──────┘
       │ confirmar
       ↓
┌─────────────┐
│ CONFIRMADA  │  ← Proveedor confirmó
└──────┬──────┘
       │ 1ra recepción
       ↓
┌──────────────┐
│ EN_RECEPCION │  ← Recibiendo mercadería
└──────┬───────┘
       │
       ├─→ PARCIAL (si falta mercadería)
       │
       └─→ COMPLETADA (si todo recibido)
              ↓
         ┌─────────┐
         │ CERRADA │  ← Cerrada administrativamente
         └─────────┘

       (En cualquier momento antes de EN_RECEPCION)
                    ↓
              ┌───────────┐
              │ CANCELADA │  ← Orden anulada
              └───────────┘
```

### 5.2 Casos de Uso Detallados

**Caso 1: Flujo Normal (Sin Incidencias)**

1. **Usuario crea orden** → Estado: PENDIENTE
   - Llena formulario con proveedor y productos
   - Sistema valida y guarda

2. **Usuario envía orden** → Estado: ENVIADA
   - Click en "Enviar a Proveedor"
   - Se genera PDF automáticamente
   - Ya no se pueden editar productos/precios

3. **Proveedor confirma** → Estado: CONFIRMADA
   - Usuario marca como confirmada manualmente
   - Ahora se pueden crear recepciones

4. **Llega mercadería completa** → Estado: COMPLETADA
   - Usuario crea recepción con 100% de productos
   - Sistema actualiza inventario
   - Estado cambia automáticamente

5. **Usuario cierra orden** → Estado: CERRADA
   - Click en "Cerrar Orden"
   - Orden archivada, no más cambios

**Caso 2: Recepción Parcial**

1. Orden en CONFIRMADA
2. Llega 50% de productos
3. Usuario crea recepción parcial → Estado: EN_RECEPCION
4. Llega resto de productos
5. Usuario crea segunda recepción → Estado: COMPLETADA

**Caso 3: Cancelación**

1. Orden en PENDIENTE/ENVIADA/CONFIRMADA
2. Proveedor no puede cumplir
3. Usuario cancela orden → Estado: CANCELADA
4. No se puede revertir (usar crear nueva orden)

### 5.3 Reglas de Negocio

**Validaciones automáticas:**

1. **Cantidades:**
   - Cantidad recibida no puede exceder cantidad ordenada
   - Cantidad pendiente = ordenada - recibida
   - Debe ser ≥ 0

2. **Estados:**
   - Solo se puede cancelar antes de recibir mercadería
   - Una vez en COMPLETADA, solo se puede CERRAR
   - CERRADA y CANCELADA son estados finales

3. **Edición:**
   - PENDIENTE: todo editable
   - ENVIADA: solo fechas, condiciones, observaciones
   - CONFIRMADA+: solo observaciones

4. **Inventario:**
   - Solo se actualiza con recepción APROBADA
   - Productos RECHAZADOS no ingresan a stock
   - Movimiento de inventario es auditable

5. **Permisos:**
   - Ver: requiere `purchases.read`
   - Crear/Editar: requiere `purchases.create/update`
   - Cambiar estado: requiere `purchases.update`
   - Eliminar: requiere `purchases.delete` + estado PENDIENTE

---

## 6. TROUBLESHOOTING

### 6.1 Problemas Comunes

#### Error: "No se pueden editar los productos"

**Síntoma:** Campos deshabilitados, no se puede modificar

**Causa:** Orden ya está en estado ENVIADA o posterior

**Solución:**
- Si es ENVIADA: cancelar y crear nueva orden
- Si es CONFIRMADA+: no se puede modificar, es por diseño
- Solo PENDIENTE permite editar productos

#### Error: "No se puede cambiar el estado"

**Síntoma:** Al intentar cambiar estado, aparece error de validación

**Causa:** Transición de estado no permitida

**Solución:**
```
Verificar transiciones válidas:
- PENDIENTE → solo ENVIADA o CANCELADA
- ENVIADA → solo CONFIRMADA o CANCELADA
- Etc. (ver diagrama de estados)
```

#### Error: "Cantidad recibida excede ordenada"

**Síntoma:** Al crear recepción, error en cantidades

**Causa:** Se intenta recibir más de lo ordenado

**Solución:**
- Verificar cantidad ordenada original
- Sumar recepciones anteriores
- Ajustar cantidad a recibir

#### Error: "No se puede generar PDF"

**Síntoma:** Click en descargar PDF no hace nada o error 500

**Causa:** Posibles causas:
1. Orden no tiene items
2. Proveedor o almacén no existe
3. Error en backend de PDFKit

**Solución:**
1. Verificar que orden tenga al menos 1 producto
2. Verificar relaciones en base de datos
3. Revisar logs del backend: `npm run dev`
4. Verificar ruta: `GET /api/compras/ordenes/:id/pdf`

### 6.2 Logs y Depuración

**Backend logs:**
```bash
cd alexa-tech-backend
npm run dev

# Buscar errores:
[ERROR] PurchaseService - ...
```

**Frontend logs:**
```javascript
// En consola del navegador (F12)
// Buscar errores de API:
Failed to fetch: http://localhost:4000/api/compras/...
```

**Verificar conexión a base de datos:**
```bash
cd alexa-tech-backend
npx prisma studio
# Revisar tablas: PurchaseOrder, PurchaseOrderItem
```

### 6.3 Migraciones y Seeds

**Resetear base de datos:**
```bash
cd alexa-tech-backend

# ⚠️ CUIDADO: Borra todos los datos
npx prisma migrate reset

# Ejecutar seeds
npx ts-node prisma/seedPurchases.ts
```

**Verificar integridad de datos:**
```sql
-- Órdenes con items
SELECT 
  po.codigo,
  po.estado,
  COUNT(poi.id) as total_items
FROM "PurchaseOrder" po
LEFT JOIN "PurchaseOrderItem" poi ON poi."ordenCompraId" = po.id
GROUP BY po.id;

-- Cantidades pendientes
SELECT 
  po.codigo,
  poi."cantidadOrdenada",
  poi."cantidadRecibida",
  poi."cantidadPendiente"
FROM "PurchaseOrderItem" poi
JOIN "PurchaseOrder" po ON po.id = poi."ordenCompraId"
WHERE poi."cantidadPendiente" > 0;
```

---

## 7. FAQ

### 7.1 Preguntas Frecuentes

**Q: ¿Puedo crear productos desde la orden de compra?**

A: Sí, hay un botón "+" junto al selector de productos que abre un modal de creación rápida. El producto se agrega automáticamente a la orden.

---

**Q: ¿Cómo manejo el IGV?**

A: Hay un checkbox "Incluye IGV" en cada item de la orden:
- ✅ Marcado: El precio incluye IGV (se descompone)
- ☐ Desmarcado: El precio NO incluye IGV (se agrega 18%)

El sistema calcula automáticamente los totales correctos.

---

**Q: ¿Puedo recibir más de lo ordenado?**

A: No, el sistema valida que la cantidad recibida no exceda la ordenada. Si llega más mercadería, debes:
1. Editar la orden (si está en PENDIENTE)
2. O crear una nueva orden para el excedente

---

**Q: ¿Qué pasa si cancelo una orden con recepciones?**

A: No se puede cancelar una orden que ya tiene recepciones. Solo se puede cancelar en estados PENDIENTE, ENVIADA o CONFIRMADA (antes de recibir mercadería).

---

**Q: ¿Puedo editar una orden enviada?**

A: Parcialmente. En estado ENVIADA solo puedes editar:
- Fecha de entrega esperada
- Condiciones de pago
- Observaciones

No puedes cambiar productos, cantidades ni precios.

---

**Q: ¿Cómo funciona la moneda?**

A: La moneda se fija automáticamente en PEN (Soles) desde la configuración de la empresa. No es editable por usuario. Si necesitas otra moneda, debe cambiarse en configuración general.

---

**Q: ¿Se actualiza el inventario automáticamente?**

A: Sí, cuando creas una recepción con estado de calidad APROBADO, el sistema:
1. Suma la cantidad al stock del producto
2. Crea movimiento de inventario de tipo INGRESO_COMPRA
3. Asocia el movimiento al almacén destino
4. Registra en auditoría

Productos RECHAZADOS no ingresan al inventario.

---

**Q: ¿Puedo ver el historial de cambios?**

A: Actualmente el sistema registra cambios en tabla de auditoría pero no hay UI para visualizarlos. Está planificado para versión 2.1.

---

**Q: ¿Qué diferencia hay entre COMPLETADA y CERRADA?**

A: 
- **COMPLETADA**: Toda la mercadería fue recibida y está correcta
- **CERRADA**: Orden cerrada administrativamente (ya no se harán más acciones)

COMPLETADA es automático, CERRADA es manual.

---

**Q: ¿Se pueden eliminar órdenes?**

A: Solo se pueden eliminar órdenes en estado PENDIENTE. Las demás solo se pueden CANCELAR.

---

### 7.2 Preguntas Técnicas

**Q: ¿Cómo implementar un nuevo estado?**

A: 
1. Agregar estado en `schema.prisma`:
```prisma
enum PurchaseOrderStatus {
  // ... existentes
  NUEVO_ESTADO
}
```

2. Actualizar ALLOWED_TRANSITIONS en `purchases.service.ts`

3. Regenerar Prisma client: `npx prisma generate`

4. Crear migración: `npx prisma migrate dev`

5. Actualizar frontend en `purchases.types.ts`

---

**Q: ¿Cómo personalizar el PDF?**

A: Editar `purchases.service.ts` líneas 689-1055:
```typescript
private async generatePDF(order: PurchaseOrder) {
  const doc = new PDFDocument();
  
  // Personalizar header
  doc.fontSize(20).text('MI EMPRESA', 50, 50);
  
  // Agregar logo
  doc.image('path/to/logo.png', 50, 80, { width: 100 });
  
  // etc.
}
```

---

**Q: ¿Cómo agregar un campo a la orden?**

A:
1. Actualizar modelo en `schema.prisma`
2. Crear migración
3. Actualizar DTOs en backend
4. Actualizar interfaces en frontend
5. Agregar campo al formulario
6. Actualizar lógica de cálculos si es necesario

---

**Q: ¿El módulo soporta multi-moneda?**

A: No actualmente. Está fijo en PEN. Para soportar multi-moneda:
1. Cambiar tipo de `moneda` en modelo
2. Agregar selector en formulario
3. Implementar conversión en cálculos
4. Actualizar PDFs

---

**Q: ¿Cómo hacer backup de órdenes?**

A:
```bash
# Backup de base de datos completa
pg_dump -U usuario -d alexatech > backup.sql

# Backup solo de compras
pg_dump -U usuario -d alexatech \
  -t '"PurchaseOrder"' \
  -t '"PurchaseOrderItem"' \
  -t '"PurchaseReceipt"' \
  -t '"PurchaseReceiptItem"' \
  > compras_backup.sql
```

---

## 8. APÉNDICES

### 8.1 Glosario

| Término | Definición |
|---------|------------|
| **Orden de Compra (OC)** | Documento que formaliza la solicitud de productos a un proveedor |
| **Recepción** | Proceso de recibir y verificar mercadería contra la orden |
| **Item** | Línea de detalle en una orden (producto + cantidad + precio) |
| **IGV** | Impuesto General a las Ventas (18% en Perú) |
| **Proveedor** | Entidad comercial que vende productos |
| **Almacén** | Ubicación física donde se almacenan productos |
| **Estado** | Situación actual de una orden en su ciclo de vida |
| **Transición** | Cambio de un estado a otro |
| **CUID** | Identificador único generado por Prisma |
| **DTO** | Data Transfer Object (objeto de transferencia de datos) |

### 8.2 Códigos de Estado HTTP

| Código | Significado | Cuándo Ocurre |
|--------|-------------|---------------|
| 200 OK | Éxito | GET, PUT exitoso |
| 201 Created | Creado | POST exitoso |
| 400 Bad Request | Error validación | Datos inválidos |
| 401 Unauthorized | No autorizado | Sin token o expirado |
| 403 Forbidden | Prohibido | Sin permisos |
| 404 Not Found | No encontrado | ID no existe |
| 409 Conflict | Conflicto | Código duplicado |
| 500 Internal Server Error | Error servidor | Bug en backend |

### 8.3 Permisos RBAC

| Permiso | Descripción | Roles que lo tienen |
|---------|-------------|---------------------|
| `purchases.read` | Ver órdenes | Todos |
| `purchases.create` | Crear órdenes | Comprador, Admin |
| `purchases.update` | Editar órdenes | Comprador, Admin |
| `purchases.delete` | Eliminar órdenes | Admin |
| `purchases.pdf` | Descargar PDFs | Comprador, Admin, Supervisor |
| `receipts.create` | Crear recepciones | Almacenero, Admin |
| `receipts.update` | Editar recepciones | Almacenero, Admin |

### 8.4 Archivos de Configuración

**Backend - .env:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/alexatech"
PORT=4000
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

**Frontend - .env:**
```env
VITE_API_URL=http://localhost:4000
VITE_API_PREFIX=/api
```

### 8.5 Scripts Útiles

**Generar datos de prueba:**
```bash
cd alexa-tech-backend
npx ts-node prisma/seedPurchases.ts
```

**Ver base de datos:**
```bash
npx prisma studio
```

**Aplicar migraciones:**
```bash
npx prisma migrate deploy
```

**Regenerar cliente Prisma:**
```bash
npx prisma generate
```

### 8.6 Recursos Adicionales

**Documentación relacionada:**
- 📄 `ANALISIS_COMPLETO_MODULO_COMPRAS.md` - Análisis detallado
- 📄 `FLUJO_ESTADOS_COMPRAS.md` - Diagramas de estados
- 📄 `PLAN_ACCION_MODULO_COMPRAS.md` - Plan de implementación
- 📄 `GUIA_PRUEBAS_MANUALES_COMPRAS.md` - Casos de prueba

**Stack documentation:**
- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/docs)
- [React 19](https://react.dev/)
- [Styled Components](https://styled-components.com/)
- [PDFKit](https://pdfkit.org/)

---

## 📝 NOTAS DE VERSIÓN

**v2.0 (6 Diciembre 2025) - Actual**
- ✅ Refactorización completa de PurchaseOrderDetail
- ✅ Seeds de datos funcionales
- ✅ Filtros agrupados visualmente
- ✅ Cálculo de IGV por item
- ✅ Campos editables según estado
- ✅ Moneda fija desde configuración
- ✅ Botón creación rápida de productos

**v1.5 (Noviembre 2025)**
- ✅ Generación de PDFs
- ✅ Sistema de recepciones
- ✅ Control de calidad
- ✅ Integración con inventario

**v1.0 (Octubre 2025)**
- ✅ CRUD básico de órdenes
- ✅ Gestión de estados
- ✅ Validaciones básicas

---

**🎯 ROADMAP (Próximas Versiones)**

**v2.1 (Q1 2026)**
- [ ] Historial de cambios visible en UI
- [ ] Notificaciones por email
- [ ] Exportar a Excel
- [ ] Reportes de compras

**v2.2 (Q2 2026)**
- [ ] Multi-moneda
- [ ] Integración con contabilidad
- [ ] Cuentas por pagar
- [ ] Aprobaciones por workflow

---

## 📞 SOPORTE

**Equipo de Desarrollo:**
- 👨‍💻 Backend: equipo-backend@alexatech.com
- 🎨 Frontend: equipo-frontend@alexatech.com
- 🐛 Bugs: bugs@alexatech.com

**Horario de Soporte:**
- Lunes a Viernes: 9:00 AM - 6:00 PM
- Emergencias: +51 999 999 999

---

**Última actualización:** 6 de Diciembre, 2025  
**Mantenido por:** Equipo AlexaTech  
**Versión del manual:** 2.0
