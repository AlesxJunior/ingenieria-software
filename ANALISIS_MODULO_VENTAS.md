# 📊 ANÁLISIS COMPLETO: MÓDULO DE VENTAS

**Fecha**: 4 de diciembre de 2025  
**Estado**: ⚠️ **REQUIERE CORRECCIÓN CRÍTICA**

---

## 🎯 Resumen Ejecutivo

### ❌ **PROBLEMA CRÍTICO IDENTIFICADO**

El módulo de ventas **NO actualiza correctamente el inventario** al confirmar pagos. 

**Causa raíz**: El código que descuenta stock está **COMENTADO** en el método `confirmPayment`.

---

## 🔍 Análisis Detallado del Flujo

### 📋 **Estados de una Venta**

```
PENDIENTE → COMPLETADA → CANCELADA
```

- **PENDIENTE**: Venta creada, sin pago confirmado
- **COMPLETADA**: Pago confirmado, debe descontar inventario ✅
- **CANCELADA**: Venta cancelada, revierte inventario si estaba completada

---

## 🔄 Flujo Actual (CON PROBLEMAS)

### **1. Crear Venta** (`POST /api/sales`)

**Archivo**: `sales.service.ts` (líneas 178-402)

```typescript
async create(data: SaleCreateInput, userId: string): Promise<Sale> {
  // ✅ VALIDACIONES CORRECTAS
  - Valida sesión de caja activa
  - Valida cliente para Factura
  - Verifica stock disponible (NO lo descuenta aún)
  - Calcula totales con IGV opcional
  
  // ✅ CREA VENTA EN ESTADO "PENDIENTE"
  const created = await prisma.sale.create({
    data: {
      estado: 'Pendiente',  // 📌 NO descuenta stock aún
      items: { create: items },
      payments: { create: paymentsData },  // ✅ Soporta pagos múltiples
    }
  });
  
  return created;  // Estado: PENDIENTE
}
```

**✅ CORRECTO**: La venta se crea en estado `PENDIENTE` sin afectar inventario.

---

### **2. Confirmar Pago** (`POST /api/sales/:id/confirm-payment`)

**Archivo**: `sales.service.ts` (líneas 406-502)

```typescript
async confirmPayment(saleId: string, paymentData, userId: string): Promise<Sale> {
  // ✅ Valida que la venta exista y esté PENDIENTE
  // ✅ Valida monto recibido >= total venta
  // ✅ Calcula cambio
  
  // ✅ Actualiza venta a COMPLETADA
  const updated = await prisma.sale.update({
    where: { id: saleId },
    data: {
      estado: 'Completada',
      montoRecibido,
      montoCambio,
      fechaPago: new Date(),
    }
  });
  
  // ✅ Actualiza totalVentas en CashSession
  if (sale.cashSessionId) {
    await prisma.cashSession.update({
      where: { id: sale.cashSessionId },
      data: { totalVentas: { increment: totalVenta } }
    });
  }
  
  // ❌❌❌ PROBLEMA CRÍTICO: CÓDIGO COMENTADO ❌❌❌
  // 🔄 Registrar movimiento de kardex para cada producto (COMENTADO temporalmente)
  // for (const item of sale.items) {
  //   await inventoryService.createKardexMovement({
  //     productId: item.productId,
  //     warehouseId: sale.almacenId,
  //     type: 'SALIDA',
  //     reason: 'VENTA',
  //     quantity: item.cantidad,
  //     ...
  //   });
  // }
  
  return updated;  // ❌ Estado: COMPLETADA pero SIN DESCONTAR STOCK
}
```

**❌ ERROR CRÍTICO**: 
- La venta se marca como `COMPLETADA` ✅
- La sesión de caja se actualiza ✅
- **EL INVENTARIO NO SE DESCUENTA** ❌❌❌

---

### **3. Cambiar Estado Manualmente** (`PATCH /api/sales/:id/status`)

**Archivo**: `sales.service.ts` (líneas 748-850)

```typescript
async updateStatus(id: string, estado: 'Pendiente'|'Completada'|'Cancelada', userId: string) {
  const prevEstado = existing.estado;
  const nextEstado = estado;
  
  // ✅ Si se completa manualmente, SÍ descuenta inventario
  if (nextEstado === 'Completada' && prevEstado !== 'Completada') {
    const itemsForInventory = existing.items.map(it => ({
      productId: it.productId,
      cantidad: it.cantidad
    }));
    
    // ✅ LLAMA A applySaleSalida
    await inventoryService.applySaleSalida(
      id, 
      itemsForInventory, 
      existing.almacenId, 
      userId
    );
    
    // ✅ Actualiza totalVentas en CashSession
    if (existing.cashSessionId) {
      await prisma.cashSession.update({
        data: { totalVentas: { increment: Number(existing.total) } }
      });
    }
  }
  
  // ✅ Si se cancela y estaba completada, REVIERTE inventario
  if (nextEstado === 'Cancelada' && prevEstado === 'Completada') {
    await inventoryService.applyPurchaseEntrada(
      id,
      itemsForInventory,
      existing.almacenId,
      userId
    );
    
    // ✅ Resta totalVentas en CashSession
  }
  
  return updated;
}
```

**✅ CORRECTO**: Este flujo SÍ actualiza el inventario correctamente.

---

## 🔧 Servicio de Inventario (FUNCIONAL)

**Archivo**: `inventoryService.ts` (líneas 450-540)

```typescript
async applySaleSalida(
  saleId: string, 
  items: Array<{productId: string; cantidad: number}>, 
  warehouseId: string, 
  userId?: string
) {
  // ✅ Valida datos y almacén
  // ✅ Busca motivo de salida (SAL-VENTA)
  
  await prisma.$transaction(async (tx) => {
    for (const it of items) {
      const product = await tx.product.findUnique({...});
      
      // ✅ Saltar productos sin control de inventario
      if (product.trackInventory === false) continue;
      
      // ✅ Obtener stock actual
      const existing = await tx.stockByWarehouse.findUnique({...});
      const stockBefore = existing?.quantity ?? 0;
      const stockAfter = stockBefore - Number(it.cantidad);
      
      // ✅ Validar stock suficiente
      if (stockAfter < 0) {
        throw new Error(`Stock insuficiente...`);
      }
      
      // ✅ Actualizar StockByWarehouse
      await tx.stockByWarehouse.upsert({
        update: { quantity: stockAfter },
        create: { quantity: stockAfter, ... }
      });
      
      // ✅ Crear InventoryMovement (Kardex)
      await tx.inventoryMovement.create({
        data: {
          type: 'SALIDA',
          quantity: Number(it.cantidad),
          stockBefore,
          stockAfter,
          reason: `Venta ${saleId}`,
          reasonId: saleReason?.id,
          documentRef: saleId,
          userId
        }
      });
    }
    
    // ✅ Recalcular stock global por producto
    for (const pid of productIds) {
      const agg = await tx.stockByWarehouse.aggregate({...});
      const total = agg._sum.quantity ?? 0;
      await tx.product.update({ data: { stock: total } });
    }
  }, { isolationLevel: 'Serializable' });
}
```

**✅ FUNCIONAL**: El servicio está correctamente implementado con:
- Transacciones atómicas
- Validación de stock
- Actualización de `StockByWarehouse`
- Registro en `InventoryMovement` (Kardex)
- Recálculo de stock global

---

## 📊 Tablas Afectadas

| Tabla | Operación | Momento | Estado Actual |
|-------|-----------|---------|---------------|
| **Sale** | `CREATE` | Crear venta | ✅ CORRECTO (PENDIENTE) |
| **Sale** | `UPDATE` | Confirmar pago | ⚠️ Marca COMPLETADA sin inventario |
| **SalePayment** | `CREATE` | Crear venta | ✅ CORRECTO (pagos múltiples) |
| **SaleItem** | `CREATE` | Crear venta | ✅ CORRECTO |
| **CashSession** | `UPDATE` | Confirmar pago | ✅ CORRECTO (totalVentas) |
| **StockByWarehouse** | `UPDATE` | ❌ NUNCA | ❌ NO SE ACTUALIZA |
| **InventoryMovement** | `CREATE` | ❌ NUNCA | ❌ NO SE CREA |
| **Product.stock** | `UPDATE` | ❌ NUNCA | ❌ NO SE RECALCULA |

---

## 🐛 Flujos Afectados

### ✅ **Flujo Manual (FUNCIONA)**

```
Usuario → Lista Ventas → Cambiar Estado → Completada
  ↓
updateStatus() → applySaleSalida() → ✅ Descuenta Stock
```

**Usado en**: `ListaVentas.tsx` cuando se cambia estado manualmente

---

### ❌ **Flujo Normal (NO FUNCIONA)**

```
Usuario → Realizar Venta → Confirmar Pago
  ↓
create() → Estado PENDIENTE → confirmPayment() → ❌ NO Descuenta Stock
```

**Usado en**: `RealizarVenta.tsx` (flujo principal de ventas)

---

## 🔧 CORRECCIÓN REQUERIDA

### **Solución**: Descomentar y Activar Descuento en `confirmPayment`

**Archivo**: `sales.service.ts` (líneas 476-490)

**CAMBIAR DE**:
```typescript
// 🔄 Registrar movimiento de kardex para cada producto (COMENTADO temporalmente)
// for (const item of sale.items) {
//   await inventoryService.createKardexMovement({
//     ...
//   });
// }
```

**A**:
```typescript
// 🔄 Descontar inventario al confirmar pago
const itemsForInventory = sale.items.map(it => ({
  productId: it.productId,
  cantidad: it.cantidad
}));

if (itemsForInventory.length > 0 && sale.almacenId) {
  await inventoryService.applySaleSalida(
    sale.id,
    itemsForInventory,
    sale.almacenId,
    userId
  );
}
```

---

## ✅ Después de la Corrección

### **Flujo Correcto Esperado**:

```
1. Usuario crea venta (POST /api/sales)
   ├─ Sale.estado = 'PENDIENTE'
   ├─ SalePayment creado
   └─ Stock NO se toca ✅

2. Usuario confirma pago (POST /api/sales/:id/confirm-payment)
   ├─ Sale.estado = 'COMPLETADA'
   ├─ Sale.montoRecibido / montoCambio
   ├─ CashSession.totalVentas += total
   ├─ ✅ StockByWarehouse.quantity -= cantidades
   ├─ ✅ InventoryMovement (tipo SALIDA) creado
   └─ ✅ Product.stock recalculado

3. Usuario cancela venta completada (PATCH /api/sales/:id/status)
   ├─ Sale.estado = 'CANCELADA'
   ├─ ✅ StockByWarehouse.quantity += cantidades (revierte)
   ├─ ✅ InventoryMovement (tipo ENTRADA) creado
   └─ ✅ CashSession.totalVentas -= total
```

---

## 📝 Funcionalidades Correctas

### ✅ **Pagos Múltiples** (FUNCIONA)

```typescript
// Frontend envía:
payments: [
  { metodoPago: 'Efectivo', monto: 50.00 },
  { metodoPago: 'Tarjeta', monto: 50.00 }
]

// Backend crea registros en SalePayment
// formaPago = primer método (compatibilidad legacy)
```

### ✅ **IGV Opcional** (FUNCIONA)

```typescript
// Frontend puede desactivar IGV
incluyeIGV: false  // No aplica 18% de IGV
```

### ✅ **Comprobantes con Series** (FUNCIONA)

```typescript
// Genera código automático:
// Boleta: B001-00000123
// Factura: F001-00000456
// NotaVenta: NV001-00000789
```

### ✅ **Notas de Crédito** (FUNCIONA)

```typescript
// Permite crear NC con items específicos
// Actualiza totalVentas en CashSession
// Registra en auditoría
```

---

## 🎯 Validaciones Actuales

### ✅ **Al Crear Venta**:
- Session de caja debe estar abierta
- Cliente requerido para Facturas
- **Stock validado pero NO descontado** ⚠️
- Totales calculados correctamente
- Pagos múltiples validados (suma = total)

### ✅ **Al Confirmar Pago**:
- Venta debe existir y estar PENDIENTE
- Monto recibido >= total venta
- Cambio calculado automáticamente
- **Stock NO se descuenta** ❌

### ✅ **Al Cambiar Estado Manual**:
- Solo PENDIENTE puede eliminarse
- Completar manualmente SÍ descuenta stock ✅
- Cancelar completada SÍ revierte stock ✅

---

## 📈 Recomendaciones Adicionales

### 1. **Consistencia de Flujos**
- ⚠️ Dos formas de completar una venta (confirmPayment vs updateStatus)
- **Recomendación**: Unificar ambos flujos para usar `applySaleSalida`

### 2. **Control de Inventario**
- ✅ Respeta `product.trackInventory` (si es false, no controla stock)
- ✅ Transacciones atómicas con `isolationLevel: Serializable`

### 3. **Auditoría**
- ✅ Registra eventos en `AuditLog`
- ✅ Trazabilidad completa con `documentRef`

### 4. **Sesiones de Caja**
- ✅ `totalVentas` se actualiza correctamente en ambos flujos
- ✅ Reversión al cancelar ventas completadas

---

## 🔗 Archivos Relacionados

### Backend:
- `alexa-tech-backend/src/modules/sales/sales.service.ts` (885 líneas)
- `alexa-tech-backend/src/modules/sales/sales.routes.ts`
- `alexa-tech-backend/src/services/inventoryService.ts` (570 líneas)

### Frontend:
- `alexa-tech-react/src/modules/sales/pages/RealizarVenta.tsx` (2054 líneas)
- `alexa-tech-react/src/modules/sales/pages/ListaVentas.tsx`
- `alexa-tech-react/src/modules/sales/context/SalesContext.tsx`

### Schemas:
- `Sale` - `SaleItem` - `SalePayment`
- `StockByWarehouse` - `InventoryMovement`
- `CashSession`

---

## 🎓 Conclusión

### ❌ **Estado Actual**: REQUIERE CORRECCIÓN

**Problema Crítico**:
- El flujo principal de ventas (`confirmPayment`) **NO descuenta inventario**
- Código está comentado con nota "temporalmente - implementar después"
- Genera inconsistencias: ventas completadas sin afectar stock

**Impacto**:
- Stock en sistema no refleja ventas reales
- Kardex incompleto
- Reportes de inventario incorrectos

### ✅ **Solución Inmediata**:

Descomentar líneas 476-490 en `sales.service.ts` y cambiar por:

```typescript
// Descontar inventario al confirmar pago
const itemsForInventory = sale.items.map(it => ({
  productId: it.productId,
  cantidad: it.cantidad
}));

if (itemsForInventory.length > 0 && sale.almacenId) {
  await inventoryService.applySaleSalida(
    sale.id,
    itemsForInventory,
    sale.almacenId,
    userId
  );
}
```

**Tiempo estimado**: 5 minutos de código + reinicio backend

---

**Prioridad**: 🚨 **CRÍTICA - BLOQUEA PRODUCCIÓN**

**Estado de Aprobación**: ⏸️ **PENDIENTE CORRECCIÓN**

---

**Verificado por**: GitHub Copilot  
**Fecha**: 4 de diciembre de 2025
